
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Edit,
  Check,
  X,
  Bell,
  Shield,
  Globe,
  Trash2,
  LogOut,
  Info,
  ChevronRight,
  Leaf,
  HeartPulse,
  Activity,
  Utensils,
  Settings,
  Mail,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { Modal } from '../components/common/Modal.jsx';

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
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
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
          name: p.name || '',
          age: p.age?.toString() || '',
          gender: p.gender || '',
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
      name: profile?.name || '',
      age: profile?.age?.toString() || '',
      gender: profile?.gender || '',
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
    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    if (form.age && (Number(form.age) < 1 || Number(form.age) > 120)) {
      toast.error('Please enter a valid age.');
      return;
    }

    setSaving(true);

    try {
      const updated = await userService.updateProfile({
        ...form,
        name: form.name.trim(),
        age: form.age ? Number(form.age) : undefined,
      });

      setProfile(updated);
      setForm({
        name: updated.name || '',
        age: updated.age?.toString() || '',
        gender: updated.gender || '',
        allergies: updated.allergies || [],
        healthConditions: updated.healthConditions || [],
        dietPreference: updated.dietPreference || '',
      });

      updateUser({ name: updated.name });

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

  const displayName = profile?.name || user?.name || 'User';
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
              {profile?.email || user?.email || 'No email available'}
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
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                id="profile-name"
                name="name"
                label="Full name"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />

              <Input
                id="profile-age"
                name="age"
                label="Age"
                type="number"
                placeholder="Enter your age"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
                min={1}
                max={120}
              />
            </div>

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
                value={profile.name}
              />

              <ProfileInfo
                icon={Calendar}
                label="Age"
                value={profile.age ? `${profile.age} years` : 'Not set'}
              />

              <ProfileInfo
                icon={Activity}
                label="Gender"
                value={profile.gender}
              />

              <ProfileInfo
                icon={Mail}
                label="Email address"
                value={profile.email}
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

      {/* Account settings */}
      <div className="mb-6">
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--ls-muted)' }}
          >
            Preferences
          </p>
          <h2
            className="text-lg font-bold mt-1"
            style={{ color: 'var(--ls-text)' }}
          >
            Account Settings
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <SettingRow
            icon={Globe}
            label="Language"
            description="Choose your preferred language"
            id="setting-language"
            onClick={() => {
              setLanguage((current) =>
                current === 'English' ? 'Hindi' : 'English'
              );
              toast(
                `Language preference changed. Full translation is not available yet.`
              );
            }}
            right={
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--ls-green)' }}
              >
                {language}
              </span>
            }
          />

          <SettingRow
            icon={Bell}
            label="Notifications"
            description={
              notifications ? 'Currently enabled' : 'Currently disabled'
            }
            id="setting-notifications"
            onClick={() => {
              setNotifications((current) => !current);
              toast(
                notifications
                  ? 'Notifications disabled'
                  : 'Notifications enabled'
              );
            }}
            right={
              <div
                className={`w-11 h-6 rounded-full flex items-center transition-all ${
                  notifications ? 'justify-end' : 'justify-start'
                }`}
                style={{
                  background: notifications
                    ? 'var(--ls-green)'
                    : 'var(--ls-border)',
                  padding: '3px',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </div>
            }
          />

          <SettingRow
            icon={Shield}
            label="Privacy Policy"
            description="Learn how your information is handled"
            id="setting-privacy"
            onClick={() => toast('Privacy policy coming soon')}
          />

          <SettingRow
            icon={Info}
            label="About FoodLens"
            description="Version 1.0.0 · Final Year Project"
            id="setting-about"
            onClick={() => toast('FoodLens — AI-powered food label analysis')}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <div className="mb-4">
          <p
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--ls-red)' }}
          >
            Account management
          </p>
          <h2
            className="text-lg font-bold mt-1"
            style={{ color: 'var(--ls-text)' }}
          >
            Danger Zone
          </h2>
        </div>

        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{
            border: '1px solid var(--ls-red-light)',
            background: 'var(--ls-surface)',
          }}
        >
          <SettingRow
            icon={Trash2}
            label="Delete All Data"
            description="Permanently remove your scan history and saved data"
            id="setting-delete-data"
            danger
            onClick={() => setDeleteModal(true)}
            right={
              <ChevronRight
                size={17}
                style={{ color: 'var(--ls-red)' }}
              />
            }
          />
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

      {/* Delete confirmation */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete all data?"
      >
        <div className="flex flex-col gap-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--ls-red-light)',
              color: 'var(--ls-red)',
            }}
          >
            <AlertCircle size={24} />
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--ls-muted)' }}
          >
            This will permanently delete your scan history, health profile
            and all saved data. This action{' '}
            <strong style={{ color: 'var(--ls-text)' }}>
              cannot be undone.
            </strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setDeleteModal(false)}
              id="delete-cancel-btn"
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setDeleteModal(false);
                toast.error(
                  'Data deletion is not connected to the backend yet.'
                );
              }}
              id="delete-confirm-btn"
            >
              <Trash2 size={16} />
              Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
