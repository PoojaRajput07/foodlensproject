import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {sent ? (
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
                Check your inbox
              </h1>

              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: 'var(--ls-muted)' }}
              >
                If <strong style={{ color: 'var(--ls-text)' }}>{email}</strong> is
                registered with FoodLens, we've sent a password reset link. It
                expires in&nbsp;1&nbsp;hour.
              </p>

              <p
                className="text-xs mb-8"
                style={{ color: 'var(--ls-subtle)' }}
              >
                Didn't receive it? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--ls-green)' }}
                >
                  try a different email
                </button>
                .
              </p>

              <Link
                to="/login"
                className="ls-btn ls-btn-secondary w-full justify-center gap-2"
                style={{ display: 'flex' }}
              >
                <ArrowLeft size={16} />
                Back to Sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Back link */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium mb-7 hover:underline"
                style={{ color: 'var(--ls-muted)' }}
              >
                <ArrowLeft size={15} />
                Back to Sign in
              </Link>

              {/* Header */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'var(--ls-green-light)' }}
              >
                <Mail size={22} style={{ color: 'var(--ls-green)' }} />
              </div>

              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--ls-heading)' }}
              >
                Forgot your password?
              </h1>
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'var(--ls-muted)' }}
              >
                No worries! Enter your registered email address and we'll send
                you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <Input
                  id="forgot-email"
                  name="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  error={emailError}
                  autoComplete="email"
                  autoFocus
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  id="forgot-submit-btn"
                >
                  Send Reset Link
                  <Mail size={16} />
                </Button>
              </form>

              <p
                className="text-xs text-center mt-6"
                style={{ color: 'var(--ls-subtle)' }}
              >
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--ls-green)' }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
