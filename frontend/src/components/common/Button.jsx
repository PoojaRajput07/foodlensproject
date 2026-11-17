// src/components/common/Button.jsx
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'ls-btn ls-btn-primary',
  secondary: 'ls-btn ls-btn-secondary',
  ghost: 'ls-btn ls-btn-ghost',
  danger: 'ls-btn ls-btn-danger',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: '',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
