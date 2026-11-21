// Hook: Groups
// Project: B-Zooginer Pre-Order Platform

import { useQuery } from '@tanstack/react-query';
import { getPublishedGroups, getGroupBySlugOrId } from '@/services/groups.service';

export function usePublishedGroups() {
  return useQuery({
    queryKey: ['groups', 'published'],
    queryFn: getPublishedGroups,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useGroupDetail(identifier: string) {
  return useQuery({
    queryKey: ['groups', 'detail', identifier],
    queryFn: () => getGroupBySlugOrId(identifier),
    enabled: Boolean(identifier),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}
