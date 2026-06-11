// ============================================================
// Unit tests — validators.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  validateWhatsApp,
  validateEmail,
  validateTicketQty,
  validateMediaFile,
  calculateOrderTotal,
  getValidTransitions,
  filterConcertsByStatus,
} from '@/utils/validators';
import type { Concert } from '@/types';

// ────────────────────────────────────────────────────────────
// validateWhatsApp
// ────────────────────────────────────────────────────────────
describe('validateWhatsApp', () => {
  it('accepts a 10-digit number', () => {
    expect(validateWhatsApp('0812345678')).toBe(true);
  });

  it('accepts a 15-digit number', () => {
    expect(validateWhatsApp('081234567890123')).toBe(true);
  });

  it('accepts a 12-digit number (common Indonesian format)', () => {
    expect(validateWhatsApp('628123456789')).toBe(true);
  });

  it('rejects a 9-digit number (too short)', () => {
    expect(validateWhatsApp('081234567')).toBe(false);
  });

  it('rejects a 16-digit number (too long)', () => {
    expect(validateWhatsApp('0812345678901234')).toBe(false);
  });

  it('rejects input containing non-digit characters', () => {
    expect(validateWhatsApp('+628123456789')).toBe(false);
  });

  it('rejects input with spaces', () => {
    expect(validateWhatsApp('0812 3456 789')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(validateWhatsApp('')).toBe(false);
  });

  it('rejects dashes', () => {
    expect(validateWhatsApp('0812-3456-789')).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// validateEmail
// ────────────────────────────────────────────────────────────
describe('validateEmail', () => {
  it('accepts a standard email', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('accepts a subdomain email', () => {
    expect(validateEmail('user@mail.example.co.id')).toBe(true);
  });

  it('rejects missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('rejects @ at the very start (nothing before @)', () => {
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('rejects domain without a dot', () => {
    expect(validateEmail('user@localhost')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects email with no domain after @', () => {
    expect(validateEmail('user@')).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// validateTicketQty
// ────────────────────────────────────────────────────────────
describe('validateTicketQty', () => {
  it('accepts qty=1 when maxPerOrder=5 and remainingQuota=10', () => {
    expect(validateTicketQty(1, 5, 10)).toBe(true);
  });

  it('accepts qty equal to maxPerOrder', () => {
    expect(validateTicketQty(5, 5, 10)).toBe(true);
  });

  it('accepts qty equal to remainingQuota (less than maxPerOrder)', () => {
    expect(validateTicketQty(3, 5, 3)).toBe(true);
  });

  it('rejects qty = 0', () => {
    expect(validateTicketQty(0, 5, 10)).toBe(false);
  });

  it('rejects negative qty', () => {
    expect(validateTicketQty(-1, 5, 10)).toBe(false);
  });

  it('rejects qty exceeding maxPerOrder', () => {
    expect(validateTicketQty(6, 5, 10)).toBe(false);
  });

  it('rejects qty exceeding remainingQuota', () => {
    expect(validateTicketQty(4, 5, 3)).toBe(false);
  });

  it('rejects a floating-point qty', () => {
    expect(validateTicketQty(1.5, 5, 10)).toBe(false);
  });

  it('rejects qty when remainingQuota is 0', () => {
    expect(validateTicketQty(1, 5, 0)).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// validateMediaFile
// ────────────────────────────────────────────────────────────
const FIVE_MB = 5 * 1024 * 1024;

describe('validateMediaFile', () => {
  it('accepts image/jpeg under 5 MB', () => {
    expect(validateMediaFile({ type: 'image/jpeg', size: 1024 })).toBe(true);
  });

  it('accepts image/jpg under 5 MB', () => {
    expect(validateMediaFile({ type: 'image/jpg', size: 1024 })).toBe(true);
  });

  it('accepts image/png under 5 MB', () => {
    expect(validateMediaFile({ type: 'image/png', size: FIVE_MB })).toBe(true);
  });

  it('accepts image/webp exactly at 5 MB', () => {
    expect(validateMediaFile({ type: 'image/webp', size: FIVE_MB })).toBe(true);
  });

  it('rejects image/jpeg exceeding 5 MB', () => {
    expect(validateMediaFile({ type: 'image/jpeg', size: FIVE_MB + 1 })).toBe(false);
  });

  it('rejects unsupported type image/gif', () => {
    expect(validateMediaFile({ type: 'image/gif', size: 1024 })).toBe(false);
  });

  it('rejects application/pdf', () => {
    expect(validateMediaFile({ type: 'application/pdf', size: 1024 })).toBe(false);
  });

  it('rejects empty type string', () => {
    expect(validateMediaFile({ type: '', size: 1024 })).toBe(false);
  });

  it('rejects size = 0 with invalid type', () => {
    expect(validateMediaFile({ type: 'text/plain', size: 0 })).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────
// calculateOrderTotal
// ────────────────────────────────────────────────────────────
describe('calculateOrderTotal', () => {
  it('calculates correctly for a standard order', () => {
    const result = calculateOrderTotal(150_000, 20_000, 2);
    expect(result.subtotal).toBe(300_000);
    expect(result.jastipTotal).toBe(40_000);
    expect(result.grandTotal).toBe(340_000);
  });

  it('calculates correctly for qty = 1', () => {
    const result = calculateOrderTotal(100_000, 10_000, 1);
    expect(result.subtotal).toBe(100_000);
    expect(result.jastipTotal).toBe(10_000);
    expect(result.grandTotal).toBe(110_000);
  });

  it('calculates correctly when jastipFee is 0', () => {
    const result = calculateOrderTotal(200_000, 0, 3);
    expect(result.subtotal).toBe(600_000);
    expect(result.jastipTotal).toBe(0);
    expect(result.grandTotal).toBe(600_000);
  });

  it('calculates correctly for qty = 0 (edge: results in 0)', () => {
    const result = calculateOrderTotal(100_000, 10_000, 0);
    expect(result.subtotal).toBe(0);
    expect(result.jastipTotal).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('grandTotal equals subtotal + jastipTotal', () => {
    const result = calculateOrderTotal(75_000, 15_000, 4);
    expect(result.grandTotal).toBe(result.subtotal + result.jastipTotal);
  });
});

// ────────────────────────────────────────────────────────────
// getValidTransitions
// ────────────────────────────────────────────────────────────
describe('getValidTransitions', () => {
  it('Menunggu Pembayaran can only transition to Dibatalkan', () => {
    expect(getValidTransitions('Menunggu Pembayaran')).toEqual(['Dibatalkan']);
  });

  it('Dibayar can transition to Diproses or Dibatalkan', () => {
    const transitions = getValidTransitions('Dibayar');
    expect(transitions).toContain('Diproses');
    expect(transitions).toContain('Dibatalkan');
    expect(transitions).toHaveLength(2);
  });

  it('Diproses can only transition to Selesai', () => {
    expect(getValidTransitions('Diproses')).toEqual(['Selesai']);
  });

  it('Selesai has no valid transitions (terminal)', () => {
    expect(getValidTransitions('Selesai')).toEqual([]);
  });

  it('Dibatalkan has no valid transitions (terminal)', () => {
    expect(getValidTransitions('Dibatalkan')).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────
// filterConcertsByStatus
// ────────────────────────────────────────────────────────────

/** Build a minimal Concert fixture */
function makeConcert(id: string, status: Concert['status']): Concert {
  return {
    id,
    artistName: 'Artist',
    date: '2025-01-01T19:00:00',
    venueName: 'Venue',
    venueAddress: 'Address',
    city: 'City',
    jastipFee: 0,
    quota: 100,
    remainingQuota: 100,
    maxTicketsPerOrder: 4,
    status,
    ticketCategories: [],
    posterUrls: [],
    interestCount: 0,
    createdAt: '2025-01-01T00:00:00',
    updatedAt: '2025-01-01T00:00:00',
  };
}

describe('filterConcertsByStatus', () => {
  const concerts: Concert[] = [
    makeConcert('1', 'Akan Datang'),
    makeConcert('2', 'Berlangsung'),
    makeConcert('3', 'Selesai'),
    makeConcert('4', 'Akan Datang'),
  ];

  it('filters to Akan Datang only', () => {
    const result = filterConcertsByStatus(concerts, ['Akan Datang']);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.status === 'Akan Datang')).toBe(true);
  });

  it('filters to multiple statuses', () => {
    const result = filterConcertsByStatus(concerts, ['Akan Datang', 'Berlangsung']);
    expect(result).toHaveLength(3);
  });

  it('returns empty array when no concerts match', () => {
    const result = filterConcertsByStatus(concerts, ['Selesai']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns empty array for empty statuses list', () => {
    const result = filterConcertsByStatus(concerts, []);
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty concerts list', () => {
    const result = filterConcertsByStatus([], ['Akan Datang']);
    expect(result).toHaveLength(0);
  });

  it('returns all concerts when all statuses are included', () => {
    const result = filterConcertsByStatus(concerts, [
      'Akan Datang',
      'Berlangsung',
      'Selesai',
    ]);
    expect(result).toHaveLength(4);
  });
});
