import { fmtWage } from '../utils/formatters';

export function WageBadge({ row }: { row: { WAGE_FROM?: string; WAGE_TO?: string; WAGE_UNIT?: string } }) {
  return <span className="text-sm font-bold text-green-600 whitespace-nowrap">{fmtWage(row)}</span>;
}
