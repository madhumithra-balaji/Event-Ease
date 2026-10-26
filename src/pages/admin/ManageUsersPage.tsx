import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Building2, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { User, Role } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ users: User[] }>('/api/admin/users');
      setUsers(data.users || []);
    } catch (err: any) {
      error(err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: Role) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      success(`User role updated to ${newRole}.`);
      loadUsers();
    } catch (err: any) {
      error(err.message || 'Failed to update user role.');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Identity & Access Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Users & Roles</h1>
          <p className="text-xs text-slate-500">
            Audit registered platform accounts, assign administrative privileges, and inspect tenancy.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading platform users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Organization / Notes</th>
                  <th className="py-3.5 px-4">Events Hosted</th>
                  <th className="py-3.5 px-4">Bookings</th>
                  <th className="py-3.5 px-4 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u.role === 'ORGANIZER'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role === 'ORGANIZER' && <Building2 className="w-3 h-3" />}
                        {u.role === 'ATTENDEE' && <UserIcon className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.organizationName || <span className="text-slate-400 italic">None</span>}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {u.eventCount ?? 0}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {u.orderCount ?? 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="ATTENDEE">Attendee</option>
                        <option value="ORGANIZER">Organizer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
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
