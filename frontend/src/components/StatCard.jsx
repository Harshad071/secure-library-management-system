export default function StatCard({ label, value, trend, icon: Icon, tone = 'cyan' }) {
  const tones = {
    cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200 border-cyan-400/20',
    emerald: 'from-emerald-400/20 to-emerald-400/5 text-emerald-200 border-emerald-400/20',
    amber: 'from-amber-400/20 to-amber-400/5 text-amber-200 border-amber-400/20',
    rose: 'from-rose-400/20 to-rose-400/5 text-rose-200 border-rose-400/20',
  }

  return (
    <article className={`rounded-2xl border bg-gradient-to-br p-5 shadow-xl shadow-slate-950/20 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <span className="rounded-xl border border-white/10 bg-white/10 p-3">
            <Icon size={20} />
          </span>
        )}
      </div>
      {trend && <p className="mt-4 text-xs font-medium text-slate-400">{trend}</p>}
    </article>
  )
}
