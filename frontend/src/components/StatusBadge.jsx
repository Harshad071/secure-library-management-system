export default function StatusBadge({ status }) {
  const normalized = String(status).toLowerCase()
  const styles = {
    available: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    unavailable: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    pending: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    borrowed: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    returned: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
    overdue: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    admin: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    user: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[normalized] || styles.user}`}>
      {status}
    </span>
  )
}
