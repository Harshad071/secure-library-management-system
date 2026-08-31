import { useCallback, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

import PageWrapper from '../components/PageWrapper'
import StatusBadge from '../components/StatusBadge'
import { getMyBorrows, returnBook } from '../services/borrowService'

const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export default function MyBorrowsPage() {
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [returningId, setReturningId] = useState(null)

  const loadBorrows = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      setBorrows(await getMyBorrows())
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load borrow records')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadInitialBorrows = () => getMyBorrows()
      .then((records) => {
        if (active) setBorrows(records)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to load borrow records')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    loadInitialBorrows()
    const intervalId = window.setInterval(() => {
      loadBorrows(false)
    }, 10000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [loadBorrows])

  const handleReturn = async (borrow) => {
    if (!['Approved', 'Overdue'].includes(borrow.status)) {
      toast.error('Only approved borrows can be returned')
      return
    }

    setReturningId(borrow.id)
    try {
      await returnBook(borrow.id)
      toast.success(`${borrow.title} returned successfully`)
      window.dispatchEvent(new Event('library:data-changed'))
      await loadBorrows()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Return failed')
      await loadBorrows()
    } finally {
      setReturningId(null)
    }
  }

  return (
    <PageWrapper
      eyebrow="Circulation"
      title="My Borrows"
      description="Track borrow requests, approvals, due dates, and return actions from one focused workspace."
    >
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-slate-950/20">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Book</th>
              <th className="px-5 py-4">Requested</th>
              <th className="px-5 py-4">Due</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td className="px-5 py-8 text-sm text-slate-400" colSpan="5">Loading borrow records...</td>
              </tr>
            ) : borrows.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-slate-500" colSpan="5">No borrow records yet.</td>
              </tr>
            ) : (
              borrows.map((borrow) => (
                <tr key={borrow.id} className="transition hover:bg-slate-800/50">
                  <td className="px-5 py-4 text-sm font-semibold text-white">{borrow.title}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{formatDate(borrow.requestedAt || borrow.borrowedAt)}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{formatDate(borrow.dueAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={borrow.status} />
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={!['Approved', 'Overdue'].includes(borrow.status) || returningId === borrow.id}
                      onClick={() => handleReturn(borrow)}
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      <RotateCcw size={16} />
                      {returningId === borrow.id ? 'Returning...' : ['Approved', 'Overdue'].includes(borrow.status) ? 'Return' : borrow.status}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
