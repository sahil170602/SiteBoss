import React, { useState, useEffect } from 'react';
import { X, Plus, CheckCircle, Circle, Save, Trash2 } from 'lucide-react';

const LaborManager = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // 1. Load existing data or use default
  const [laborers, setLaborers] = useState(() => {
    const saved = localStorage.getItem('nexus_labor_list');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Raju Bhai', type: 'Mason', present: true },
      { id: 2, name: 'Chotu', type: 'Helper', present: true },
    ];
  });

  const [newLaborName, setNewLaborName] = useState('');
  const [newLaborType, setNewLaborType] = useState('Helper');
  const [isAdding, setIsAdding] = useState(false);

  const toggleAttendance = (id) => {
    setLaborers(laborers.map(l => l.id === id ? { ...l, present: !l.present } : l));
  };

  const handleAddLabor = () => {
    if (!newLaborName) return;
    const newL = { id: Date.now(), name: newLaborName, type: newLaborType, present: true };
    setLaborers([...laborers, newL]);
    setNewLaborName('');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setLaborers(laborers.filter(l => l.id !== id));
  };

  const handleSaveDay = () => {
    // 2. SAVE TO STORAGE
    localStorage.setItem('nexus_labor_list', JSON.stringify(laborers));
    
    // Also save a "Daily Report" for the Owner to see history (simplified)
    const summary = {
        date: new Date().toLocaleDateString(),
        present: laborers.filter(l=>l.present).length,
        total: laborers.length
    };
    localStorage.setItem('nexus_labor_summary', JSON.stringify(summary));

    alert("Daily Register Updated!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white w-full sm:max-w-md h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h3 className="font-bold text-xl text-nexus-dark">Daily Attendance</h3>
            <p className="text-xs text-nexus-muted">{new Date().toDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 active:text-red-500 shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* Add New Input Area */}
          {isAdding ? (
            <div className="bg-blue-50 p-3 rounded-xl flex gap-2 items-center mb-4 border border-blue-100">
               <input autoFocus type="text" placeholder="Name" className="flex-1 bg-white p-3 rounded-lg text-sm font-bold outline-none" value={newLaborName} onChange={e => setNewLaborName(e.target.value)}/>
               <select className="bg-white p-3 rounded-lg text-xs font-bold outline-none" value={newLaborType} onChange={e => setNewLaborType(e.target.value)}>
                 <option>Helper</option><option>Mason</option><option>Carpenter</option>
               </select>
               <button onClick={handleAddLabor} className="bg-nexus-accent p-3 rounded-lg text-nexus-dark font-bold shadow-md"><Plus className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 active:bg-slate-50 transition-colors">
              <Plus className="w-4 h-4" /> Add New Laborer
            </button>
          )}

          {/* List */}
          {laborers.map((labor) => (
            <div key={labor.id} className={`p-4 rounded-xl flex items-center justify-between border-2 transition-all ${labor.present ? 'bg-white border-emerald-500 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}>
              <div className="flex items-center gap-3" onClick={() => toggleAttendance(labor.id)}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${labor.present ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{labor.name.charAt(0)}</div>
                <div><p className="font-bold text-nexus-dark">{labor.name}</p><p className="text-[10px] uppercase font-bold text-nexus-muted">{labor.type}</p></div>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => handleDelete(labor.id)} className="text-slate-300 p-2"><Trash2 className="w-4 h-4" /></button>
                 <div onClick={() => toggleAttendance(labor.id)}>{labor.present ? <CheckCircle className="w-6 h-6 fill-emerald-100 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-300" />}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex justify-between text-xs font-bold mb-3 px-2">
            <span className="text-emerald-600">Present: {laborers.filter(l=>l.present).length}</span>
            <span className="text-red-500">Absent: {laborers.filter(l=>!l.present).length}</span>
          </div>
          <button onClick={handleSaveDay} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:bg-slate-800"><Save className="w-5 h-5" /> Update Owner</button>
        </div>

      </div>
    </div>
  );
};

export default LaborManager;