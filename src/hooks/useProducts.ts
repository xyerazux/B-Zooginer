// Hook: Products & Admin Product Mutations
// Project: B-Zooginer Pre-Order Platform

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getActiveProducts,
  getProductByIdOrSlug,
  getProductForAdmin,
  createProductWithVariants,
  updateProductWithVariants,
  deleteProduct,
  type ProductFormData,
} from '@/services/products.service';

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

export function useProductForAdmin(productId: string) {
  return useQuery({
    queryKey: ['products', 'admin-detail', productId],
    queryFn: () => getProductForAdmin(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60,
  });
}

export function useCreateProduct(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => createProductWithVariants(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'products', groupId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<ProductFormData> }) =>
      updateProductWithVariants(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'products', groupId] });
      queryClient.invalidateQueries({ queryKey: ['products', 'admin-detail', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-admin', 'products', groupId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
