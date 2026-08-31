import api from './api'

const toNumber = (value, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const normalizeBook = (book) => {
  const availableCopies = toNumber(book?.availableCopies)
  const totalCopies = toNumber(book?.totalCopies)

  return {
    id: book?.id ?? `${book?.title || 'book'}-${book?.isbn || 'unknown'}`,
    title: book?.title || 'Untitled book',
    author: book?.author || 'Unknown author',
    category: book?.category || 'Uncategorized',
    isbn: book?.isbn || '',
    totalCopies,
    availableCopies,
    status: book?.status || (availableCopies > 0 ? 'Available' : 'Unavailable'),
  }
}

export const getBooks = async (query = '', options = {}) => {
  const trimmedQuery = typeof query === 'string' ? query.trim() : ''
  const response = await api.get('/books', {
    params: trimmedQuery ? { q: trimmedQuery } : {},
    signal: options.signal,
  })

  return Array.isArray(response.data) ? response.data.map(normalizeBook) : []
}

export const createBook = async (book) => {
  const response = await api.post('/books', book)
  return response.data
}

export const updateBook = async (bookId, book) => {
  const response = await api.put(`/books/${bookId}`, book)
  return response.data
}

export const deleteBook = async (bookId) => {
  await api.delete(`/books/${bookId}`)
}
