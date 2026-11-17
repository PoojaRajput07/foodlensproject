// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Leaf, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Let\'s set up your health profile.');
      navigate('/setup');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ls-bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden ls-brand-gradient flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white"
              style={{ width: `${120 + i * 60}px`, height: `${120 + i * 60}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          ))}
        </div>
        <div className="relative flex items-center gap-3 text-white font-bold text-2xl">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          Label Sach
        </div>
        <div className="relative">
          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Scan smarter.<br />Eat safer.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Create your free account and get personalised ingredient analysis
            tailored to your allergies and health conditions.
          </p>
        </div>
        <p className="relative text-white/50 text-xs">© 2024 Label Sach. Not medical advice.</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--ls-page)' }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden" style={{ color: 'var(--ls-green)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center ls-brand-gradient">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Label Sach</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Create your account</h1>
            <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="reg-name"
              name="name"
              label="Full name"
              icon={User}
              placeholder="Priya Sharma"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete="name"
              autoFocus
            />
            <Input
              id="reg-email"
              name="email"
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              id="reg-password"
              name="password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
              hint="At least 8 characters"
            />
            <Input
              id="reg-confirm-password"
              name="confirmPassword"
              label="Confirm password"
              type="password"
              icon={Lock}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading} id="register-submit-btn" className="mt-1">
              Create Account
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--ls-muted)' }}>
            By creating an account you agree to our Terms of Service.
          </p>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--ls-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'var(--ls-green)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
