import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Package, CheckCircle, MoreVertical, 
  Share2, MessageSquare, Calendar, AlertTriangle, 
  Plus, Users, XCircle, Check, Camera
} from 'lucide-react';

const ProjectDetails = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('ISSUES'); 

  // --- DYNAMIC DATA LOADING ---
  const [laborData, setLaborData] = useState([]);
  const [laborSummary, setLaborSummary] = useState({ present: 0, total: 0 });
  const [issues, setIssues] = useState([]);
  const [inventory, setInventory] = useState([]); 
  const [feed, setFeed] = useState([]); 

  useEffect(() => {
    // 1. Load Labor
    const savedLabor = localStorage.getItem('nexus_labor_list');
    if (savedLabor) {
        const parsedLabor = JSON.parse(savedLabor);
        setLaborData(parsedLabor);
        setLaborSummary({
            present: parsedLabor.filter(l => l.present).length,
            total: parsedLabor.length
        });
    }

    // 2. Load Issues
    const savedIssues = localStorage.getItem('nexus_issues');
    if (savedIssues) setIssues(JSON.parse(savedIssues));

    // 3. Load Inventory
    const savedInv = localStorage.getItem('nexus_inventory');
    if (savedInv) {
        setInventory(JSON.parse(savedInv));
    } else {
        setInventory([
            { id: 1, name: 'Cement (UltraTech)', qty: 140, unit: 'Bags', color: 'bg-slate-100', required: 500 },
            { id: 2, name: 'Steel 10mm', qty: 250, unit: 'Kg', color: 'bg-slate-100', required: 1000 },
        ]);
    }

    // 4. Load Feed
    const savedFeed = localStorage.getItem('nexus_feed');
    if (savedFeed) {
        setFeed(JSON.parse(savedFeed));
    } else {
        setFeed([
            { id: 1, user: 'System', role: 'Automated', time: '09:00 AM', content: 'Project synced.', image: false }
        ]);
    }

  }, []);

  const handleResolveIssue = (id) => {
    const updated = issues.map(i => i.id === id ? { ...i, status: 'RESOLVED' } : i);
    setIssues(updated);
    localStorage.setItem('nexus_issues', JSON.stringify(updated));
  };

  // Static Timeline
  const timeline = [
    { id: 1, title: 'Foundation Work', date: 'Oct 6 - Oct 20', status: 'COMPLETED' },
    { id: 2, title: 'Plinth Beam', date: 'Oct 21 - Oct 25', status: 'IN_PROGRESS' },
  ];

  return (
    <div className="h-full flex flex-col bg-nexus-surface animate-in slide-in-from-right-10 duration-300">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 shrink-0 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-600 active:bg-slate-200 hover:bg-slate-200 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-lg font-bold text-nexus-dark truncate max-w-[200px]">{project.name}</h1>
              <div className="flex items-center gap-2 text-xs text-nexus-muted">
                <span className="flex items-center gap-1 text-emerald-600 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active</span>
                <span>• {project.location}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
              <button className="p-2 text-nexus-accent active:bg-amber-50 rounded-lg hover:bg-amber-50 transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="p-2 text-slate-400 active:bg-slate-100 rounded-lg hover:bg-slate-50 transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* MODERN TABS */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar gap-2 shadow-inner">
          <TabButton label="Updates" active={activeTab === 'FEED'} onClick={() => setActiveTab('FEED')} />
          <TabButton label="Issues" count={issues.filter(i=>i.status==='OPEN').length} active={activeTab === 'ISSUES'} onClick={() => setActiveTab('ISSUES')} />
          <TabButton label="Labor" active={activeTab === 'LABOR'} onClick={() => setActiveTab('LABOR')} />
          <TabButton label="Stock" active={activeTab === 'INVENTORY'} onClick={() => setActiveTab('INVENTORY')} />
          <TabButton label="Plan" active={activeTab === 'TIMELINE'} onClick={() => setActiveTab('TIMELINE')} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* === FEED TAB === */}
            {activeTab === 'FEED' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 space-y-6">
                        {feed.length === 0 && <p className="pl-12 text-slate-400">No updates yet.</p>}
                        {feed.map(post => (
                            <div key={post.id} className="relative pl-12">
                                <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-nexus-accent rounded-full flex items-center justify-center z-10"><div className="w-2.5 h-2.5 bg-nexus-accent rounded-full"></div></div>
                                <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div><p className="text-sm font-bold text-nexus-dark">{post.user}</p><p className="text-[10px] uppercase font-bold text-slate-400">{post.role}</p></div>
                                        <span className="text-xs text-slate-400">{post.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{post.content}</p>
                                    {post.image && (
                                        <div className="bg-slate-100 rounded-xl h-40 w-full flex items-center justify-center text-slate-400 mb-3"><Camera className="w-8 h-8 opacity-50" /></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === ISSUES TAB (STYLIZED) === */}
            {activeTab === 'ISSUES' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-nexus-dark text-lg">Site Blockers</h3>
                  <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">Sort by Priority</span>
                </div>
                {issues.length === 0 && <div className="text-center text-slate-400 py-10">No active issues reported.</div>}
                {issues.map(issue => (
                  <div key={issue.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${issue.status === 'RESOLVED' ? 'border-slate-200 opacity-60' : issue.priority === 'HIGH' ? 'border-l-4 border-l-red-500 border-red-100' : 'border-l-4 border-l-amber-500 border-amber-100'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {issue.priority === 'HIGH' && issue.status === 'OPEN' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            <h4 className={`font-bold text-sm ${issue.status === 'RESOLVED' ? 'line-through text-slate-400' : 'text-nexus-dark'}`}>{issue.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] bg-slate-50 px-2 py-1 rounded-md text-slate-500 font-bold border border-slate-100 flex items-center gap-1"><Users className="w-3 h-3" /> {issue.reporter}</span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {issue.date}</span>
                        </div>
                      </div>
                      {issue.status === 'OPEN' ? (
                        <button onClick={() => handleResolveIssue(issue.id)} className="px-4 py-2 bg-nexus-dark text-white text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-lg hover:bg-slate-800"><Check className="w-3.5 h-3.5" /> Resolve</button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* === LABOR TAB (PREMIUM GRADIENT) === */}
            {activeTab === 'LABOR' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-gradient-to-br from-nexus-dark to-slate-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   <div className="absolute bottom-0 left-0 w-32 h-32 bg-nexus-accent opacity-10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                   <div className="flex justify-between items-end relative z-10">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Strength</p>
                        <h2 className="text-4xl font-bold tracking-tight">{laborSummary.present} <span className="text-xl font-medium text-slate-500">/ {laborSummary.total}</span></h2>
                      </div>
                      <div className="text-right bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
                        <p className="text-emerald-400 font-bold text-xl">{laborSummary.total > 0 ? Math.round((laborSummary.present/laborSummary.total)*100) : 0}%</p>
                        <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wide">Attendance</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-nexus-muted uppercase border-b border-slate-200">
                      <tr><th className="p-5 font-semibold text-slate-500">Worker Name</th><th className="p-5 text-right font-semibold text-slate-500">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {laborData.length === 0 && <tr><td colSpan="2" className="p-5 text-center text-slate-400">No labor data uploaded yet.</td></tr>}
                      {laborData.map(w => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-5"><p className="font-bold text-nexus-dark text-base">{w.name}</p><p className="text-xs text-slate-400 font-medium mt-0.5">{w.type}</p></td>
                          <td className="p-5 text-right">
                            {w.present ? <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Present</span> : <span className="text-red-700 font-bold bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Absent</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* === INVENTORY TAB === */}
            {activeTab === 'INVENTORY' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-nexus-accent hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item.qty < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500'}`}><Package className="w-6 h-6" /></div><div><h4 className="font-bold text-nexus-dark text-base">{item.name}</h4><p className="text-xs text-slate-500 font-medium mt-0.5">Required: {item.required || 500} {item.unit}</p></div></div>
                        {item.qty < 10 && <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-100 animate-pulse">LOW</span>}
                      </div>
                      <div className="mt-2"><div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-slate-500">Current Stock ({item.qty})</span><span className={item.qty < 10 ? 'text-red-500' : 'text-emerald-500'}>{item.required ? Math.min(100, Math.round((item.qty/item.required)*100)) : 100}%</span></div><div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${item.qty < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${item.required ? (item.qty/item.required)*100 : 100}%` }}></div></div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === TIMELINE TAB === */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200"><div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100"><div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100"><Calendar className="w-6 h-6" /></div><div><h3 className="font-bold text-xl text-nexus-dark">Project Schedule</h3><p className="text-sm text-slate-500 font-medium mt-0.5">Est. Completion: <span className="text-nexus-dark font-bold">Dec 15, 2026</span></p></div></div><div className="relative border-l-2 border-slate-100 ml-3 space-y-10 pb-2">{timeline.map((task) => (<div key={task.id} className="relative pl-8 group"><div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-110 ${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-nexus-accent ring-4 ring-amber-50'}`}></div><div><h4 className={`font-bold text-base ${task.status === 'IN_PROGRESS' ? 'text-nexus-accent' : 'text-nexus-dark'}`}>{task.title}</h4><p className="text-xs text-slate-400 font-medium mt-1 bg-slate-50 inline-block px-2 py-1 rounded-md border border-slate-100">{task.date}</p></div></div>))}</div></div></div>
            )}

        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`flex-none px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-sm border ${active ? 'bg-nexus-dark text-white border-nexus-dark ring-2 ring-nexus-dark/20' : 'text-slate-500 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
  >
    {label} {count > 0 && <span className="ml-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] min-w-[18px] inline-block text-center">{count}</span>}
  </button>
);

export default ProjectDetails;