import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// All of these are admin-only on the server: non-admins get a 403 ApiError.

export const getFleetOwners = () =>
  request(
    (token) => mockServer.getFleetOwners(token),
    () => axiosInstance.get('/admin/fleet-owners'),
  )

export const getPendingUsers = () =>
  request(
    (token) => mockServer.getPendingUsers(token),
    () => axiosInstance.get('/admin/pending-users'),
  )

export const approvePendingUser = (id) =>
  request(
    (token) => mockServer.approvePendingUser(token, id),
    () => axiosInstance.post(`/admin/pending-users/${id}/approve`),
  )

export const rejectPendingUser = (id) =>
  request(
    (token) => mockServer.rejectPendingUser(token, id),
    () => axiosInstance.post(`/admin/pending-users/${id}/reject`),
  )
