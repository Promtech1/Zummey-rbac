import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// params: { status?, search?, fleetManagerId? (admin only) }
export const getVehicles = (params = {}) =>
  request(
    (token) => mockServer.getVehicles(token, params),
    () => axiosInstance.get('/vehicles', { params }),
  )

export const createVehicle = (data) =>
  request(
    (token) => mockServer.createVehicle(token, data),
    () => axiosInstance.post('/vehicles', data),
  )
