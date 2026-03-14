import { useState } from 'react';
import type { Filing, LCAFiling } from '../types';
import { fmtNumber } from '../utils/formatters';
import { FilingTabs } from './FilingTabs';

interface EmployerCardProps {
  name: string;
  city?: string;
  state?: string;
  numEmployees?: string;
  variants?: string[];
  permCount: number;
  lcaCount: number;
  filings: Filing[];
  lcaFilings: LCAFiling[];
}

export function EmployerCard({
  name, city, state, numEmployees, variants,
  permCount, lcaCount, filings, lcaFilings,
}: EmployerCardProps) {
  const [open, setOpen] = useState(false);
  const filteredVariants = (variants || []).filter(v => v !== name).slice(0, 5);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden transition-shadow hover:shadow-md animate-fade-in`}>
      <div
        className="px-5 py-4 cursor-pointer flex justify-between items-start gap-3 select-none hover:bg-gray-50 active:bg-gray-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-bold text-gray-900 leading-snug break-words">{name}</div>
          <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {city || ''}{state ? `, ${state}` : ''}
            {numEmployees && (
              <span className="text-xs text-gray-400 ml-1">&middot; {fmtNumber(numEmployees)} employees</span>
            )}
          </div>
          {filteredVariants.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filteredVariants.map(v => (
                <span key={v} className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {v}
                </span>
              ))}
              {(variants || []).filter(v => v !== name).length > 5 && (
                <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  +{(variants || []).filter(v => v !== name).length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {permCount > 0 && (
            <span className="bg-blue-50 text-blue-600 text-sm font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap">
              {permCount} Green Card
            </span>
          )}
          {lcaCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap">
              {lcaCount} H-1B
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100">
          <FilingTabs filings={filings} lcaFilings={lcaFilings} />
        </div>
      )}
    </div>
  );
}
