import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, CheckCircle2, QrCode, Search } from 'lucide-react';
import { api } from '../../services/api.js';
import { EventItem, Order } from '../../types/index.js';

export function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [checkInMap, setCheckInMap] = useState<{ [id: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const evData = await api.get<{ event: EventItem }>(`/api/events/${id}`);
        setEvent(evData.event);

        // Fetch organizer analytics or all orders for this event
        const res = await api.get<any>('/api/analytics/organizer');
        const eventOrders = (res.recentBookings || []).filter((b: any) => b.eventTitle === evData.event.title);
        setAttendees(eventOrders);
      } catch (err) {
        console.error('Failed to load attendees:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const toggleCheckIn = (orderId: string) => {
    setCheckInMap((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const filtered = attendees.filter(
    (a) =>
      a.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      a.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendee Roster</h1>
            <p className="text-xs text-slate-500">
              {event?.title || 'Event'} • Gate Check-in & Admission Roster
            </p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attendee or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No attendees found for this event yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Tickets</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Gate Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((att) => {
                  const isCheckedIn = Boolean(checkInMap[att.id]);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{att.attendeeName}</div>
                        <div className="text-[11px] text-slate-400">{att.attendeeEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {att.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {att.ticketCount} Pass{att.ticketCount > 1 ? 'es' : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ${att.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                            isCheckedIn
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isCheckedIn ? 'Checked In' : 'Expected'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleCheckIn(att.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isCheckedIn
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {isCheckedIn ? 'Undo Check-in' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
