import { useState } from 'react';
import type { ChatMessage, Filing, LCAFiling } from '../types';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmployerCard } from './EmployerCard';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-[80%] text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%] w-full">
        {message.isStreaming && !message.data && (
          <ThinkingIndicator text={message.thinking} />
        )}

        {message.sql && <SQLBlock sql={message.sql} />}

        {message.explanation && (
          <p className="text-sm text-gray-700 mb-3">{message.explanation}</p>
        )}

        {message.data && message.data.length > 0 && (
          <ResultRenderer message={message} />
        )}

        {message.data && message.data.length === 0 && !message.isStreaming && message.resultType !== 'text' && (
          <p className="text-sm text-gray-400 italic">No results found.</p>
        )}

        {!message.data && !message.isStreaming && message.content && !message.explanation && (
          <p className="text-sm text-gray-700">{message.content}</p>
        )}

        {message.queryTime !== undefined && (
          <p className="text-xs text-gray-400 mt-1">
            {message.rowCount} row{message.rowCount !== 1 ? 's' : ''} in {message.queryTime}s
          </p>
        )}
      </div>
    </div>
  );
}

function SQLBlock({ sql }: { sql: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-2">
      <button
        onClick={() => setShow(!show)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        {show ? 'Hide' : 'Show'} SQL
      </button>
      {show && (
        <pre className="mt-1 bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {sql}
        </pre>
      )}
    </div>
  );
}

function ResultRenderer({ message }: { message: ChatMessage }) {
  const { resultType, data, columns } = message;
  if (!data || data.length === 0) return null;

  if (resultType === 'employers') {
    return <EmployerResults data={data} />;
  }

  if (resultType === 'filings') {
    return <FilingResults data={data} />;
  }

  if (resultType === 'aggregate') {
    return <AggregateTable data={data} columns={columns || []} />;
  }

  // text fallback
  return <p className="text-sm text-gray-700">{message.explanation}</p>;
}

function EmployerResults({ data }: { data: Record<string, unknown>[] }) {
  // Detect if data has employer-level fields
  const isEmployerTable = data[0] && ('CANONICAL_NAME' in data[0] || 'FILING_COUNT' in data[0]);

  if (isEmployerTable) {
    return (
      <div>
        {data.map((emp, i) => (
          <EmployerCard
            key={i}
            name={(emp.CANONICAL_NAME || emp.EMPLOYER_NAME || '') as string}
            city={(emp.CITY || emp.EMPLOYER_CITY || '') as string}
            state={(emp.STATE || emp.EMPLOYER_STATE || '') as string}
            numEmployees={(emp.NUM_EMPLOYEES || emp.EMPLOYER_NUM_EMPLOYEES || '') as string}
            variants={Array.isArray(emp.NAME_VARIANTS) ? emp.NAME_VARIANTS as string[] : []}
            permCount={(emp.FILING_COUNT || 0) as number}
            lcaCount={(emp.LCA_FILING_COUNT || 0) as number}
            filings={(emp.filings || []) as Filing[]}
            lcaFilings={(emp.lca_filings || []) as LCAFiling[]}
          />
        ))}
      </div>
    );
  }

  // Flat employer rows from SQL (e.g., "top 10 employers by filing count")
  return <AggregateTable data={data} columns={Object.keys(data[0])} />;
}

function FilingResults({ data }: { data: Record<string, unknown>[] }) {
  // Check if LCA-type filings
  const hasVisaClass = data[0] && 'VISA_CLASS' in data[0];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {data.map((row, i) =>
        hasVisaClass ? (
          <div key={i} className="border-b border-gray-100 last:border-b-0 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{(row.JOB_TITLE || '—') as string}</div>
                <div className="text-xs text-gray-400 truncate">{(row.EMPLOYER_NAME || '') as string}</div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{(row.VISA_CLASS || 'H-1B') as string}</span>
              <span className="text-sm font-bold text-green-600 whitespace-nowrap">{formatWage(row)}</span>
            </div>
          </div>
        ) : (
          <div key={i} className="border-b border-gray-100 last:border-b-0 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{(row.JOB_TITLE || '—') as string}</div>
                <div className="text-xs text-gray-400 truncate">{(row.EMPLOYER_NAME || '') as string}</div>
              </div>
              <span className="text-sm font-bold text-green-600 whitespace-nowrap">{formatWage(row)}</span>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function formatWage(row: Record<string, unknown>): string {
  const from = row.WAGE_FROM as string;
  if (!from) return '—';
  const n = Number(from);
  if (isNaN(n)) return from;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function AggregateTable({ data, columns }: { data: Record<string, unknown>[]; columns: string[] }) {
  if (data.length === 0 || columns.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString('en-US');
  return String(value);
}
