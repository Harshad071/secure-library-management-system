import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Filter, Search } from 'lucide-react'

// Day 2: searchable catalog for borrowing and availability checks
import toast from 'react-hot-toast'

import PageWrapper from '../components/PageWrapper'
import StatusBadge from '../components/StatusBadge'
import { getBooks } from '../services/bookService'
import { borrowBook as borrowBookRequest } from '../services/borrowService'

export default function BooksPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [borrowingId, setBorrowingId] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const requestIdRef = useRef(0)

  const loadBooks = useCallback(async (search, showLoading = true) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    if (showLoading) setLoading(true)
    try {
      const nextBooks = await getBooks(search)
      if (requestId === requestIdRef.current) {
        setBooks(nextBooks)
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setBooks([])
        toast.error(error.response?.data?.message || 'Unable to load books')
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadBooks(query)
    }, 250)
    const intervalId = window.setInterval(() => {
      loadBooks(query, false)
    }, 10000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [loadBooks, query])

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesFilter = filter === 'All' || book.status === filter
      return matchesFilter
    })
  }, [books, filter])

  const trimmedQuery = query.trim()
  const suggestions = useMemo(() => {
    if (!trimmedQuery) return []
    return books.slice(0, 6)
  }, [books, trimmedQuery])

  const chooseSuggestion = (book) => {
    setQuery(book.title)
    setSearchFocused(false)
    setBooks([book])
  }

  const borrowBook = async (book) => {
    if (book.availableCopies <= 0) {
      toast.error('This book is currently unavailable')
      return
    }

    setBorrowingId(book.id)
    try {
      await borrowBookRequest(book.id)
      toast.success(`${book.title} request submitted for approval`)
      window.dispatchEvent(new Event('library:data-changed'))
      await loadBooks(query)
    } catch (error) {
      toast.error(error.response?.data?.message || (book.availableCopies <= 0 ? 'Book currently out of stock' : 'Borrow request failed'))
      await loadBooks(query)
    } finally {
      setBorrowingId(null)
    }
  }

  return (
    <PageWrapper
      eyebrow="Catalogue"
      title="Book Search"
      description="Search, filter, and inspect the secure library catalogue from a responsive card interface."
      actions={
        <button className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          {filteredBooks.length} results
        </button>
      }
    >
      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <Search className="text-slate-500" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by title, author, category..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              autoComplete="off"
            />
          </label>
          {searchFocused && trimmedQuery ? (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/40">
              {loading ? (
                <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">No books found</div>
              ) : (
                suggestions.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      chooseSuggestion(book)
                    }}
                    className="flex w-full items-center justify-between gap-4 border-b border-slate-900 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-900"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-white">{book.title}</span>
                      <span className="block text-xs text-slate-500">{book.author}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-cyan-300">{book.status}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <Filter className="text-slate-500" size={18} />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          >
            <option className="bg-slate-950">All</option>
            <option className="bg-slate-950">Available</option>
            <option className="bg-slate-950">Unavailable</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-sm text-slate-400">
          Loading live catalogue...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
          <BookOpen className="mx-auto text-slate-500" size={36} />
          <h2 className="mt-4 text-lg font-bold text-white">No books found</h2>
          <p className="mt-2 text-sm text-slate-500">Try a different keyword or status filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => (
            <article key={book.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-cyan-400/40">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                  <BookOpen size={20} />
                </span>
                <StatusBadge status={book.status} />
              </div>
              <h2 className="mt-5 text-lg font-bold text-white">{book.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{book.author}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{book.category}</p>
              <p className="mt-3 text-xs text-slate-500">{book.availableCopies} of {book.totalCopies} copies available</p>
              <button
                type="button"
                disabled={book.availableCopies <= 0 || borrowingId === book.id}
                onClick={() => borrowBook(book)}
                className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
              >
                {borrowingId === book.id ? 'Submitting...' : book.availableCopies > 0 ? 'Request borrow' : 'Currently unavailable'}
              </button>
            </article>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
