import { Bell, CheckCircle2, Clock3, LogOut, Menu, Moon, Search, Shield, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'

import { getMyBorrows, getPendingRequests } from '../services/borrowService'
import { clearAuthSession, getAuthSession } from '../utils/auth'

export default function Navbar({ onMenuClick, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const userName = localStorage.getItem('name') || 'Library User'
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let active = true

    const loadNotifications = async () => {
      try {
        const { role } = getAuthSession()
        const requests = role === 'ADMIN' ? await getPendingRequests() : await getMyBorrows()
        if (!active) return

        setNotifications(
          requests
            .filter((request) => role === 'ADMIN' || ['Pending', 'Approved', 'Overdue'].includes(request.status))
            .slice(0, 5)
            .map((request) => {
              if (role === 'ADMIN') {
                return { id: request.id, title: 'Borrow request awaiting review', detail: `${request.username} requested ${request.title}`, to: '/admin', urgent: true }
              }
              if (request.status === 'Overdue') {
                return { id: request.id, title: 'Book return overdue', detail: `${request.title} needs your attention`, to: '/my-borrows', urgent: true }
              }
              if (request.status === 'Approved') {
                return { id: request.id, title: 'Borrow request approved', detail: request.dueAt ? `${request.title} is due ${new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date(request.dueAt))}` : request.title, to: '/my-borrows' }
              }
              return { id: request.id, title: 'Borrow request pending', detail: `${request.title} is awaiting review`, to: '/my-borrows' }
            }),
        )
      } catch {
        if (active) setNotifications([])
      }
    }

    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 30000)
    window.addEventListener('library:data-changed', loadNotifications)
    return () => {
      active = false
      window.clearInterval(intervalId)
      window.removeEventListener('library:data-changed', loadNotifications)
    }
  }, [])

  const notificationCount = useMemo(() => notifications.length, [notifications])

  const logout = () => {
    clearAuthSession()
    toast.success('Signed out securely')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-200 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="hidden items-center gap-3 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40">
            <Shield size={19} />
          </span>
          <span className="text-sm font-bold tracking-wide text-white">SecureLibrary</span>
        </Link>

        <div className="ml-auto hidden min-w-0 max-w-md flex-1 items-center rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-slate-500 xl:flex">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search books, users, transactions..."
            className="ml-2 w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={() => setNotificationsOpen((open) => !open)}
          className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-200"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          <span className="relative block">
            <Bell size={18} />
            {notificationCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">{notificationCount}</span>}
          </span>
        </button>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-slate-500">Verified session</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-300 transition hover:border-red-400/50 hover:text-red-200"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      {notificationsOpen && (
        <div className="absolute right-4 top-[4.5rem] z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-slate-950/30 sm:right-6 lg:right-8">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-sm font-bold text-white">Notifications</p>
            <span className="text-xs text-slate-500">Live borrow updates</span>
          </div>
          {notifications.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-4 text-sm text-slate-400"><CheckCircle2 className="text-emerald-400" size={18} /> You’re all caught up.</div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <Link key={notification.id} to={notification.to} onClick={() => setNotificationsOpen(false)} className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-900">
                  <Clock3 className={notification.urgent ? 'mt-0.5 shrink-0 text-rose-400' : 'mt-0.5 shrink-0 text-cyan-300'} size={17} />
                  <span><span className="block text-sm font-semibold text-white">{notification.title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{notification.detail}</span></span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
