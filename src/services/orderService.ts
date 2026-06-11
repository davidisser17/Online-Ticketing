// ============================================================
// Concert Ticket Jastip — Order Service
// ============================================================

import apiClient from './api';
import type { ApiResponse, Order, OrderStatus, PaymentToken } from '@/types';

// ------ DTOs -------------------------------------------------

export interface CreateOrderDto {
  concertId: string;
  ticketCategoryId: string;
  ticketQty: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  concertId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ------ Public endpoints -------------------------------------

export const createOrder = (data: CreateOrderDto) =>
  apiClient.post<ApiResponse<Order>>('/orders', data);

export const getOrderByNumberAndWhatsapp = (
  orderNumber: string,
  whatsapp: string,
) =>
  apiClient.get<ApiResponse<Order>>('/orders/track', {
    params: { orderNumber, whatsapp },
  });

export const getPaymentToken = (orderId: string) =>
  apiClient.post<ApiResponse<PaymentToken>>(`/orders/${orderId}/payment-token`);

// ------ CMS endpoints ----------------------------------------

export const getAllOrders = (filters?: OrderFilters) =>
  apiClient.get<ApiResponse<Order[]>>('/cms/orders', { params: filters });

export const getOrderById = (id: string) =>
  apiClient.get<ApiResponse<Order>>(`/cms/orders/${id}`);

export const updateOrderStatus = (
  id: string,
  status: OrderStatus,
  note?: string,
) =>
  apiClient.patch<ApiResponse<Order>>(`/cms/orders/${id}/status`, {
    status,
    note,
  });
