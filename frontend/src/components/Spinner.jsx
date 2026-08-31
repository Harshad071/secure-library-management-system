export default function Spinner({ label = 'Loading secure workspace...' }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-300" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
