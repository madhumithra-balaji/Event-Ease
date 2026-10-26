import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Ticket,
  Printer,
  Download,
  ArrowRight,
  QrCode,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { Order, EventItem, Transaction } from '../types/index.js';

export function BookingConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.get<{ order: Order; event: EventItem; transaction: Transaction }>(
          `/api/orders/${orderId}`
        );
        setOrder(data.order);
        setEvent(data.event);
        setTransaction(data.transaction);

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-bold text-slate-800 mb-4">Order not found.</p>
          <Link to="/events" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Booking Confirmed & Inventory Settled
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1 mb-2">
            You're Going to {event?.title || 'the Event'}!
          </h1>
          <p className="text-sm text-slate-500">
            A confirmation receipt and digital ticket pass has been issued for order{' '}
            <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>.
          </p>
        </div>

        {/* Digital Ticket Pass Card (Printable) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8 print:shadow-none print:border-black">
          {/* Ticket Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                Official Event Admission Pass
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">{event?.title}</h2>
              <p className="text-xs text-slate-300 mt-1">{event?.venue}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-400 block">Total Amount</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Ticket Details Body */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {event?.eventDate &&
                    new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                </p>
                <p className="text-xs text-slate-500">
                  {event?.eventDate &&
                    new Date(event.eventDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Attendee</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{order.attendeeName || 'Guest'}</p>
                <p className="text-xs text-slate-500 truncate">{order.attendeeEmail}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Payment Reference</p>
                <p className="text-sm font-bold font-mono text-slate-900 mt-1">
                  {transaction?.paymentReference || 'PAY-REF-OK'}
                </p>
                <p className="text-xs text-emerald-600 font-semibold">Simulated Gateway Paid</p>
              </div>
            </div>

            {/* Ticket Tier Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Reserved Ticket Tiers
              </h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">
                      {item.ticketTypeName} × {item.quantity}
                    </span>
                    <span className="font-mono font-medium text-slate-700">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code & Scan Simulation */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 gap-4">
              <div className="flex items-center gap-4">
                {/* Visual QR Code Generator */}
                <div className="w-20 h-20 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1">
                    <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900 col-span-3"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900 col-span-2 row-span-2 rounded-xs"></div>
                    <div className="bg-slate-900"></div>
                    <div className="bg-slate-900 col-span-2"></div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900">Fast Venue Fast-Track QR</p>
                  <p className="text-[11px] text-slate-500">
                    Scan upon arrival at the gate. Valid for {order.items.reduce((s, it) => s + it.quantity, 0)} ticket entries.
                  </p>
                  <p className="text-[10px] font-mono text-indigo-600 mt-1">HASH: {order.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/my-bookings"
            className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-xs text-center transition-colors shadow-xs"
          >
            View All My Bookings
          </Link>
          <Link
            to="/events"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Explore More Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
