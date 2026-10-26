import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Users,
  ShieldAlert,
  CreditCard,
  Ticket,
  ChevronRight,
  Shield,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'ORGANIZER';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">
            This section requires the <span className="font-semibold">{requiredRole}</span> role. You are currently logged in as <span className="font-semibold">{role}</span>.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
          >
            Back to Public Events
          </Link>
        </div>
      </div>
    );
  }

  const isAdminView = location.pathname.startsWith('/admin');

  const organizerLinks = [
    { label: 'Overview & Analytics', path: '/organizer', icon: LayoutDashboard },
    { label: 'Manage Events', path: '/organizer/events', icon: Calendar },
    { label: 'Create New Event', path: '/organizer/events/new', icon: PlusCircle },
  ];

  const adminLinks = [
    { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Manage Organizers', path: '/admin/organizers', icon: Building2 },
    { label: 'All Platform Events', path: '/admin/events', icon: Calendar },
    { label: 'Transactions Ledger', path: '/admin/transactions', icon: CreditCard },
  ];

  const links = isAdminView ? adminLinks : organizerLinks;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            {isAdminView ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold text-xs border border-purple-200">
                <Shield className="w-3.5 h-3.5" />
                Administrator Console
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200">
                <Building2 className="w-3.5 h-3.5" />
                Organizer Studio
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 truncate">
            {isAdminView ? 'Platform Control Center' : user.organizationName || `${user.name}'s Events`}
          </h3>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? isAdminView
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick jump to public portal */}
        <div className="p-4 border-t border-slate-100">
          <Link
            to="/events"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-500" />
            <span>Switch to Public Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
