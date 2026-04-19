/**
 * Formats a number as currency for display (demo-friendly, ETB default).
 */
export function formatCurrency(amount: number, currencyCode = 'ETB'): string {
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
