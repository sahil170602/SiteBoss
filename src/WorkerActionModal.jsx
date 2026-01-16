import React, { useState } from 'react';
import { supabase } from './supabaseClient'; 
import { X, Check, AlertTriangle } from 'lucide-react';

// Added 'projectName' to props
const WorkerActionModal = ({ isOpen, onClose, actionType, onConfirm, userName, projectName }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState({ name: 'Cement (UltraTech)', qty: '' });
  const [issue, setIssue] = useState('');

  const handleSubmit = async () => {
    setLoading(true);

    if (actionType === 'MATERIAL') {
      if(!material.qty) { alert("Enter Quantity"); setLoading(false); return; }

      // Include SITE NAME in notification message
      const { error } = await supabase.from('nexus_notifications').insert([{ 
          type: 'URGENT', 
          title: 'Material Request',
          msg: `${userName} (${projectName}) requested ${material.qty} units of ${material.name}.`,
          action: 'Approve Order',
          item: material.name
      }]);
      
      if(error) alert("Error: " + error.message);
    }

    if (actionType === 'ISSUE') {
       if(!issue) { alert("Describe the issue"); setLoading(false); return; }

       const { error } = await supabase.from('nexus_issues').insert([{ 
           title: issue,
           priority: 'HIGH',
           status: 'OPEN',
           site_name: projectName, // SAVING REAL PROJECT NAME HERE
           reporter: userName
       }]);

       if(error) alert("Error: " + error.message);
    }

    setLoading(false);
    onConfirm(); 
    onClose();
    setMaterial({ name: 'Cement (UltraTech)', qty: '' });
    setIssue('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
                <h3 className="font-bold text-xl text-nexus-dark">{actionType === 'MATERIAL' ? 'Request Material' : 'Report Issue'}</h3>
                <p className="text-xs text-nexus-muted">Site: {projectName}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {actionType === 'MATERIAL' && (
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Item</label><select className="w-full bg-nexus-surface p-4 rounded-xl font-bold outline-none" value={material.name} onChange={(e) => setMaterial({...material, name: e.target.value})}><option>Cement (UltraTech)</option><option>Steel 10mm</option><option>Bricks (Red)</option><option>River Sand</option></select></div>
              <div><label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Quantity</label><input type="number" className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-xl outline-none" value={material.qty} onChange={(e) => setMaterial({...material, qty: e.target.value})} /></div>
            </div>
        )}

        {actionType === 'ISSUE' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-red-50 border-2 border-dashed border-red-100 rounded-xl text-red-400 mb-4"><AlertTriangle className="w-10 h-10 mb-2" /><span className="text-xs font-bold">High Priority Alert</span></div>
              <div><label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Issue Description</label><textarea rows="3" className="w-full bg-nexus-surface p-4 rounded-xl font-medium text-sm outline-none resize-none" value={issue} onChange={(e) => setIssue(e.target.value)}></textarea></div>
            </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">{loading ? 'Sending...' : <><Check className="w-5 h-5" /> <span>Submit</span></>}</button>
      </div>
    </div>
  );
};

export default WorkerActionModal;