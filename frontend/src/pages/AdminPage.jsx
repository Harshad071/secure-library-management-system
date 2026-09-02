import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, BookPlus, Check, ShieldCheck, Trash2, X } from 'lucide-react'

// Day 2: admin control panel for catalog and borrow approvals
import toast from 'react-hot-toast'

import PageWrapper from '../components/PageWrapper'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { createBook, deleteBook, getBooks, updateBook } from '../services/bookService'
import { getAdminStats, getAdminUsers } from '../services/adminService'
import { approveBorrowRequest, getPendingRequests, rejectBorrowRequest } from '../services/borrowService'

const emptyBook = { title: '', author: '', category: '', isbn: '', totalCopies: 1, availableCopies: 1 }

const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [books, setBooks] = useState([])
  const [drafts, setDrafts] = useState({})
  const [newBook, setNewBook] = useState(emptyBook)
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState(null)

  const loadAdminData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [statsResponse, usersResponse, requestsResponse, booksResponse] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getPendingRequests(),
        getBooks(),
      ])
      setStats(statsResponse)
      setUsers(usersResponse)
      setRequests(requestsResponse)
      setBooks(booksResponse)
      setDrafts(Object.fromEntries(booksResponse.map((book) => [book.id, { ...book }])))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin workspace')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const refreshQuietly = () => loadAdminData(false)

    const initialLoadId = window.setTimeout(() => loadAdminData(), 0)
    const intervalId = window.setInterval(refreshQuietly, 10000)
    window.addEventListener('library:data-changed', refreshQuietly)

    return () => {
      window.clearTimeout(initialLoadId)
      window.clearInterval(intervalId)
      window.removeEventListener('library:data-changed', refreshQuietly)
    }
  }, [loadAdminData])

  const statCards = useMemo(
    () => [
      { label: 'Pending requests', value: stats?.pendingRequests ?? 0, trend: 'Awaiting approval', icon: AlertTriangle, tone: 'amber' },
      { label: 'Book records', value: stats?.totalBooks ?? 0, trend: `${stats?.availableBooks ?? 0} copies available`, icon: BookPlus, tone: 'cyan' },
      { label: 'Overdue books', value: stats?.overdueBooks ?? 0, trend: `${stats?.dueSoonBooks ?? 0} due soon`, icon: BarChart3, tone: 'rose' },
      { label: 'Low stock books', value: stats?.lowStockBooks ?? 0, trend: 'Available copies at 2 or less', icon: ShieldCheck, tone: 'emerald' },
    ],
    [stats],
  )

  const approveRequest = async (request) => {
    setWorkingId(request.id)
    try {
      await approveBorrowRequest(request.id)
      toast.success(`${request.title} approved`)
      window.dispatchEvent(new Event('library:data-changed'))
      await loadAdminData(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed')
    } finally {
      setWorkingId(null)
    }
  }

  const rejectRequest = async (request) => {
    setWorkingId(request.id)
    try {
      await rejectBorrowRequest(request.id)
      toast.success(`${request.title} rejected`)
      window.dispatchEvent(new Event('library:data-changed'))
      await loadAdminData(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed')
    } finally {
      setWorkingId(null)
    }
  }

  const addBook = async (event) => {
    event.preventDefault()
    try {
      await createBook({
        ...newBook,
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.availableCopies),
      })
      toast.success('Book added to inventory')
      setNewBook(emptyBook)
      window.dispatchEvent(new Event('library:data-changed'))
      await loadAdminData(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to add book')
    }
  }

  const saveBook = async (bookId) => {
    const draft = drafts[bookId]
    setWorkingId(bookId)
    try {
      await updateBook(bookId, {
        ...draft,
        totalCopies: Number(draft.totalCopies),
        availableCopies: Number(draft.availableCopies),
      })
      toast.success('Inventory updated')
      window.dispatchEvent(new Event('library:data-changed'))
      await loadAdminData(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update book')
    } finally {
      setWorkingId(null)
    }
  }

  const removeBook = async (bookId) => {
    setWorkingId(bookId)
    try {
      await deleteBook(bookId)
      toast.success('Book removed from inventory')
      window.dispatchEvent(new Event('library:data-changed'))
      await loadAdminData(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete book')
    } finally {
      setWorkingId(null)
    }
  }

  const updateDraft = (bookId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [bookId]: {
        ...current[bookId],
        [key]: value,
      },
    }))
  }

  const lowStockBooks = books.filter((book) => book.availableCopies > 0 && book.availableCopies <= 2)

  return (
    <PageWrapper
      eyebrow="Admin control"
      title="Administration"
      description="Approve requests, manage inventory, and monitor library activity from a role-aware workspace."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} value={loading ? '...' : card.value} />
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Request approval panel</h2>
            <p className="text-sm text-slate-500">Pending borrow requests become official borrows only after approval.</p>
          </div>
          <StatusBadge status={`${requests.length} Pending`} />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Requested</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm text-slate-500" colSpan="5">No pending requests.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="transition hover:bg-slate-800/50">
                    <td className="px-5 py-4 text-sm text-slate-300">{request.username}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">{request.title}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(request.requestedAt)}</td>
                    <td className="px-5 py-4"><StatusBadge status={request.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={workingId === request.id}
                          onClick={() => approveRequest(request)}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/20 disabled:opacity-50"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={workingId === request.id}
                          onClick={() => rejectRequest(request)}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-400/20 disabled:opacity-50"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Inventory management</h2>
          <p className="text-sm text-slate-500">Add, update, delete, and tune stock counts. Low stock: {lowStockBooks.length}</p>
        </div>

        <form onSubmit={addBook} className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_160px_140px_110px_110px_auto]">
          {['title', 'author', 'category', 'isbn'].map((field) => (
            <input
              key={field}
              value={newBook[field]}
              onChange={(event) => setNewBook((current) => ({ ...current, [field]: event.target.value }))}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
              required={field === 'title' || field === 'author'}
            />
          ))}
          <input
            type="number"
            min="0"
            value={newBook.totalCopies}
            onChange={(event) => setNewBook((current) => ({ ...current, totalCopies: event.target.value }))}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
          />
          <input
            type="number"
            min="0"
            value={newBook.availableCopies}
            onChange={(event) => setNewBook((current) => ({ ...current, availableCopies: event.target.value }))}
            className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300">
            <BookPlus size={16} />
            Add
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {books.slice(0, 12).map((book) => {
                const draft = drafts[book.id] || book
                return (
                  <tr key={book.id} className="transition hover:bg-slate-800/50">
                    {['title', 'author', 'category', 'isbn'].map((field) => (
                      <td key={field} className="px-4 py-3">
                        <input
                          value={draft[field] || ''}
                          onChange={(event) => updateDraft(book.id, field, event.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm text-white outline-none"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={draft.totalCopies}
                        onChange={(event) => updateDraft(book.id, 'totalCopies', event.target.value)}
                        className="w-20 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm text-white outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={draft.availableCopies}
                        onChange={(event) => updateDraft(book.id, 'availableCopies', event.target.value)}
                        className="w-20 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2 text-sm text-white outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={workingId === book.id}
                          onClick={() => saveBook(book.id)}
                          className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          disabled={workingId === book.id}
                          onClick={() => removeBook(book.id)}
                          className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-rose-200 hover:bg-rose-400/20 disabled:opacity-50"
                          aria-label="Delete book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">User activity</h2>
          <p className="text-sm text-slate-500">Role visibility and approved borrow counts for administrative review.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Active borrows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm text-slate-500" colSpan="4">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.email} className="transition hover:bg-slate-800/50">
                    <td className="px-5 py-4 text-sm font-semibold text-white">{user.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user.email}</td>
                    <td className="px-5 py-4"><StatusBadge status={user.role} /></td>
                    <td className="px-5 py-4 text-sm text-slate-300">{user.activeBorrows}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageWrapper>
  )
}
