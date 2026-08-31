import { useState } from 'react'

import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function PageWrapper({ eyebrow, title, description, children, actions }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'light' ? 'light' : 'dark')
  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }

  return (
    <div className={`theme-${theme}`}>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_30%)]" />
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className="relative z-10 lg:flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {eyebrow && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    {eyebrow}
                  </p>
                )}
                <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
              </div>
              {actions}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
