import { useState, useMemo } from 'react';
import type { Filing, LCAFiling } from '../types';
import { FilingRow } from './FilingRow';
import { LCAFilingRow } from './LCAFilingRow';
import { SortBar } from './SortBar';
import type { SortKey, SortDir } from './SortBar';

function sortFilings<T extends { WAGE_FROM?: string; DECISION_DATE?: string; JOB_TITLE?: string }>(
  filings: T[], key: SortKey, dir: SortDir
): T[] {
  return [...filings].sort((a, b) => {
    let va: string | number, vb: string | number;
    if (key === 'salary') {
      va = parseFloat(a.WAGE_FROM || '0') || 0;
      vb = parseFloat(b.WAGE_FROM || '0') || 0;
    } else if (key === 'date') {
      va = a.DECISION_DATE || '';
      vb = b.DECISION_DATE || '';
    } else {
      va = (a.JOB_TITLE || '').toLowerCase();
      vb = (b.JOB_TITLE || '').toLowerCase();
    }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

interface FilingTabsProps {
  filings: Filing[];
  lcaFilings: LCAFiling[];
}

export function FilingTabs({ filings, lcaFilings }: FilingTabsProps) {
  const [tab, setTab] = useState<'perm' | 'lca'>('perm');
  const [permSort, setPermSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' });
  const [lcaSort, setLcaSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' });

  const hasBoth = filings.length > 0 && lcaFilings.length > 0;

  const handlePermSort = (key: SortKey) => {
    setPermSort(prev => ({
      key,
      dir: prev.key === key ? (prev.dir === 'desc' ? 'asc' : 'desc') : (key === 'title' ? 'asc' : 'desc'),
    }));
  };

  const handleLcaSort = (key: SortKey) => {
    setLcaSort(prev => ({
      key,
      dir: prev.key === key ? (prev.dir === 'desc' ? 'asc' : 'desc') : (key === 'title' ? 'asc' : 'desc'),
    }));
  };

  const sortedPerm = useMemo(() => sortFilings(filings, permSort.key, permSort.dir), [filings, permSort]);
  const sortedLca = useMemo(() => sortFilings(lcaFilings, lcaSort.key, lcaSort.dir), [lcaFilings, lcaSort]);

  return (
    <div>
      {hasBoth && (
        <div className="flex border-b border-gray-200 px-4">
          <button
            onClick={(e) => { e.stopPropagation(); setTab('perm'); }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer
              ${tab === 'perm' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            Green Card<span className="font-bold ml-1">{filings.length}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setTab('lca'); }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer
              ${tab === 'lca' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
          >
            H-1B<span className="font-bold ml-1">{lcaFilings.length}</span>
          </button>
        </div>
      )}

      {(tab === 'perm' || !hasBoth) && filings.length > 0 && (
        <div>
          <SortBar sortKey={permSort.key} sortDir={permSort.dir} onSort={handlePermSort} />
          {sortedPerm.map((f, i) => <FilingRow key={i} filing={f} />)}
        </div>
      )}

      {((tab === 'lca' && hasBoth) || (!hasBoth && lcaFilings.length > 0 && filings.length === 0)) && (
        <div>
          <SortBar sortKey={lcaSort.key} sortDir={lcaSort.dir} onSort={handleLcaSort} />
          {sortedLca.map((f, i) => <LCAFilingRow key={i} filing={f} />)}
        </div>
      )}

      {filings.length === 0 && lcaFilings.length === 0 && (
        <div className="py-5 text-center text-gray-400 text-sm">No filings found</div>
      )}
    </div>
  );
}
