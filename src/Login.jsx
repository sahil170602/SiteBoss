import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { HardHat, Key, Phone, User, Building2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState('OWNER'); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Owner State
  const [profile, setProfile] = useState({ mobile: '', name: '', companyName: '' });
  
  // Team State
  const [workerId, setWorkerId] = useState('');

  // 1. OWNER LOGIN (Simple Pass-through)
  const handleOwnerLogin = () => {
    if (!profile.mobile || !profile.name || !profile.companyName) {
        return alert("Please fill all details");
    }
    
    setIsLoading(true);
    setTimeout(() => { 
      setIsLoading(false); 
      // Log in immediately (in future we can save Owner profile to DB too)
      onLoginSuccess({ 
          ...profile, 
          role: 'OWNER', 
          id: Date.now() 
      }); 
    }, 1000);
  };

  // 2. WORKER LOGIN (Check Database)
  const handleWorkerLogin = async () => {
    if (!workerId) return alert("Please enter your Mobile Number");
    setIsLoading(true);
    
    // Check Supabase for this mobile number
    const { data, error } = await supabase
        .from('nexus_workers')
        .select('*')
        .eq('mobile', workerId)
        .maybeSingle();

    if (error || !data) {
        alert("Access Denied. Ask the Owner to add your mobile number in the Staff list.");
        setIsLoading(false);
    } else {
        // Success
        onLoginSuccess({ 
            name: data.name, 
            role: data.role, // 'Supervisor' or 'Store Keeper'
            projectName: 'Assigned Site', 
            id: data.id 
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-surface flex items-center justify-center p-4 pb-12 pt-[env(safe-area-inset-top)]">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-floating overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-nexus-dark p-8 text-center relative">
          <h1 className="text-2xl font-bold text-white tracking-wide mb-6">NEXUS</h1>
          <div className="flex bg-slate-800/50 p-1 rounded-xl mx-auto max-w-[200px]">
             <button onClick={() => setLoginMode('OWNER')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${loginMode === 'OWNER' ? 'bg-nexus-accent text-nexus-dark shadow-lg' : 'text-slate-400'}`}>Owner</button>
             <button onClick={() => setLoginMode('WORKER')} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${loginMode === 'WORKER' ? 'bg-nexus-accent text-nexus-dark shadow-lg' : 'text-slate-400'}`}>Team</button>
           </div>
        </div>

        <div className="p-8">
          
          {/* === OWNER FORM === */}
          {loginMode === 'OWNER' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center mb-2"><h2 className="text-lg font-bold text-nexus-dark">Business Login</h2></div>
              
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="tel" value={profile.mobile} onChange={(e) => setProfile({...profile, mobile:e.target.value})} placeholder="Mobile Number" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold outline-none" />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name:e.target.value})} placeholder="Full Name" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold outline-none" />
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={profile.companyName} onChange={(e) => setProfile({...profile, companyName:e.target.value})} placeholder="Company Name" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold outline-none" />
              </div>

              <button onClick={handleOwnerLogin} disabled={isLoading} className="w-full bg-nexus-dark text-white font-bold py-4 rounded-xl active:scale-95 transition-transform shadow-lg mt-2">
                {isLoading ? 'Processing...' : 'Login to Dashboard'}
              </button>
            </div>
          )}

          {/* === TEAM FORM === */}
          {loginMode === 'WORKER' && (
            <div className="space-y-6 animate-in fade-in pt-4 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><Key className="w-7 h-7" /></div>
                <h2 className="text-lg font-bold text-nexus-dark">Site Access</h2>
                <p className="text-xs text-slate-400 -mt-1 mb-4">Enter Registered Mobile Number</p>
                <input type="tel" placeholder="e.g. 9876543210" className="w-full bg-nexus-surface text-2xl font-bold text-center py-5 rounded-xl border-2 border-transparent focus:border-nexus-accent outline-none" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
                <button onClick={handleWorkerLogin} disabled={isLoading} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold active:scale-95 transition-transform">{isLoading ? 'Verifying...' : 'Enter Site'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;