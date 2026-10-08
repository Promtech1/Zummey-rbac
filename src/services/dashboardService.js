import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// params: { fleetManagerId? } (honoured for admins only; the server decides)
export const getDashboardStats = (params = {}) =>
  request(
    (token) => mockServer.getDashboardStats(token, params),
    () => axiosInstance.get('/dashboard/stats', { params }),
  )
