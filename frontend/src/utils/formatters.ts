export function fmtWage(row: { WAGE_FROM?: string; WAGE_TO?: string; WAGE_UNIT?: string }): string {
  if (!row.WAGE_FROM) return '—';
  const from = Number(row.WAGE_FROM).toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  });
  const unit = row.WAGE_UNIT
    ? '/' + row.WAGE_UNIT.toLowerCase().replace('year', 'yr').replace('hour', 'hr')
    : '';
  if (row.WAGE_TO && row.WAGE_TO !== row.WAGE_FROM) {
    const to = Number(row.WAGE_TO).toLocaleString('en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0,
    });
    return `${from} – ${to}${unit}`;
  }
  return `${from}${unit}`;
}

export function fmtPW(row: { PREVAILING_WAGE?: string; PW_UNIT?: string }): string {
  if (!row.PREVAILING_WAGE) return '';
  const pw = Number(row.PREVAILING_WAGE);
  if (isNaN(pw)) return row.PREVAILING_WAGE;
  const fmt = pw.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  });
  const unit = row.PW_UNIT
    ? '/' + row.PW_UNIT.toLowerCase().replace('year', 'yr').replace('hour', 'hr')
    : '';
  return fmt + unit;
}

export function fmtDate(d?: string): string {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function statusClass(status?: string): 'certified' | 'denied' | 'withdrawn' | 'other' {
  if (!status) return 'other';
  const lower = status.toLowerCase();
  if (lower.includes('certified')) return 'certified';
  if (lower.includes('denied')) return 'denied';
  if (lower.includes('withdrawn')) return 'withdrawn';
  return 'other';
}

export function visaChipClass(visaClass?: string): string {
  if (!visaClass) return 'h1b';
  const vc = visaClass.toLowerCase();
  if (vc.includes('e-3')) return 'e3';
  if (vc.includes('h-1b1')) return 'h1b1';
  return 'h1b';
}

export function fmtNumber(n: number | string): string {
  return Number(n).toLocaleString('en-US');
}
