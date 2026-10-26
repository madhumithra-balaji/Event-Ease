export type Role = 'ADMIN' | 'ORGANIZER' | 'ATTENDEE';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export type OrderStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isApproved: boolean;
  avatarUrl?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  eventDate: string;
  salesCutoffDate: string;
  bannerUrl: string;
  status: EventStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationItem {
  id: string;
  reservationId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: number;
}

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  status: ReservationStatus;
  expiresAt: string;
  totalAmount: number;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  items: ReservationItem[];
}

export interface Order {
  id: string;
  userId: string;
  reservationId: string;
  eventId: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: ReservationItem[];
  attendeeName?: string;
  attendeeEmail?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  paymentReference: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}
