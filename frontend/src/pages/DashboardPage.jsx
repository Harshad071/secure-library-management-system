import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BookOpen, CheckCircle2, Clock3, Users } from 'lucide-react'

// Day 2: member dashboard for borrow summaries, stats, and activity
import toast from 'react-hot-toast'

import PageWrapper from '../components/PageWrapper'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { getDashboardStats } from '../services/adminService'
import { getMyBorrows } from '../services/borrowService'

const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not set'
    : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const [statsResponse, borrowsResponse] = await Promise.all([getDashboardStats(), getMyBorrows()])
        if (!active) return
        setSummary(statsResponse)
        setBorrows(borrowsResponse)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load dashboard data')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    const intervalId = window.setInterval(loadDashboard, 10000)
    window.addEventListener('library:data-changed', loadDashboard)

    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('library:data-changed', loadDashboard)
    }
  }, [])

  const stats = useMemo(
    () => {
      const activeMine = borrows.filter((borrow) => borrow.status === 'Approved' || borrow.status === 'Overdue').length
      const pendingMine = borrows.filter((borrow) => borrow.status === 'Pending').length
      const overdueMine = borrows.filter((borrow) => borrow.status === 'Overdue').length

      return [
        { label: 'Available books', value: summary?.availableBooks ?? 0, trend: 'Copies ready for request', icon: CheckCircle2, tone: 'emerald' },
        { label: 'Pending requests', value: pendingMine, trend: 'Awaiting admin review', icon: Clock3, tone: 'cyan' },
        { label: 'Active borrowed', value: activeMine, trend: 'Approved borrows in your account', icon: BookOpen, tone: 'amber' },
        { label: 'Overdue warnings', value: overdueMine, trend: 'Past due items for you', icon: AlertTriangle, tone: 'rose' },
        { label: 'Request history', value: borrows.length, trend: 'All borrow workflow records', icon: Users, tone: 'cyan' },
      ]
    },
    [borrows, summary],
  )

  const borrowedBooks = borrows.slice(0, 5)
  const activity = summary?.recentActivity || []

  return (
    <PageWrapper
      eyebrow="Command center"
      title="Library Dashboard"
      description="A polished overview of inventory health, active borrowing, member activity, and security status."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} value={loading ? '...' : stat.value} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Borrow requests</h2>
              <p className="text-sm text-slate-500">Your requests, approvals, due dates, and return status</p>
            </div>
            <BookOpen className="text-cyan-300" size={21} />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full min-w-[560px] text-left">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {borrowedBooks.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan="3">
                      No active borrows yet.
                    </td>
                  </tr>
                ) : (
                  borrowedBooks.map((book) => (
                    <tr key={book.id} className="transition hover:bg-slate-800/50">
                      <td className="px-4 py-4 text-sm font-medium text-white">{book.title}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{formatDate(book.dueAt)}</td>
                      <td className="px-4 py-4">
                        <StatusBadge status={book.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Activity stream</h2>
              <p className="text-sm text-slate-500">Recent secure workspace events</p>
            </div>
            <Activity className="text-emerald-300" size={21} />
          </div>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-500">
                No recent activity yet.
              </div>
            ) : (
              activity.map((item) => (
                <div key={`${item.type}-${item.occurredAt}-${item.message}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                  {item.message}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
