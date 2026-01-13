import React, { useState } from 'react';
import WorkerActionModal from './WorkerActionModal';
import LaborManager from './LaborManager';
import SiteInventory from './SiteInventory'; 
import SiteIssues from './SiteIssues'; 
import SupervisorExpenseModal from './SupervisorExpenseModal'; // <--- IMPORT THIS
import { Camera, MapPin, Package, Clock, AlertTriangle, LogOut, CheckCircle, Users, Wallet } from 'lucide-react';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('HOME'); 
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [modalAction, setModalAction] = useState(null); 
  const [showLaborMgr, setShowLaborMgr] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false); // <--- NEW STATE

  const handleActionComplete = () => {
    if (modalAction === 'ATTENDANCE') {
      setIsAttendanceMarked(true);
      alert("Success!");
    } else {
      alert("Submitted!");
    }
    setModalAction(null);
  };

  const renderContent = () => {
    if (activeView === 'STOCK') return <SiteInventory />;
    if (activeView === 'ISSUES') return <SiteIssues />;
    
    // DEFAULT: HOME VIEW
    return (
      <div className="animate-in fade-in duration-300">
        
        {/* Header */}
        <header className="bg-nexus-dark text-white p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] rounded-b-3xl shadow-floating relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nexus-accent opacity-10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-nexus-accent text-nexus-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Site Access</span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live</span>
              </div>
              <h1 className="text-xl font-bold truncate max-w-[250px]">{user.projectName || "Green Valley Villa"}</h1>
              <p className="text-slate-400 text-sm">{user.name}</p>
            </div>
            <button onClick={onLogout} className="bg-white/10 p-2 rounded-full active:bg-red-500/20 active:text-red-400 transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>

          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase">Today's Attendance</p>
              <p className="text-lg font-bold">{isAttendanceMarked ? 'Marked' : 'Not Marked'}</p>
            </div>
            <button 
              onClick={() => !isAttendanceMarked && setModalAction('ATTENDANCE')}
              disabled={isAttendanceMarked}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${isAttendanceMarked ? 'bg-emerald-500 text-white' : 'bg-nexus-accent text-nexus-dark'}`}
            >
              {isAttendanceMarked ? <CheckCircle className="w-4 h-4"/> : <MapPin className="w-4 h-4"/>}
              {isAttendanceMarked ? 'Present' : 'Mark In'}
            </button>
          </div>
        </header>

        {/* Action Grid */}
        <div className="p-6 grid grid-cols-2 gap-4 -mt-2">
          
          {/* Row 1 */}
          <ActionButton icon={Camera} label="Update Progress" color="text-blue-500" bg="bg-blue-50" onClick={() => setModalAction('PROGRESS')} />
          <ActionButton icon={Package} label="Order Material" color="text-amber-500" bg="bg-amber-50" onClick={() => setModalAction('MATERIAL')} />
          
          {/* Row 2: Labor Management */}
          <button onClick={() => setShowLaborMgr(true)} className="col-span-1 bg-white p-4 rounded-2xl shadow-card flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform border border-transparent active:border-nexus-accent h-32">
             <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><Users className="w-5 h-5" /></div>
             <span className="font-bold text-nexus-dark text-xs text-center">Labor<br/>Attendance</span>
          </button>

          {/* Row 2: Expense Management (NEW) */}
          <button onClick={() => setShowExpenseModal(true)} className="col-span-1 bg-white p-4 rounded-2xl shadow-card flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform border border-transparent active:border-nexus-accent h-32">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><Wallet className="w-5 h-5" /></div>
             <span className="font-bold text-nexus-dark text-xs text-center">Record<br/>Expense</span>
          </button>

        </div>

        {/* Feed */}
        <div className="px-6 pb-6">
          <h3 className="font-bold text-nexus-dark mb-4 flex justify-between">Site Activity <span className="text-xs text-nexus-muted font-normal">Today</span></h3>
          <div className="space-y-4">
            <FeedItem user="YOU" title="Material Arrived" sub="50 Bags Cement" time="10:45 AM" color="border-emerald-500" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-nexus-surface font-sans">
      <div className="pb-24">
        {renderContent()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-nexus-dark text-slate-400 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6 shadow-2xl flex justify-around items-center z-50 rounded-t-2xl">
        <NavBtn icon={Clock} label="Today" active={activeView === 'HOME'} onClick={() => setActiveView('HOME')} />
        <NavBtn icon={Package} label="Stock" active={activeView === 'STOCK'} onClick={() => setActiveView('STOCK')} />
        <NavBtn icon={AlertTriangle} label="Issues" active={activeView === 'ISSUES'} onClick={() => setActiveView('ISSUES')} />
      </div>

      <WorkerActionModal isOpen={!!modalAction} actionType={modalAction} onClose={() => setModalAction(null)} onConfirm={handleActionComplete} />
      <LaborManager isOpen={showLaborMgr} onClose={() => setShowLaborMgr(false)} />
      
      {/* NEW EXPENSE MODAL */}
      <SupervisorExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />

    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color, bg, onClick }) => (
  <button onClick={onClick} className="bg-white p-5 rounded-2xl shadow-card flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform border border-transparent active:border-nexus-accent h-32">
    <div className={`w-12 h-12 ${bg} ${color} rounded-full flex items-center justify-center`}><Icon className="w-6 h-6" /></div>
    <span className="font-bold text-nexus-dark text-sm text-center">{label}</span>
  </button>
);

const FeedItem = ({ user, title, sub, time, color }) => (
  <div className={`bg-white p-4 rounded-xl shadow-card border-l-4 ${color}`}>
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">{user}</div>
        <div><p className="text-sm font-bold text-nexus-dark">{title}</p><p className="text-xs text-nexus-muted">{sub}</p></div>
      </div>
      <span className="text-[10px] text-slate-400 font-bold">{time}</span>
    </div>
  </div>
);

const NavBtn = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-nexus-accent' : 'text-slate-400 active:text-white'}`}>
    <Icon className="w-6 h-6" />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default SupervisorDashboard;