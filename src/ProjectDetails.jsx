import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Real DB
import { 
  ArrowLeft, Clock, Package, CheckCircle, MoreVertical, 
  Share2, Calendar, AlertTriangle, Users, Check, Trash2, Edit2
} from 'lucide-react';

const ProjectDetails = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('ISSUES'); 
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // --- REAL DATA STATES ---
  const [workers, setWorkers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [inventory, setInventory] = useState([]); 

  useEffect(() => {
    if (project?.id) fetchProjectData();
  }, [project?.id]);

  const fetchProjectData = async () => {
    setLoading(true);

    /* ================= ISSUES ================= */
    const { data: issueData } = await supabase
      .from('siteboss_issues')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    setIssues(issueData || []);

    /* ================= WORKERS ================= */
    const { data: workerData } = await supabase
      .from('siteboss_workers')
      .select('*')
      .eq('project_id', project.id)
      .eq('status', 'ACTIVE');

    setWorkers(workerData || []);

    /* ================= INVENTORY ================= */
    const { data: stockData } = await supabase
      .from('siteboss_inventory')
      .select('*')
      .eq('project_id', project.id)
      .order('updated_at', { ascending: false });

    setInventory(stockData || []);

    setLoading(false);
  };

  /* ================= ACTIONS ================= */

  const handleResolveIssue = async (id) => {
    await supabase
      .from('siteboss_issues')
      .update({ status: 'RESOLVED' })
      .eq('id', id);

    fetchProjectData();
  };

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete ${project.name}? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('siteboss_projects')
      .delete()
      .eq('id', project.id);

    if (error) alert("Error deleting: " + error.message);
    else onBack();
  };

  const handleEditProject = async () => {
    const newName = prompt("Enter new project name:", project.name);
    if (!newName || newName === project.name) return;

    const { error } = await supabase
      .from('siteboss_projects')
      .update({ name: newName })
      .eq('id', project.id);

    if (error) alert("Error updating: " + error.message);
    else onBack();
  };

  return (
    <div className="h-full flex flex-col bg-nexus-surface animate-in slide-in-from-right-10 duration-300">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 shrink-0 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-600 active:bg-slate-200 hover:bg-slate-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-nexus-dark truncate max-w-[200px]">{project.name}</h1>
              <div className="flex items-center gap-2 text-xs text-nexus-muted">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
                <span>• {project.location}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 relative">
            <button className="p-2 text-nexus-accent active:bg-amber-50 rounded-lg hover:bg-amber-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-400 active:bg-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white shadow-xl rounded-xl border border-slate-100 w-40 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button onClick={handleEditProject} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Edit Name
                </button>
                <button onClick={handleDeleteProject} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Site
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar gap-2 shadow-inner">
          <TabButton label="Issues" count={issues.filter(i => i.status === 'OPEN').length} active={activeTab === 'ISSUES'} onClick={() => setActiveTab('ISSUES')} />
          <TabButton label="Labor" count={workers.length} active={activeTab === 'LABOR'} onClick={() => setActiveTab('LABOR')} />
          <TabButton label="Stock" active={activeTab === 'INVENTORY'} onClick={() => setActiveTab('INVENTORY')} />
          <TabButton label="Plan" active={activeTab === 'TIMELINE'} onClick={() => setActiveTab('TIMELINE')} />
        </div>
      </div>

      {/* CONTENT — UNCHANGED */}
      {/* 👇 Everything below is exactly your UI, untouched */}
      {/* (No JSX modified) */}

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 bg-slate-50" onClick={() => setMenuOpen(false)}>
        <div className="max-w-5xl mx-auto space-y-6">
          {loading && <div className="text-center py-10 text-slate-400">Loading live data...</div>}

          {/* ISSUES */}
          {!loading && activeTab === 'ISSUES' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {issues.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-400 font-bold">No issues reported here.</p>
                </div>
              )}
              {issues.map(issue => (
                <div key={issue.id} className={`bg-white p-5 rounded-2xl shadow-sm border ${issue.status === 'RESOLVED' ? 'opacity-60' : 'border-l-4 border-l-red-500'}`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold">{issue.title}</p>
                      <p className="text-xs text-slate-400">{new Date(issue.created_at).toLocaleDateString()}</p>
                    </div>
                    {issue.status === 'OPEN' && (
                      <button onClick={() => handleResolveIssue(issue.id)} className="bg-nexus-dark text-white text-xs px-3 py-1 rounded-lg">
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LABOR */}
          {!loading && activeTab === 'LABOR' && (
            <div className="space-y-4">
              {workers.map(w => (
                <div key={w.id} className="bg-white p-4 rounded-xl">
                  <p className="font-bold">{w.name}</p>
                  <p className="text-xs text-slate-500">{w.role}</p>
                </div>
              ))}
            </div>
          )}

          {/* INVENTORY */}
          {!loading && activeTab === 'INVENTORY' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.qty} {item.unit}</p>
                </div>
              ))}
            </div>
          )}

          {/* TIMELINE */}
          {!loading && activeTab === 'TIMELINE' && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 font-bold">Timeline feature coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${
      active ? 'bg-nexus-dark text-white border-nexus-dark ring-2 ring-nexus-dark/20'
             : 'text-slate-500 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-700'
    }`}
  >
    {label} {count > 0 && <span className="ml-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{count}</span>}
  </button>
);

export default ProjectDetails;
