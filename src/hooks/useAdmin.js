import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approvePendingUser,
  getFleetOwners,
  getPendingUsers,
  rejectPendingUser,
} from '../services/adminService'

// `options` lets a caller pass extra React Query options, e.g. { enabled: false }.
export function useFleetOwners(options = {}) {
  return useQuery({
    queryKey: ['admin', 'fleet-owners'],
    queryFn: getFleetOwners,
    ...options,
  })
}

export function usePendingUsers(options = {}) {
  return useQuery({
    queryKey: ['admin', 'pending-users'],
    queryFn: getPendingUsers,
    ...options,
  })
}

// Approving creates a fleet owner or rider, so those lists refetch too.
// Returning the promise keeps the mutation "pending" until the refetch is
// done, so the row's spinner stays until the user leaves the list.
function useAdminMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['riders'] }),
      ]),
  })
}

export const useApprovePendingUser = () => useAdminMutation(approvePendingUser)
export const useRejectPendingUser = () => useAdminMutation(rejectPendingUser)
