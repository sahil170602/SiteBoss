import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Search, UserPlus, Trash2, Shield, Phone, X, Check, RefreshCw } from 'lucide-react';

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workers, setWorkers] = useState([]);

  // NEW WORKER FORM
  const [newWorker, setNewWorker] = useState({ name: '', role: 'Supervisor', mobile: '' });

  // 1. FETCH REAL WORKERS
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nexus_workers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setWorkers(data);
    setLoading(false);
  };

  // 2. ADD REAL WORKER
  const handleSaveWorker = async () => {
    if(!newWorker.name || !newWorker.mobile) return alert("Name and Mobile are required");
    
    setLoading(true);
    const { error } = await supabase.from('nexus_workers').insert([
        {
            name: newWorker.name,
            role: newWorker.role,
            mobile: newWorker.mobile, // This serves as their Login ID
            site_id: 0, // Default or unassigned
            status: 'Active'
        }
    ]);

    if (error) {
        alert("Error adding worker: " + error.message);
    } else {
        setIsAddOpen(false);
        setNewWorker({ name: '', role: 'Supervisor', mobile: '' });
        fetchWorkers(); // Refresh list
    }
    setLoading(false);
  };

  // 3. DELETE WORKER
  const handleDelete = async (id) => {
    if (confirm('Permanently remove this staff member?')) {
      await supabase.from('nexus_workers').delete().eq('id', id);
      fetchWorkers();
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.mobile.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Staff Directory</h2>
          <p className="text-nexus-muted text-sm">{workers.length} registered members</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="bg-nexus-dark text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
          <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Add Staff</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search by name or mobile..." className="w-full bg-white pl-12 pr-4 py-4 rounded-xl shadow-card text-nexus-dark font-medium outline-none focus:ring-2 focus:ring-nexus-accent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* List */}
      {loading && workers.length === 0 ? (
          <div className="text-center py-10 text-slate-400"><RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2"/>Loading staff...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map((worker) => (
            <div key={worker.id} className="bg-white p-5 rounded-2xl shadow-card border-l-4 border-emerald-500">
                <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-nexus-dark">{worker.name}</h3>
                    <p className="text-xs text-nexus-muted font-semibold uppercase">{worker.role}</p>
                </div>
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600">Active</span>
                </div>

                <div className="bg-nexus-surface p-3 rounded-xl flex items-center justify-between border border-slate-200 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-nexus-dark text-nexus-accent"><Phone className="w-4 h-4" /></div>
                    <div>
                    <p className="text-[10px] text-nexus-muted uppercase font-bold">Login Mobile</p>
                    <p className="font-mono font-bold text-lg tracking-wider text-nexus-dark">{worker.mobile}</p>
                    </div>
                </div>
                </div>

                <button onClick={() => handleDelete(worker.id)} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg active:bg-red-100">
                    <Trash2 className="w-3 h-3" /> Remove Access
                </button>
            </div>
            ))}
        </div>
      )}

      {/* --- ADD STAFF MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
            <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-xl text-nexus-dark">Add New Staff</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 bg-white rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Full Name</label>
                <input type="text" className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" placeholder="e.g. Amit Kumar" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Mobile Number (Login ID)</label>
                <input type="tel" className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" placeholder="e.g. 9876543210" value={newWorker.mobile} onChange={e => setNewWorker({...newWorker, mobile: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Role</label>
                <select className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value})}>
                    <option>Supervisor</option>
                    <option>Store Keeper</option>
                    <option>Labor</option>
                </select>
              </div>

              <button onClick={handleSaveWorker} disabled={loading} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-card active:scale-95 transition-all">
                {loading ? 'Saving...' : <><Check className="w-5 h-5" /> <span>Create Account</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Workers;