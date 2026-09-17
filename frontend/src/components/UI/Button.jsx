import clsx from 'clsx'

const variants = {
  primary:
    'bg-brand-green text-brand-dark font-semibold hover:opacity-90 shadow-lg shadow-brand-green/20',
  secondary:
    'bg-white/5 border border-white/10 text-slate-200 hover:border-brand-green/40 hover:text-brand-green',
  danger:
    'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  ghost:
    'text-slate-400 hover:text-brand-green hover:bg-brand-surface',
  outline:
    'border border-brand-green text-brand-green hover:bg-brand-green hover:text-brand-dark',
}

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
  xl: 'px-9 py-4 text-lg',
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
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-brand-green/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
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
