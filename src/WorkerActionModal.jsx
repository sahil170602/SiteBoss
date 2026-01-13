import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase
import { X, Camera, MapPin, Check, Package, UploadCloud } from 'lucide-react';

const WorkerActionModal = ({ isOpen, onClose, actionType, onConfirm }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  
  // FORM STATES
  const [material, setMaterial] = useState({ name: 'Cement (UltraTech)', qty: '' });
  const [progress, setProgress] = useState({ desc: '' });
  const [locationStatus, setLocationStatus] = useState('Locating...');

  useEffect(() => {
    setLoading(false);
    if (actionType === 'ATTENDANCE') {
        setTimeout(() => setLocationStatus('Lat: 19.99 • Long: 73.78'), 2000);
    }
  }, [isOpen, actionType]);

  const handleSubmit = async () => {
    setLoading(true);

    // 1. HANDLE MATERIAL REQUEST (Live DB)
    if (actionType === 'MATERIAL') {
      const { error } = await supabase
        .from('nexus_notifications')
        .insert([
          { 
            type: 'URGENT', 
            title: 'Material Request',
            msg: `Supervisor requested ${material.qty} units of ${material.name}.`,
            action: 'Approve Order',
            item: material.name
          }
        ]);

      if (error) {
        alert('Error sending request: ' + error.message);
        setLoading(false);
        return;
      }
    }

    // 2. HANDLE PROGRESS UPDATE (Optional: You can add a 'nexus_feed' table in Supabase later)
    if (actionType === 'PROGRESS') {
       console.log("Progress upload logic here");
    }

    setLoading(false);
    onConfirm(); 
    onClose();
    // Reset forms
    setProgress({ desc: '' });
    setMaterial({ name: 'Cement (UltraTech)', qty: '' });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
        
        <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h3 className="font-bold text-xl text-nexus-dark">
              {actionType === 'ATTENDANCE' && 'Mark Attendance'}
              {actionType === 'MATERIAL' && 'Request Material'}
              {actionType === 'PROGRESS' && 'Daily Update'}
            </h3>
            <p className="text-xs text-nexus-muted">
              {actionType === 'ATTENDANCE' && 'Location Verification'}
              {actionType === 'MATERIAL' && 'Send indent to Owner'}
              {actionType === 'PROGRESS' && 'Upload site photos'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 active:text-red-500 shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* ATTENDANCE UI */}
          {actionType === 'ATTENDANCE' && (
            <div className="text-center space-y-4">
              <div className="bg-slate-900 rounded-2xl h-64 w-full flex flex-col items-center justify-center relative overflow-hidden">
                <Camera className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm font-medium">Tap to take selfie</p>
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-lg flex items-center justify-center gap-2 text-xs text-white font-mono">
                  <MapPin className={`w-3 h-3 ${locationStatus === 'Locating...' ? 'animate-bounce text-amber-500' : 'text-emerald-500'}`} /> {locationStatus}
                </div>
              </div>
            </div>
          )}

          {/* MATERIAL UI */}
          {actionType === 'MATERIAL' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Select Item</label>
                <select className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-nexus-dark outline-none appearance-none" value={material.name} onChange={(e) => setMaterial({...material, name: e.target.value})}>
                  <option>Cement (UltraTech)</option><option>Steel 10mm</option><option>Bricks</option><option>Sand</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Quantity</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0" className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-xl text-nexus-dark outline-none" value={material.qty} onChange={(e) => setMaterial({...material, qty: e.target.value})} />
                  <div className="bg-slate-100 px-6 rounded-xl flex items-center font-bold text-slate-500">Units</div>
                </div>
              </div>
            </div>
          )}

          {/* PROGRESS UI */}
          {actionType === 'PROGRESS' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl h-32 flex flex-col items-center justify-center text-slate-400 active:border-nexus-accent active:bg-amber-50/20 transition-all">
                <UploadCloud className="w-8 h-8 mb-2" /><span className="text-xs font-bold">Tap to upload photos</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Description</label>
                <textarea rows="3" placeholder="Work done today..." className="w-full bg-nexus-surface p-3 rounded-xl font-medium text-sm outline-none resize-none" value={progress.desc} onChange={(e) => setProgress({...progress, desc: e.target.value})}></textarea>
              </div>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all">
            {loading ? <span className="animate-pulse">Processing...</span> : <><Check className="w-5 h-5" /> <span>Submit</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerActionModal;