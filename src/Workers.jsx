import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Search, UserPlus, Trash2, Phone, X, Check, RefreshCw, Building2 } from 'lucide-react';

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [newWorker, setNewWorker] = useState({
    name: '',
    role: 'Supervisor',
    mobile: '',
    site_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    /* 🔹 FETCH PROJECTS (FIXED) */
    const { data: projectData, error: projectErr } = await supabase
      .from('siteboss_projects')
      .select('id, name')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!projectErr) setProjects(projectData || []);

    /* 🔹 FETCH WORKERS */
    const { data: workerData } = await supabase
      .from('siteboss_workers')
      .select(`
        *,
        siteboss_projects ( name )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (workerData) setWorkers(workerData);

    setLoading(false);
  };

  const handleSaveWorker = async () => {
    if (!newWorker.name || !newWorker.mobile || !newWorker.site_id) {
      alert('Name, Mobile and Site are required');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    /* 🚫 Prevent duplicate mobile */
    const { data: existing } = await supabase
      .from('siteboss_workers')
      .select('id')
      .eq('mobile', newWorker.mobile)
      .maybeSingle();

    if (existing) {
      alert('This mobile number is already registered');
      setLoading(false);
      return;
    }

   const { error } = await supabase
  .from('siteboss_workers')
  .insert([{
    owner_id: user.id,
    name: newWorker.name,
    role: newWorker.role,   // ✅ FIX IS HERE
    mobile: newWorker.mobile,
    project_id: newWorker.site_id,
    status: 'ACTIVE'
  }]);


    if (error) {
      alert(error.message);
    } else {
      setIsAddOpen(false);
      setNewWorker({ name: '', role: 'Supervisor', mobile: '', site_id: '' });
      fetchData();
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently remove this staff member?')) return;
    await supabase.from('siteboss_workers').delete().eq('id', id);
    fetchData();
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.mobile.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-6 pb-32 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Staff Directory</h2>
          <p className="text-nexus-muted text-sm">{workers.length} registered members</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-nexus-dark text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Staff</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full bg-white pl-12 pr-4 py-4 rounded-xl shadow-card font-medium outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST */}
      {loading && workers.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(worker => (
            <div key={worker.id} className="bg-white p-5 rounded-2xl shadow-card border-l-4 border-emerald-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-nexus-dark">{worker.name}</h3>
                  <p className="text-xs text-nexus-muted font-semibold uppercase">{worker.role}</p>
                </div>
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-600 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {worker.siteboss_projects?.name || 'Unassigned'}
                </span>
              </div>

              <div className="bg-nexus-surface p-3 rounded-xl border border-slate-200 mb-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-nexus-dark text-nexus-accent">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-nexus-muted uppercase font-bold">Login ID</p>
                  <p className="font-mono font-bold text-lg tracking-wider text-nexus-dark">
                    {worker.mobile}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(worker.id)}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4">

            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-bold text-xl text-nexus-dark">Add New Staff</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <select
              className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none"
              value={newWorker.site_id}
              onChange={e => setNewWorker({ ...newWorker, site_id: e.target.value })}
            >
              <option value="">-- Select Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <input
              type="text"
              className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none"
              placeholder="Name"
              value={newWorker.name}
              onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
            />

            <input
              type="tel"
              className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none"
              placeholder="Mobile"
              value={newWorker.mobile}
              onChange={e => setNewWorker({ ...newWorker, mobile: e.target.value })}
            />

            <select
              className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none"
              value={newWorker.role}
              onChange={e => setNewWorker({ ...newWorker, role: e.target.value })}
            >
              <option>Supervisor</option>
              <option>Store Keeper</option>
            </select>

            <button
              onClick={handleSaveWorker}
              disabled={loading}
              className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : <><Check className="w-5 h-5" /> Create Account</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
