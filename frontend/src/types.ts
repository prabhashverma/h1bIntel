export interface Employer {
  FEIN: string;
  CANONICAL_NAME: string;
  CITY: string;
  STATE: string;
  NAICS_CODE: string;
  NUM_EMPLOYEES: string;
  FILING_COUNT: number;
  NAME_VARIANTS: string[];
  LCA_FILING_COUNT: number;
  LCA_TOTAL_POSITIONS: number;
  filings: Filing[];
  lca_filings: LCAFiling[];
}

export interface Filing {
  EMPLOYER_NAME: string;
  EMPLOYER_CITY: string;
  EMPLOYER_STATE: string;
  EMPLOYER_NUM_EMPLOYEES: string;
  JOB_TITLE: string;
  SOC_TITLE: string;
  SOC_CODE: string;
  WAGE_FROM: string;
  WAGE_TO: string;
  WAGE_UNIT: string;
  CASE_STATUS: string;
  FISCAL_YEAR: string;
  WORKSITE_CITY: string;
  WORKSITE_STATE: string;
  ATTORNEY_FIRM: string;
  NAICS_CODE: string;
  DECISION_DATE: string;
  EMPLOYER_FEIN?: string;
}

export interface LCAFiling {
  EMPLOYER_NAME: string;
  EMPLOYER_CITY: string;
  EMPLOYER_STATE: string;
  JOB_TITLE: string;
  SOC_TITLE: string;
  SOC_CODE: string;
  WAGE_FROM: string;
  WAGE_TO: string;
  WAGE_UNIT: string;
  CASE_STATUS: string;
  FISCAL_YEAR: string;
  WORKSITE_CITY: string;
  WORKSITE_STATE: string;
  ATTORNEY_FIRM: string;
  DECISION_DATE: string;
  VISA_CLASS: string;
  PREVAILING_WAGE: string;
  PW_UNIT: string;
  PW_WAGE_LEVEL: string;
  TOTAL_WORKER_POSITIONS: string;
  BEGIN_DATE: string;
  END_DATE: string;
  TRADE_NAME_DBA: string;
  H1B_DEPENDENT: string;
}

export type ResultType = 'employers' | 'filings' | 'aggregate' | 'text';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  sql?: string;
  resultType?: ResultType;
  data?: Record<string, unknown>[];
  columns?: string[];
  rowCount?: number;
  queryTime?: number;
  explanation?: string;
  isStreaming?: boolean;
}

export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}
