import { statusClass } from '../utils/formatters';

const styles: Record<string, string> = {
  certified: 'bg-green-50 text-green-600',
  denied: 'bg-red-50 text-red-500',
  withdrawn: 'bg-gray-100 text-gray-400',
  other: 'bg-amber-50 text-amber-500',
};

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span>—</span>;
  const cls = statusClass(status);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${styles[cls]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
