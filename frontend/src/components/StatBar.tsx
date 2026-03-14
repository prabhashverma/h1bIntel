import { useStats } from '../hooks/useStats';
import { fmtNumber } from '../utils/formatters';

export function StatBar() {
  const stats = useStats();
  if (!stats) return null;

  return (
    <div className="flex justify-center gap-2 flex-wrap mt-5">
      <span className="bg-white/12 backdrop-blur border border-white/15 text-white/90 text-xs font-semibold px-3.5 py-1 rounded-full whitespace-nowrap">
        <strong className="text-white font-bold">{fmtNumber(stats.perm_records)}</strong>&nbsp;Green Card
      </span>
      {stats.lca_records && (
        <span className="bg-white/12 backdrop-blur border border-white/15 text-white/90 text-xs font-semibold px-3.5 py-1 rounded-full whitespace-nowrap">
          <strong className="text-white font-bold">{fmtNumber(stats.lca_records)}</strong>&nbsp;H-1B
        </span>
      )}
      <span className="bg-white/12 backdrop-blur border border-white/15 text-white/90 text-xs font-semibold px-3.5 py-1 rounded-full whitespace-nowrap">
        <strong className="text-white font-bold">{fmtNumber(stats.unique_employers)}</strong>&nbsp;employers
      </span>
    </div>
  );
}
