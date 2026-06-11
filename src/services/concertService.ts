// ============================================================
// Concert Ticket Jastip — Concert Service
// ============================================================

import apiClient from './api';
import type { ApiResponse, Concert } from '@/types';

export const getConcerts = (params?: { status?: string[] }) =>
  apiClient.get<ApiResponse<Concert[]>>('/concerts', { params });

export const getConcertById = (id: string) =>
  apiClient.get<ApiResponse<Concert>>(`/concerts/${id}`);
