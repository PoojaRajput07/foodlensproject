
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Edit,
  Check,
  X,
  LogOut,
  Info,
  ChevronRight,
  Leaf,
  HeartPulse,
  Activity,
  Utensils,
  Mail,
  Shield,
  Scan,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Button } from '../components/common/Button.jsx';

import { InlineLoader } from '../components/common/Spinner.jsx';


const ALLERGIES = [
  'Milk',
  'Peanut',
  'Gluten',
  'Soy',
  'Egg',
  'Tree nuts',
  'Sesame',
];

const CONDITIONS = [
  'Diabetes',
  'High BP',
  'Thyroid',
  'PCOS',
  'Lactose intolerance',
];

const DIETS = [
  'Vegetarian',
  'Non-vegetarian',
  'Vegan',
  'Jain',
];

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        selected
          ? 'text-white border-transparent ls-brand-gradient shadow-sm'
          : 'hover:border-[var(--ls-green)]'
      }`}
      style={
        !selected
          ? {
              borderColor: 'var(--ls-border)',
              color: 'var(--ls-text)',
              background: 'var(--ls-surface)',
            }
          : {}
      }
    >
      {selected && <Check size={13} className="inline mr-1.5" />}
      {label}
    </button>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--ls-green-light)',
          color: 'var(--ls-green)',
        }}
      >
        <Icon size={19} />
      </div>

      <div>
        <h2
          className="font-bold text-base"
          style={{ color: 'var(--ls-text)' }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileInfo({ label, value, icon: Icon }) {
  return (
    <div
      className="rounded-xl p-3.5 flex items-center gap-3"
      style={{ background: 'var(--ls-bg)' }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--ls-green-light)',
          color: 'var(--ls-green)',
        }}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p
          className="text-xs mb-0.5"
          style={{ color: 'var(--ls-muted)' }}
        >
          {label}
        </p>
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--ls-text)' }}
        >
          {value || 'Not set'}
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  right,
  onClick,
  id,
  danger = false,
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 hover:opacity-80 disabled:cursor-default"
      style={{
        background: 'var(--ls-surface)',
        border: '1px solid var(--ls-border)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? 'var(--ls-red-light)' : 'var(--ls-green-light)',
          color: danger ? 'var(--ls-red)' : 'var(--ls-green)',
        }}
      >
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: danger ? 'var(--ls-red)' : 'var(--ls-text)' }}
        >
          {label}
        </p>
        {description && (
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--ls-muted)' }}
          >
            {description}
          </p>
        )}
      </div>

      {right || (
        <ChevronRight
          size={17}
          style={{ color: 'var(--ls-muted)', flexShrink: 0 }}
        />
      )}
    </button>
  );
}

function ProfileSection({ children, className = '' }) {
  return (
    <section
      className={`ls-surface rounded-2xl p-5 sm:p-6 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </section>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);


  const [form, setForm] = useState({
    allergies: [],
    healthConditions: [],
    dietPreference: '',
  });

  useEffect(() => {
    let active = true;

    userService
      .getProfile()
      .then((p) => {
        if (!active) return;

        setProfile(p);
        setForm({
          allergies: p.allergies || [],
          healthConditions: p.healthConditions || [],
          dietPreference: p.dietPreference || '',
        });
      })
      .catch(() => {
        if (active) toast.error('Could not load profile.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleItem = (key, item) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((x) => x !== item)
        : [...prev[key], item],
    }));
  };

  const resetForm = () => {
    setForm({
      allergies: profile?.allergies || [],
      healthConditions: profile?.healthConditions || [],
      dietPreference: profile?.dietPreference || '',
    });
  };

  const handleCancelEdit = () => {
    resetForm();
    setEditMode(false);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const updated = await userService.updateProfile(form);

      setProfile(updated);
      setForm({
        allergies: updated.allergies || [],
        healthConditions: updated.healthConditions || [],
        dietPreference: updated.dietPreference || '',
      });

      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  };

  if (loading) {
    return <InlineLoader message="Loading your profile..." />;
  }

  // Name & email come from AuthContext (auth/me), not from the profile endpoint
  const displayName = user?.name || profile?.name || 'User';
  const displayEmail = user?.email || profile?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      {/* Page heading */}
      <div className="mb-7">
        <p
          className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
          style={{ color: 'var(--ls-green)' }}
        >
          Account
        </p>

        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--ls-text)' }}
        >
          Profile & Settings
        </h1>

        <p
          className="text-sm"
          style={{ color: 'var(--ls-muted)' }}
        >
          Manage your personal information and food preferences.
        </p>
      </div>

      {/* Profile header */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-7 mb-6"
        style={{
          background: 'var(--ls-surface)',
          border: '1px solid var(--ls-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="absolute -top-20 -right-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--ls-green)' }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ls-brand-gradient"
          >
            {initials || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2
                className="text-xl font-bold truncate"
                style={{ color: 'var(--ls-text)' }}
              >
                {displayName}
              </h2>

              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{
                  color: 'var(--ls-green)',
                  background: 'var(--ls-green-light)',
                }}
              >
                ACCOUNT
              </span>
            </div>

            <p
              className="text-sm flex items-center gap-2 break-all"
              style={{ color: 'var(--ls-muted)' }}
            >
              <Mail size={14} />
              {displayEmail || 'No email available'}
            </p>

            <p
              className="text-xs mt-2"
              style={{ color: 'var(--ls-muted)' }}
            >
              Your personal food profile
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editMode) {
                handleCancelEdit();
              } else {
                setEditMode(true);
              }
            }}
            id="profile-edit-btn"
          >
            {editMode ? <X size={16} /> : <Edit size={16} />}
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {editMode && (
        <ProfileSection className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="font-bold text-lg"
                style={{ color: 'var(--ls-text)' }}
              >
                Edit your profile
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--ls-muted)' }}
              >
                Keep your information and preferences up to date.
              </p>
            </div>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--ls-green-light)',
                color: 'var(--ls-green)',
              }}
            >
              <Edit size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-5">

            <div>
              <label
                className="text-sm font-semibold block mb-2"
                style={{ color: 'var(--ls-text)' }}
              >
                Allergies
              </label>

              <p
                className="text-xs mb-3"
                style={{ color: 'var(--ls-muted)' }}
              >
                Select the ingredients you want the AI to check for.
              </p>

              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map((allergy) => (
                  <ToggleChip
                    key={allergy}
                    label={allergy}
                    selected={form.allergies.includes(allergy)}
                    onClick={() => toggleItem('allergies', allergy)}
                  />
                ))}
              </div>
            </div>

            <div
              className="h-px"
              style={{ background: 'var(--ls-border)' }}
            />

            <div>
              <label
                className="text-sm font-semibold block mb-2"
                style={{ color: 'var(--ls-text)' }}
              >
                Health conditions
              </label>

              <p
                className="text-xs mb-3"
                style={{ color: 'var(--ls-muted)' }}
              >
                Select any conditions relevant to your food choices.
              </p>

              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((condition) => (
                  <ToggleChip
                    key={condition}
                    label={condition}
                    selected={form.healthConditions.includes(condition)}
                    onClick={() =>
                      toggleItem('healthConditions', condition)
                    }
                  />
                ))}
              </div>
            </div>

            <div
              className="h-px"
              style={{ background: 'var(--ls-border)' }}
            />

            <div>
              <label
                className="text-sm font-semibold block mb-2"
                style={{ color: 'var(--ls-text)' }}
              >
                Dietary preference
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIETS.map((diet) => {
                  const selected = form.dietPreference === diet;

                  return (
                    <button
                      type="button"
                      key={diet}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          dietPreference: selected ? '' : diet,
                        }))
                      }
                      className="rounded-xl px-3 py-3 text-sm font-medium border transition-all"
                      style={{
                        borderColor: selected
                          ? 'var(--ls-green)'
                          : 'var(--ls-border)',
                        color: selected
                          ? 'var(--ls-green)'
                          : 'var(--ls-text)',
                        background: selected
                          ? 'var(--ls-green-light)'
                          : 'var(--ls-surface)',
                      }}
                    >
                      {selected && (
                        <Check size={14} className="inline mr-1" />
                      )}
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleSave}
                loading={saving}
                id="profile-save-btn"
                fullWidth
              >
                <Check size={16} />
                Save Changes
              </Button>

              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={saving}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </ProfileSection>
      )}

      {/* Profile details */}
      {!editMode && profile && (
        <>
          <ProfileSection className="mb-6">
            <SectionHeading
              icon={User}
              title="Personal Information"
              description="Your basic account details."
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <ProfileInfo
                icon={User}
                label="Full name"
                value={displayName}
              />

              <ProfileInfo
                icon={Mail}
                label="Email address"
                value={displayEmail}
              />
            </div>
          </ProfileSection>

          {/* Health profile */}
          <ProfileSection className="mb-6">
            <SectionHeading
              icon={HeartPulse}
              title="Health Profile"
              description="Information used for personalized food analysis."
            />

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield
                    size={15}
                    style={{ color: 'var(--ls-red)' }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ls-text)' }}
                  >
                    Allergies
                  </p>
                </div>

                {profile.allergies?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="ls-badge verdict-bg-avoid"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: 'var(--ls-muted)' }}
                  >
                    No allergies selected
                  </p>
                )}
              </div>

              <div
                className="h-px"
                style={{ background: 'var(--ls-border)' }}
              />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity
                    size={15}
                    style={{ color: 'var(--ls-amber)' }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ls-text)' }}
                  >
                    Health conditions
                  </p>
                </div>

                {profile.healthConditions?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.healthConditions.map((condition) => (
                      <span
                        key={condition}
                        className="ls-badge verdict-bg-caution"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-sm"
                    style={{ color: 'var(--ls-muted)' }}
                  >
                    No health conditions selected
                  </p>
                )}
              </div>

              <div
                className="h-px"
                style={{ background: 'var(--ls-border)' }}
              />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils
                    size={15}
                    style={{ color: 'var(--ls-green)' }}
                  />
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--ls-text)' }}
                  >
                    Dietary preference
                  </p>
                </div>

                <span className="ls-badge verdict-bg-ok">
                  {profile.dietPreference || 'Not set'}
                </span>
              </div>
            </div>

            <div
              className="mt-5 p-3.5 rounded-xl flex items-start gap-3"
              style={{
                background: 'var(--ls-green-light)',
              }}
            >
              <Info
                size={16}
                className="flex-shrink-0 mt-0.5"
                style={{ color: 'var(--ls-green)' }}
              />

              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--ls-text)' }}
              >
                Your profile helps FoodLens personalize food-label
                assessments. Keep it updated for more relevant results.
              </p>
            </div>
          </ProfileSection>
        </>
      )}

      {/* About FoodLens */}
      <div className="mb-6">
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--ls-muted)' }}
          >
            Application
          </p>
          <h2
            className="text-lg font-bold mt-1"
            style={{ color: 'var(--ls-text)' }}
          >
            About FoodLens
          </h2>
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: 'var(--ls-surface)',
            border: '1px solid var(--ls-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* App identity */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center ls-brand-gradient flex-shrink-0"
            >
              <Leaf size={26} className="text-white" />
            </div>
            <div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--ls-text)' }}
              >
                FoodLens
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--ls-muted)' }}
              >
                Version 1.0.0 &nbsp;·&nbsp; Final Year Project
              </p>
            </div>
          </div>

          <div
            className="h-px mb-5"
            style={{ background: 'var(--ls-border)' }}
          />

          <p
            className="text-sm leading-7 mb-5"
            style={{ color: 'var(--ls-muted)' }}
          >
            FoodLens is an AI-powered food label analysis application designed
            to help you make smarter, healthier food choices. Simply scan a
            product barcode or search by name and get instant, personalized
            ingredient insights tailored to your allergies, health conditions,
            and dietary preferences.
          </p>

          {/* Feature highlights */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                icon: Scan,
                title: 'Barcode Scanning',
                desc: 'Instant product lookup using your camera',
              },
              {
                icon: Sparkles,
                title: 'AI Analysis',
                desc: 'Personalized ingredient insights powered by AI',
              },
              {
                icon: Shield,
                title: 'Health Profile',
                desc: 'Tailored for your allergies & health conditions',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-3.5"
                style={{ background: 'var(--ls-bg)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
                  style={{
                    background: 'var(--ls-green-light)',
                    color: 'var(--ls-green)',
                  }}
                >
                  <Icon size={17} />
                </div>
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: 'var(--ls-text)' }}
                >
                  {title}
                </p>
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: 'var(--ls-muted)' }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-5 p-3.5 rounded-xl flex items-start gap-3"
            style={{ background: 'var(--ls-green-light)' }}
          >
            <Info
              size={15}
              className="flex-shrink-0 mt-0.5"
              style={{ color: 'var(--ls-green)' }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--ls-text)' }}
            >
              FoodLens assessments are AI-assisted and based on product label
              data. Results are not medical advice. Always consult a healthcare
              professional for dietary decisions.
            </p>
          </div>
        </div>
      </div>



      {/* Sign out */}
      <Button
        variant="danger"
        fullWidth
        onClick={handleLogout}
        id="profile-logout-btn"
      >
        <LogOut size={17} />
        Sign Out
      </Button>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 mt-7">
        <Leaf size={14} style={{ color: 'var(--ls-green)' }} />
        <p
          className="text-xs"
          style={{ color: 'var(--ls-muted)' }}
        >
          FoodLens · Make informed food choices
        </p>
      </div>


    </div>
  );
}
