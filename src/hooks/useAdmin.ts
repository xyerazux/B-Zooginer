// Hook: Master Admin Operations
// Project: B-Zooginer Pre-Order Platform

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMasterAdminStats,
  getAllGroups,
  toggleGroupPublish,
  createGroup,
  getAdminAccounts,
  createGroupAdminAccount,
  getAllOrders,
  getActivityLogs,
} from '@/services/admin.service';
import type { PoStatusType } from '@/types/database.types';

export function useMasterAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getMasterAdminStats,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAllGroups() {
  return useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: getAllGroups,
    staleTime: 1000 * 60 * 2,
  });
}

export function useToggleGroupPublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, isPublished }: { groupId: string; isPublished: boolean }) =>
      toggleGroupPublish(groupId, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description?: string; po_status?: PoStatusType }) =>
      createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useAdminAccounts() {
  return useQuery({
    queryKey: ['admin', 'accounts'],
    queryFn: getAdminAccounts,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateGroupAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; password: string; full_name: string; group_id: string }) =>
      createGroupAdminAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useAllOrders(filters?: {
  groupId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  source?: string;
  search?: string;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => getAllOrders(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: getActivityLogs,
    staleTime: 1000 * 30,
  });
}
