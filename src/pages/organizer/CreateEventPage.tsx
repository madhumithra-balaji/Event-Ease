import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  DollarSign,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

interface TicketTierForm {
  name: string;
  price: string;
  totalQuantity: string;
  description: string;
}

const PRESET_BANNERS = [
  { label: 'Tech Summit', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Music Festival', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Fintech Forum', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Wine & Dining', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80' },
];

export function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-25T10:00');
  const [salesCutoffDate, setSalesCutoffDate] = useState('2026-11-24T23:59');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  const [ticketTiers, setTicketTiers] = useState<TicketTierForm[]>([
    { name: 'General Admission', price: '75', totalQuantity: '150', description: 'Standard admission to all sessions' },
    { name: 'VIP Executive Pass', price: '250', totalQuantity: '30', description: 'Front-row seats, VIP lounge & dinner' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const addTicketTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      { name: '', price: '', totalQuantity: '', description: '' },
    ]);
  };

  const removeTicketTier = (idx: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTicketTier = (idx: number, field: keyof TicketTierForm, value: string) => {
    setTicketTiers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue || !eventDate || !description) {
      error('Please fill in all mandatory event fields.');
      return;
    }

    if (ticketTiers.some((t) => !t.name || !t.price || !t.totalQuantity)) {
      error('Please complete all ticket tier fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/events', {
        title,
        category,
        venue,
        eventDate: new Date(eventDate).toISOString(),
        salesCutoffDate: new Date(salesCutoffDate).toISOString(),
        bannerUrl,
        description,
        status,
        ticketTiers,
      });

      success('Event created and published successfully!');
      navigate('/organizer/events');
    } catch (err: any) {
      error(err.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Event Studio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Event</h1>
          <p className="text-xs text-slate-500">
            Publish your event, configure ticket pricing tiers, and configure inventory bounds.
          </p>
        </div>

        <Link
          to="/organizer/events"
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Information Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            1. Event Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Web3 & AI Conference 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
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
                <option value="PUBLISHED">Published (Available to Attendees)</option>
                <option value="DRAFT">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Location *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Austin Convention Center, Austin, TX"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Event Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Cutoff Date *</label>
              <input
                type="datetime-local"
                required
                value={salesCutoffDate}
                onChange={(e) => setSalesCutoffDate(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Banner Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
            <div className="relative mb-2">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
              {PRESET_BANNERS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBannerUrl(preset.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                    bannerUrl === preset.url
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Provide a detailed overview of the agenda, keynote speakers, networking sessions, and amenities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Ticket Tiers Builder Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-600" />
              2. Ticket Pricing Tiers
            </h2>
            <button
              type="button"
              onClick={addTicketTier}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="space-y-3">
            {ticketTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    Tier #{idx + 1}
                  </span>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketTier(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VIP Pass"
                      value={tier.name}
                      onChange={(e) => updateTicketTier(idx, 'name', e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      placeholder="99"
                      value={tier.price}
                      onChange={(e) => updateTicketTier(idx, 'price', e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Quantity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      placeholder="100"
                      value={tier.totalQuantity}
                      onChange={(e) => updateTicketTier(idx, 'totalQuantity', e.target.value)}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Benefits Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Includes exclusive lounge access and lunch"
                    value={tier.description}
                    onChange={(e) => updateTicketTier(idx, 'description', e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Publish Event & Tiers</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
