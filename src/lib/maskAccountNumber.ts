/**
 * Masks an account number, keeping only the last few digits visible.
 */
export function maskAccountNumber(account: string, visibleDigits = 4): string {
  const digits = account.replace(/\D/g, '');
  if (digits.length <= visibleDigits) return '••••';
  const tail = digits.slice(-visibleDigits);
  return `••••${tail}`;
}
