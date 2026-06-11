// ============================================================
// Concert Ticket Jastip — Validation & Calculation Utilities
// ============================================================

import type { Concert, ConcertStatus, OrderStatus } from '@/types';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  ORDER_STATUS_TRANSITIONS,
  WHATSAPP_MAX_DIGITS,
  WHATSAPP_MIN_DIGITS,
} from '@/utils/constants';

/**
 * Validate a WhatsApp number.
 * Valid: exactly 10–15 digits, no other characters.
 */
export function validateWhatsApp(input: string): boolean {
  const digits = /^\d+$/.test(input) ? input.length : -1;
  return digits >= WHATSAPP_MIN_DIGITS && digits <= WHATSAPP_MAX_DIGITS;
}

/**
 * Validate an e-mail address.
 * Valid: at least 1 character before '@', and the domain part after '@' must
 * contain at least one '.'.
 */
export function validateEmail(input: string): boolean {
  const atIndex = input.indexOf('@');
  if (atIndex < 1) return false; // no '@' or nothing before '@'
  const domain = input.slice(atIndex + 1);
  return domain.includes('.');
}

/**
 * Validate a ticket quantity.
 * Valid: integer, >= 1, and <= min(maxPerOrder, remainingQuota).
 */
export function validateTicketQty(
  qty: number,
  maxPerOrder: number,
  remainingQuota: number,
): boolean {
  if (!Number.isInteger(qty)) return false;
  if (qty < 1) return false;
  return qty <= Math.min(maxPerOrder, remainingQuota);
}

/**
 * Validate a media file for upload.
 * Valid: MIME type must be one of the accepted image types AND size <= 5 MB.
 */
export function validateMediaFile(file: { type: string; size: number }): boolean {
  const isAcceptedType = (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
  const isWithinSize = file.size <= MAX_FILE_SIZE_BYTES;
  return isAcceptedType && isWithinSize;
}

/**
 * Calculate totals for an order.
 *
 * @returns subtotal       — ticketPrice × qty
 * @returns jastipTotal    — jastipFee × qty
 * @returns grandTotal     — subtotal + jastipTotal
 */
export function calculateOrderTotal(
  ticketPrice: number,
  jastipFee: number,
  qty: number,
): { subtotal: number; jastipTotal: number; grandTotal: number } {
  const subtotal = ticketPrice * qty;
  const jastipTotal = jastipFee * qty;
  const grandTotal = subtotal + jastipTotal;
  return { subtotal, jastipTotal, grandTotal };
}

/**
 * Return the valid next statuses for the given order status.
 * Terminal statuses ('Selesai', 'Dibatalkan') return an empty array.
 */
export function getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus];
}

/**
 * Filter a list of concerts to those whose status is in the given statuses array.
 */
export function filterConcertsByStatus(
  concerts: Concert[],
  statuses: ConcertStatus[],
): Concert[] {
  return concerts.filter((c) => statuses.includes(c.status));
}
