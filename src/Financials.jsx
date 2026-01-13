import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Wallet, TrendingDown, TrendingUp, AlertCircle, FileText, 
  Filter, Download, Plus, X, Check, ArrowDownLeft, ArrowUpRight, User, RefreshCw
} from 'lucide-react';

const Financials = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 1. FETCH TRANSACTIONS FROM DB
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ spent: 0, income: 0, pending: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('nexus_transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (data) {
        setTransactions(data);
        // Calculate Stats
        const spent = data.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
        const income = data.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
        const pending = data.filter(t => t.status === 'Pending').reduce((a, b) => a + b.amount, 0);
        setStats({ spent, income, pending });
    }
    setLoading(false);
  };

  // --- FORM STATE ---
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'EXPENSE', category: 'Material' });

  const handleAddTransaction = async () => {
    if (!newTx.title || !newTx.amount) return alert("Enter details");
    
    // INSERT TO DB
    const { error } = await supabase.from('nexus_transactions').insert([
        {
            title: newTx.title,
            amount: parseFloat(newTx.amount),
            type: newTx.type,
            status: newTx.type === 'INCOME' ? 'Received' : 'Paid',
            category: newTx.category,
            added_by: 'Owner'
        }
    ]);

    if (error) {
        alert('Error adding transaction: ' + error.message);
    } else {
        setIsAddOpen(false);
        setNewTx({ title: '', amount: '', type: 'EXPENSE', category: 'Material' }); 
        fetchTransactions(); // Refresh
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-32">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Financial Overview</h2>
          <p className="text-nexus-muted text-sm">Real-time database sync</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTransactions} className="p-3 bg-white border rounded-xl"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button className="flex-1 md:flex-none px-4 py-3 md:py-2 bg-nexus-dark text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:bg-slate-800 transition-colors shadow-lg">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* --- BIG NUMBERS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <FinCard label="Total Spent" value={`₹${stats.spent.toLocaleString()}`} sub="Total Outflow" icon={TrendingDown} color="text-nexus-accent" bg="bg-amber-50" />
        <FinCard label="Pending" value={`₹${stats.pending.toLocaleString()}`} sub="Needs Approval" icon={AlertCircle} color="text-red-500" bg="bg-red-50" />
        <FinCard label="Income" value={`₹${stats.income.toLocaleString()}`} sub="Total Inflow" icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-50" />
      </div>

      {/* --- TRANSACTION LIST --- */}
      <div>
        <h3 className="font-bold text-nexus-dark mb-4 text-lg">Recent Transactions</h3>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                    <th className="p-4 text-xs font-bold text-nexus-muted uppercase">Transaction</th>
                    <th className="p-4 text-xs font-bold text-nexus-muted uppercase">Category</th>
                    <th className="p-4 text-xs font-bold text-nexus-muted uppercase">Amount</th>
                    <th className="p-4 text-xs font-bold text-nexus-muted uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                    <tr key={tx.id} className="active:bg-slate-50 transition-colors">
                        <td className="p-4">
                        <p className="font-bold text-nexus-dark text-sm">{tx.title}</p>
                        <span className="text-xs text-nexus-muted">{new Date(tx.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{tx.category}</span></td>
                        <td className={`p-4 font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-nexus-dark'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                        </td>
                        <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                            tx.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            tx.status === 'Received' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{tx.status}</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          )}
        </div>
      </div>

      {/* --- FLOATING ACTION BUTTON (FAB) --- */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-nexus-dark text-white p-4 rounded-full shadow-2xl shadow-slate-900/30 active:scale-90 transition-transform z-40 border-2 border-slate-700"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* --- ADD TRANSACTION MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 pb-[env(safe-area-inset-bottom)]">
            <div className="bg-nexus-surface p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="font-bold text-xl text-nexus-dark">Record Cash Flow</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-2 bg-white rounded-full text-slate-400 active:text-red-500 shadow-sm"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setNewTx({...newTx, type: 'EXPENSE'})} className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${newTx.type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}>
                  <ArrowUpRight className="w-4 h-4" /> Expense (Out)
                </button>
                <button onClick={() => setNewTx({...newTx, type: 'INCOME'})} className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${newTx.type === 'INCOME' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}>
                  <ArrowDownLeft className="w-4 h-4" /> Income (In)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Amount (₹)</label>
                <input type="number" placeholder="0.00" autoFocus className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-3xl text-nexus-dark outline-none focus:ring-2 focus:ring-nexus-accent" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Description</label>
                    <input type="text" placeholder="e.g. Paid for Fuel" className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-nexus-dark outline-none" value={newTx.title} onChange={(e) => setNewTx({...newTx, title: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-nexus-muted uppercase mb-2">Category</label>
                    <select className="w-full bg-nexus-surface p-4 rounded-xl font-bold text-nexus-dark outline-none" value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})}>
                      <option>Material</option>
                      <option>Labor</option>
                      <option>Fuel</option>
                      <option>Client Payment</option>
                      <option>Other</option>
                    </select>
                </div>
              </div>

              <button onClick={handleAddTransaction} className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all mt-4">
                <Check className="w-5 h-5" /> <span>Save Transaction</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const FinCard = ({ label, value, sub, icon: Icon, color, bg }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-card border-l-4 ${color.replace('text', 'border')}`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
      <span className="text-xs font-bold text-nexus-muted uppercase">{label}</span>
    </div>
    <p className="text-2xl font-bold text-nexus-dark">{value}</p>
    <p className={`text-xs font-bold mt-1 ${color}`}>{sub}</p>
  </div>
);

export default Financials;