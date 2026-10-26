import { Router, Response } from 'express';
import crypto from 'crypto';
import { Database, dbMutex } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Reservation, ReservationItem } from '../types.js';

export const reservationsRouter = Router();

const HOLD_DURATION_MS = 10 * 60 * 1000; // 10 minutes temporary hold

// POST /api/reservations - Create temporary 10-minute hold
reservationsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const unlock = await dbMutex.acquire();
  try {
    const { eventId, items } = req.body; // items: [{ ticketTypeId, quantity }]

    if (!eventId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Event ID and ticket items selection are required.' });
      return;
    }

    const event = Database.findEventById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    if (event.status !== 'PUBLISHED') {
      res.status(400).json({ error: 'This event is not open for ticket reservations.' });
      return;
    }

    // Check sales cutoff date
    if (new Date(event.salesCutoffDate).getTime() < Date.now()) {
      res.status(400).json({ error: 'Ticket sales for this event have closed.' });
      return;
    }

    // First: Run hold cleanup to restore any freshly expired holds
    Database.releaseExpiredHolds();

    // Verify all requested ticket types and check availability
    const reservationItems: ReservationItem[] = [];
    let calculatedTotal = 0;

    for (const reqItem of items) {
      const quantity = parseInt(reqItem.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ error: 'Invalid ticket quantity requested.' });
        return;
      }

      const ticket = Database.findTicketById(reqItem.ticketTypeId);
      if (!ticket || ticket.eventId !== eventId) {
        res.status(404).json({ error: `Ticket tier ${reqItem.ticketTypeId} not found for this event.` });
        return;
      }

      if (ticket.availableQuantity < quantity) {
        res.status(409).json({
          error: `Insufficient inventory for '${ticket.name}'. Only ${ticket.availableQuantity} tickets remaining.`,
          available: ticket.availableQuantity,
          ticketName: ticket.name,
        });
        return;
      }

      calculatedTotal += ticket.price * quantity;
      reservationItems.push({
        id: `ritm-${crypto.randomUUID().slice(0, 8)}`,
        reservationId: '', // Set below
        ticketTypeId: ticket.id,
        ticketTypeName: ticket.name,
        quantity,
        unitPrice: ticket.price,
      });
    }

    // ATOMIC RESERVATION HOLD: Decrement available, increment reserved
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);
    const reservationId = `res-${crypto.randomUUID().slice(0, 8)}`;

    for (const item of reservationItems) {
      item.reservationId = reservationId;
      const ticket = Database.findTicketById(item.ticketTypeId)!;
      ticket.availableQuantity -= item.quantity;
      ticket.reservedQuantity += item.quantity;
      ticket.updatedAt = now.toISOString();
    }

    const reservation: Reservation = {
      id: reservationId,
      userId: req.user!.id,
      eventId,
      status: 'PENDING',
      expiresAt: expiresAt.toISOString(),
      totalAmount: calculatedTotal,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items: reservationItems,
    };

    Database.saveReservation(reservation);

    res.status(201).json({
      message: 'Temporary reservation hold secured for 10 minutes.',
      reservation: {
        ...reservation,
        remainingSeconds: Math.floor((expiresAt.getTime() - now.getTime()) / 1000),
      },
      event: {
        id: event.id,
        title: event.title,
        venue: event.venue,
        eventDate: event.eventDate,
        bannerUrl: event.bannerUrl,
      },
    });
  } catch (err: any) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: 'Failed to create reservation hold.' });
  } finally {
    unlock();
  }
});

// GET /api/reservations/:id - Get reservation status and remaining hold time
reservationsRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const unlock = await dbMutex.acquire();
  try {
    const reservation = Database.findReservationById(req.params.id);
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }

    // Only owner or admin can view
    if (req.user!.role !== 'ADMIN' && reservation.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to view this reservation.' });
      return;
    }

    // Check expiration
    const now = Date.now();
    const expiresTime = new Date(reservation.expiresAt).getTime();

    if (reservation.status === 'PENDING' && expiresTime <= now) {
      // Mark expired and restore inventory
      reservation.status = 'EXPIRED';
      reservation.updatedAt = new Date().toISOString();

      for (const item of reservation.items) {
        const ticket = Database.findTicketById(item.ticketTypeId);
        if (ticket) {
          ticket.availableQuantity += item.quantity;
          ticket.reservedQuantity = Math.max(0, ticket.reservedQuantity - item.quantity);
          ticket.updatedAt = new Date().toISOString();
        }
      }
      Database.saveReservation(reservation);
    }

    const event = Database.findEventById(reservation.eventId);
    const remainingSeconds = Math.max(0, Math.floor((expiresTime - now) / 1000));

    res.json({
      reservation: {
        ...reservation,
        remainingSeconds: reservation.status === 'PENDING' ? remainingSeconds : 0,
      },
      event,
    });
  } catch (err: any) {
    console.error('Error fetching reservation:', err);
    res.status(500).json({ error: 'Failed to load reservation.' });
  } finally {
    unlock();
  }
});

// POST /api/reservations/:id/cancel - Explicit user cancellation & inventory release
reservationsRouter.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const unlock = await dbMutex.acquire();
  try {
    const reservation = Database.findReservationById(req.params.id);
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && reservation.userId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to cancel this reservation.' });
      return;
    }

    if (reservation.status !== 'PENDING') {
      res.status(400).json({ error: `Cannot cancel reservation in ${reservation.status} status.` });
      return;
    }

    // Restore inventory
    const now = new Date().toISOString();
    reservation.status = 'CANCELLED';
    reservation.updatedAt = now;

    for (const item of reservation.items) {
      const ticket = Database.findTicketById(item.ticketTypeId);
      if (ticket) {
        ticket.availableQuantity += item.quantity;
        ticket.reservedQuantity = Math.max(0, ticket.reservedQuantity - item.quantity);
        ticket.updatedAt = now;
      }
    }

    Database.saveReservation(reservation);

    res.json({
      message: 'Reservation cancelled and ticket inventory released back to pool.',
      reservation,
    });
  } catch (err: any) {
    console.error('Error cancelling reservation:', err);
    res.status(500).json({ error: 'Failed to cancel reservation.' });
  } finally {
    unlock();
  }
});
