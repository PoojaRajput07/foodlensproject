import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, BrainCircuit, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';

function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Full name is required';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.password) {
    errors.password = 'Password is required';
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

function BrandingPanel() {
  const highlights = [
    { icon: ScanLine, title: 'Scan any product', description: 'Barcode or ingredient list — instant results.' },
    { icon: BrainCircuit, title: 'AI-driven analysis', description: 'Tailored to your allergies and dietary profile.' },
    { icon: ShieldCheck, title: 'Privacy first', description: 'Your health data stays yours, always.' },
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
          <Leaf size={14} />
          A more mindful way to eat
        </div>
        <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
          Know what goes into your{' '}
          <span className="text-white/60 italic font-normal">everyday food.</span>
        </h2>
        <p className="text-white/70 text-base leading-relaxed mb-10 max-w-md">
          Make informed food choices with personalized ingredient insights based on your dietary preferences, allergies and health profile.
        </p>
        <div className="flex flex-col gap-6">
          {highlights.map(({ icon: Icon, title, description }) => (
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

      <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} FoodLens. Informational purposes only.</p>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success("Account created! Let's set up your health profile.");
      navigate('/setup');
    } catch (err) {
      toast.error(
        err.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ls-bg)' }}>
      <BrandingPanel />

      <main
        className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8"
        style={{ background: 'var(--ls-page)' }}
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link
            to="/"
            className="flex items-center gap-2 mb-10 lg:hidden"
            style={{ color: 'var(--ls-green)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center ls-brand-gradient">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>FoodLens</span>
          </Link>

          {/* Heading */}
          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--ls-green)' }}>Get started</p>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
              style={{ color: 'var(--ls-heading)', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}
            >
              Create your account
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--ls-muted)' }}
            >
              A little about you. A better understanding of your food.
            </p>
          </div>

          {/* Registration form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >
            <Input
              id="reg-name"
              name="name"
              label="Full name"
              placeholder="Your full name"
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
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
              hint="Use at least 8 characters"
            />

            <Input
              id="reg-confirm-password"
              name="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Enter your password again"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            {/* Submit button */}
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                id="register-submit-btn"
                className="mt-1"
              >
                Create Account
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>

          {/* Terms */}
          <p
            className="mt-6 text-xs leading-relaxed text-center"
            style={{ color: 'var(--ls-muted)' }}
          >
            By creating an account, you agree to use FoodLens as an informational tool. It does not replace professional medical advice.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--ls-muted)' }}>Already a member?</span>
            <div className="flex-1 h-px" style={{ background: 'var(--ls-border)' }} />
          </div>

          {/* Login link */}
          <p
            className="text-sm text-center"
            style={{ color: 'var(--ls-muted)' }}
          >
            Have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline underline-offset-4"
              style={{ color: 'var(--ls-green)' }}
            >
              Sign in
            </Link>
          </p>

          {/* Privacy note */}
          <div className="mt-8 flex justify-center items-center gap-2 text-xs" style={{ color: 'var(--ls-muted)' }}>
            <ShieldCheck size={13} />
            Your account details are kept private.
          </div>
        </div>
      </main>
    </div>
  );
}
