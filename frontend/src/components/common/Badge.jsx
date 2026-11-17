// src/components/common/Badge.jsx
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const configs = {
  avoid: {
    class: 'verdict-bg-avoid',
    icon: XCircle,
    label: 'Avoid',
  },
  caution: {
    class: 'verdict-bg-caution',
    icon: AlertTriangle,
    label: 'Caution',
  },
  ok: {
    class: 'verdict-bg-ok',
    icon: CheckCircle,
    label: 'OK',
  },
  unverified: {
    class: 'verdict-bg-unverified',
    icon: HelpCircle,
    label: 'Unverified',
  },
};

export function VerdictBadge({ verdict, showIcon = true, className = '' }) {
  const cfg = configs[verdict?.toLowerCase()] || configs.unverified;
  const Icon = cfg.icon;

  return (
    <span className={`ls-badge ${cfg.class} ${className}`}>
      {showIcon && <Icon size={12} />}
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const colorMap = {
    permitted: 'verdict-bg-ok',
    restricted: 'verdict-bg-caution',
    prohibited: 'verdict-bg-avoid',
    unknown: 'verdict-bg-unverified',
  };
  const cls = colorMap[status?.toLowerCase()] || colorMap.unknown;
  return (
    <span className={`ls-badge ${cls} ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}

export function CategoryBadge({ category, className = '' }) {
  return (
    <span
      className={`ls-badge ${className}`}
      style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
    >
      {category}
    </span>
  );
}
