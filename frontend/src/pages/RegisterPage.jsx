import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, ShieldCheck, UserPlus } from 'lucide-react'

// Day 2: secure registration flow for new members and admins
import toast from 'react-hot-toast'

import { register } from '../services/authService'
import { getRedirectPathForRole } from '../utils/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', role: 'USER' })

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const { session } = await register(form)
      toast.success('Account created and signed in')
      navigate(getRedirectPathForRole(session.role), { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed. Please check your details.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_85%_70%,rgba(34,211,238,0.16),transparent_28%)]" />
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-cyan-950/20 backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-slate-800 bg-slate-900/70 p-8 lg:border-b-0 lg:border-r">
            <Link to="/login" className="flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
                <ShieldCheck size={22} />
              </span>
              <span className="font-bold text-white">SecureLibrary</span>
            </Link>
            <h1 className="mt-12 text-4xl font-bold text-white">Create secure access</h1>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Register a user profile for the library workspace with clean validation-ready inputs.
            </p>
            <div className="mt-8 space-y-3">
              {['Professional UI', 'Role prepared', 'JWT flow friendly'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                  <BadgeCheck className="text-emerald-300" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Registration</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Join workspace</h2>
            </div>

            {[
              { label: 'Full name', name: 'fullName', type: 'text', placeholder: 'Aarav Sharma' },
              { label: 'Username', name: 'username', type: 'text', placeholder: 'aarav' },
              { label: 'Email address', name: 'email', type: 'email', placeholder: 'aarav@securelibrary.dev' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Minimum 8 characters' },
            ].map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>
            ))}

            <div>
              <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-300">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
              <UserPlus size={18} />
              Create account
            </button>

            <p className="text-center text-sm text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
