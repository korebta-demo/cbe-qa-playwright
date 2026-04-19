/**
 * Demo-friendly USD formatter for unit tests (separate from the ETB formatter in `src/lib/`).
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
