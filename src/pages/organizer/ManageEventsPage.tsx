import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { EventItem } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export function ManageEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error, info } = useToast();

  const loadOrganizerEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ events: EventItem[] }>('/api/events?myEvents=true');
      setEvents(data.events || []);
    } catch (err: any) {
      error(err.message || 'Failed to load your events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerEvents();
  }, []);

  const handleToggleStatus = async (event: EventItem) => {
    const nextStatus = event.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.put(`/api/events/${event.id}`, { status: nextStatus });
      success(`Event status changed to ${nextStatus}.`);
      loadOrganizerEvents();
    } catch (err: any) {
      error(err.message || 'Failed to change event status.');
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/events/${id}`);
      success(`Event "${title}" was deleted.`);
      loadOrganizerEvents();
    } catch (err: any) {
      error(err.message || 'Failed to delete event.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Event Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hosted Events</h1>
          <p className="text-xs text-slate-500">
            Monitor active ticket sales, modify pricing tiers, and manage event statuses.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Events Table / Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Events Found</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            You haven't created any events yet. Publish your first gathering with custom ticket tiers and start accepting reservations!
          </p>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Event</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Date & Venue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Ticket Inventory</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const tickets = ev.tickets || [];
                  const totalCapacity = tickets.reduce((s, t) => s + t.totalQuantity, 0);
                  const available = tickets.reduce((s, t) => s + t.availableQuantity, 0);
                  const sold = totalCapacity - available;
                  const soldPct = totalCapacity > 0 ? Math.round((sold / totalCapacity) * 100) : 0;

                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.bannerUrl}
                            alt={ev.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <Link
                              to={`/events/${ev.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                            >
                              {ev.title}
                            </Link>
                            <span className="text-[11px] text-indigo-600 font-semibold">{ev.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {new Date(ev.eventDate).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{ev.venue}</div>
                      </td>

                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(ev)}
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] tracking-wide uppercase transition-colors ${
                            ev.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : ev.status === 'DRAFT'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {ev.status} (Click to toggle)
                        </button>
                      </td>

                      <td className="py-4 px-4 min-w-[160px]">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>{sold} Sold</span>
                          <span className="text-slate-400">{available} Left ({totalCapacity} Total)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, soldPct)}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/events/${ev.id}`}
                            title="View Public Storefront Page"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/organizer/events/${ev.id}/edit`}
                            title="Edit Event"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/organizer/events/${ev.id}/attendees`}
                            title="View Attendees"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            title="Delete Event"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
