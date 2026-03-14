type SortKey = 'date' | 'salary' | 'title';
type SortDir = 'asc' | 'desc';

interface SortBarProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

export function SortBar({ sortKey, sortDir, onSort }: SortBarProps) {
  const btn = (key: SortKey, label: string) => {
    const isActive = sortKey === key;
    const arrow = isActive ? (sortDir === 'asc' ? '↑' : '↓') : '';
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onSort(key); }}
        className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap
          ${isActive ? 'text-blue-600 bg-white border-blue-200' : 'text-gray-400 bg-transparent border-transparent hover:text-gray-600 hover:bg-white hover:border-gray-200'}`}
      >
        {label}{arrow && <span className="text-[10px]">{arrow}</span>}
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Sort</span>
      {btn('date', 'Date')}
      {btn('salary', 'Salary')}
      {btn('title', 'Job Title')}
    </div>
  );
}

export type { SortKey, SortDir };
