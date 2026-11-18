
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--ls-page)' }}
    >
      {/* LEFT BRAND PANEL */}
      <aside className="hidden lg:flex lg:w-[40%] xl:w-[42%] shrink-0 relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-[#173F32]">

        {/* Decorative circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full border border-white/10" />

          <div className="absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full border border-white/10" />

          <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] rounded-full border border-[#C9B78B]/20 -translate-y-1/2" />

          <div className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full border border-white/10" />

          <div className="absolute inset-0 bg-gradient-to-br from-[#244F40]/30 via-transparent to-[#0D2B22]/70" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 text-[#F8F5EC]">
          <div className="w-11 h-11 rounded-2xl border border-[#C9B78B]/40 bg-white/5 flex items-center justify-center">
            <Leaf size={21} className="text-[#D6C69D]" />
          </div>

          <span className="text-2xl tracking-tight font-semibold">
            FoodLens
          </span>
        </div>

        {/* Brand content */}
        <div className="relative z-10 max-w-lg">
          <span className="text-[11px] tracking-[0.3em] uppercase text-[#D6C69D] font-medium">
            A more mindful way to eat
          </span>

          <h2 className="mt-6 text-4xl xl:text-5xl leading-[1.15] font-semibold text-[#F8F5EC]">
            Know what
            <br />
            goes into your
            <br />
            <span className="text-[#D6C69D] italic font-normal">
              everyday food.
            </span>
          </h2>

          <p className="mt-7 max-w-sm text-sm leading-7 text-[#E6E9E2]/70">
            Make informed food choices with personalized ingredient insights
            based on your dietary preferences, allergies and health profile.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D6C69D]/40 flex items-center justify-center">
              <ShieldCheck size={16} className="text-[#D6C69D]" />
            </div>

            <span className="text-xs tracking-wide text-white/60">
              Your food choices, understood better.
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[11px] tracking-wide text-white/40">
          © 2026 FoodLens. Informational purposes only.
        </p>
      </aside>

      {/* RIGHT REGISTRATION PANEL */}
      <main
        className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10"
        style={{ background: 'var(--ls-page)' }}
      >
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div
            className="flex items-center gap-3 mb-12 lg:hidden"
            style={{ color: 'var(--ls-green)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#173F32] flex items-center justify-center">
              <Leaf size={19} className="text-[#D6C69D]" />
            </div>

            <span className="text-xl font-semibold tracking-tight">
              FoodLens
            </span>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[#A28C5B]">
              Get started
            </span>

            <h1
              className="mt-3 text-[32px] leading-tight font-semibold tracking-tight"
              style={{ color: 'var(--ls-text)' }}
            >
              Create your account
            </h1>

            <p
              className="mt-3 text-sm leading-6"
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
            className="mt-6 text-[11px] leading-5 text-center"
            style={{ color: 'var(--ls-muted)' }}
          >
            By creating an account, you agree to our Terms of Service.
          </p>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#DEDCCF]" />

            <span className="text-[10px] uppercase tracking-[0.18em] text-[#9A9A8D]">
              Already a member?
            </span>

            <div className="flex-1 h-px bg-[#DEDCCF]" />
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
          <div className="mt-10 flex justify-center items-center gap-2 text-[10px] tracking-wide text-[#9A9A8D]">
            <ShieldCheck size={13} />
            Your account details are kept private.
          </div>
        </div>
      </main>
    </div>
  );
}
