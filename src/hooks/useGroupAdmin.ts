// Hook: Group Admin Operations (Group Isolated)
// Project: B-Zooginer Pre-Order Platform

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGroupAdminStats,
  getMyGroup,
  getGroupProducts,
  toggleProductActive,
  getGroupOrders,
  updateOrderStatus,
  confirmOrderPayment,
} from '@/services/groupAdmin.service';
import { cancelOrder } from '@/services/orders.service';
import { updateGroupProfile, type UpdateGroupProfileInput } from '@/services/groups.service';
import type { OrderStatusType } from '@/types/database.types';

export function useGroupAdminStats(groupId: string) {
  return useQuery({
    queryKey: ['group-admin', 'stats', groupId],
    queryFn: () => getGroupAdminStats(groupId),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60,
  });
}

export function useMyGroup(groupId: string) {
  return useQuery({
    queryKey: ['group-admin', 'my-group', groupId],
    queryFn: () => getMyGroup(groupId),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useGroupProducts(groupId: string) {
  return useQuery({
    queryKey: ['group-admin', 'products', groupId],
    queryFn: () => getGroupProducts(groupId),
    enabled: Boolean(groupId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleProductActive(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      toggleProductActive(productId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'products', groupId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useGroupOrders(
  groupId: string,
  filters?: {
    orderStatus?: string;
    paymentStatus?: string;
    source?: string;
    search?: string;
    sortBy?: string;
  }
) {
  return useQuery({
    queryKey: ['group-admin', 'orders', groupId, filters],
    queryFn: () => getGroupOrders(groupId, filters),
    enabled: Boolean(groupId),
    staleTime: 1000 * 30,
  });
}

export function useUpdateOrderStatus(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatusType }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats', groupId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useConfirmOrderPayment(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => confirmOrderPayment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats', groupId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useCancelOrder(groupId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: ['group-admin', 'orders', groupId] });
        queryClient.invalidateQueries({ queryKey: ['group-admin', 'stats', groupId] });
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateGroupProfile(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGroupProfileInput) => updateGroupProfile(groupId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'my-group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
