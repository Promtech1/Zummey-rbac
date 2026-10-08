import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../services/dashboardService'

export function useDashboardStats(params = {}) {
  return useQuery({
    queryKey: ['dashboard', 'stats', params],
    queryFn: () => getDashboardStats(params),
  })
}
