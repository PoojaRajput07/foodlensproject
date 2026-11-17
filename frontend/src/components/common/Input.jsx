// src/components/common/Input.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label,
  id,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  hint,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium"
          style={{ color: 'var(--ls-text)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ls-muted)' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          type={inputType}
          className={`ls-input ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-10' : ''} ${
            error ? 'border-red-500 focus:shadow-none' : ''
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
            style={{ color: 'var(--ls-muted)' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
