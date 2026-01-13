import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import DB
import { X, MapPin, Wallet, Building2, Check } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.location) return alert("Project Name & Location are required!");
    
    setLoading(true);

    // INSERT INTO SUPABASE
    const { data, error } = await supabase
      .from('nexus_projects')
      .insert([
        {
          name: formData.name,
          location: formData.location,
          budget: parseFloat(formData.budget) || 0,
          start_date: formData.startDate,
          status: 'Active',
          progress: 0,
          color: 'bg-emerald-500' // Default color
        }
      ])
      .select();

    if (error) {
      alert('Error creating project: ' + error.message);
    } else {
      // Success! Pass the new project back to parent
      if(data && data.length > 0) {
          onSave(data[0]); 
      }
      onClose();
      // Reset Form
      setFormData({ name: '', location: '', budget: '', startDate: new Date().toISOString().split('T')[0] });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
        
        <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
          <div><h3 className="font-bold text-xl text-nexus-dark">New Project</h3><p className="text-xs text-nexus-muted">Start a new site tracking</p></div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 active:text-red-500 shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Project Name</label>
            <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="e.g. Sunset Villas" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Site Location</label>
            <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="e.g. Nashik Road" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Budget (Lakhs)</label>
              <div className="relative"><Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="number" placeholder="0" className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} /></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Start Date</label>
              <div className="relative"><input type="date" className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent text-sm" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all mt-4">
            {loading ? 'Creating...' : <><Check className="w-5 h-5" /><span>Launch Project</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;