"""
LLM-to-SQL chat pipeline with SSE streaming.
User asks natural-language questions → GPT-4o-mini generates SELECT SQL → results streamed back.
"""

import json
import os
import re
import sqlite3
import time
from pathlib import Path
from typing import AsyncGenerator

from openai import OpenAI

DB_PATH = Path(__file__).parent / "perm.db"

SCHEMA_DESCRIPTION = """
You have access to a SQLite database with 3 tables containing US immigration filing data.

### Table: perm (Green Card / PERM labor certifications, ~609K rows, FY2021–FY2026)
Columns: FISCAL_YEAR, CASE_NUMBER, CASE_STATUS, RECEIVED_DATE, DECISION_DATE,
OCCUPATION_TYPE, EMPLOYER_NAME, EMPLOYER_CITY, EMPLOYER_STATE, EMPLOYER_FEIN,
NAICS_CODE, EMPLOYER_NUM_EMPLOYEES, EMPLOYER_YEAR_COMMENCED, SOC_CODE, SOC_TITLE,
JOB_TITLE, WAGE_FROM, WAGE_TO, WAGE_UNIT, WORKSITE_ADDR, WORKSITE_CITY,
WORKSITE_STATE, WORKSITE_BLS_AREA, ATTORNEY_FIRM
All columns are TEXT. WAGE_FROM/WAGE_TO are numeric strings. CASE_STATUS values include
'Certified', 'Denied', 'Withdrawn', 'Certified-Expired'.

### Table: lca (H-1B / LCA filings, ~2.5M rows, FY2021–FY2024)
Columns: FISCAL_YEAR, CASE_NUMBER, CASE_STATUS, VISA_CLASS, RECEIVED_DATE, DECISION_DATE,
BEGIN_DATE, END_DATE, EMPLOYER_NAME, TRADE_NAME_DBA, EMPLOYER_CITY, EMPLOYER_STATE,
EMPLOYER_POSTAL_CODE, NAICS_CODE, SOC_CODE, SOC_TITLE, JOB_TITLE, FULL_TIME_POSITION,
TOTAL_WORKER_POSITIONS, WAGE_FROM, WAGE_TO, WAGE_UNIT, PREVAILING_WAGE, PW_UNIT,
PW_WAGE_LEVEL, WORKSITE_CITY, WORKSITE_STATE, WORKSITE_POSTAL_CODE, ATTORNEY_FIRM,
H1B_DEPENDENT, EMPLOYER_FEIN
All columns are TEXT. VISA_CLASS is usually 'H-1B', 'E-3 Australian', or 'H-1B1'.

### Table: employer (entity-resolved employer index, keyed by FEIN)
Columns: FEIN (PK), CANONICAL_NAME, CITY, STATE, NAICS_CODE, NUM_EMPLOYEES,
FILING_COUNT (INTEGER, PERM count), NAME_VARIANTS (pipe-separated),
LCA_FILING_COUNT (INTEGER), LCA_TOTAL_POSITIONS (INTEGER)
"""

SYSTEM_PROMPT = f"""You are a helpful immigration data analyst. Users ask questions about Green Card (PERM)
and H-1B (LCA) sponsorship data. You translate their questions into SQL queries against a SQLite database.

{SCHEMA_DESCRIPTION}

RULES:
1. Generate ONLY SELECT statements. Never INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or ATTACH.
2. Always include LIMIT (max 200) to avoid huge result sets.
3. For wage comparisons, CAST WAGE_FROM to REAL: CAST(WAGE_FROM AS REAL).
4. EMPLOYER_NAME values are UPPERCASE. Use UPPER() or LIKE with uppercase patterns.
5. When counting H-1B positions, SUM(CAST(TOTAL_WORKER_POSITIONS AS INTEGER)) is more accurate than COUNT(*).
6. For "top sponsors", use the employer table's FILING_COUNT / LCA_FILING_COUNT for speed.
7. State values are 2-letter codes (CA, NY, TX, etc.).

RESPONSE FORMAT — reply with valid JSON only:
{{
  "thinking": "Brief explanation of your approach",
  "sql": "SELECT ...",
  "resultType": "employers" | "filings" | "aggregate" | "text",
  "explanation": "One sentence describing what the results show"
}}

resultType guide:
- "employers": results have EMPLOYER_NAME/CANONICAL_NAME + filing details → render as employer cards
- "filings": individual filing rows (perm or lca) → render as filing list
- "aggregate": counts, averages, grouped stats → render as table
- "text": no SQL needed, answer directly → set sql to null

If you cannot answer, set resultType to "text" and explain why in the explanation field."""

# Dangerous SQL patterns
_FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|ATTACH|DETACH|REPLACE|PRAGMA|VACUUM|REINDEX)\b",
    re.IGNORECASE,
)


def _validate_sql(sql: str) -> str | None:
    """Return error message if SQL is unsafe, else None."""
    if _FORBIDDEN.search(sql):
        return "Only SELECT queries are allowed."
    if not sql.strip().upper().startswith("SELECT"):
        return "Query must start with SELECT."
    return None


def _ensure_limit(sql: str, max_limit: int = 200) -> str:
    """Inject or cap LIMIT clause."""
    if not re.search(r"\bLIMIT\b", sql, re.IGNORECASE):
        sql = sql.rstrip().rstrip(";") + f" LIMIT {max_limit}"
    return sql


def _execute_sql(sql: str) -> tuple[list[dict], list[str]]:
    """Execute read-only SQL with timeout. Returns (rows, column_names)."""
    uri = f"file:{DB_PATH}?mode=ro"
    conn = sqlite3.connect(uri, uri=True, timeout=5)
    conn.row_factory = sqlite3.Row
    try:
        cur = conn.execute(sql)
        columns = [desc[0] for desc in cur.description] if cur.description else []
        rows = [dict(r) for r in cur.fetchall()]
        return rows, columns
    finally:
        conn.close()


async def chat_stream(messages: list[dict]) -> AsyncGenerator[str, None]:
    """
    Process chat messages and yield SSE events.
    Events: thinking, sql, result, error, done
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    # Build conversation for OpenAI
    oai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in messages:
        role = msg.get("role", "user")
        if role in ("user", "assistant"):
            oai_messages.append({"role": role, "content": msg["content"]})

    # Call OpenAI
    yield _sse("thinking", {"text": "Analyzing your question..."})

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=oai_messages,
            temperature=0,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
    except Exception as e:
        yield _sse("error", {"message": f"LLM error: {str(e)}"})
        yield _sse("done", {})
        return

    # Parse LLM response
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        yield _sse("error", {"message": "Failed to parse LLM response"})
        yield _sse("done", {})
        return

    thinking = parsed.get("thinking", "")
    sql = parsed.get("sql")
    result_type = parsed.get("resultType", "text")
    explanation = parsed.get("explanation", "")

    if thinking:
        yield _sse("thinking", {"text": thinking})

    # Text-only response (no SQL)
    if not sql or result_type == "text":
        yield _sse("result", {
            "resultType": "text",
            "explanation": explanation or thinking,
            "data": [],
            "columns": [],
            "rowCount": 0,
        })
        yield _sse("done", {"assistantMessage": explanation or thinking})
        return

    # Validate SQL
    error = _validate_sql(sql)
    if error:
        yield _sse("error", {"message": error})
        yield _sse("done", {})
        return

    sql = _ensure_limit(sql)
    yield _sse("sql", {"query": sql})

    # Execute
    try:
        t0 = time.time()
        rows, columns = _execute_sql(sql)
        elapsed = round(time.time() - t0, 3)
    except Exception as e:
        yield _sse("error", {"message": f"SQL error: {str(e)}"})
        yield _sse("done", {})
        return

    yield _sse("result", {
        "resultType": result_type,
        "explanation": explanation,
        "data": rows,
        "columns": columns,
        "rowCount": len(rows),
        "queryTime": elapsed,
    })

    # Build assistant message for multi-turn context
    assistant_summary = json.dumps({
        "explanation": explanation,
        "sql": sql,
        "resultType": result_type,
        "rowCount": len(rows),
    })
    yield _sse("done", {"assistantMessage": assistant_summary})


def _sse(event: str, data: dict) -> str:
    """Format a server-sent event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
