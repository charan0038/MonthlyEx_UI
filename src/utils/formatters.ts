export const formatINR = (amount: number, includeDecimals: boolean = false): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
};

export const getMonthKey = (year: number, month: number): string => {
  const m = String(month + 1).padStart(2, '0');
  return `${year}-${m}`;
};

export const getMonthName = (monthIndex: number, year: number): string => {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
