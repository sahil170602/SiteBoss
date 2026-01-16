import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import WorkerActionModal from './WorkerActionModal';
import LaborManager from './LaborManager';
import SiteInventory from './SiteInventory';
import SiteIssues from './SiteIssues';
import SupervisorExpenseModal from './SupervisorExpenseModal';
import {
  Camera, MapPin, Package, Clock, AlertTriangle,
  LogOut, CheckCircle, Users, Wallet
} from 'lucide-react';

const SupervisorDashboard = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState('HOME');
  const [attendanceToday, setAttendanceToday] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [showLaborMgr, setShowLaborMgr] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [feed, setFeed] = useState([]);

  /* ---------------- FETCH TODAY STATUS ---------------- */
  useEffect(() => {
    fetchAttendance();
    fetchFeed();
  }, []);

  const fetchAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('site_attendance')
      .select('id')
      .eq('supervisor_id', user.id)
      .eq('project_id', user.projectId)
      .eq('date', today)
      .maybeSingle();

    setAttendanceToday(!!data);
  };

  const fetchFeed = async () => {
    const { data } = await supabase
      .from('site_activity_log')
      .select('*')
      .eq('project_id', user.projectId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setFeed(data);
  };

  /* ---------------- ATTENDANCE ---------------- */
  const markAttendance = async () => {
    if (attendanceToday) return;

    const today = new Date().toISOString().split('T')[0];

    await supabase.from('site_attendance').insert([{
      supervisor_id: user.id,
      project_id: user.projectId,
      date: today
    }]);

    await supabase.from('site_activity_log').insert([{
      project_id: user.projectId,
      actor_name: user.name,
      action: 'Attendance Marked',
      meta: 'Supervisor checked in'
    }]);

    setAttendanceToday(true);
    fetchFeed();
  };

  /* ---------------- RENDER ---------------- */
  const renderContent = () => {
    if (activeView === 'STOCK') return <SiteInventory />;
    if (activeView === 'ISSUES') return <SiteIssues />;

    return (
      <div>
        {/* HEADER */}
        <header className="bg-nexus-dark text-white p-6 rounded-b-3xl">
          <div className="flex justify-between">
            <div>
              <h1 className="text-xl font-bold">{user.projectName}</h1>
              <p className="text-sm text-slate-400">{user.name}</p>
            </div>
            <button onClick={onLogout}><LogOut /></button>
          </div>

          <div className="mt-4 bg-white/10 p-4 rounded-xl flex justify-between">
            <div>
              <p className="text-xs">Today’s Attendance</p>
              <p className="font-bold">
                {attendanceToday ? 'Marked' : 'Not Marked'}
              </p>
            </div>
            <button
              onClick={markAttendance}
              disabled={attendanceToday}
              className={`px-4 py-2 rounded-lg font-bold ${
                attendanceToday
                  ? 'bg-emerald-500'
                  : 'bg-nexus-accent text-black'
              }`}
            >
              {attendanceToday ? <CheckCircle /> : <MapPin />}
            </button>
          </div>
        </header>

        {/* ACTIONS */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <ActionButton icon={Camera} label="Update Progress" />
          <ActionButton icon={Package} label="Order Material" />
          <ActionButton icon={Users} label="Labor Attendance" onClick={() => setShowLaborMgr(true)} />
          <ActionButton icon={Wallet} label="Record Expense" onClick={() => setShowExpenseModal(true)} />
        </div>

        {/* FEED */}
        <div className="px-6">
          <h3 className="font-bold mb-3">Site Activity</h3>
          {feed.length === 0 && (
            <p className="text-xs text-slate-400">No activity today</p>
          )}
          {feed.map(item => (
            <FeedItem
              key={item.id}
              title={item.action}
              sub={item.meta}
              time={new Date(item.created_at).toLocaleTimeString()}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-nexus-surface pb-24">
      {renderContent()}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-nexus-dark flex justify-around py-4">
        <NavBtn icon={Clock} label="Today" active={activeView === 'HOME'} onClick={() => setActiveView('HOME')} />
        <NavBtn icon={Package} label="Stock" active={activeView === 'STOCK'} onClick={() => setActiveView('STOCK')} />
        <NavBtn icon={AlertTriangle} label="Issues" active={activeView === 'ISSUES'} onClick={() => setActiveView('ISSUES')} />
      </div>

      <WorkerActionModal isOpen={!!modalAction} />
      <LaborManager isOpen={showLaborMgr} onClose={() => setShowLaborMgr(false)} />
      <SupervisorExpenseModal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
    </div>
  );
};

/* ---------------- UI PARTS ---------------- */
const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-card text-center">
    <Icon className="mx-auto mb-2" />
    <p className="font-bold text-sm">{label}</p>
  </button>
);

const FeedItem = ({ title, sub, time }) => (
  <div className="bg-white p-3 rounded-xl mb-2">
    <p className="font-bold text-sm">{title}</p>
    <p className="text-xs text-slate-500">{sub}</p>
    <p className="text-[10px] text-slate-400">{time}</p>
  </div>
);

const NavBtn = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={active ? 'text-nexus-accent' : 'text-slate-400'}>
    <Icon />
    <p className="text-xs">{label}</p>
  </button>
);

export default SupervisorDashboard;
