import api from './api'

export const getMyBorrows = async () => {
  const response = await api.get('/borrows/my')
  return Array.isArray(response.data) ? response.data : []
}

export const borrowBook = async (bookId) => {
  const response = await api.post(`/borrows/${bookId}`)
  return response.data
}

export const returnBook = async (borrowId) => {
  const response = await api.post(`/borrows/${borrowId}/return`)
  return response.data
}

export const getPendingRequests = async () => {
  const response = await api.get('/borrows/pending')
  return Array.isArray(response.data) ? response.data : []
}

export const getAllBorrowRequests = async () => {
  const response = await api.get('/borrows')
  return Array.isArray(response.data) ? response.data : []
}

export const approveBorrowRequest = async (borrowId) => {
  const response = await api.post(`/borrows/${borrowId}/approve`)
  return response.data
}

export const rejectBorrowRequest = async (borrowId) => {
  const response = await api.post(`/borrows/${borrowId}/reject`)
  return response.data
}
