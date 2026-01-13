import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase
import { 
  Bell, AlertTriangle, CheckCircle, Package, UserX, Clock, 
  ArrowRight, Trash2, Check 
} from 'lucide-react';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);

  // Load from Supabase Realtime
  useEffect(() => {
    fetchNotifications();

    // Subscribe to live changes
    const subscription = supabase
      .channel('public:nexus_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_notifications' }, (payload) => {
        setAlerts(current => [payload.new, ...current]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); }
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('nexus_notifications').select('*').order('created_at', { ascending: false });
    if(data) setAlerts(data);
  };

  const handleDismiss = async (id) => {
    const { error } = await supabase.from('nexus_notifications').delete().eq('id', id);
    if (!error) {
        setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const handleAction = async (alertItem) => {
    // === SUPPLY CHAIN LOGIC ===
    if (alertItem.title === 'Material Request') {
        const cost = prompt(`Enter Order Value for ${alertItem.item}:`, "5000");
        if (!cost) return;

        // 1. Create Financial Transaction (Live DB)
        await supabase.from('nexus_transactions').insert([{
            title: `Order: ${alertItem.item}`,
            amount: parseFloat(cost),
            type: 'EXPENSE',
            status: 'Paid',
            category: 'Material',
            added_by: 'Owner'
        }]);

        // 2. Create Order for Store Keeper (Live DB)
        const qtyMatch = alertItem.msg.match(/(\d+)/);
        const qty = qtyMatch ? qtyMatch[0] : 'Bulk';

        await supabase.from('nexus_orders').insert([{
            item: alertItem.item || 'Unknown Item',
            qty: `${qty} Units`, 
            status: 'IN_TRANSIT',
            payment: 'PAID',
            eta: '4 Hours'
        }]);

        alert("Order Placed! Sent to Store Keeper dashboard.");
        handleDismiss(alertItem.id); 
    } 
    else {
        alert(`Action Triggered: ${alertItem.action}`);
        handleDismiss(alertItem.id);
    }
  };

  const getStyle = (type) => {
    switch(type) {
      case 'URGENT': return { bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-100', iconColor: 'text-red-600', icon: AlertTriangle };
      case 'WARNING': return { bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', icon: UserX };
      case 'SUCCESS': return { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', icon: CheckCircle };
      default: return { bg: 'bg-white', border: 'border-slate-100', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', icon: Bell };
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-32 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Notifications</h2>
          <p className="text-nexus-muted text-sm">You have {alerts.length} unread updates</p>
        </div>
        <button onClick={() => fetchNotifications()} className="text-xs font-bold text-slate-400 hover:text-nexus-accent uppercase tracking-wider">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-medium">All caught up!</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getStyle(alert.type);
            const Icon = style.icon; 

            return (
              <div key={alert.id} className={`p-4 rounded-2xl border ${style.bg} ${style.border} flex gap-4 relative group transition-all hover:shadow-md`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-sm ${style.iconColor}`}>{alert.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Now
                    </span>
                  </div>
                  
                  <p className="text-sm text-nexus-dark mt-1 leading-snug">{alert.msg}</p>
                  
                  {alert.action && (
                    <button 
                      onClick={() => handleAction(alert)}
                      className="mt-3 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-nexus-dark shadow-sm flex items-center gap-2 active:scale-95 transition-transform"
                    >
                      {alert.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-400 active:scale-90 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;