import { Router, Response } from 'express';
import crypto from 'crypto';
import { Database } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { TicketType } from '../types.js';

export const ticketsRouter = Router();

// Add ticket tier to event
ticketsRouter.post('/events/:eventId/tickets', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = Database.findEventById(eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && event.organizerId !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to add tickets to this event.' });
      return;
    }

    const { name, price, totalQuantity, description } = req.body;
    if (!name || price === undefined || !totalQuantity) {
      res.status(400).json({ error: 'Name, price, and total quantity are required.' });
      return;
    }

    const quantity = parseInt(totalQuantity, 10);
    const now = new Date().toISOString();

    const ticket: TicketType = {
      id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
      eventId,
      name: name.trim(),
      price: parseFloat(price),
      totalQuantity: quantity,
      availableQuantity: quantity,
      reservedQuantity: 0,
      description: description?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    Database.createTicket(ticket);
    res.status(201).json({ message: 'Ticket tier created successfully.', ticket });
  } catch (err: any) {
    console.error('Error creating ticket tier:', err);
    res.status(500).json({ error: 'Failed to create ticket tier.' });
  }
});

// Update ticket tier
ticketsRouter.put('/tickets/:ticketId', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = Database.findTicketById(req.params.ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket tier not found.' });
      return;
    }

    const event = Database.findEventById(ticket.eventId);
    if (!event || (req.user!.role !== 'ADMIN' && event.organizerId !== req.user!.id)) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    const { name, price, totalQuantity, description } = req.body;
    let newTotal = ticket.totalQuantity;
    let newAvailable = ticket.availableQuantity;

    if (totalQuantity !== undefined) {
      const parsedTotal = parseInt(totalQuantity, 10);
      const diff = parsedTotal - ticket.totalQuantity;
      newTotal = parsedTotal;
      newAvailable = Math.max(0, ticket.availableQuantity + diff);
    }

    const updated = Database.updateTicket(ticket.id, {
      ...(name && { name: name.trim() }),
      ...(price !== undefined && { price: parseFloat(price) }),
      totalQuantity: newTotal,
      availableQuantity: newAvailable,
      ...(description !== undefined && { description: description.trim() }),
    });

    res.json({ message: 'Ticket updated successfully.', ticket: updated });
  } catch (err: any) {
    console.error('Error updating ticket tier:', err);
    res.status(500).json({ error: 'Failed to update ticket tier.' });
  }
});

// Delete ticket tier
ticketsRouter.delete('/tickets/:ticketId', requireAuth, requireRole('ORGANIZER', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket = Database.findTicketById(req.params.ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket tier not found.' });
      return;
    }

    const event = Database.findEventById(ticket.eventId);
    if (!event || (req.user!.role !== 'ADMIN' && event.organizerId !== req.user!.id)) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    // Check if tickets are currently reserved
    if (ticket.reservedQuantity > 0) {
      res.status(400).json({
        error: 'Cannot delete ticket tier while active reservations hold this ticket.',
      });
      return;
    }

    Database.deleteTicket(ticket.id);
    res.json({ message: 'Ticket tier deleted successfully.' });
  } catch (err: any) {
    console.error('Error deleting ticket tier:', err);
    res.status(500).json({ error: 'Failed to delete ticket tier.' });
  }
});
