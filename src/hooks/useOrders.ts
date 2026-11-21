// Hook: Orders
// Project: B-Zooginer Pre-Order Platform

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitPublicOrder, getOrderConfirmation, type PublicOrderPayload } from '@/services/orders.service';

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

export function useOrderConfirmation(orderCode: string, accessToken: string) {
  return useQuery({
    queryKey: ['orders', 'confirmation', orderCode, accessToken],
    queryFn: () => getOrderConfirmation(orderCode, accessToken),
    enabled: Boolean(orderCode && accessToken),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}
