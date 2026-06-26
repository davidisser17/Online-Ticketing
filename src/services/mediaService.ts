// ============================================================
// Concert Ticket Jastip — Media Service
// ============================================================

import apiClient from './api';
import type { ApiResponse } from '@/types';

// ------ Helpers ----------------------------------------------

function createFormData(files: File[]): FormData {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return formData;
}

// ------ Endpoints --------------------------------------------

export const uploadMedia = (
  concertId: string,
  files: File[],
  onProgress?: (pct: number) => void,
) =>
  apiClient.post<ApiResponse<{ urls: string[] }>>(
    `/concerts/${concertId}/media`,
    createFormData(files),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(pct);
        }
      },
    },
  );

export const deleteMedia = (concertId: string, url: string) =>
  apiClient.delete(`/concerts/${concertId}/media`, { data: { url } });
