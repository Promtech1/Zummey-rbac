import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVehicle, getVehicles } from '../services/vehicleService'

// keepPreviousData: while a new search/filter loads, keep showing the old
// rows instead of flashing a skeleton on every keystroke.
export function useVehicles(params = {}, options = {}) {
  return useQuery({
    queryKey: ['vehicles', params],
    queryFn: () => getVehicles(params),
    placeholderData: keepPreviousData,
    ...options,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'fleet-owners'] }) // vehicle counts
    },
  })
}
