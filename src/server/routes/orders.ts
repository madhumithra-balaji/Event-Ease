import { Router, Response } from 'express';
import { Database } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

// GET /api/orders/my-orders - Attendee booking history
ordersRouter.get('/my-orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = Database.findOrdersByUserId(req.user!.id);

    // Enrich with event info
    const enrichedOrders = orders.map((order) => {
      const event = Database.findEventById(order.eventId);
      const txns = Database.findTransactionsByOrderId(order.id);
      return {
        ...order,
        event: event
          ? {
              id: event.id,
              title: event.title,
              venue: event.venue,
              eventDate: event.eventDate,
              bannerUrl: event.bannerUrl,
              category: event.category,
            }
          : null,
        transaction: txns[0] || null,
      };
    });

    // Sort newest first
    enrichedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ orders: enrichedOrders });
  } catch (err: any) {
    console.error('Error fetching my-orders:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/orders/:id - Specific order details (ticket pass)
ordersRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = Database.findOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const event = Database.findEventById(order.eventId);
    // Role check: owner, organizer of the event, or admin
    const isOwner = order.userId === req.user!.id;
    const isEventOrganizer = event && event.organizerId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isEventOrganizer && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized to view this order.' });
      return;
    }

    const txns = Database.findTransactionsByOrderId(order.id);
    const user = Database.findUserById(order.userId);

    res.json({
      order: {
        ...order,
        attendeeName: user?.name || order.attendeeName,
        attendeeEmail: user?.email || order.attendeeEmail,
      },
      event,
      transaction: txns[0] || null,
    });
  } catch (err: any) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to load order.' });
  }
});
