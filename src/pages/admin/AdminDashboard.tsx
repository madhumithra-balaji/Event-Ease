import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  DollarSign,
  Ticket,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { api } from '../../services/api.js';

interface AdminAnalytics {
  summary: {
    totalRevenue: number;
    totalTicketsSold: number;
    totalOrders: number;
    totalEvents: number;
    totalUsers: number;
    totalOrganizers: number;
    totalAttendees: number;
    pendingOrganizers: number;
  };
  categoriesData: { name: string; value: number }[];
  recentTransactions: any[];
}

const COLORS = ['#7c3aed', '#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export function AdminDashboard() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await api.get<AdminAnalytics>('/api/analytics/admin');
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalOrders: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalOrganizers: 0,
    totalAttendees: 0,
    pendingOrganizers: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-500">
            Platform-wide oversight across all organizer tenants, financial ledgers, and inventory telemetry.
          </p>
        </div>

        {s.pendingOrganizers > 0 && (
          <Link
            to="/admin/organizers"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{s.pendingOrganizers} Pending Organizer Approval</span>
          </Link>
        )}
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Platform Gross GMV</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ${s.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Platform-wide processed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tickets Issued</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {s.totalTicketsSold.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{s.totalOrders} total completed orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Organizers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{s.totalOrganizers}</p>
          <p className="text-[11px] text-slate-500 mt-1">Hosting {s.totalEvents} published events</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{s.totalUsers}</p>
          <p className="text-[11px] text-slate-500 mt-1">{s.totalAttendees} verified attendees</p>
        </div>
      </div>

      {/* Main Charts & Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Events by Category</h3>
          <p className="text-xs text-slate-400 mb-4">Marketplace inventory spread</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoriesData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.categoriesData || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Platform Management Quick Links</h3>
          <p className="text-xs text-slate-500">
            Direct shortcuts to inspect tenants, moderate listings, and review audit logs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/admin/organizers"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  Manage Organizers
                </p>
                <p className="text-[11px] text-slate-500">Approve or suspend event hosts</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/admin/users"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  Manage Users & Roles
                </p>
                <p className="text-[11px] text-slate-500">Inspect accounts, modify RBAC roles</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/admin/events"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  All Platform Events
                </p>
                <p className="text-[11px] text-slate-500">Review status across all tenants</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/admin/transactions"
              className="p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  Transactions Ledger
                </p>
                <p className="text-[11px] text-slate-500">Audit gateway payments & holds</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
