// src/components/common/EmptyState.jsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
        >
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--ls-text)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: 'var(--ls-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
