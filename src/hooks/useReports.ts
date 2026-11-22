// Hook: Financial & Sales Reports
// Project: B-Zooginer Pre-Order Platform

import { useQuery } from '@tanstack/react-query';
import { getComprehensiveReport, type ReportFilterOptions } from '@/services/reports.service';

export function useComprehensiveReport(filters: ReportFilterOptions = {}) {
  return useQuery({
    queryKey: ['reports', 'comprehensive', filters],
    queryFn: () => getComprehensiveReport(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}
