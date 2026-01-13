import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import DB
import LiveMap from './LiveMap'; 
import AddProjectModal from './AddProjectModal'; 
import ProjectDetails from './ProjectDetails'; 
import Financials from './Financials'; 
import Workers from './Workers'; 
import Notifications from './Notifications'; 
import { 
  LayoutDashboard, Map as MapIcon, Wallet, Users, Bell, 
  Search, Plus, MoreVertical, LogOut, Building2, Menu, X 
} from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedProject, setSelectedProject] = useState(null); 

  // --- REAL DATA STATES ---
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ 
    activeSites: 0, 
    totalWorkers: 0, 
    cashOutflow: 0,
    notifications: 0
  });

  // Load Data on Mount & Refresh
  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, isModalOpen]); 

  const fetchDashboardData = async () => {
    // 1. Fetch Projects (Live DB)
    const { data: projData } = await supabase.from('nexus_projects').select('*').order('created_at', { ascending: false });
    if (projData) setProjects(projData);

    // 2. Fetch Stats
    const activeSites = projData ? projData.length : 0;

    // Cash Outflow (Sum of Expenses)
    const { data: txData } = await supabase.from('nexus_transactions').select('amount').eq('type', 'EXPENSE');
    const outflow = txData ? txData.reduce((sum, t) => sum + t.amount, 0) : 0;

    // Notifications Count
    const { count: alertCount } = await supabase.from('nexus_notifications').select('*', { count: 'exact', head: true });

    // Workers (Mock count or fetch from nexus_workers if populated)
    const { count: workerCount } = await supabase.from('nexus_workers').select('*', { count: 'exact', head: true });

    setStats({
        activeSites,
        totalWorkers: workerCount || 0,
        cashOutflow: outflow,
        notifications: alertCount || 0
    });
  };

  const handleCreateProject = (newProject) => {
    setProjects([newProject, ...projects]);
    fetchDashboardData(); // Refresh stats
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setSelectedProject(null); 
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    if (selectedProject) return selectedProject.name;
    if (activeTab === 'dashboard') return 'Overview';
    if (activeTab === 'map') return 'Command Center';
    if (activeTab === 'workers') return 'Staff Management';
    if (activeTab === 'financials') return 'Financial Overview';
    if (activeTab === 'notifications') return 'Alerts & Updates';
    return 'Nexus';
  };

  const statCards = [
    { title: 'Active Sites', value: stats.activeSites, change: 'Live Projects', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Total Staff', value: stats.totalWorkers, change: 'Registered', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { title: 'Total Expense', value: `₹${(stats.cashOutflow/100000).toFixed(2)}L`, change: 'Total Outflow', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  return (
    <div className="flex h-screen bg-nexus-surface font-sans overflow-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />)}

      {/* SIDEBAR */}
      <aside className={`fixed z-50 h-full w-64 bg-nexus-dark text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nexus-accent rounded-lg flex items-center justify-center"><span className="font-bold text-nexus-dark">N</span></div>
            <span className="text-xl font-bold tracking-wide">NEXUS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><X className="w-6 h-6" /></button>
        </div>

        <nav className="p-4 space-y-2">
          <div onClick={() => handleNavClick('dashboard')}><NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard' && !selectedProject} /></div>
          <div onClick={() => handleNavClick('map')}><NavItem icon={MapIcon} label="Live Map" active={activeTab === 'map'} /></div>
          <div onClick={() => handleNavClick('workers')}><NavItem icon={Users} label="Site Workers" active={activeTab === 'workers'} /></div>
          <div onClick={() => handleNavClick('financials')}><NavItem icon={Wallet} label="Financials" active={activeTab === 'financials'} /></div>
          <div className="pt-8 text-xs font-bold text-slate-500 uppercase tracking-wider px-4">System</div>
          <div onClick={() => handleNavClick('notifications')}><NavItem icon={Bell} label="Notifications" badge={stats.notifications > 0 ? stats.notifications : null} active={activeTab === 'notifications'} /></div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer mt-4"><LogOut className="w-5 h-5" /><span className="font-medium">Logout</span></button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu className="w-6 h-6 text-nexus-dark" /></button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-nexus-dark">{getPageTitle()}</h1>
              <p className="text-xs text-nexus-muted hidden md:block">{new Date().toDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-nexus-dark">{user.name}</p>
                <p className="text-xs text-nexus-muted font-semibold">{user.companyName}</p>
              </div>
              <div className="w-10 h-10 bg-nexus-primary rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">{user.name.charAt(0)}</div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-0 relative">
          
          {selectedProject ? (
            <ProjectDetails project={selectedProject} onBack={() => setSelectedProject(null)} />
          ) : (
            <> 
                {/* DASHBOARD OVERVIEW */}
                {activeTab === 'dashboard' && (
                  <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
                    
                    {/* Banner */}
                    <div className="bg-nexus-dark rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-floating">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-nexus-accent opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Boss.</h2>
                          <p className="text-slate-400 mb-6 max-w-lg text-sm md:text-base">
                            {stats.notifications > 0 ? `You have ${stats.notifications} unread updates pending.` : "All caught up. No pending alerts."}
                          </p>
                          <button onClick={() => setIsModalOpen(true)} className="bg-nexus-accent active:bg-amber-600 text-nexus-dark px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg"><Plus className="w-4 h-4" /><span>Create New Project</span></button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {statCards.map((stat, index) => (
                        <div key={index} className="bg-white p-5 rounded-2xl shadow-card flex items-start justify-between">
                            <div><p className="text-xs font-bold text-nexus-muted uppercase">{stat.title}</p><p className="text-2xl font-bold text-nexus-dark mt-1">{stat.value}</p><p className={`text-[10px] font-bold mt-1 ${stat.color}`}>{stat.change}</p></div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                        </div>
                        ))}
                    </div>

                    {/* Projects List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-nexus-dark">Active Projects ({projects.length})</h3>
                        </div>
                        
                        {projects.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold mb-2">No projects yet.</p>
                                <p className="text-xs text-slate-400">Click "Create New Project" to start tracking.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {projects.map((project) => (
                                <div key={project.id} onClick={() => setSelectedProject(project)} className="bg-white p-6 rounded-2xl shadow-card border border-transparent active:border-nexus-accent transition-all active:scale-[0.99] cursor-pointer group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                        <h4 className="font-bold text-lg text-nexus-dark">{project.name}</h4>
                                        <div className="flex items-center gap-1 text-nexus-muted text-xs mt-1"><MapIcon className="w-3 h-3" />{project.location}</div>
                                        </div>
                                        <MoreVertical className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2"><span className="text-slate-500">{project.status}</span><span className="text-nexus-dark">{project.progress || 0}%</span></div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-slate-200"><div className={`h-full ${project.color || 'bg-blue-500'}`} style={{ width: `${project.progress || 0}%` }}></div></div></div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                  </div>
                )}

                {/* OTHER TABS */}
                {activeTab === 'map' && <div className="h-full md:p-6 pb-20"><LiveMap /></div>}
                {activeTab === 'workers' && <div className="h-full animate-in fade-in duration-500"><Workers /></div>}
                {activeTab === 'financials' && <div className="h-full"><Financials /></div>}
                {activeTab === 'notifications' && <div className="h-full animate-in fade-in duration-500"><Notifications /></div>}
            </>
          )}

          <AddProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateProject} />

        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, badge }) => (
  <div className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-nexus-accent text-nexus-dark font-bold shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex items-center gap-3"><Icon className="w-5 h-5" /><span className="text-sm font-medium">{label}</span></div>
    {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
  </div>
);

export default Dashboard;