import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Download,
  Plus,
  X,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

const Financials = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ spent: 0, income: 0, pending: 0 });

  const [newTx, setNewTx] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    category: 'Material'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🔴 FIXED: table name + owner_id
const fetchTransactions = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('siteboss_transactions')
    .select('*')
    .eq('owner_id', (await supabase.auth.getUser()).data.user.id)
    .order('created_at', { ascending: false });

  if (data) {
    setTransactions(data);

    const spent = data.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const income = data.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const pending = data.filter(t => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);

    setStats({ spent, income, pending });
  }

  setLoading(false);
};


  const handleAddTransaction = async () => {
    if (!newTx.title || !newTx.amount) {
      alert('Please fill all fields');
      return;
    }

    // 🔴 FIXED INSERT
await supabase.from('siteboss_transactions').insert([{
  owner_id: user.id,
  project_id: selectedProjectId || null,
  title: newTx.title,
  amount: Number(newTx.amount),
  type: newTx.type,
  status: newTx.type === 'INCOME' ? 'RECEIVED' : 'PAID',
  category: newTx.category,
  created_by: user.id
}]);

    if (error) {
      alert(error.message);
      return;
    }

    setIsAddOpen(false);
    setNewTx({ title: '', amount: '', type: 'EXPENSE', category: 'Material' });
    fetchTransactions();
  };

  const handleExport = async () => {
    if (!transactions.length) return alert('No data to export');

    const csv = [
      ['Date', 'Title', 'Category', 'Type', 'Amount', 'Status'],
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        t.title,
        t.category,
        t.type,
        t.amount,
        t.status
      ])
    ].map(r => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], 'financials.csv', { type: 'text/csv' });

    if (navigator.share) {
      await navigator.share({
        title: 'Financial Report',
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financials.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-8 pb-32">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-nexus-dark">Financial Overview</h2>
          <p className="text-nexus-muted text-sm">Live database</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchTransactions}
            className="p-3 bg-white border rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-3 bg-nexus-dark text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinCard label="Total Spent" value={stats.spent} color="text-amber-600" />
        <FinCard label="Pending" value={stats.pending} color="text-red-500" />
        <FinCard label="Income" value={stats.income} color="text-emerald-600" />
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No transactions found
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-bold">Transaction</th>
                <th className="p-4 text-xs font-bold">Category</th>
                <th className="p-4 text-xs font-bold">Amount</th>
                <th className="p-4 text-xs font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-t">
                  <td className="p-4 font-bold">{tx.title}</td>
                  <td className="p-4">{tx.category}</td>
                  <td className="p-4">
                    {tx.type === 'INCOME' ? '+' : '-'} ₹{tx.amount}
                  </td>
                  <td className="p-4">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* FAB */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-6 bg-nexus-dark text-white p-4 rounded-full shadow-2xl z-40"
      >
        <Plus />
      </button>

      {/* MODAL */}
      {isAddOpen && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setIsAddOpen(false)}
    />

    {/* MODAL */}
    <div
      className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5 z-10"
      onClick={(e) => e.stopPropagation()}   // 🔥 THIS IS THE KEY
    >
      <h3 className="font-bold text-xl text-nexus-dark">Add Transaction</h3>

      {/* TYPE */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setNewTx({ ...newTx, type: 'EXPENSE' })}
          className={`flex-1 py-3 rounded-lg font-bold ${
            newTx.type === 'EXPENSE'
              ? 'bg-white text-red-500'
              : 'text-slate-400'
          }`}
        >
          Expense
        </button>

        <button
          type="button"
          onClick={() => setNewTx({ ...newTx, type: 'INCOME' })}
          className={`flex-1 py-3 rounded-lg font-bold ${
            newTx.type === 'INCOME'
              ? 'bg-white text-emerald-500'
              : 'text-slate-400'
          }`}
        >
          Income
        </button>
      </div>

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Amount"
        className="w-full p-4 bg-slate-100 rounded-xl text-2xl font-bold outline-none"
        value={newTx.amount}
        onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
      />

      {/* DESCRIPTION */}
      <input
        type="text"
        placeholder="Description"
        className="w-full p-4 bg-slate-100 rounded-xl font-bold outline-none"
        value={newTx.title}
        onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
      />

      {/* CATEGORY */}
      <select
        className="w-full p-4 bg-slate-100 rounded-xl font-bold outline-none"
        value={newTx.category}
        onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
      >
        <option>Material</option>
        <option>Labour</option>
        <option>Fuel</option>
        <option>Other</option>
      </select>

      {/* SAVE */}
      <button
        onClick={handleAddTransaction}
        className="w-full bg-nexus-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Save Transaction
      </button>
    </div>
  </div>
)}

    </div>
  );
};

const FinCard = ({ label, value, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-card">
    <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>₹{value}</p>
  </div>
);

export default Financials;
