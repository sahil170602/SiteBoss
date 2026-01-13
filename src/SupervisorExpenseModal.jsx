import React, { useState } from 'react';
import { X, Check, Receipt, IndianRupee, Camera } from 'lucide-react';

const SupervisorExpenseModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Fuel');

  const handleSubmit = () => {
    if (!amount || !desc) return alert("Please enter amount and description");

    const newExpense = {
      id: Date.now(),
      title: desc,
      site: 'Green Valley Villa', // In real app, this comes from user profile
      amount: parseFloat(amount),
      type: 'EXPENSE',
      status: 'Pending', // Supervisor expenses usually need approval
      date: 'Just now',
      category: category,
      addedBy: 'Supervisor'
    };

    // 1. GET EXISTING DATA
    const existingData = JSON.parse(localStorage.getItem('nexus_transactions') || '[]');
    
    // 2. ADD NEW EXPENSE
    const updatedData = [newExpense, ...existingData];
    
    // 3. SAVE TO SHARED STORAGE
    localStorage.setItem('nexus_transactions', JSON.stringify(updatedData));

    alert("Expense Recorded! Owner will see this immediately.");
    onClose();
    setAmount('');
    setDesc('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
        
        {/* Header */}
        <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h3 className="font-bold text-xl text-nexus-dark">Record Expense</h3>
            <p className="text-xs text-nexus-muted">Site Petty Cash Entry</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 active:text-red-500 shadow-sm"><X className="w-5 h-5" /></button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          
          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Amount (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="number" 
                autoFocus
                placeholder="0.00" 
                className="w-full bg-nexus-surface pl-12 p-4 rounded-xl font-bold text-3xl text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">What was this for?</label>
            <input 
              type="text" 
              placeholder="e.g. Diesel for Generator" 
              className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-nexus-dark outline-none mb-3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            
            {/* Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['Fuel', 'Tea/Snacks', 'Transport', 'Material', 'Repair'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${category === cat ? 'bg-nexus-dark text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Proof */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 active:bg-slate-50 active:border-nexus-accent transition-colors">
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-xs font-bold">Attach Receipt Photo</span>
          </div>

          {/* Submit */}
          <button 
            onClick={handleSubmit}
            className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all"
          >
            <Check className="w-5 h-5" /> <span>Save & Notify Owner</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default SupervisorExpenseModal;