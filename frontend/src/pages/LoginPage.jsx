import { useState } from 'react'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'

// Day 2: secure member access screen for the library portal
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { login } from '../services/authService'
import { getRedirectPathForRole } from '../utils/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ usernameOrEmail: '', password: '', remember: true })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const session = await login(form)
      toast.success('Secure session started')
      navigate(getRedirectPathForRole(session.role), { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.14),transparent_30%)]" />
      <section className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
          <Link to="/login" className="flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40">
              <ShieldCheck size={22} />
            </span>
            <span className="text-base font-bold tracking-wide text-white">SecureLibrary</span>
          </Link>

          <div className="my-12 max-w-2xl lg:my-0">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Zero-trust library portal</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Manage knowledge assets with a security-first dashboard.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
              A polished command center for books, borrows, users, and admin oversight.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {['JWT-ready', 'Role-aware', 'Audit-focused'].map((item) => (
                <div key={item} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="hidden text-sm text-slate-500 lg:block">Professional Secure Library Management System</p>
        </div>

        <div className="flex items-center justify-center px-6 pb-10 sm:px-10 lg:px-16 lg:py-10">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                Encrypted access
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-400">Sign in to continue to your secure workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="usernameOrEmail" className="mb-2 block text-sm font-medium text-slate-300">
                  Username or email
                </label>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  value={form.usernameOrEmail}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  placeholder="admin@securelibrary.dev"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={17} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 text-slate-400">
                  <input
                    name="remember"
                    type="checkbox"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
                  />
                  Remember device
                </label>
                <button type="button" className="w-fit font-medium text-cyan-300 hover:text-cyan-200">
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300">
                Sign in
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
