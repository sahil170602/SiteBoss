import React, { useState, useEffect } from 'react';
import { Package, Search, History } from 'lucide-react';

const SiteInventory = () => {
  // Default Data
  const defaultStock = [
    { id: 1, name: 'Cement (UltraTech)', qty: 140, unit: 'Bags', color: 'bg-slate-100' },
    { id: 2, name: 'Steel 10mm', qty: 250, unit: 'Kg', color: 'bg-slate-100' },
    { id: 3, name: 'Red Bricks', qty: 4500, unit: 'Nos', color: 'bg-slate-100' },
    { id: 4, name: 'River Sand', qty: 2, unit: 'Brass', color: 'bg-amber-50 border-amber-200' },
  ];

  const [stock, setStock] = useState([]);

  // Load from Storage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_inventory');
    if (saved) {
        setStock(JSON.parse(saved));
    } else {
        setStock(defaultStock);
        localStorage.setItem('nexus_inventory', JSON.stringify(defaultStock));
    }
  }, []);

  const handleLogUsage = (id, amount) => {
    const updatedStock = stock.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty - amount) } : item
    );
    setStock(updatedStock);
    localStorage.setItem('nexus_inventory', JSON.stringify(updatedStock)); // Sync
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Site Stock</h2>
          <p className="text-nexus-muted text-sm">Track materials on ground</p>
        </div>
        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-nexus-accent">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Stock List */}
      <div className="space-y-4">
        {stock.map(item => (
          <div key={item.id} className={`bg-white p-5 rounded-2xl shadow-card border ${item.qty < 10 ? 'border-red-200' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-nexus-dark text-lg">{item.name}</h3>
                <p className="text-xs text-nexus-muted uppercase font-bold">Current Stock</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${item.qty < 10 ? 'text-red-500' : 'text-nexus-dark'}`}>
                  {item.qty}
                </span>
                <span className="text-xs text-slate-400 font-bold ml-1">{item.unit}</span>
              </div>
            </div>

            {/* Quick Actions: Log Usage */}
            <div className="bg-nexus-surface p-2 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Log Usage:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleLogUsage(item.id, 1)}
                  className="bg-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform"
                >
                  - 1
                </button>
                <button 
                  onClick={() => handleLogUsage(item.id, 5)}
                  className="bg-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform"
                >
                  - 5
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteInventory;