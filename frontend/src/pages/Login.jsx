// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Leaf, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

function validate(form) {
  const errors = {};
  if (!form.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ls-bg)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden ls-brand-gradient flex-col justify-between p-12">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 text-white font-bold text-2xl mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            Label Sach
          </div>
          <p className="text-white/70 text-sm">Your food label scanner</p>
        </div>

        <div className="relative">
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-6">
            "Know exactly what goes into your body. Every ingredient, every reason, every source."
          </blockquote>
          <div className="flex flex-col gap-4">
            {[
              'Personalised to your allergies',
              'Backed by FSSAI data',
              'Clear Avoid / Caution / OK verdict',
            ].map((text) => (
              <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={12} className="text-white" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/50 text-xs">
          © 2024 Label Sach. Not medical advice.
        </p>
      </div>

      {/* Right: form */}
      <div
        className="flex-1 flex items-center justify-center p-6"
        style={{ background: 'var(--ls-page)' }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden" style={{ color: 'var(--ls-green)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center ls-brand-gradient">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Label Sach</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
              Sign in to continue to Label Sach
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="login-email"
              name="email"
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />
            <div>
              <Input
                id="login-password"
                name="password"
                label="Password"
                type="password"
                icon={Lock}
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  className="text-xs font-medium hover:underline"
                  style={{ color: 'var(--ls-green)' }}
                  id="forgot-password-btn"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              id="login-submit-btn"
              className="mt-1"
            >
              Sign In
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
            <span className="text-xs" style={{ color: 'var(--ls-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
          </div>

          {/* Google login placeholder */}
          <button
            id="google-login-btn"
            className="ls-btn ls-btn-ghost w-full gap-3"
            onClick={() => toast('Google login coming soon!')}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.4 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 15.5 19.2 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.1-17.7 10.4L6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-1.9 14.4-5l-6.6-5.6C29.8 36.2 27 37 24 37c-5.7 0-10.6-3.1-11.7-7.5l-7 5.4C8.4 41 15.6 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8C35.3 32 32.1 34.5 28.4 36l6.6 5.6C39.9 38 44 31.5 44 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--ls-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--ls-green)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
