
import { Link } from 'react-router-dom';
import {
  Leaf,
  ScanLine,
  ShieldCheck,
  FileText,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  UserRound,
  BrainCircuit,
  History,
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';

function NavBar() {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        background: 'var(--ls-surface)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ls-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl"
          style={{ color: 'var(--ls-green)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center ls-brand-gradient">
            <Leaf size={18} className="text-white" />
          </div>
          FoodLens
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how"
            className="text-sm font-medium transition-colors hover:text-[var(--ls-green)]"
            style={{ color: 'var(--ls-muted)' }}
          >
            How it works
          </a>
          <a
            href="#features"
            className="text-sm font-medium transition-colors hover:text-[var(--ls-green)]"
            style={{ color: 'var(--ls-muted)' }}
          >
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="ls-btn ls-btn-ghost text-sm px-4 py-2">
            Login
          </Link>
          <Link to="/register" className="ls-btn ls-btn-primary text-sm px-4 py-2">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--ls-page)' }}
    >
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          background: 'var(--ls-green)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{
          background: '#3dbe7e',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div
              className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'var(--ls-green-light)',
                color: 'var(--ls-green)',
              }}
            >
              <Star size={14} />
              Smarter food choices, made personal
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: 'var(--ls-text)' }}
            >
              Know what's hiding{' '}
              <span style={{ color: 'var(--ls-green)' }}>
                behind the label
              </span>
            </h1>

            <p
              className="text-lg mb-8 leading-relaxed"
              style={{ color: 'var(--ls-muted)' }}
            >
              Scan a food product and get an AI-powered analysis based on its
              ingredients, nutrition information, allergies, dietary choices
              and health profile.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to="/register"
                id="hero-try-scan-btn"
                className="ls-btn ls-btn-primary px-6 py-3 text-base gap-2"
              >
                <ScanLine size={18} />
                Try a Scan
                <ArrowRight size={16} />
              </Link>

              <a
                href="#how"
                className="ls-btn ls-btn-ghost px-6 py-3 text-base"
                id="hero-watch-demo-btn"
              >
                How it Works
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: BrainCircuit, text: 'AI-powered analysis' },
                { icon: UserRound, text: 'Personalized results' },
                { icon: Zap, text: 'Quick product scanning' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--ls-muted)' }}
                >
                  <Icon size={16} style={{ color: 'var(--ls-green)' }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex justify-center animate-fade-in"
            style={{ animationDelay: '150ms' }}
          >
            <ProductPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPreviewCard() {
  return (
    <div
      className="w-full max-w-sm ls-surface overflow-hidden"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'var(--ls-red-light)' }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--ls-red)' }}
          >
            Sample scan result
          </p>

          <h3
            className="font-bold text-base mt-1"
            style={{ color: 'var(--ls-text)' }}
          >
            Packaged food product
          </h3>

          <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
            Personalized analysis
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <XCircle size={28} style={{ color: 'var(--ls-red)' }} />
          <span className="ls-badge verdict-bg-avoid text-xs">
            Avoid
          </span>
        </div>
      </div>

      <div className="px-5 py-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--ls-muted)' }}
        >
          Personalized observations
        </p>

        <div className="flex flex-col gap-3">
          {[
            {
              name: 'Ingredient concern',
              reason: 'Conflicts with the selected allergy profile',
              verdict: 'avoid',
            },
            {
              name: 'Nutrition information',
              reason: 'Consider the nutritional values per 100g',
              verdict: 'caution',
            },
            {
              name: 'Dietary preference',
              reason: 'Checked against your selected diet',
              verdict: 'caution',
            },
          ].map(({ name, reason, verdict }) => (
            <div
              key={name}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: 'var(--ls-bg)' }}
            >
              {verdict === 'avoid' ? (
                <XCircle
                  size={17}
                  style={{ color: 'var(--ls-red)', flexShrink: 0 }}
                />
              ) : (
                <AlertTriangle
                  size={17}
                  style={{ color: 'var(--ls-amber)', flexShrink: 0 }}
                />
              )}

              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--ls-text)' }}
                >
                  {name}
                </p>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: 'var(--ls-muted)' }}
                >
                  {reason}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-4 pt-3"
          style={{ borderTop: '1px solid var(--ls-border)' }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            Illustrative example. Actual results depend on the product label
            and your saved profile.
          </p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: ScanLine,
      title: 'Scan a product',
      description:
        'Scan the barcode or provide the ingredient list to get product and nutrition information.',
    },
    {
      num: '02',
      icon: BrainCircuit,
      title: 'AI analyzes your profile',
      description:
        'AI compares the available ingredients and nutrition information with your allergies, health conditions and dietary preferences.',
    },
    {
      num: '03',
      icon: CheckCircle,
      title: 'Understand your result',
      description:
        'Get an OK, Caution, Avoid or Unverified assessment with explanations to help you make an informed choice.',
    },
  ];

  return (
    <section
      id="how"
      className="py-20"
      style={{ background: 'var(--ls-green-light)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--ls-text)' }}
          >
            How FoodLens works
          </h2>

          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--ls-muted)' }}
          >
            Three simple steps to understand what's in your food.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {steps.map(({ num, icon: Icon, title, description }) => (
            <div
              key={num}
              className="ls-surface p-7 flex flex-col gap-4 animate-fade-in"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center ls-brand-gradient">
                  <Icon size={22} className="text-white" />
                </div>

                <span
                  className="text-4xl font-black"
                  style={{ color: 'var(--ls-border)' }}
                >
                  {num}
                </span>
              </div>

              <div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--ls-text)' }}
                >
                  {title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--ls-muted)' }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: ScanLine,
      title: 'Barcode scanning',
      description:
        'Scan product barcodes or enter them manually to retrieve available product information.',
    },
    {
      icon: BrainCircuit,
      title: 'AI ingredient analysis',
      description:
        'Understand ingredient information with AI-generated explanations based on the available product label.',
    },
    {
      icon: ShieldCheck,
      title: 'Allergy awareness',
      description:
        'Evaluate product information against the allergies saved in your personal profile.',
    },
    {
      icon: UserRound,
      title: 'Personalized assessment',
      description:
        'Consider your dietary preferences and selected health conditions when analyzing a product.',
    },
    {
      icon: FileText,
      title: 'Nutrition insights',
      description:
        'Review available energy, fats, carbohydrates, sugars, protein and sodium information.',
    },
    {
      icon: History,
      title: 'Scan history',
      description:
        'Access your previous scans and revisit their personalized analysis.',
    },
  ];

  return (
    <section
      id="features"
      className="py-20"
      style={{ background: 'var(--ls-page)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--ls-text)' }}
          >
            Everything you need
          </h2>

          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--ls-muted)' }}
          >
            Understand food labels with personalized AI-powered insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="ls-surface p-6 ls-card-hover animate-fade-in"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: 'var(--ls-green-light)',
                  color: 'var(--ls-green)',
                }}
              >
                <Icon size={20} />
              </div>

              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--ls-text)' }}
              >
                {title}
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--ls-muted)' }}
              >
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 ls-brand-gradient">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Make every food choice count
        </h2>

        <p className="text-white opacity-80 text-lg mb-8">
          Create your profile and get personalized food-label analysis based
          on your preferences and health information.
        </p>

        <Link
          to="/register"
          id="cta-get-started-btn"
          className="ls-btn bg-white text-[var(--ls-green)] font-semibold px-8 py-3 text-base hover:bg-green-50"
        >
          Get Started
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-10"
      style={{
        background: 'var(--ls-surface)',
        borderTop: '1px solid var(--ls-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: 'var(--ls-green)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center ls-brand-gradient">
              <Leaf size={15} className="text-white" />
            </div>
            FoodLens
          </Link>

          <div
            className="flex flex-wrap gap-6 text-sm"
            style={{ color: 'var(--ls-muted)' }}
          >
            <a href="#how" className="hover:text-[var(--ls-green)] transition-colors">
              How it works
            </a>

            <a href="#features" className="hover:text-[var(--ls-green)] transition-colors">
              Features
            </a>

            <Link to="/login" className="hover:text-[var(--ls-green)] transition-colors">
              Login
            </Link>

            <Link to="/register" className="hover:text-[var(--ls-green)] transition-colors">
              Get Started
            </Link>
          </div>

          <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>
            © {new Date().getFullYear()} FoodLens. Not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div style={{ background: 'var(--ls-bg)', minHeight: '100vh' }}>
      <NavBar />
      <HeroSection />
      <HowItWorks />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
