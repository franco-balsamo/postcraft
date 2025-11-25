import clsx from 'clsx'

const variants = {
  primary:
    'bg-gradient-to-r from-brand-green to-brand-cyan text-brand-dark font-semibold hover:opacity-90 shadow-lg shadow-brand-green/20',
  secondary:
    'bg-brand-surface border border-brand-border text-slate-200 hover:border-brand-green hover:text-brand-green',
  danger:
    'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  ghost:
    'text-slate-400 hover:text-brand-green hover:bg-brand-surface',
  outline:
    'border border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-dark',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
