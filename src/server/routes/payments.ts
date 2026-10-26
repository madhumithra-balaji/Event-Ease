import { Router, Response } from 'express';
import crypto from 'crypto';
import { Database, dbMutex } from '../db.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { Order, Transaction, PaymentStatus } from '../types.js';

export const paymentsRouter = Router();

// POST /api/payments/process - Simulated payment gateway
paymentsRouter.post('/process', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { reservationId, paymentMethod, idempotencyKey, forceOutcome } = req.body;

  if (!reservationId) {
    res.status(400).json({ error: 'Reservation ID is required.' });
    return;
  }

  // Check idempotency first if key is provided
  if (idempotencyKey) {
    const existing = Database.getIdempotencyRecord(idempotencyKey);
    if (existing) {
      if (existing.status === 'SUCCESS' && existing.orderId) {
        const order = Database.findOrderById(existing.orderId);
        res.json({
          message: 'Payment already processed successfully (Idempotent response).',
          status: 'SUCCESS',
          order,
        });
        return;
      } else if (existing.status === 'PROCESSING') {
        res.status(409).json({ error: 'Payment is already currently being processed for this request.' });
        return;
      }
    }
    // Mark as PROCESSING
    Database.setIdempotencyRecord(idempotencyKey, {
      status: 'PROCESSING',
      createdAt: new Date().toISOString(),
    });
  }

  const unlock = await dbMutex.acquire();
  try {
    const reservation = Database.findReservationById(reservationId);
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found.' });
      return;
    }

    if (reservation.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to process payment for this reservation.' });
      return;
    }

    if (reservation.status === 'CONFIRMED') {
      const existingOrder = Database.getOrders().find((o) => o.reservationId === reservation.id);
      res.json({
        message: 'This reservation is already confirmed and paid.',
        status: 'SUCCESS',
        order: existingOrder,
      });
      return;
    }

    if (reservation.status !== 'PENDING') {
      res.status(400).json({
        error: `Cannot process payment. Reservation is in ${reservation.status} state.`,
      });
      return;
    }

    // Check expiration timestamp
    const now = Date.now();
    const expiresTime = new Date(reservation.expiresAt).getTime();
    if (expiresTime <= now) {
      // Expired! Release inventory immediately
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

      if (idempotencyKey) {
        Database.setIdempotencyRecord(idempotencyKey, {
          status: 'FAILED',
          createdAt: new Date().toISOString(),
        });
      }

      res.status(400).json({
        error: 'Your 10-minute reservation hold has expired. The ticket inventory has been returned to the pool.',
        status: 'EXPIRED',
      });
      return;
    }

    // Determine simulation outcome:
    // If forceOutcome is 'SUCCESS' or 'FAILED', respect it.
    // Otherwise randomly approve (92% success rate for smooth user demo).
    let paymentSuccess = true;
    if (forceOutcome === 'FAILED') {
      paymentSuccess = false;
    } else if (forceOutcome === 'SUCCESS') {
      paymentSuccess = true;
    } else {
      paymentSuccess = Math.random() < 0.92;
    }

    const currentIso = new Date().toISOString();

    if (!paymentSuccess) {
      // Payment Failed: release hold
      reservation.status = 'CANCELLED';
      reservation.updatedAt = currentIso;

      for (const item of reservation.items) {
        const ticket = Database.findTicketById(item.ticketTypeId);
        if (ticket) {
          ticket.availableQuantity += item.quantity;
          ticket.reservedQuantity = Math.max(0, ticket.reservedQuantity - item.quantity);
          ticket.updatedAt = currentIso;
        }
      }
      Database.saveReservation(reservation);

      const failedTxn: Transaction = {
        id: `txn-${crypto.randomUUID().slice(0, 8)}`,
        orderId: 'FAILED',
        paymentReference: `FAIL-REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
        amount: reservation.totalAmount,
        paymentMethod: paymentMethod || 'Card',
        status: 'FAILED',
        createdAt: currentIso,
        updatedAt: currentIso,
      };
      Database.createTransaction(failedTxn);

      if (idempotencyKey) {
        Database.setIdempotencyRecord(idempotencyKey, {
          status: 'FAILED',
          createdAt: currentIso,
        });
      }

      res.status(402).json({
        error: 'Simulated payment was declined by the issuing gateway.',
        status: 'FAILED',
        transaction: failedTxn,
      });
      return;
    }

    // PAYMENT SUCCESS:
    // 1. Mark reservation CONFIRMED
    reservation.status = 'CONFIRMED';
    reservation.updatedAt = currentIso;

    // 2. Clear reserved inventory quantity (sold permanently)
    for (const item of reservation.items) {
      const ticket = Database.findTicketById(item.ticketTypeId);
      if (ticket) {
        ticket.reservedQuantity = Math.max(0, ticket.reservedQuantity - item.quantity);
        ticket.updatedAt = currentIso;
      }
    }
    Database.saveReservation(reservation);

    // 3. Create confirmed Order
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${crypto.randomUUID().slice(0, 8)}`;

    const newOrder: Order = {
      id: orderId,
      userId: req.user!.id,
      reservationId: reservation.id,
      eventId: reservation.eventId,
      orderNumber,
      totalAmount: reservation.totalAmount,
      status: 'CONFIRMED',
      createdAt: currentIso,
      items: reservation.items,
      attendeeName: req.user!.name,
      attendeeEmail: req.user!.email,
    };
    Database.createOrder(newOrder);

    // 4. Create successful Transaction
    const paymentRef = `PAY-REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newTxn: Transaction = {
      id: `txn-${crypto.randomUUID().slice(0, 8)}`,
      orderId: newOrder.id,
      paymentReference: paymentRef,
      amount: reservation.totalAmount,
      paymentMethod: paymentMethod || 'Credit Card (Visa)',
      status: 'SUCCESS',
      createdAt: currentIso,
      updatedAt: currentIso,
    };
    Database.createTransaction(newTxn);

    // 5. Update Idempotency Cache
    if (idempotencyKey) {
      Database.setIdempotencyRecord(idempotencyKey, {
        status: 'SUCCESS',
        orderId: newOrder.id,
        createdAt: currentIso,
      });
    }

    res.json({
      message: 'Payment simulated successfully. Booking confirmed!',
      status: 'SUCCESS',
      order: newOrder,
      transaction: newTxn,
    });
  } catch (err: any) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Internal payment simulation error.' });
  } finally {
    unlock();
  }
});

// GET /api/payments/:id - Transaction detail
paymentsRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const txn = Database.getTransactions().find((t) => t.id === req.params.id);
    if (!txn) {
      res.status(404).json({ error: 'Transaction not found.' });
      return;
    }
    res.json({ transaction: txn });
  } catch (err: any) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction.' });
  }
});
