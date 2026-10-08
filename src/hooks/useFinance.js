import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFinanceSummary, getTransactions, requestWithdrawal } from '../services/financeService'

export function useFinanceSummary(params = {}) {
  return useQuery({
    queryKey: ['finance', 'summary', params],
    queryFn: () => getFinanceSummary(params),
    placeholderData: keepPreviousData,
  })
}

export function useTransactions(params = {}) {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
  })
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance'] }),
  })
}
