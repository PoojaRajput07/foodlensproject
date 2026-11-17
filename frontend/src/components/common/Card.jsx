// src/components/common/Card.jsx
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`ls-surface p-5 ${hover ? 'ls-card-hover cursor-pointer' : ''} ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`} style={{ borderBottom: '1px solid var(--ls-border)', paddingBottom: '1rem' }}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, colorClass = '', className = '' }) {
  return (
    <Card className={`flex items-center gap-4 ${className}`}>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--ls-muted)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--ls-text)' }}>
          {value ?? '—'}
        </p>
      </div>
    </Card>
  );
}
