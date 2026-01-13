import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase
import { Package, Truck, CheckCircle, Clock, LogOut, Wallet, Search } from 'lucide-react';

const StoreKeeperDashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);

  // Load Orders from Cloud
  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh orders when added by Owner
    const subscription = supabase
      .channel('public:nexus_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nexus_orders' }, (payload) => {
        setOrders(current => [payload.new, ...current]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); }
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('nexus_orders').select('*').order('created_at', { ascending: false });
    if(data) setOrders(data);
  };

  // Handle "Mark Delivered"
  const handleReceive = async (order) => {
    if(!confirm(`Confirm ${order.qty} of ${order.item} received?`)) return;

    // 1. Update Order Status in DB
    await supabase.from('nexus_orders').update({ status: 'DELIVERED', eta: 'Arrived' }).eq('id', order.id);

    // 2. AUTO-UPDATE INVENTORY in DB
    // Fetch current item to get ID and current qty
    const { data: inventoryItem } = await supabase
        .from('nexus_inventory')
        .select('*')
        .ilike('name', `%${order.item}%`) // Fuzzy search
        .maybeSingle();

    const addQty = parseInt(order.qty) || 0;

    if (inventoryItem) {
        // Update existing
        await supabase.from('nexus_inventory').update({ qty: inventoryItem.qty + addQty }).eq('id', inventoryItem.id);
    } else {
        // Insert new if not exists (Basic handling)
        await supabase.from('nexus_inventory').insert([{ name: order.item, qty: addQty, unit: 'Units' }]);
    }
    
    alert("Stock Updated Automatically in Cloud!");
    fetchOrders(); // Refresh UI
  };

  return (
    <div className="min-h-screen bg-nexus-surface font-sans pb-10">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pt-[calc(2rem+env(safe-area-inset-top))] rounded-b-[40px] shadow-2xl relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Store Keeper</span>
            <h1 className="text-xl font-bold mt-1">{user.projectName}</h1>
            <p className="text-slate-400 text-sm">{user.name}</p>
          </div>
          <button onClick={onLogout} className="bg-white/10 p-2 rounded-full active:bg-white/20 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/5">
                <p className="text-xs text-slate-300 font-bold uppercase">In Transit</p>
                <p className="text-2xl font-bold text-orange-400">{orders.filter(o => o.status === 'IN_TRANSIT').length}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/5">
                <p className="text-xs text-slate-300 font-bold uppercase">Payment Due</p>
                <p className="text-2xl font-bold text-red-400">{orders.filter(o => o.payment === 'PENDING').length}</p>
            </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-nexus-dark text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-nexus-accent" /> Track Deliveries
            </h3>
            <button onClick={fetchOrders} className="text-xs text-slate-400 font-bold">Refresh</button>
        </div>

        {orders.length === 0 && <p className="text-center text-slate-400 text-sm">No active orders found.</p>}

        {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
                
                {/* Top: Item & Payment */}
                <div className="p-5 border-b border-slate-50 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg text-nexus-dark">{order.item}</h4>
                        <p className="text-sm text-slate-500 font-medium">{order.qty}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase flex items-center gap-1 ${
                        order.payment === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                        <Wallet className="w-3 h-3" /> {order.payment}
                    </div>
                </div>

                {/* Timeline Visual */}
                <div className="p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        <span className="text-emerald-600">Ordered</span>
                        <span className={order.status !== 'ORDERED' ? 'text-emerald-600' : ''}>In Transit</span>
                        <span className={order.status === 'DELIVERED' ? 'text-emerald-600' : ''}>Received</span>
                    </div>
                    
                    <div className="relative w-full h-2 bg-slate-200 rounded-full mb-4">
                        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            order.status === 'DELIVERED' ? 'w-full bg-emerald-500' : 
                            order.status === 'IN_TRANSIT' ? 'w-[60%] bg-nexus-accent' : 'w-[10%] bg-slate-400'
                        }`}></div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-nexus-dark font-bold text-sm">
                            {order.status === 'DELIVERED' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : 
                             order.status === 'IN_TRANSIT' ? <Truck className="w-4 h-4 text-nexus-accent animate-pulse" /> : 
                             <Clock className="w-4 h-4 text-slate-400" />
                            }
                            {order.status === 'IN_TRANSIT' ? `ETA: ${order.eta || 'Soon'}` : order.status}
                        </div>

                        {order.status !== 'DELIVERED' && (
                            <button 
                                onClick={() => handleReceive(order)}
                                className="bg-nexus-dark text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-transform"
                            >
                                Mark Received
                            </button>
                        )}
                    </div>
                </div>
            </div>
        ))}
      </div>

    </div>
  );
};

export default StoreKeeperDashboard;