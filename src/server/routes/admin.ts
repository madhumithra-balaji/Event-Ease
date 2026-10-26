import { Router, Response } from 'express';
import { Database } from '../db.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth.js';
import { Role } from '../types.js';

export const adminRouter = Router();

// Protect all admin routes
adminRouter.use(requireAuth, requireRole('ADMIN'));

// GET /api/admin/users - List all users
adminRouter.get('/users', (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = Database.getUsers().map((u) => {
      const { passwordHash: _, ...safeUser } = u;
      const eventCount = Database.getEvents().filter((e) => e.organizerId === u.id).length;
      const orderCount = Database.getOrders().filter((o) => o.userId === u.id).length;
      return {
        ...safeUser,
        eventCount,
        orderCount,
      };
    });
    res.json({ users });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PUT /api/admin/users/:id/role - Update user role
adminRouter.put('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!role || !['ADMIN', 'ORGANIZER', 'ATTENDEE'].includes(role)) {
      res.status(400).json({ error: 'Invalid role specified.' });
      return;
    }

    const updated = Database.updateUser(req.params.id, {
      role: role as Role,
      isApproved: true,
    });

    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({ message: 'User role updated successfully.', user: safeUser });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// PUT /api/admin/organizers/:id/approve - Approve or deactivate organizer
adminRouter.put('/organizers/:id/approve', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { isApproved } = req.body;
    const targetUser = Database.findUserById(req.params.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updated = Database.updateUser(targetUser.id, {
      isApproved: Boolean(isApproved),
    });

    const { passwordHash: _, ...safeUser } = updated!;
    res.json({
      message: `Organizer ${isApproved ? 'approved' : 'deactivated'} successfully.`,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Error toggling organizer approval:', err);
    res.status(500).json({ error: 'Failed to update organizer approval status.' });
  }
});

// GET /api/admin/events - List all events platform-wide
adminRouter.get('/events', (req: AuthenticatedRequest, res: Response) => {
  try {
    const events = Database.getEvents().map((e) => {
      const org = Database.findUserById(e.organizerId);
      const tickets = Database.getTicketsByEventId(e.id);
      const totalTickets = tickets.reduce((s, t) => s + t.totalQuantity, 0);
      const availableTickets = tickets.reduce((s, t) => s + t.availableQuantity, 0);
      return {
        ...e,
        organizer: org ? { id: org.id, name: org.name, email: org.email } : null,
        totalTickets,
        availableTickets,
      };
    });
    res.json({ events });
  } catch (err: any) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// GET /api/admin/transactions - All financial transactions platform-wide
adminRouter.get('/transactions', (req: AuthenticatedRequest, res: Response) => {
  try {
    const txns = Database.getTransactions();
    const enriched = txns.map((t) => {
      const order = Database.findOrderById(t.orderId);
      const event = order ? Database.findEventById(order.eventId) : null;
      const user = order ? Database.findUserById(order.userId) : null;
      return {
        ...t,
        orderNumber: order?.orderNumber || 'N/A',
        eventTitle: event?.title || 'Unknown Event',
        customerName: user?.name || order?.attendeeName || 'Customer',
        customerEmail: user?.email || order?.attendeeEmail || '',
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ transactions: enriched });
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});
