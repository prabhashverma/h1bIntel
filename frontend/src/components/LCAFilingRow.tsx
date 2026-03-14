import { useState } from 'react';
import type { LCAFiling } from '../types';
import { fmtWage, fmtDate, fmtPW, visaChipClass } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

const visaColors: Record<string, string> = {
  h1b: 'bg-blue-100 text-blue-800',
  e3: 'bg-pink-100 text-pink-800',
  h1b1: 'bg-emerald-100 text-emerald-800',
};

export function LCAFilingRow({ filing }: { filing: LCAFiling }) {
  const [open, setOpen] = useState(false);
  const vcClass = visaChipClass(filing.VISA_CLASS);

  return (
    <div
      className="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center px-4 py-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">{filing.JOB_TITLE || '—'}</div>
          <div className="text-xs text-gray-400 truncate">{filing.SOC_TITLE || ''}</div>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${visaColors[vcClass] || visaColors.h1b}`}>
          {filing.VISA_CLASS || 'H-1B'}
        </span>
        <span className="text-sm font-bold text-green-600 whitespace-nowrap shrink-0">
          {fmtWage(filing)}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 min-w-[72px] text-right">
          {fmtDate(filing.DECISION_DATE)}
        </span>
        <svg
          className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${open ? 'rotate-180 text-blue-500' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className="flex gap-4 px-4 pb-3 flex-wrap items-center">
          <StatusBadge status={filing.CASE_STATUS} />
          {filing.PW_WAGE_LEVEL && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-500">
              Level {filing.PW_WAGE_LEVEL}
            </span>
          )}
          {filing.PREVAILING_WAGE && (
            <span className="text-xs text-gray-500 font-medium">PW: {fmtPW(filing)}</span>
          )}
          {filing.TOTAL_WORKER_POSITIONS && filing.TOTAL_WORKER_POSITIONS !== '1' && (
            <span className="text-xs text-gray-500 font-medium">{filing.TOTAL_WORKER_POSITIONS} positions</span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {filing.WORKSITE_CITY || ''}{filing.WORKSITE_STATE ? `, ${filing.WORKSITE_STATE}` : ''}
          </span>
          <span className="inline-block bg-gray-100 text-xs font-semibold px-2 py-0.5 rounded text-gray-500">
            {filing.FISCAL_YEAR}
          </span>
        </div>
      )}
    </div>
  );
}
