// ============================================================
// Unit tests for src/utils/formatters.ts
// ============================================================
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from '../formatters';

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
describe('formatCurrency', () => {
  it('formats one million rupiah correctly', () => {
    expect(formatCurrency(1_000_000)).toBe('Rp\u00a01.000.000');
  });

  it('formats zero rupiah', () => {
    expect(formatCurrency(0)).toBe('Rp\u00a00');
  });

  it('formats a small amount without decimal separator', () => {
    expect(formatCurrency(500)).toBe('Rp\u00a0500');
  });

  it('formats a large amount with multiple separators', () => {
    expect(formatCurrency(75_000_000)).toBe('Rp\u00a075.000.000');
  });

  it('always omits fractional digits', () => {
    // Even if given a float, the formatter rounds and omits decimals
    const result = formatCurrency(99_999.9);
    expect(result).not.toMatch(/,/);
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('formats a Saturday date in Indonesian', () => {
    // 2025-03-15 is a Saturday (Sabtu)
    const result = formatDate('2025-03-15T19:00:00');
    expect(result).toContain('2025');
    expect(result.toLowerCase()).toContain('maret');
    expect(result).toContain('15');
    expect(result.toLowerCase()).toContain('sabtu');
  });

  it('formats a Sunday date in Indonesian', () => {
    // 2025-01-05 is a Sunday (Minggu)
    const result = formatDate('2025-01-05T00:00:00');
    expect(result.toLowerCase()).toContain('minggu');
    expect(result.toLowerCase()).toContain('januari');
    expect(result).toContain('2025');
  });

  it('formats a Monday date in Indonesian', () => {
    // 2025-06-02 is a Monday (Senin)
    const result = formatDate('2025-06-02T10:00:00');
    expect(result.toLowerCase()).toContain('senin');
    expect(result.toLowerCase()).toContain('juni');
    expect(result).toContain('2025');
  });

  it('includes the full month name, not a number', () => {
    const result = formatDate('2025-12-25T00:00:00');
    expect(result.toLowerCase()).toContain('desember');
  });
});

// ---------------------------------------------------------------------------
// formatDateTime
// ---------------------------------------------------------------------------
describe('formatDateTime', () => {
  it('appends WIB suffix', () => {
    const result = formatDateTime('2025-03-15T19:00:00');
    expect(result).toMatch(/WIB$/);
  });

  it('uses bullet separator between date and time parts', () => {
    const result = formatDateTime('2025-03-15T19:00:00');
    expect(result).toContain('•');
  });

  it('contains the date components', () => {
    const result = formatDateTime('2025-03-15T19:00:00');
    expect(result).toContain('2025');
    expect(result.toLowerCase()).toContain('maret');
    expect(result).toContain('15');
  });

  it('contains a time portion in HH.MM or HH:MM format', () => {
    const result = formatDateTime('2025-03-15T19:00:00');
    // id-ID locale may use '.' or ':' as time separator depending on runtime
    expect(result).toMatch(/\d{2}[.:]\d{2}/);
  });

  it('different times produce different outputs', () => {
    const morning = formatDateTime('2025-06-01T08:30:00');
    const evening = formatDateTime('2025-06-01T20:45:00');
    expect(morning).not.toBe(evening);
  });
});

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------
describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const freezeAt = (ms: number) => {
    vi.useFakeTimers();
    vi.setSystemTime(ms);
  };

  it('returns "baru saja" for timestamps less than 60 seconds ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 30_000).toISOString(); // 30 s ago
    expect(formatRelativeTime(iso)).toBe('baru saja');
  });

  it('returns "baru saja" for exactly 0 seconds ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    expect(formatRelativeTime(new Date(now).toISOString())).toBe('baru saja');
  });

  it('returns "N menit yang lalu" for timestamps between 1 and 59 minutes ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 5 * 60_000).toISOString(); // 5 min ago
    expect(formatRelativeTime(iso)).toBe('5 menit yang lalu');
  });

  it('returns "1 menit yang lalu" for exactly 60 seconds ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('1 menit yang lalu');
  });

  it('returns "N jam yang lalu" for timestamps between 1 and 23 hours ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 3 * 3_600_000).toISOString(); // 3 h ago
    expect(formatRelativeTime(iso)).toBe('3 jam yang lalu');
  });

  it('returns "1 jam yang lalu" for exactly 60 minutes ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 60 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('1 jam yang lalu');
  });

  it('returns "N hari yang lalu" for timestamps 24 hours or more ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 2 * 24 * 3_600_000).toISOString(); // 2 days ago
    expect(formatRelativeTime(iso)).toBe('2 hari yang lalu');
  });

  it('returns "1 hari yang lalu" for exactly 24 hours ago', () => {
    const now = 1_700_000_000_000;
    freezeAt(now);
    const iso = new Date(now - 24 * 3_600_000).toISOString();
    expect(formatRelativeTime(iso)).toBe('1 hari yang lalu');
  });
});
