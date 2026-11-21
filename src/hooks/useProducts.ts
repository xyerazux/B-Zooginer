// Hook: Products
// Project: B-Zooginer Pre-Order Platform

import { useQuery } from '@tanstack/react-query';
import { getActiveProducts, getProductByIdOrSlug } from '@/services/products.service';

export function useActiveProducts(groupId?: string) {
  return useQuery({
    queryKey: ['products', 'active', groupId || 'all'],
    queryFn: () => getActiveProducts(groupId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useProductDetail(identifier: string) {
  return useQuery({
    queryKey: ['products', 'detail', identifier],
    queryFn: () => getProductByIdOrSlug(identifier),
    enabled: Boolean(identifier),
    staleTime: 1000 * 60 * 2,
  });
}
