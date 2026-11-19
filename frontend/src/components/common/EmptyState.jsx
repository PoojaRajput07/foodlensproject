export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center px-4">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
      >
        {Icon && <Icon size={26} strokeWidth={1.5} />}
      </div>
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
        >
          {title}
        </h3>
        {description && (
          <p
            className="mt-1.5 max-w-xs mx-auto text-sm leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
