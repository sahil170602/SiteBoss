import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, CheckCircle, Camera, X } from 'lucide-react';

const SiteIssues = () => {
  const [issues, setIssues] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', priority: 'MEDIUM' });

  // Load Issues
  useEffect(() => {
    const saved = localStorage.getItem('nexus_issues');
    if (saved) setIssues(JSON.parse(saved));
  }, []);

  const handleSaveIssue = () => {
    if (!newIssue.title) return;
    const issue = {
      id: Date.now(),
      title: newIssue.title,
      date: 'Just now',
      status: 'OPEN',
      priority: newIssue.priority,
      reporter: 'Supervisor'
    };
    const updated = [issue, ...issues];
    setIssues(updated);
    localStorage.setItem('nexus_issues', JSON.stringify(updated));
    setIsFormOpen(false);
    setNewIssue({ title: '', priority: 'MEDIUM' });
  };

  const handleResolve = (id) => {
    const updated = issues.map(i => i.id === id ? { ...i, status: 'RESOLVED' } : i);
    setIssues(updated);
    localStorage.setItem('nexus_issues', JSON.stringify(updated));
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Site Issues</h2>
          <p className="text-nexus-muted text-sm">Report blockers & delays</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-transform"><Plus className="w-5 h-5" /></button>
      </div>

      {/* Add Issue Form */}
      {isFormOpen && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6 animate-in zoom-in-95">
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-red-600 uppercase">New Report</span>
                <button onClick={() => setIsFormOpen(false)}><X className="w-4 h-4 text-red-400" /></button>
            </div>
            <input 
                autoFocus
                type="text" 
                placeholder="What is broken?" 
                className="w-full p-3 rounded-lg text-sm font-bold mb-3 outline-none"
                value={newIssue.title}
                onChange={e => setNewIssue({...newIssue, title: e.target.value})}
            />
            <div className="flex gap-2">
                {['HIGH', 'MEDIUM', 'LOW'].map(p => (
                    <button key={p} onClick={() => setNewIssue({...newIssue, priority: p})} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${newIssue.priority === p ? 'bg-red-500 text-white' : 'bg-white text-slate-400'}`}>{p}</button>
                ))}
            </div>
            <button onClick={handleSaveIssue} className="w-full bg-nexus-dark text-white py-3 rounded-lg font-bold text-xs mt-3">Submit Report</button>
        </div>
      )}

      <div className="space-y-4">
        {issues.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No active issues. Good job!</p>}
        {issues.map(issue => (
          <div key={issue.id} className={`bg-white p-5 rounded-2xl shadow-card border-l-4 ${issue.status === 'OPEN' ? 'border-red-500' : 'border-emerald-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <div className={`mt-1 ${issue.status === 'OPEN' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {issue.status === 'OPEN' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold ${issue.status === 'RESOLVED' ? 'text-slate-400 line-through' : 'text-nexus-dark'}`}>{issue.title}</h3>
                  <p className="text-xs text-nexus-muted">{issue.date} • {issue.priority}</p>
                </div>
              </div>
            </div>
            {issue.status === 'OPEN' && (
              <button onClick={() => handleResolve(issue.id)} className="w-full mt-3 bg-slate-50 text-slate-500 py-2 rounded-lg text-xs font-bold active:bg-slate-200">Mark Resolved</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteIssues;