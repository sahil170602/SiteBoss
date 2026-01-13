import React, { useState } from 'react';
import { Search, UserPlus, Copy, Trash2, Shield, Phone, X, Check } from 'lucide-react';

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // MOCK DATA
  const [workers, setWorkers] = useState([
    { id: 1, name: 'Ramesh Pawar', role: 'Supervisor', site: 'Green Valley Villa', code: '482-190', status: 'Active', mobile: '9876543210' },
    { id: 2, name: 'Suresh Patil', role: 'Store Keeper', site: 'Green Valley Villa', code: '881-223', status: 'Active', mobile: '9988776655' },
  ]);

  // NEW WORKER FORM
  const [newWorker, setNewWorker] = useState({ name: '', role: 'Supervisor', mobile: '' });
  const [generatedCode, setGeneratedCode] = useState('');

  const handleOpenAdd = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const formatted = randomCode.slice(0,3) + '-' + randomCode.slice(3);
    setGeneratedCode(formatted);
    setIsAddOpen(true);
  };

  const handleSaveWorker = () => {
    if(!newWorker.name) return alert("Name is required");
    const workerEntry = {
      id: Date.now(),
      name: newWorker.name,
      role: newWorker.role,
      site: 'Unassigned', 
      code: generatedCode,
      status: 'Active',
      mobile: newWorker.mobile || '---'
    };
    setWorkers([...workers, workerEntry]);
    setIsAddOpen(false);
    setNewWorker({ name: '', role: 'Supervisor', mobile: '' });
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Access Code ${code} copied!`);
  };

  const handleDelete = (id) => {
    if (confirm('Revoke access for this worker?')) {
      setWorkers(workers.map(w => w.id === id ? { ...w, status: 'Inactive', code: '---' } : w));
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Staff</h2>
          <p className="text-nexus-muted text-sm">{workers.length} active members</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-nexus-dark text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg">
          <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Add Staff</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search staff..." className="w-full bg-white pl-12 pr-4 py-4 rounded-xl shadow-card text-nexus-dark font-medium outline-none focus:ring-2 focus:ring-nexus-accent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className={`bg-white p-5 rounded-2xl shadow-card border-l-4 ${worker.status === 'Active' ? 'border-emerald-500' : 'border-slate-300'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-nexus-dark">{worker.name}</h3>
                <p className="text-xs text-nexus-muted font-semibold uppercase">{worker.role}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${worker.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{worker.status}</span>
            </div>

            <div className="bg-nexus-surface p-3 rounded-xl flex items-center justify-between border border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${worker.status === 'Active' ? 'bg-nexus-dark text-nexus-accent' : 'bg-slate-200 text-slate-400'}`}><Shield className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-nexus-muted uppercase font-bold">Ghost ID</p>
                  <p className="font-mono font-bold text-lg tracking-wider text-nexus-dark">{worker.code}</p>
                </div>
              </div>
              {worker.status === 'Active' && (
                <button onClick={() => handleCopy(worker.code)} className="p-2 text-slate-400 active:text-nexus-dark"><Copy className="w-5 h-5" /></button>
              )}
            </div>

            {worker.status === 'Active' && (
              <button onClick={() => handleDelete(worker.id)} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg active:bg-red-100"><Trash2 className="w-3 h-3" /> Revoke Access</button>
            )}
          </div>
        ))}
      </div>

      {/* --- ADD STAFF MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
            <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-xl text-nexus-dark">Add Site Staff</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 bg-white rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-nexus-dark p-4 rounded-xl text-center mb-6">
                <p className="text-nexus-muted text-xs font-bold uppercase mb-1">New Access Code</p>
                <p className="text-white text-3xl font-mono font-bold tracking-[0.2em] text-nexus-accent">{generatedCode}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Full Name</label>
                <input type="text" className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" placeholder="e.g. Amit Kumar" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Role</label>
                    <select className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value})}>
                        <option>Supervisor</option>
                        <option>Store Keeper</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Mobile (Opt)</label>
                    <input type="tel" className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" placeholder="Optional" value={newWorker.mobile} onChange={e => setNewWorker({...newWorker, mobile: e.target.value})} />
                </div>
              </div>

              <button onClick={handleSaveWorker} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 shadow-card active:scale-95 transition-all">
                <Check className="w-5 h-5" /> <span>Create Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Workers;