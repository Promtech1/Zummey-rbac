import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// params: { search?, fleetManagerId? (admin only) }
export const getRiders = (params = {}) =>
  request(
    (token) => mockServer.getRiders(token, params),
    () => axiosInstance.get('/riders', { params }),
  )

export const createRider = (data) =>
  request(
    (token) => mockServer.createRider(token, data),
    () => axiosInstance.post('/riders', data),
  )
