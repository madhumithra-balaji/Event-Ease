import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';
import { User } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export function ManageOrganizersPage() {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadOrganizers = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ users: User[] }>('/api/admin/users');
      const orgs = (data.users || []).filter((u) => u.role === 'ORGANIZER');
      setOrganizers(orgs);
    } catch (err: any) {
      error(err.message || 'Failed to load organizers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      await api.put(`/api/admin/organizers/${id}/approve`, {
        isApproved: !currentApproved,
      });
      success(`Organizer ${!currentApproved ? 'approved' : 'deactivated'} successfully.`);
      loadOrganizers();
    } catch (err: any) {
      error(err.message || 'Failed to update approval status.');
    }
  };

  const filtered = organizers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      (o.organizationName && o.organizationName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Multi-Tenant Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Organizers</h1>
          <p className="text-xs text-slate-500">
            Review organizer applications, approve verified event promoters, or suspend inactive accounts.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading organizers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No organizers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Organization Name</th>
                  <th className="py-3.5 px-4">Events Hosted</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{org.name}</div>
                      <div className="text-[11px] text-slate-400">{org.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {org.organizationName || `${org.name}'s Events`}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {org.eventCount ?? 0}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                          org.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {org.isApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved & Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Pending Review</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleApproval(org.id, org.isApproved)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          org.isApproved
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        }`}
                      >
                        {org.isApproved ? 'Deactivate Host' : 'Approve Host'}
                      </button>
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
