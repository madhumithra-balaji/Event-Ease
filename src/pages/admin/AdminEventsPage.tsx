import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Eye, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { EventItem } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const loadAllEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ events: EventItem[] }>('/api/admin/events');
      setEvents(data.events || []);
    } catch (err: any) {
      error(err.message || 'Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllEvents();
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      await api.put(`/api/events/${eventId}`, { status: newStatus });
      success(`Event status updated to ${newStatus}.`);
      loadAllEvents();
    } catch (err: any) {
      error(err.message || 'Failed to update event status.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Admin: Permanently delete event "${title}"?`)) return;
    try {
      await api.delete(`/api/events/${id}`);
      success('Event deleted.');
      loadAllEvents();
    } catch (err: any) {
      error(err.message || 'Failed to delete event.');
    }
  };

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer && e.organizer.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Platform Content Governance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Platform Events</h1>
          <p className="text-xs text-slate-500">
            Review listings submitted by all tenant organizers, audit ticket quantities, or override statuses.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events or organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Organizer</th>
                  <th className="py-3.5 px-4">Category & Date</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={e.bannerUrl}
                          alt={e.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{e.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{e.venue}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{e.organizer?.name || 'Organizer'}</p>
                      <p className="text-[11px] text-slate-400">{e.organizer?.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{e.category}</span>
                      <p className="text-[11px] text-slate-400">
                        {new Date(e.eventDate).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {e.availableTickets} / {e.totalTickets}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={e.status}
                        onChange={(opt) => handleUpdateStatus(e.id, opt.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="SOLD_OUT">SOLD_OUT</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/events/${e.id}`}
                          title="View Public Page"
                          className="p-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id, e.title)}
                          title="Delete Event"
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
