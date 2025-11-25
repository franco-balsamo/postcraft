import clsx from 'clsx'

const variants = {
  green: 'bg-brand-green/10 text-brand-green border border-brand-green/30',
  cyan: 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30',
  yellow: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
  red: 'bg-red-500/10 text-red-400 border border-red-500/30',
  gray: 'bg-slate-700/50 text-slate-400 border border-slate-600/50',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
}

const statusMap = {
  published: 'green',
  scheduled: 'cyan',
  pending: 'yellow',
  failed: 'red',
  draft: 'gray',
  free: 'gray',
  pro: 'cyan',
  enterprise: 'purple',
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
