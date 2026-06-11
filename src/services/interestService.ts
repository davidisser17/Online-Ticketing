// ============================================================
// Concert Ticket Jastip — Interest Service
// ============================================================

import apiClient from './api';
import type { ApiResponse, Interest } from '@/types';

// ------ DTOs -------------------------------------------------

export interface InterestFormData {
  fullName: string;
  whatsapp: string;
  email: string;
}

// ------ Endpoints --------------------------------------------

export const registerInterest = (
  concertId: string,
  data: InterestFormData,
) =>
  apiClient.post<ApiResponse<Interest>>(
    `/concerts/${concertId}/interests`,
    data,
  );
