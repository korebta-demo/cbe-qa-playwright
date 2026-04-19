import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../../src/utils/formatCurrency';

// DEMO: This test is intentionally incorrect to show CI failure
describe('DEMO: intentional failure (remove or fix after the demo)', () => {
  it('expects the wrong string on purpose', () => {
    expect(formatCurrency(1500)).toBe('$1500');
  });
});
