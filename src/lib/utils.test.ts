import { describe, expect, it } from 'vitest';
import { formatCurrency } from './formatCurrency';
import { getStatusLabel } from './getStatusLabel';
import { maskAccountNumber } from './maskAccountNumber';

describe('formatCurrency', () => {
  it('formats a normal balance with two decimals', () => {
    const out = formatCurrency(1234.5);
    expect(out).toMatch(/234/);
    expect(out).toMatch(/50/);
  });

  it('returns an em dash for non-finite amounts', () => {
    expect(formatCurrency(Number.NaN)).toBe('—');
  });
});

describe('maskAccountNumber', () => {
  it('shows only the last four digits', () => {
    expect(maskAccountNumber('1000123456789')).toBe('••••6789');
  });
});

describe('getStatusLabel', () => {
  it('maps known codes to friendly labels', () => {
    expect(getStatusLabel('active')).toBe('Active');
    expect(getStatusLabel('pending')).toBe('Pending review');
  });
});
