// Hook: Site Settings
// Project: B-Zooginer Pre-Order Platform

import { useQuery } from '@tanstack/react-query';
import { getPublicSiteSettings } from '@/services/settings.service';

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: getPublicSiteSettings,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
