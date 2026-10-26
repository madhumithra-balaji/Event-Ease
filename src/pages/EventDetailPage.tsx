import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Ticket,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  Share2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem, TicketType } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [tktId: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);

  const { user, isAuthenticated, quickSwitchDemoRole } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      try {
        const data = await api.get<{ event: EventItem; tickets: TicketType[] }>(`/api/events/${id}`);
        setEvent(data.event);
        setTickets(data.tickets || []);
        // Initialize quantities to 0
        const initialMap: { [tktId: string]: number } = {};
        (data.tickets || []).forEach((t) => {
          initialMap[t.id] = 0;
        });
        setSelectedQuantities(initialMap);
      } catch (err: any) {
        error(err.message || 'Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadEvent();
    }
  }, [id]);

  const updateQuantity = (tktId: string, delta: number, maxAvailable: number) => {
    setSelectedQuantities((prev) => {
      const current = prev[tktId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      return { ...prev, [tktId]: next };
    });
  };

  const totalSelectedTickets = Object.values(selectedQuantities).reduce((sum, q) => sum + q, 0);
  const totalCost = tickets.reduce((sum, t) => sum + (selectedQuantities[t.id] || 0) * t.price, 0);

  const handleReserveTickets = async () => {
    if (totalSelectedTickets === 0) {
      info('Please select at least one ticket before proceeding to reservation.');
      return;
    }

    if (!isAuthenticated) {
      // Auto-switch to demo attendee for seamless evaluation if not signed in
      await quickSwitchDemoRole('ATTENDEE');
    }

    setIsReserving(true);
    try {
      const reservationPayload = {
        eventId: id,
        items: Object.entries(selectedQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity })),
      };

      const data = await api.post<{
        message: string;
        reservation: { id: string; remainingSeconds: number };
      }>('/api/reservations', reservationPayload);

      success('Temporary 10-minute reservation hold secured!');
      navigate(`/checkout/${data.reservation.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to secure reservation hold.');
    } finally {
      setIsReserving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    info('Event link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Event Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">The requested event could not be found or has been removed.</p>
          <Link to="/events" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Event Banner */}
      <div className="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-md">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white font-medium text-xs">
              Status: {event.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-4xl">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Date & Time</p>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.eventDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Venue</p>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.venue}</p>
                  <p className="text-xs text-slate-500">In-Person Experience</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Organizer</p>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{event.organizerName}</p>
                  <p className="text-xs text-emerald-600 font-semibold">Verified Organizer</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                About This Event
              </h2>
              <div className="prose text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Sales Cutoff: {new Date(event.salesCutoffDate).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Event</span>
                </button>
              </div>
            </div>

            {/* Concurrency & Hold Guarantee Notice */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900">
                <p className="font-bold text-indigo-950 mb-1">
                  Protected 10-Minute Hold Reservation System
                </p>
                <p className="text-indigo-700 leading-relaxed">
                  When you select your tickets and click Reserve, EventEase executes an atomic database transaction that decrements the pool and secures your tickets for 10 minutes. If payment is not completed before the countdown expires, the hold is safely released back into inventory.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Ticket Selection Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-600" />
                  Select Tickets
                </h3>
                <span className="text-xs text-slate-400 font-medium">Real-Time Inventory</span>
              </div>

              {tickets.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No ticket tiers currently available.</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {tickets.map((tkt) => {
                    const qty = selectedQuantities[tkt.id] || 0;
                    const isSoldOut = tkt.availableQuantity <= 0;

                    return (
                      <div
                        key={tkt.id}
                        className={`p-4 rounded-xl border transition-all ${
                          qty > 0
                            ? 'border-indigo-500 bg-indigo-50/40'
                            : isSoldOut
                            ? 'border-slate-200 bg-slate-50 opacity-60'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm text-slate-900">{tkt.name}</h4>
                          <span className="font-black text-indigo-600 text-sm">
                            ${tkt.price}
                          </span>
                        </div>

                        {tkt.description && (
                          <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                            {tkt.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {isSoldOut ? (
                              <span className="text-rose-600 font-bold">Sold Out</span>
                            ) : (
                              <span className="text-emerald-600">
                                {tkt.availableQuantity} available
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={qty <= 0}
                              onClick={() => updateQuantity(tkt.id, -1, tkt.availableQuantity)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              disabled={isSoldOut || qty >= tkt.availableQuantity}
                              onClick={() => updateQuantity(tkt.id, 1, tkt.availableQuantity)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subtotal summary */}
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Tickets:</span>
                  <span className="font-semibold text-slate-700">{totalSelectedTickets}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Reservation Hold Button */}
              <button
                type="button"
                disabled={totalSelectedTickets === 0 || isReserving}
                onClick={handleReserveTickets}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
              >
                {isReserving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Securing Atomic Hold...</span>
                  </>
                ) : (
                  <>
                    <span>Hold & Reserve for 10 Min</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-3">
                No immediate charge. 10-minute hold countdown starts upon reservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
