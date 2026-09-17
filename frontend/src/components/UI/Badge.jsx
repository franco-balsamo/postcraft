import clsx from 'clsx'

// `brand-green` is the single brand accent (used for buttons, links, active
// nav). Status/plan badges below need their own distinct hues to stay
// readable as a set — reusing the brand accent for every "positive" badge
// would make published/pro/scheduled all look identical.
const variants = {
  green: 'bg-brand-green/10 text-brand-green border border-brand-green/30',
  blue: 'bg-sky-400/10 text-sky-400 border border-sky-400/30',
  yellow: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
  red: 'bg-red-500/10 text-red-400 border border-red-500/30',
  gray: 'bg-slate-700/50 text-slate-400 border border-slate-600/50',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
}

const statusMap = {
  published: 'green',
  queued: 'blue',
  scheduled: 'blue',
  pending: 'yellow',
  failed: 'red',
  draft: 'gray',
  free: 'gray',
  starter: 'blue',
  pro: 'green',
  agency: 'purple',
}

export default function Badge({ children, variant = 'gray', status, className = '' }) {
  const resolvedVariant = status ? (statusMap[status] || 'gray') : variant
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[resolvedVariant],
        className
      )}
    >
      {children}
    </span>
  )
}
