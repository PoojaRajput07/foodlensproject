// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, Edit, Check, X,
  Bell, Shield, Globe, Trash2, LogOut,
  Info, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { InlineLoader } from '../components/common/Spinner.jsx';
import { Modal } from '../components/common/Modal.jsx';

const ALLERGIES = ['Milk', 'Peanut', 'Gluten', 'Soy', 'Egg', 'Tree nuts', 'Sesame'];
const CONDITIONS = ['Diabetes', 'High BP', 'Thyroid', 'PCOS', 'Lactose intolerance'];
const DIETS = ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Jain'];

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
        selected ? 'text-white border-transparent ls-brand-gradient' : ''
      }`}
      style={!selected ? { border: '1px solid var(--ls-border)', color: 'var(--ls-text)', background: 'var(--ls-surface)' } : {}}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: 'var(--ls-muted)' }}
    >
      {title}
    </h2>
  );
}

function SettingRow({ icon: Icon, label, description, right, onClick, id }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors hover:bg-[var(--ls-bg)] ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ background: 'var(--ls-surface)', border: '1px solid var(--ls-border)' }}
      type="button"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--ls-text)' }}>{label}</p>
        {description && <p className="text-xs" style={{ color: 'var(--ls-muted)' }}>{description}</p>}
      </div>
      {right ?? <ChevronRight size={16} style={{ color: 'var(--ls-muted)', flexShrink: 0 }} />}
    </button>
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

  // Health edit state
  const [form, setForm] = useState({
    name: '', age: '', gender: '',
    allergies: [], healthConditions: [], dietPreference: '',
  });

  useEffect(() => {
    userService.getProfile()
      .then((p) => {
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
      .catch(() => toast.error('Could not load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleItem = (key, item) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter((x) => x !== item) : [...prev[key], item],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ ...form, age: +form.age });
      setProfile(updated);
      updateUser({ name: updated.name });
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <InlineLoader message="Loading your profile…" />;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--ls-text)' }}>Profile & Settings</h1>
        <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>Manage your personal info and health data.</p>
      </div>

      {/* Profile card */}
      <div
        className="ls-surface p-5 mb-6 flex items-center gap-4"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0"
          style={{ background: 'var(--ls-green-light)', color: 'var(--ls-green)' }}
        >
          {profile?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold" style={{ color: 'var(--ls-text)' }}>{profile?.name}</h2>
          <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>{profile?.email}</p>
          {profile?.age && (
            <p className="text-xs mt-1" style={{ color: 'var(--ls-muted)' }}>
              Age {profile.age}{profile.gender ? ` · ${profile.gender}` : ''}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditMode((v) => !v)}
          id="profile-edit-btn"
        >
          {editMode ? <X size={16} /> : <Edit size={16} />}
          {editMode ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {/* Edit form */}
      {editMode && (
        <div className="ls-surface p-5 mb-5 animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--ls-text)' }}>Edit Health Data</h3>

          <div className="flex flex-col gap-4">
            <Input id="profile-name" label="Name" icon={User} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input id="profile-age" label="Age" type="number" icon={Calendar} value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} min={1} max={120} />

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ls-text)' }}>Allergies</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map((a) => (
                  <ToggleChip key={a} label={a} selected={form.allergies.includes(a)}
                    onClick={() => toggleItem('allergies', a)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ls-text)' }}>Health Conditions</label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((c) => (
                  <ToggleChip key={c} label={c} selected={form.healthConditions.includes(c)}
                    onClick={() => toggleItem('healthConditions', c)} />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--ls-text)' }}>Diet Preference</label>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <ToggleChip key={d} label={d} selected={form.dietPreference === d}
                    onClick={() => setForm((f) => ({ ...f, dietPreference: f.dietPreference === d ? '' : d }))} />
                ))}
              </div>
            </div>

            <Button onClick={handleSave} loading={saving} id="profile-save-btn">
              <Check size={16} /> Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Health summary (view mode) */}
      {!editMode && profile && (
        <div className="ls-surface p-5 mb-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <SectionHeader title="Health Profile" />
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--ls-muted)' }}>Allergies</p>
              {profile.allergies?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.allergies.map((a) => (
                    <span key={a} className="ls-badge verdict-bg-avoid">{a}</span>
                  ))}
                </div>
              ) : <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>None selected</p>}
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--ls-muted)' }}>Health Conditions</p>
              {profile.healthConditions?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.healthConditions.map((c) => (
                    <span key={c} className="ls-badge verdict-bg-caution">{c}</span>
                  ))}
                </div>
              ) : <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>None selected</p>}
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--ls-muted)' }}>Diet</p>
              <span className="ls-badge verdict-bg-ok">{profile.dietPreference || 'Not set'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account settings */}
      <div className="mb-6">
        <SectionHeader title="Account Settings" />
        <div className="flex flex-col gap-2">
          <SettingRow
            icon={Globe}
            label="Language"
            description={language}
            id="setting-language"
            onClick={() => {
              setLanguage((l) => l === 'English' ? 'Hindi' : 'English');
              toast(`Language set to ${language === 'English' ? 'Hindi' : 'English'} (UI placeholder)`);
            }}
            right={<span className="text-sm font-medium" style={{ color: 'var(--ls-green)' }}>{language}</span>}
          />
          <SettingRow
            icon={Bell}
            label="Notifications"
            description={notifications ? 'Enabled' : 'Disabled'}
            id="setting-notifications"
            onClick={() => { setNotifications((v) => !v); toast(notifications ? 'Notifications disabled' : 'Notifications enabled'); }}
            right={
              <div
                className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                  notifications ? 'justify-end' : 'justify-start'
                }`}
                style={{ background: notifications ? 'var(--ls-green)' : 'var(--ls-border)', padding: '2px' }}
              >
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            }
          />
          <SettingRow icon={Shield} label="Privacy Policy" id="setting-privacy" onClick={() => toast('Privacy policy coming soon')} />
          <SettingRow icon={Info} label="About Label Sach" description="v1.0.0 · Final Year Project" id="setting-about" onClick={() => {}} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <SectionHeader title="Danger Zone" />
        <div className="flex flex-col gap-2">
          <SettingRow
            icon={Trash2}
            label="Delete All Data"
            description="Permanently remove all your scan history and profile"
            id="setting-delete-data"
            onClick={() => setDeleteModal(true)}
            right={<ChevronRight size={16} style={{ color: 'var(--ls-red)' }} />}
          />
        </div>
      </div>

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        onClick={logout}
        id="profile-logout-btn"
      >
        <LogOut size={18} /> Sign Out
      </Button>

      {/* Delete data modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete all data?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'var(--ls-muted)' }}>
            This will permanently delete your scan history, health profile, and all saved data.
            This action <strong>cannot be undone</strong>.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setDeleteModal(false)} id="delete-cancel-btn">
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                setDeleteModal(false);
                toast.error('Data deletion coming soon — backend integration required.');
              }}
              id="delete-confirm-btn"
            >
              <Trash2 size={16} /> Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
