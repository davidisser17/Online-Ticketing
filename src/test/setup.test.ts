// ============================================================
// Smoke test — verifies the test setup is wired correctly.
// ============================================================

import { CONCERT_STATUSES, ORDER_STATUSES } from '../utils/constants';
import type { Concert, Order } from '../types';

describe('Project setup smoke tests', () => {
  it('constants are exported correctly', () => {
    expect(CONCERT_STATUSES).toHaveLength(3);
    expect(ORDER_STATUSES).toHaveLength(5);
  });

  it('TypeScript types are importable (compile-time check)', () => {
    // If this file compiles, the types are correctly exported.
    const concert = {} as Concert;
    const order = {} as Order;
    expect(concert).toBeDefined();
    expect(order).toBeDefined();
  });

  it('jest-dom matchers are available via setup.ts', () => {
    // Create a minimal DOM element and assert with jest-dom matcher.
    const div = document.createElement('div');
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });
});
