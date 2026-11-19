import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.js';
import { Button } from '../components/common/Button.jsx';

function StrengthBar({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--ls-red)' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'var(--ls-amber)' };
    return { level: 3, label: 'Strong', color: 'var(--ls-green)' };
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i <= level ? color : 'var(--ls-border)',
            }}
          />
        ))}
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no token in URL
  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'New password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!form.confirm) {
      errs.confirm = 'Please confirm your new password';
    } else if (form.password !== form.confirm) {
      errs.confirm = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, password: form.password });
      setSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{ background: 'var(--ls-bg)' }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 mb-10 w-fit mx-auto"
          style={{ color: 'var(--ls-green)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center ls-brand-gradient">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--ls-heading)' }}>
            FoodLens
          </span>
        </Link>

        <div
          className="ls-surface rounded-2xl px-8 py-10"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {success ? (
            /* ── Success state ── */
            <div className="text-center animate-scale-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--ls-green-light)' }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--ls-green)' }} />
              </div>

              <h1
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--ls-heading)' }}
              >
                Password updated!
              </h1>

              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--ls-muted)' }}
              >
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>

              <Link
                to="/login"
                className="ls-btn ls-btn-primary w-full justify-center"
                style={{ display: 'flex' }}
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium mb-7 hover:underline"
                style={{ color: 'var(--ls-muted)' }}
              >
                <ArrowLeft size={15} />
                Back to Sign in
              </Link>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'var(--ls-green-light)' }}
              >
                <KeyRound size={22} style={{ color: 'var(--ls-green)' }} />
              </div>

              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--ls-heading)' }}
              >
                Set new password
              </h1>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--ls-muted)' }}
              >
                Choose a strong password for your FoodLens account. It must be
                at least 8 characters long.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* New password */}
                <div>
                  <label
                    htmlFor="reset-password"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--ls-text)' }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      autoFocus
                      className="ls-input pr-11"
                      style={
                        errors.password
                          ? { borderColor: 'var(--ls-red)', boxShadow: '0 0 0 3px rgba(185,75,69,0.12)' }
                          : {}
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                      style={{ color: 'var(--ls-muted)' }}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--ls-red)' }}>
                      <AlertTriangle size={12} />
                      {errors.password}
                    </p>
                  )}
                  <StrengthBar password={form.password} />
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="reset-confirm"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--ls-text)' }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm"
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      value={form.confirm}
                      onChange={handleChange}
                      autoComplete="new-password"
                      className="ls-input pr-11"
                      style={
                        errors.confirm
                          ? { borderColor: 'var(--ls-red)', boxShadow: '0 0 0 3px rgba(185,75,69,0.12)' }
                          : {}
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                      style={{ color: 'var(--ls-muted)' }}
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--ls-red)' }}>
                      <AlertTriangle size={12} />
                      {errors.confirm}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  id="reset-submit-btn"
                  className="mt-1"
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
