import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Package, Plus, Minus, RefreshCw } from 'lucide-react';

const SiteInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('nexus_inventory').select('*').order('name');
    if (data) setInventory(data);
    setLoading(false);
  };

  const updateStock = async (id, currentQty, change) => {
    const newQty = parseFloat(currentQty) + change;
    if (newQty < 0) return; // Prevent negative stock

    // Optimistic UI Update (Update screen before DB for speed)
    setInventory(inventory.map(item => item.id === id ? { ...item, qty: newQty } : item));

    // Update DB
    await supabase.from('nexus_inventory').update({ qty: newQty }).eq('id', id);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-nexus-dark flex items-center gap-2">
            <Package className="w-5 h-5 text-nexus-accent" /> Material Stock
        </h3>
        <button onClick={fetchInventory} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {inventory.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Inventory empty.</p>}

        {inventory.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <div>
                <p className="font-bold text-nexus-dark">{item.name}</p>
                <p className="text-xs text-nexus-muted">{item.qty} {item.unit || 'Units'} Available</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                <button onClick={() => updateStock(item.id, item.qty, -1)} className="p-2 bg-white rounded shadow-sm text-red-500 active:scale-90 transition-transform"><Minus className="w-4 h-4" /></button>
                <span className="font-bold text-sm min-w-[30px] text-center">{item.qty}</span>
                <button onClick={() => updateStock(item.id, item.qty, 1)} className="p-2 bg-white rounded shadow-sm text-green-600 active:scale-90 transition-transform"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteInventory;