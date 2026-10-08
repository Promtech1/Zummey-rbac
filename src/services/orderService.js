import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// params: { status?, search?, fleetManagerId? (admin only) }
export const getOrders = (params = {}) =>
  request(
    (token) => mockServer.getOrders(token, params),
    () => axiosInstance.get('/orders', { params }),
  )
