// Hook: Orders Operations (Public, Admin Manual, Order Details & Cancellation)
// Project: B-Zooginer Pre-Order Platform

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  submitPublicOrder,
  submitAdminOrder,
  getOrderConfirmation,
  getOrderDetailsWithItems,
  cancelOrder,
  updateOrderPayment,
  updateOrderStatus,
  type PublicOrderPayload,
  type AdminOrderPayload,
} from '@/services/orders.service';
import type { PaymentStatusType, OrderStatusType } from '@/types/database.types';

export function useSubmitPublicOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublicOrderPayload) => submitPublicOrder(payload),
    onSuccess: () => {
      // Invalidate products query to reflect updated variant stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useSubmitAdminOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminOrderPayload) => submitAdminOrder(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats', variables.group_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useOrderConfirmation(orderCode: string, accessToken: string) {
  return useQuery({
    queryKey: ['orders', 'confirmation', orderCode, accessToken],
    queryFn: () => getOrderConfirmation(orderCode, accessToken),
    enabled: Boolean(orderCode && accessToken),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrderDetails(orderId?: string) {
  return useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => (orderId ? getOrderDetailsWithItems(orderId) : null),
    enabled: Boolean(orderId),
    staleTime: 1000 * 30,
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateOrderPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: PaymentStatusType }) =>
      updateOrderPayment(orderId, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats'] });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatusType }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders'] });
    },
  });
}
