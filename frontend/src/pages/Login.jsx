import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, BrainCircuit, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  return errors;
}

function BrandingPanel() {
  const benefits = [
    { icon: ScanLine, title: 'Smart food scanning', description: 'Understand packaged food labels in seconds.' },
    { icon: ShieldCheck, title: 'Your profile, your priorities', description: 'Personalized analysis based on your preferences.' },
    { icon: BrainCircuit, title: 'AI-powered insights', description: 'Get clear explanations, not confusing labels.' },
  ];
  return (
    <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden ls-brand-gradient flex-col justify-between p-12">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-white"
            style={{ width: `${140 + i * 75}px`, height: `${140 + i * 75}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        ))}
      </div>
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

      <Link to="/" className="relative flex items-center gap-3 text-white">
        <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
          <Leaf size={22} />
        </div>
        <div>
          <span className="font-bold text-2xl tracking-tight block" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>FoodLens</span>
          <span className="text-white/60 text-xs tracking-wider">FOOD LABEL INTELLIGENCE</span>
        </div>
      </Link>

      <div className="relative max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/90 text-xs font-medium mb-7">
          <ShieldCheck size={14} />
          Make informed food choices
        </div>
        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
          Your food choices deserve <span className="text-white/60">more clarity.</span>
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-10 max-w-md">
          Understand what&apos;s inside packaged food with AI-powered insights tailored to your allergies, dietary preferences and health profile.
        </p>
        <div className="flex flex-col gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center flex-shrink-0">
                <Icon size={19} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
                <p className="text-white/60 text-xs leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} FoodLens. Not medical advice.</p>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => navigate('/forgot-password');
  const handleGoogleLogin = () => toast('Google login is coming soon!');

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ls-bg)' }}>
      <BrandingPanel />
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8" style={{ background: 'var(--ls-page)' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden" style={{ color: 'var(--ls-green)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center ls-brand-gradient">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>FoodLens</span>
          </Link>

          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--ls-green)' }}>Welcome back</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>Sign in to your account</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ls-muted)' }}>Continue making more informed food choices with FoodLens.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <Input id="login-email" name="email" label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" autoFocus />
            <div>
              <Input id="login-password" name="password" label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password" />
              <div className="flex justify-end mt-3">
                <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold hover:underline" style={{ color: 'var(--ls-green)' }} id="forgot-password-btn">Forgot password?</button>
              </div>
            </div>
            <Button type="submit" fullWidth loading={loading} id="login-submit-btn" className="mt-1">
              Sign In
              <ArrowRight size={17} />
            </Button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--ls-muted)' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
          </div>

          {/* <button id="google-login-btn" className="ls-btn ls-btn-ghost w-full gap-3 py-3" onClick={handleGoogleLogin} type="button">
            <svg width="19" height="19" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.4 20-21 0-1.4-.1-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 15.5 19.2 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.1-17.7 10.4L6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.5-1.9 14.4-5l-6.6-5.6C29.8 36.2 27 37 24 37c-5.7 0-10.6-3.1-11.7-7.5l-7 5.4C8.4 41 15.6 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8C35.3 32 32.1 34.5 28.4 36l6.6 5.6C39.9 38 44 31.5 44 24c0-1.4-.1-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button> */}

          <p className="text-sm text-center mt-8" style={{ color: 'var(--ls-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--ls-green)' }}>Create an account</Link>
          </p>
          <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: 'var(--ls-muted)' }}>
            By continuing, you agree to use FoodLens as an informational tool. It does not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
