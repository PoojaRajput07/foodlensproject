// src/components/common/Spinner.jsx
export function Spinner({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4"
        strokeDashoffset="10"
        opacity="0.3"
      />
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8"
        strokeDashoffset="0"
      />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: 'var(--ls-bg)', color: 'var(--ls-green)' }}
    >
      <Spinner size={40} />
      <p className="text-sm font-medium" style={{ color: 'var(--ls-muted)' }}>Loading…</p>
    </div>
  );
}

export function InlineLoader({ message = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-8 justify-center" style={{ color: 'var(--ls-muted)' }}>
      <Spinner size={20} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
