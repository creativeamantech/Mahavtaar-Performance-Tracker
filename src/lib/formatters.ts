export const fmtCur = (n: number | null | undefined): string => {
  if (n == null || n === 0) return '—';
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

export const fmtPct = (n: number | null | undefined): string => {
  if (n == null || isNaN(n)) return '0.00%';
  return (n * 100).toFixed(2) + '%';
};

export const fmtNum = (n: number | null | undefined): string => {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

export const fmtDate = (d: string | Date | null | undefined): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const pctColor = (pct: number): string => {
  if (pct > 0.5) return 'text-success';
  if (pct > 0.3) return 'text-primary';
  return 'text-destructive';
};

export const targetColor = (target: number): string =>
  target <= 0 ? 'text-success' : 'text-primary';
