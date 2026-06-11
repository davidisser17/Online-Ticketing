// ============================================================
// Concert Ticket Jastip — Auth Service
// ============================================================

import apiClient from './api';
import type { ApiResponse, AdminUser } from '@/types';

export const login = (credentials: {
  username: string;
  password: string;
}) =>
  apiClient.post<ApiResponse<{ token: string; user: AdminUser }>>(
    '/cms/auth/login',
    credentials,
  );

export const logout = () => apiClient.post('/cms/auth/logout');
