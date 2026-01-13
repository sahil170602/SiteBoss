import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';

const SiteIssues = () => {
  const [issues, setIssues] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newIssue, setNewIssue] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const { data } = await supabase.from('nexus_issues').select('*').eq('status', 'OPEN').order('created_at', { ascending: false });
    if (data) setIssues(data);
  };

  const handleAddIssue = async () => {
    if (!newIssue) return;
    await supabase.from('nexus_issues').insert([{ title: newIssue, priority: 'HIGH', status: 'OPEN' }]);
    setNewIssue('');
    setIsAddOpen(false);
    fetchIssues();
  };

  const handleResolve = async (id) => {
    await supabase.from('nexus_issues').update({ status: 'RESOLVED' }).eq('id', id);
    fetchIssues(); // Refresh list
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-nexus-dark flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Active Issues
        </h3>
        <button onClick={() => setIsAddOpen(true)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100">
            <Plus className="w-4 h-4" />
        </button>
      </div>

      {isAddOpen && (
        <div className="mb-4 flex gap-2">
            <input 
                type="text" 
                placeholder="Describe issue..." 
                className="flex-1 bg-slate-50 p-2 rounded-lg text-sm border border-slate-200 outline-none"
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
            />
            <button onClick={handleAddIssue} className="bg-nexus-dark text-white px-3 rounded-lg text-xs font-bold">Add</button>
            <button onClick={() => setIsAddOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="space-y-3">
        {issues.length === 0 && <p className="text-center text-emerald-600 text-sm py-4 font-medium">All Clear! No issues.</p>}

        {issues.map((issue) => (
          <div key={issue.id} className="flex justify-between items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
            <div className="flex gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                <div>
                    <p className="text-sm font-bold text-nexus-dark">{issue.title}</p>
                    <p className="text-xs text-slate-400">{new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <button onClick={() => handleResolve(issue.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteIssues;