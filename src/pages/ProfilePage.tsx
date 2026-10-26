import React from 'react';
import { User, Mail, Shield, Building2, Calendar, Ticket, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">My Profile & Account</h1>
        <p className="text-xs text-slate-500 mb-6">Manage your user details and view system role privileges.</p>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 text-white flex items-center gap-5">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-[11px] uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-indigo-200">{user.email}</p>
              {user.organizationName && (
                <p className="text-xs text-indigo-300 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.organizationName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Account Role</span>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>{user.role}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {user.role === 'ADMIN'
                    ? 'Full platform administrator with oversight on all tenants.'
                    : user.role === 'ORGANIZER'
                    ? 'Verified event host with rights to create events, ticket tiers, and view revenue analytics.'
                    : 'Event attendee with rights to reserve ticket holds and complete simulated checkout.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Verification Status</span>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{user.isApproved ? 'Approved & Active' : 'Pending Review'}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tenant status verified in central PostgreSQL registry.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
              <span>Account Member Since: {new Date(user.createdAt).toLocaleDateString()}</span>
              <span className="font-mono text-[10px]">USER ID: {user.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
