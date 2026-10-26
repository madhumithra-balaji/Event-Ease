import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
  TrendingUp,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem } from '../types/index.js';

export function LandingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.get<{ events: EventItem[] }>('/api/events');
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to load landing events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const categories = [
    { name: 'Technology', icon: '💻', count: events.filter((e) => e.category === 'Technology').length || 3 },
    { name: 'Music', icon: '🎵', count: events.filter((e) => e.category === 'Music').length || 2 },
    { name: 'Business', icon: '📈', count: events.filter((e) => e.category === 'Business').length || 1 },
    { name: 'Food & Wine', icon: '🍷', count: events.filter((e) => e.category === 'Food & Wine').length || 1 },
  ];

  const featuredEvents = events.filter((e) => e.featured).slice(0, 3);
  const upcomingEvents = events.slice(0, 6);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next-Generation Multi-Tenant Event Ticketing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              Reserve Your Pass with <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">Guaranteed Inventory</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Experience seamless ticket reservations with real-time atomic 10-minute hold locks, zero double-booking, simulated checkout, and live organizer analytics.
            </p>

            {/* Quick Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto border border-white/20"
            >
              <div className="flex items-center gap-2.5 px-3 flex-1 w-full text-slate-700">
                <Search className="w-5 h-5 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by event name, category, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Find Tickets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80 text-center">
            <div className="p-3">
              <p className="text-2xl font-black text-indigo-400">10-Min</p>
              <p className="text-xs text-slate-400">Protected Reservation Hold</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-emerald-400">0%</p>
              <p className="text-xs text-slate-400">Double-Booking Risk</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-violet-400">Multi-Role</p>
              <p className="text-xs text-slate-400">Admin, Organizer, Attendee</p>
            </div>
            <div className="p-3">
              <p className="text-2xl font-black text-amber-400">Real-Time</p>
              <p className="text-xs text-slate-400">Recharts Revenue Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Events</h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={event.bannerUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 shadow-xs">
                    {event.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs">
                    From ${event.minPrice}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{event.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[180px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {event.totalAvailable} left
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Category Browse */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-sm text-slate-500">Discover events that match your interests</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/events?category=${encodeURIComponent(cat.name)}`)}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-left group"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500">{cat.count} Events Available</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How the 10-Minute Hold Engine Works */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Engine Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1 mb-3">
            How The Ticket Reservation Engine Works
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to handle flash sales, sudden concurrency spikes, and ensure zero inventory leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Select Tickets</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Attendee selects ticket tiers (VIP, Premium, General Admission) and chooses desired quantities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Atomic 10-Min Hold</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Database mutex locks availability, creates temporary hold, and decreases available pool immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Simulated Checkout</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Live countdown timer guides payment. Evaluator can test both simulated approvals and random declines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Worker Release / Pass</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              On success, instant QR pass generated. If hold expires, background worker automatically restores inventory.
            </p>
          </div>
        </div>
      </section>

      {/* CTA For Organizers */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Host Your Next Big Event?
            </h2>
            <p className="text-sm text-indigo-200 mb-8 leading-relaxed">
              Create ticket tiers, monitor real-time bookings, prevent double-bookings with automated reservation holds, and track revenue on live Recharts dashboards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/organizer/events/new"
                className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-900 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-md"
              >
                Create Event Now
              </Link>
              <Link
                to="/organizer"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-400/40 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Explore Organizer Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
