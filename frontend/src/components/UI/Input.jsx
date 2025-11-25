import clsx from 'clsx'

export default function Input({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        type={type}
        className={clsx(
          'w-full bg-brand-navy border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green',
          'transition-all duration-200',
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-brand-border hover:border-slate-600',
          inputClassName
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', inputClassName = '', rows = 4, ...props }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={clsx(
          'w-full bg-brand-navy border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green',
          'transition-all duration-200',
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-brand-border hover:border-slate-600',
          inputClassName
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
