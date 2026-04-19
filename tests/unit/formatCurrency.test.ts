import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../../src/utils/formatCurrency';

describe('formatCurrency (USD)', () => {
  it('formats whole dollars with cents', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
  });

  it('formats decimals', () => {
    expect(formatCurrency(10.5)).toBe('$10.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
