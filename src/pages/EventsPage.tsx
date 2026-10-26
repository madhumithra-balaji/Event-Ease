import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Tag,
  ArrowUpDown,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem } from '../types/index.js';

export function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'default';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') {
          queryParams.set('category', currentCategory);
        }
        if (currentSearch) {
          queryParams.set('search', currentSearch);
        }
        if (currentSort !== 'default') {
          queryParams.set('sort', currentSort);
        }

        const data = await api.get<{ events: EventItem[] }>(`/api/events?${queryParams.toString()}`);
        setEvents(data.events || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [currentCategory, currentSearch, currentSort]);

  const handleCategoryChange = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'All') next.delete('category');
    else next.set('category', category);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('search', searchInput.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const handleSortChange = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    if (sort === 'default') next.delete('sort');
    else next.set('sort', sort);
    setSearchParams(next);
  };

  const categories = ['All', 'Technology', 'Music', 'Business', 'Food & Wine'];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Explore Events & Experiences
          </h1>
          <p className="text-sm text-slate-500">
            Browse upcoming conferences, festivals, and exclusive gatherings with atomic ticket hold reservations.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events or venues..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </form>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="default">Featured / Date</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="date_asc">Date: Soonest First</option>
            </select>
          </div>
        </div>

        {/* Results grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No Events Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              We couldn't find any events matching your selected criteria. Try adjusting your search query or category filter.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
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
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 shadow-xs">
                    {event.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs">
                    {event.minPrice === 0 ? 'Free' : `From $${event.minPrice}`}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
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
                      {event.totalAvailable} tickets left
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
