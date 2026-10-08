import axiosInstance from './axiosInstance'
import { request } from './request'
import * as mockServer from '../mocks/mockServer'

// params: { fleetManagerId? (admin only) }
export const getFinanceSummary = (params = {}) =>
  request(
    (token) => mockServer.getFinanceSummary(token, params),
    () => axiosInstance.get('/finance/summary', { params }),
  )

// params: { type?: 'credit' | 'debit', fleetManagerId? (admin only) }
export const getTransactions = (params = {}) =>
  request(
    (token) => mockServer.getTransactions(token, params),
    () => axiosInstance.get('/finance/transactions', { params }),
  )

// data: { amount, bankName, accountNumber }
export const requestWithdrawal = (data) =>
  request(
    (token) => mockServer.requestWithdrawal(token, data),
    () => axiosInstance.post('/finance/withdrawals', data),
  )
