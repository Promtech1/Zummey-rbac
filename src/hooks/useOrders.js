import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getOrders } from '../services/orderService'

export function useOrders(params = {}, options = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}
