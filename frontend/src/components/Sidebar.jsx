import { BookOpen, ClipboardList, LayoutDashboard, ShieldCheck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { getAuthSession, hasAllowedRole } from '../utils/auth'

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Books', to: '/books', icon: BookOpen },
  { label: 'My Borrows', to: '/my-borrows', icon: ClipboardList },
  { label: 'Admin', to: '/admin', icon: ShieldCheck, allowedRoles: ['ADMIN'] },
]

export default function Sidebar({ open, onClose }) {
  const { role } = getAuthSession()
  const visibleItems = items.filter((item) => hasAllowedRole(role, item.allowedRoles))

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950/95 p-4 transition-transform lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="text-sm font-bold text-white">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-800 p-2 text-slate-400"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Security Layer</p>
          <p className="mt-2 text-sm text-slate-300">JWT protected routes and role-aware navigation are active.</p>
        </div>

        <nav className="mt-6 space-y-2">
          {visibleItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
