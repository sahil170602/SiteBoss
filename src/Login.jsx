import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Key, Phone, User, Building2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState('OWNER'); 
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({ mobile: '', name: '', companyName: '' });
  const [workerId, setWorkerId] = useState('');

  /* ================= OWNER LOGIN (REAL AUTH) ================= */

  const handleOwnerLogin = async () => {
    if (!profile.mobile || !profile.name || !profile.companyName) {
      return alert("Fill all details");
    }

    setIsLoading(true);

    // 1️⃣ Sign in anonymously (simple, OTP can be added later)
    const { data: authData, error } = await supabase.auth.signInAnonymously();

    if (error || !authData?.user) {
      setIsLoading(false);
      return alert("Login failed");
    }

    const authUser = authData.user;

    // 2️⃣ Insert / upsert owner into siteboss_users
   await supabase
  .from('siteboss_users')
  .upsert({
    id: authUser.id,
    role: 'OWNER',
    name: profile.name,
    mobile: profile.mobile,
    company_name: profile.companyName,
    is_active: true
  });

    setIsLoading(false);

    // 3️⃣ Notify App.jsx
    onLoginSuccess({
      id: authUser.id,
      role: 'OWNER',
      name: profile.name,
      companyName: profile.companyName
    });
  };

  /* ================= WORKER LOGIN ================= */

  const handleWorkerLogin = async () => {
    if (!workerId) return alert("Enter Mobile Number");
    setIsLoading(true);

    const { data, error } = await supabase
      .from('siteboss_workers')
      .select(`
        id,
        name,
        role,
        siteboss_projects ( name )
      `)
      .eq('mobile', workerId)
      .maybeSingle();

    if (error || !data) {
      setIsLoading(false);
      return alert("Access Denied. ID not found.");
    }

    setIsLoading(false);

    onLoginSuccess({
      id: data.id,
      role: data.role || 'WORKER',
      name: data.name,
      projectName: data.siteboss_projects?.name || 'Unassigned'
    });
  };

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="min-h-screen bg-nexus-surface flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-floating overflow-hidden">
        <div className="bg-nexus-dark p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">SITEBOSS</h1>
          <div className="flex bg-slate-800/50 p-1 rounded-xl mx-auto max-w-[200px]">
            <button
              onClick={() => setLoginMode('OWNER')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg ${
                loginMode === 'OWNER'
                  ? 'bg-nexus-accent text-nexus-dark'
                  : 'text-slate-400'
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => setLoginMode('WORKER')}
              className={`flex-1 py-3 text-xs font-bold rounded-lg ${
                loginMode === 'WORKER'
                  ? 'bg-nexus-accent text-nexus-dark'
                  : 'text-slate-400'
              }`}
            >
              Team
            </button>
          </div>
        </div>

        <div className="p-8 space-y-5">
          {loginMode === 'OWNER' ? (
            <>
              <div className="relative">
                <Phone className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="Mobile"
                  className="w-full pl-12 p-3 bg-nexus-surface rounded-xl outline-none"
                  value={profile.mobile}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                />
              </div>

              <div className="relative">
                <User className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full pl-12 p-3 bg-nexus-surface rounded-xl outline-none"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Company"
                  className="w-full pl-12 p-3 bg-nexus-surface rounded-xl outline-none"
                  value={profile.companyName}
                  onChange={(e) =>
                    setProfile({ ...profile, companyName: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleOwnerLogin}
                disabled={isLoading}
                className="w-full bg-nexus-dark text-white font-bold py-4 rounded-xl mt-2"
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            </>
          ) : (
            <div className="text-center">
              <Key className="mx-auto text-emerald-500 w-8 h-8 mb-4" />
              <h3 className="font-bold text-nexus-dark text-lg mb-1">Site Access</h3>
              <p className="text-xs text-slate-400 mb-4">Enter Registered Mobile</p>
              <input
                type="tel"
                placeholder="9876543210"
                className="w-full text-center text-2xl font-bold p-4 bg-nexus-surface rounded-xl mb-4 outline-none"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
              <button
                onClick={handleWorkerLogin}
                disabled={isLoading}
                className="w-full bg-nexus-dark text-white font-bold py-4 rounded-xl"
              >
                {isLoading ? 'Verify & Enter' : 'Enter Site'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
