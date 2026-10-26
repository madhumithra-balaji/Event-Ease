import { Router, Response } from 'express';
import crypto from 'crypto';
import { Database } from '../db.js';
import { AuthenticatedRequest, optionalAuth, requireAuth, requireRole } from '../middleware/auth.js';
import { Event, TicketType } from '../types.js';

export const eventsRouter = Router();

// GET /api/events - Public list of events
eventsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      search,
      category,
      organizerId,
      myEvents,
      status,
      sort,
    } = req.query;

    let events = Database.getEvents();

    // If organizer asks for their own events
    if (myEvents === 'true' && req.user) {
      if (req.user.role === 'ADMIN') {
        // admin can view all
      } else {
        events = events.filter((e) => e.organizerId === req.user!.id);
      }
    } else if (!organizerId) {
      // General public: only PUBLISHED events
      events = events.filter((e) => e.status === 'PUBLISHED');
    }

    if (organizerId) {
      events = events.filter((e) => e.organizerId === organizerId);
    }

    if (category && category !== 'All') {
      events = events.filter((e) => e.category.toLowerCase() === String(category).toLowerCase());
    }

    if (status) {
      events = events.filter((e) => e.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    // Attach tickets & organizer summary
    const enrichedEvents = events.map((event) => {
      const tickets = Database.getTicketsByEventId(event.id);
      const organizer = Database.findUserById(event.organizerId);
      const minPrice = tickets.length > 0 ? Math.min(...tickets.map((t) => t.price)) : 0;
      const maxPrice = tickets.length > 0 ? Math.max(...tickets.map((t) => t.price)) : 0;
      const totalAvailable = tickets.reduce((acc, t) => acc + t.availableQuantity, 0);

      return {
        ...event,
        tickets,
        organizerName: organizer?.organizationName || organizer?.name || 'Organizer',
        minPrice,
        maxPrice,
        totalAvailable,
      };
    });

    // Sorting
    if (sort === 'price_asc') {
      enrichedEvents.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === 'price_desc') {
      enrichedEvents.sort((a, b) => b.minPrice - a.minPrice);
    } else if (sort === 'date_asc') {
      enrichedEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    } else {
      // Default: featured first, then date
      enrichedEvents.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });
    }

    res.json({ events: enrichedEvents });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/events/:id - Event details
eventsRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = Database.findEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    const tickets = Database.getTicketsByEventId(event.id);
    const organizer = Database.findUserById(event.organizerId);

    res.json({
      event: {
        ...event,
        organizerName: organizer?.organizationName || organizer?.name || 'Organizer',
        organizerEmail: organizer?.email,
      },
      tickets,
    });
  } catch (err: any) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ error: 'Failed to load event details.' });
  }
});

// POST /api/events - Create new event (Organizer or Admin)
eventsRouter.post('/', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      eventDate,
      salesCutoffDate,
      bannerUrl,
      status,
      ticketTiers,
    } = req.body;

    if (!title || !description || !category || !venue || !eventDate) {
      res.status(400).json({ error: 'Please fill in all required event fields.' });
      return;
    }

    const now = new Date().toISOString();
    const eventId = `evt-${crypto.randomUUID().slice(0, 8)}`;

    const newEvent: Event = {
      id: eventId,
      organizerId: req.user!.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      venue: venue.trim(),
      eventDate,
      salesCutoffDate: salesCutoffDate || eventDate,
      bannerUrl:
        bannerUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      status: status || 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    };

    Database.createEvent(newEvent);

    // Create tickets if provided
    const createdTickets: TicketType[] = [];
    if (Array.isArray(ticketTiers) && ticketTiers.length > 0) {
      for (const tier of ticketTiers) {
        if (!tier.name || !tier.price || !tier.totalQuantity) continue;
        const total = parseInt(tier.totalQuantity, 10);
        const ticket: TicketType = {
          id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
          eventId,
          name: tier.name.trim(),
          price: parseFloat(tier.price),
          totalQuantity: total,
          availableQuantity: total,
          reservedQuantity: 0,
          description: tier.description?.trim(),
          createdAt: now,
          updatedAt: now,
        };
        Database.createTicket(ticket);
        createdTickets.push(ticket);
      }
    } else {
      // Default ticket tier if none passed
      const defaultTicket: TicketType = {
        id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
        eventId,
        name: 'General Admission',
        price: 50,
        totalQuantity: 100,
        availableQuantity: 100,
        reservedQuantity: 0,
        description: 'Standard event access ticket',
        createdAt: now,
        updatedAt: now,
      };
      Database.createTicket(defaultTicket);
      createdTickets.push(defaultTicket);
    }

    res.status(201).json({
      message: 'Event created successfully!',
      event: newEvent,
      tickets: createdTickets,
    });
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PUT /api/events/:id - Edit event
eventsRouter.put('/:id', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = Database.findEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // Role check: Admin can edit any, Organizer can only edit their own
    if (req.user!.role !== 'ADMIN' && event.organizerId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized. You do not own this event.' });
      return;
    }

    const {
      title,
      description,
      category,
      venue,
      eventDate,
      salesCutoffDate,
      bannerUrl,
      status,
    } = req.body;

    const updated = Database.updateEvent(event.id, {
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(category && { category: category.trim() }),
      ...(venue && { venue: venue.trim() }),
      ...(eventDate && { eventDate }),
      ...(salesCutoffDate && { salesCutoffDate }),
      ...(bannerUrl && { bannerUrl }),
      ...(status && { status }),
    });

    res.json({ message: 'Event updated successfully.', event: updated });
  } catch (err: any) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id - Delete event
eventsRouter.delete('/:id', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const event = Database.findEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && event.organizerId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized. You do not own this event.' });
      return;
    }

    Database.deleteEvent(event.id);
    res.json({ message: 'Event deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});
