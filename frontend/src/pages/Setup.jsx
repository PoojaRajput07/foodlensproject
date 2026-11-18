// src/pages/Setup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, ChevronLeft, Check, Leaf, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';

const ALLERGIES = ['Milk', 'Peanut', 'Gluten', 'Soy', 'Egg', 'Tree nuts', 'Sesame'];
const CONDITIONS = ['Diabetes', 'High BP', 'Thyroid', 'PCOS', 'Lactose intolerance'];
const DIETS = ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Jain'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const STEPS = ['Personal info', 'Health profile', 'Review'];

function ProgressIndicator({ step }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done ? 'ls-brand-gradient text-white' : active ? 'border-2 text-white ls-brand-gradient' : ''
                }`}
                style={!done && !active ? { border: '2px solid var(--ls-border)', color: 'var(--ls-muted)' } : {}}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: active ? 'var(--ls-green)' : 'var(--ls-muted)' }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-8 sm:w-16 h-0.5 mb-4"
                style={{ background: done ? 'var(--ls-green)' : 'var(--ls-border)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
        selected ? 'text-white border-transparent ls-brand-gradient' : ''
      }`}
      style={!selected ? { border: '1px solid var(--ls-border)', color: 'var(--ls-text)', background: 'var(--ls-surface)' } : {}}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

export default function Setup() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [personal, setPersonal] = useState({ name: '', age: '', gender: '' });
  const [health, setHealth] = useState({
    allergies: [],
    healthConditions: [],
    dietPreference: '',
  });
  const [personalErrors, setPersonalErrors] = useState({});

  const toggleItem = (key, item) => {
    setHealth((prev) => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter((x) => x !== item) : [...prev[key], item],
    }));
  };

  const validatePersonal = () => {
    const errs = {};
    if (!personal.name.trim()) errs.name = 'Name is required';
    if (!personal.age) errs.age = 'Age is required';
    else if (isNaN(personal.age) || +personal.age < 1 || +personal.age > 120)
      errs.age = 'Enter a valid age';
    return errs;
  };

  const handleNext = () => {
    if (step === 0) {
      const errs = validatePersonal();
      if (Object.keys(errs).length) { setPersonalErrors(errs); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...personal, age: +personal.age, ...health, profileComplete: true };
      const updated = await userService.updateProfile(payload);
      updateUser(updated);
      toast.success('Health profile saved!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--ls-bg)' }}>
      <div className="w-full max-w-lg ls-surface p-8 animate-scale-in" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--ls-green)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center ls-brand-gradient">
            <Leaf size={15} className="text-white" />
          </div>
          <span className="font-bold">FoodLens</span>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Set up your health profile</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--ls-muted)' }}>
          This helps us personalise every scan result for you.
        </p>

        <ProgressIndicator step={step} />

        {/* Step 1: Personal info */}
        {step === 0 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <Input
              id="setup-name"
              label="Your name"
              icon={User}
              placeholder="Priya Sharma"
              value={personal.name}
              onChange={(e) => { setPersonal((p) => ({ ...p, name: e.target.value })); setPersonalErrors((pe) => ({ ...pe, name: '' })); }}
              error={personalErrors.name}
              autoFocus
            />
            <Input
              id="setup-age"
              label="Age"
              type="number"
              placeholder="28"
              value={personal.age}
              onChange={(e) => { setPersonal((p) => ({ ...p, age: e.target.value })); setPersonalErrors((pe) => ({ ...pe, age: '' })); }}
              error={personalErrors.age}
              min={1} max={120}
            />
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ls-text)' }}>
                Gender <span className="font-normal" style={{ color: 'var(--ls-muted)' }}>(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <ToggleChip
                    key={g}
                    label={g}
                    selected={personal.gender === g}
                    onClick={() => setPersonal((p) => ({ ...p, gender: p.gender === g ? '' : g }))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Health profile */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ls-text)' }}>Allergies</h3>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map((a) => (
                  <ToggleChip
                    key={a}
                    label={a}
                    selected={health.allergies.includes(a)}
                    onClick={() => toggleItem('allergies', a)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ls-text)' }}>Health conditions</h3>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <ToggleChip
                    key={c}
                    label={c}
                    selected={health.healthConditions.includes(c)}
                    onClick={() => toggleItem('healthConditions', c)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ls-text)' }}>Diet preference</h3>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <ToggleChip
                    key={d}
                    label={d}
                    selected={health.dietPreference === d}
                    onClick={() => setHealth((h) => ({ ...h, dietPreference: h.dietPreference === d ? '' : d }))}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="rounded-xl p-4" style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ls-muted)' }}>Personal</p>
              <p style={{ color: 'var(--ls-text)' }} className="font-medium">{personal.name || '—'}</p>
              <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>Age: {personal.age || '—'} · {personal.gender || 'Gender not specified'}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ls-muted)' }}>Allergies</p>
              {health.allergies.length ? (
                <div className="flex flex-wrap gap-2">
                  {health.allergies.map((a) => (
                    <span key={a} className="ls-badge verdict-bg-avoid">{a}</span>
                  ))}
                </div>
              ) : <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>None selected</p>}
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ls-muted)' }}>Health conditions</p>
              {health.healthConditions.length ? (
                <div className="flex flex-wrap gap-2">
                  {health.healthConditions.map((c) => (
                    <span key={c} className="ls-badge verdict-bg-caution">{c}</span>
                  ))}
                </div>
              ) : <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>None selected</p>}
            </div>
            <div className="rounded-xl p-4" style={{ background: 'var(--ls-bg)', border: '1px solid var(--ls-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--ls-muted)' }}>Diet preference</p>
              <p className="font-medium" style={{ color: 'var(--ls-text)' }}>{health.dietPreference || 'Not specified'}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} id="setup-back-btn">
                <ChevronLeft size={16} /> Back
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: 'var(--ls-muted)' }}
                id="setup-skip-btn"
              >
                <SkipForward size={14} /> Skip for now
              </button>
            )}
          </div>

          {step < 2 ? (
            <Button onClick={handleNext} id="setup-next-btn">
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSave} loading={loading} id="setup-save-btn">
              <Check size={16} /> Save & Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
