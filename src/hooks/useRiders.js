import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRider, getRiders } from '../services/riderService'

export function useRiders(params = {}, options = {}) {
  return useQuery({
    queryKey: ['riders', params],
    queryFn: () => getRiders(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}

export function useCreateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
      // Assigning a vehicle changes the vehicle tables and stats too.
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'fleet-owners'] }) // rider counts
    },
  })
}
