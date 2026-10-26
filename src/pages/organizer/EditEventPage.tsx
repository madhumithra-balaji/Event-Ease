import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  Save,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { EventItem, TicketType } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [salesCutoffDate, setSalesCutoffDate] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED'>('PUBLISHED');

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierQty, setNewTierQty] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEventData() {
      setIsLoading(true);
      try {
        const data = await api.get<{ event: EventItem; tickets: TicketType[] }>(`/api/events/${id}`);
        const ev = data.event;
        setTitle(ev.title);
        setCategory(ev.category);
        setVenue(ev.venue);
        setEventDate(ev.eventDate.slice(0, 16));
        setSalesCutoffDate(ev.salesCutoffDate ? ev.salesCutoffDate.slice(0, 16) : ev.eventDate.slice(0, 16));
        setBannerUrl(ev.bannerUrl);
        setDescription(ev.description);
        setStatus(ev.status as any);
        setTickets(data.tickets || []);
      } catch (err: any) {
        error(err.message || 'Failed to load event for editing.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadEventData();
    }
  }, [id]);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/api/events/${id}`, {
        title,
        category,
        venue,
        eventDate: new Date(eventDate).toISOString(),
        salesCutoffDate: new Date(salesCutoffDate).toISOString(),
        bannerUrl,
        description,
        status,
      });

      success('Event updated successfully.');
      navigate('/organizer/events');
    } catch (err: any) {
      error(err.message || 'Failed to save event updates.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTicketTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName || !newTierPrice || !newTierQty) return;

    try {
      const data = await api.post<{ ticket: TicketType }>(`/api/events/${id}/tickets`, {
        name: newTierName,
        price: parseFloat(newTierPrice),
        totalQuantity: parseInt(newTierQty, 10),
      });
      setTickets((prev) => [...prev, data.ticket]);
      setNewTierName('');
      setNewTierPrice('');
      setNewTierQty('');
      success(`Ticket tier "${data.ticket.name}" added.`);
    } catch (err: any) {
      error(err.message || 'Failed to add ticket tier.');
    }
  };

  const handleDeleteTicket = async (tktId: string) => {
    try {
      await api.delete(`/api/tickets/${tktId}`);
      setTickets((prev) => prev.filter((t) => t.id !== tktId));
      success('Ticket tier removed.');
    } catch (err: any) {
      error(err.message || 'Failed to delete ticket tier.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/organizer/events"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Event</h1>
            <p className="text-xs text-slate-500">Modify details, event dates, and ticket tiers</p>
          </div>
        </div>

        <Link
          to={`/events/${id}`}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          View Public Event Page →
        </Link>
      </div>

      <form onSubmit={handleSaveEvent} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Event Settings
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Business">Business</option>
                <option value="Food & Wine">Food & Wine</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="SOLD_OUT">Sold Out</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Venue</label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Cutoff</label>
              <input
                type="datetime-local"
                required
                value={salesCutoffDate}
                onChange={(e) => setSalesCutoffDate(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* Ticket Tiers Management */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-4 h-4 text-indigo-600" />
          Active Ticket Tiers
        </h2>

        <div className="divide-y divide-slate-100">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{tkt.name}</p>
                <p className="text-slate-400">
                  ${tkt.price} • {tkt.availableQuantity} available of {tkt.totalQuantity} total
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteTicket(tkt.id)}
                className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Tier Inline */}
        <form onSubmit={handleAddTicketTier} className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-700">Add Additional Tier</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Tier Name (e.g. VIP)"
              value={newTierName}
              onChange={(e) => setNewTierName(e.target.value)}
              className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="number"
              placeholder="Price ($)"
              value={newTierPrice}
              onChange={(e) => setNewTierPrice(e.target.value)}
              className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newTierQty}
              onChange={(e) => setNewTierQty(e.target.value)}
              className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Add Tier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
