import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  ChevronRight,
  Printer,
  QrCode,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Order } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export function MyBookingsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function loadMyOrders() {
      setIsLoading(true);
      try {
        const data = await api.get<{ orders: Order[] }>('/api/orders/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load my-orders:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMyOrders();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Attendee Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Tickets & Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your confirmed event passes, admission QR codes, and simulated transaction receipts.
          </p>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Ticket className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Bookings Yet</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              You haven't reserved any tickets yet. Explore our featured events and secure your admission today!
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <span>Explore Available Events</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const totalTickets = order.items.reduce((s, it) => s + it.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-200 transition-all p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {order.event?.bannerUrl ? (
                      <img
                        src={order.event.bannerUrl}
                        alt={order.event.title}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 hidden sm:block">
                        <Ticket className="w-8 h-8" />
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] tracking-wide uppercase border border-emerald-200">
                          {order.status}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {order.orderNumber}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {order.event?.title || 'Event Booking'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        {order.event?.eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            {new Date(order.event.eventDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                        {order.event?.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="line-clamp-1">{order.event.venue}</span>
                          </span>
                        )}
                      </div>

                      {/* Ticket items summary */}
                      <p className="text-xs text-slate-600 font-medium mt-2">
                        {totalTickets} Ticket{totalTickets > 1 ? 's' : ''} (
                        {order.items.map((it) => `${it.ticketTypeName} × ${it.quantity}`).join(', ')}
                        )
                      </p>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass / QR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Digital Ticket Pass with QR */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-900 to-violet-900 p-6 text-white relative">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/20">
                  EventEase Admission Pass
                </span>
                <h3 className="text-lg font-bold mt-2 text-white line-clamp-1">
                  {selectedOrder.event?.title}
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5 font-mono">
                  {selectedOrder.orderNumber}
                </p>
              </div>

              {/* Pass Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div>
                    <p className="text-slate-400 font-medium">Attendee</p>
                    <p className="text-slate-900 font-bold">{selectedOrder.attendeeName || user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-medium">Status</p>
                    <p className="text-emerald-600 font-bold">Confirmed</p>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-slate-700">TICKETS INCLUDED:</p>
                  {selectedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-slate-600">
                      <span>{it.ticketTypeName} × {it.quantity}</span>
                      <span className="font-mono font-medium">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Simulated QR Code */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center mb-2">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
                      <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                      <div className="bg-slate-900 col-span-2"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900 col-span-2"></div>
                      <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900"></div>
                      <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    PASS-ID: {selectedOrder.id}
                  </span>
                  <span className="text-xs text-slate-500 font-medium mt-1">
                    Show this QR code at admission gates
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket Pass</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
