import React, { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowDownRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../../services/api.js';
import { Transaction } from '../../types/index.js';

export function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const data = await api.get<{ transactions: Transaction[] }>('/api/admin/transactions');
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.paymentReference.toLowerCase().includes(q) ||
        (t.orderNumber && t.orderNumber.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.eventTitle && t.eventTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalVolume = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Financial Audit Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transactions Audit</h1>
          <p className="text-xs text-slate-500">
            Real-time ledger of simulated payments, checkout attempts, and gateway authorizations.
          </p>
        </div>

        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold">Total Cleared Volume:</span>
          <span className="text-lg font-black font-mono text-emerald-600">
            ${totalVolume.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'SUCCESS', 'FAILED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === tab
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Transactions' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, order, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No transactions recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Event & Order</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.paymentReference}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{t.customerName}</div>
                      <div className="text-[11px] text-slate-400">{t.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 line-clamp-1 max-w-[200px]">{t.eventTitle}</div>
                      <div className="text-[11px] font-mono text-indigo-600">{t.orderNumber}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {t.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${t.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                          t.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {t.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{t.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
