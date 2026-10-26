import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  Users,
  TrendingUp,
  PlusCircle,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface OrganizerAnalytics {
  summary: {
    totalEvents: number;
    totalTicketsSold: number;
    totalBookings: number;
    totalRevenue: number;
    conversionRate: number;
  };
  revenueOverTime: { date: string; revenue: number; sales: number }[];
  revenueByEvent: { name: string; revenue: number; ticketsSold: number }[];
  categoryDistribution: { name: string; value: number }[];
  recentBookings: {
    id: string;
    orderNumber: string;
    attendeeName: string;
    attendeeEmail: string;
    eventTitle: string;
    amount: number;
    ticketCount: number;
    status: string;
    date: string;
  }[];
}

const PIE_COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

export function OrganizerDashboard() {
  const [data, setData] = useState<OrganizerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const res = await api.get<OrganizerAnalytics>('/api/analytics/organizer');
        setData(res);
      } catch (err) {
        console.error('Failed to load organizer analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalEvents: 0,
    totalTicketsSold: 0,
    totalBookings: 0,
    totalRevenue: 0,
    conversionRate: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Organizer Performance Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Studio Analytics & Revenue
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry on your active ticket inventory, reservations, and sales conversions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/organizer/events"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Manage Events
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ${summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Settled through payment sandbox</span>
          </p>
        </div>

        {/* Tickets Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tickets Sold</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {summary.totalTicketsSold.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {summary.totalEvents} hosted event{summary.totalEvents > 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {summary.totalBookings.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed customer orders</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Hold Conversion</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">
            {summary.conversionRate}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Holds converted to orders</p>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Revenue Trend Over Time ($)
              </h3>
              <p className="text-xs text-slate-400">Weekly ticket purchase volume</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.revenueOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`$${val}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Category Distribution (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-violet-600" />
              Ticket Category Share
            </h3>
            <p className="text-xs text-slate-400">Distribution by tier volume</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
      </div>

      {/* Revenue By Event (Bar Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Revenue by Hosted Event
          </h3>
          <p className="text-xs text-slate-400">Total earnings breakdown per event title</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.revenueByEvent || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(val: any) => [`$${val}`, 'Gross Revenue']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Recent Customer Bookings</h3>
          <span className="text-xs text-slate-400">Latest confirmed orders</span>
        </div>

        {(!data?.recentBookings || data.recentBookings.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No customer orders received yet. Share your event links to start receiving bookings!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Tickets</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {bk.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{bk.attendeeName}</div>
                      <div className="text-[10px] text-slate-400">{bk.attendeeEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate">
                      {bk.eventTitle}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{bk.ticketCount}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${bk.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {bk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(bk.date).toLocaleDateString()}
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
