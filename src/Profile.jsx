import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  ArrowLeft,
  User,
  Phone,
  Building2,
  LogOut,
  Bell,
  LayoutDashboard,
  Shield
} from 'lucide-react';

const Profile = ({ onBack, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    company_name: '',
    notifications_enabled: true,
    default_view: 'dashboard'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('siteboss_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name || '',
        phone: data.phone || '',
        company_name: data.company_name || '',
        notifications_enabled: data.notifications_enabled ?? true,
        default_view: data.default_view || 'dashboard'
      });
    }

    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    await supabase
      .from('siteboss_users')
      .update(profile)
      .eq('id', user.id);

    setSaving(false);
    alert('Profile updated');
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-400">Loading profile…</div>;
  }

  return (
    <div className="min-h-screen bg-nexus-surface pb-32">

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-slate-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg text-nexus-dark">Profile & Settings</h1>
      </div>

      <div className="p-6 space-y-8">

        {/* PROFILE INFO */}
        <section className="bg-white rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="font-bold text-nexus-dark flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>

          <Input
            icon={User}
            label="Name"
            value={profile.name}
            onChange={v => setProfile({ ...profile, name: v })}
          />

          <Input
            icon={Phone}
            label="Mobile"
            value={profile.phone}
            onChange={v => setProfile({ ...profile, phone: v })}
          />

          <Input
            icon={Building2}
            label="Company"
            value={profile.company_name}
            onChange={v => setProfile({ ...profile, company_name: v })}
          />
        </section>

        {/* APP SETTINGS */}
        <section className="bg-white rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="font-bold text-nexus-dark flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" /> App Settings
          </h2>

          <Toggle
            icon={Bell}
            label="Notifications"
            checked={profile.notifications_enabled}
            onChange={v =>
              setProfile({ ...profile, notifications_enabled: v })
            }
          />

          <div>
            <label className="text-xs font-bold text-slate-500">
              Default Home Screen
            </label>
            <select
              className="w-full mt-1 bg-slate-100 p-3 rounded-xl font-bold"
              value={profile.default_view}
              onChange={e =>
                setProfile({ ...profile, default_view: e.target.value })
              }
            >
              <option value="dashboard">Dashboard</option>
              <option value="map">Live Map</option>
            </select>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="bg-white rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="font-bold text-nexus-dark flex items-center gap-2">
            <Shield className="w-5 h-5" /> Account
          </h2>

          <button
            onClick={onLogout}
            className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </section>

        {/* SAVE */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>

      </div>
    </div>
  );
};

/* ---------- SMALL COMPONENTS ---------- */

const Input = ({ icon: Icon, label, value, onChange }) => (
  <div>
    <label className="text-xs font-bold text-slate-500">{label}</label>
    <div className="relative mt-1">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        className="w-full bg-slate-100 pl-10 p-3 rounded-xl font-bold"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  </div>
);

const Toggle = ({ icon: Icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 font-bold text-nexus-dark">
      <Icon className="w-4 h-4" /> {label}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      className="w-5 h-5"
    />
  </div>
);

export default Profile;
