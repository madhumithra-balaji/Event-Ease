import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Event,
  TicketType,
  Reservation,
  ReservationItem,
  Order,
  Transaction,
} from './types.js';

interface DatabaseSchema {
  users: User[];
  events: Event[];
  ticketTypes: TicketType[];
  reservations: Reservation[];
  orders: Order[];
  transactions: Transaction[];
  processedIdempotencyKeys: { [key: string]: { status: string; orderId?: string; createdAt: string } };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Memory state
let db: DatabaseSchema = {
  users: [],
  events: [],
  ticketTypes: [],
  reservations: [],
  orders: [],
  transactions: [],
  processedIdempotencyKeys: {},
};

// Concurrency mutex lock for atomic reservation and payment ops
class AsyncMutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift()!;
          next();
        } else {
          this.locked = false;
        }
      };

      if (this.locked) {
        this.queue.push(() => resolve(release));
      } else {
        this.locked = true;
        resolve(release);
      }
    });
  }
}

export const dbMutex = new AsyncMutex();

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

function generateInitialSeedData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const organizerPasswordHash = bcrypt.hashSync('organizer123', 10);
  const attendeePasswordHash = bcrypt.hashSync('attendee123', 10);

  const users: User[] = [
    {
      id: 'user-admin-1',
      name: 'Alexander Wright',
      email: 'admin@eventease.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isApproved: true,
      organizationName: 'EventEase Global Ops',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'user-org-1',
      name: 'Elena Rostova',
      email: 'organizer@techpulse.io',
      passwordHash: organizerPasswordHash,
      role: 'ORGANIZER',
      isApproved: true,
      organizationName: 'TechPulse Summits',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-02-15T10:00:00.000Z',
      updatedAt: '2026-02-15T10:00:00.000Z',
    },
    {
      id: 'user-org-2',
      name: 'Marcus Sterling',
      email: 'organizer@soundwave.com',
      passwordHash: organizerPasswordHash,
      role: 'ORGANIZER',
      isApproved: true,
      organizationName: 'SoundWave Festivals',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-03-01T12:00:00.000Z',
      updatedAt: '2026-03-01T12:00:00.000Z',
    },
    {
      id: 'user-org-3',
      name: 'Chloe Dubois',
      email: 'organizer@gourmetguild.com',
      passwordHash: organizerPasswordHash,
      role: 'ORGANIZER',
      isApproved: false, // Pending approval for admin testing
      organizationName: 'Gourmet Guild International',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-10-20T09:00:00.000Z',
      updatedAt: '2026-10-20T09:00:00.000Z',
    },
    {
      id: 'user-att-1',
      name: 'Sarah Chen',
      email: 'attendee@gmail.com',
      passwordHash: attendeePasswordHash,
      role: 'ATTENDEE',
      isApproved: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-05-10T14:30:00.000Z',
      updatedAt: '2026-05-10T14:30:00.000Z',
    },
    {
      id: 'user-att-2',
      name: 'David Kim',
      email: 'david.kim@example.com',
      passwordHash: attendeePasswordHash,
      role: 'ATTENDEE',
      isApproved: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      createdAt: '2026-06-01T11:00:00.000Z',
      updatedAt: '2026-06-01T11:00:00.000Z',
    },
  ];

  const events: Event[] = [
    {
      id: 'evt-101',
      organizerId: 'user-org-1',
      title: 'Global AI & Cloud Architecture Summit 2026',
      description: 'The premier conference uniting founders, cloud architects, and machine learning researchers. Features keynotes on quantum computing, frontier generative models, high-performance distributed systems, and real-time inference at scale.',
      category: 'Technology',
      venue: 'Moscone Convention Center, San Francisco, CA',
      eventDate: '2026-11-18T09:00:00.000Z',
      salesCutoffDate: '2026-11-17T23:59:59.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: true,
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'evt-102',
      organizerId: 'user-org-2',
      title: 'Neon Horizon: Electronic & Ambient Music Festival',
      description: 'Three stages, 40 international artists, mind-bending holographic laser installations, and experiential spatial sound. An unforgettable 48-hour journey celebrating underground techno, synthwave, and cinematic ambient.',
      category: 'Music',
      venue: 'Waterfront Amphitheater, Austin, TX',
      eventDate: '2026-11-28T16:00:00.000Z',
      salesCutoffDate: '2026-11-28T12:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: true,
      createdAt: '2026-08-15T12:00:00.000Z',
      updatedAt: '2026-08-15T12:00:00.000Z',
    },
    {
      id: 'evt-103',
      organizerId: 'user-org-1',
      title: 'NextGen Fintech & Decentralized Commerce Forum',
      description: 'Discover the future of cross-border settlements, programmable assets, algorithmic treasury management, and high-frequency real-time financial networks. Connect with top venture capitalists and regulatory leaders.',
      category: 'Business',
      venue: 'Metropolitan Pavilion, New York, NY',
      eventDate: '2026-12-05T08:30:00.000Z',
      salesCutoffDate: '2026-12-04T22:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: true,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'evt-104',
      organizerId: 'user-org-2',
      title: 'Artisanal Harvest Wine & Culinary Grand Tasting',
      description: 'Indulge in masterclasses led by Michelin-starred chefs, biodynamic winemaker pairings, private cellaring tastings, and farm-to-table delicacies from celebrated California valleys.',
      category: 'Food & Wine',
      venue: 'Silverado Vineyards, Napa Valley, CA',
      eventDate: '2026-12-12T13:00:00.000Z',
      salesCutoffDate: '2026-12-11T20:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: false,
      createdAt: '2026-09-10T14:00:00.000Z',
      updatedAt: '2026-09-10T14:00:00.000Z',
    },
    {
      id: 'evt-105',
      organizerId: 'user-org-1',
      title: 'CyberSecurity Defense & Zero-Trust Expo 2026',
      description: 'Hands-on red team vs blue team simulations, hardware exploitation labs, zero-trust cloud network defense architecture, and threat intelligence workshops.',
      category: 'Technology',
      venue: 'Seattle Convention Center, Seattle, WA',
      eventDate: '2026-12-20T09:00:00.000Z',
      salesCutoffDate: '2026-12-19T18:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: false,
      createdAt: '2026-09-20T11:00:00.000Z',
      updatedAt: '2026-09-20T11:00:00.000Z',
    },
    {
      id: 'evt-106',
      organizerId: 'user-org-2',
      title: 'Acoustic Candlelight Sessions: Winter Symphony',
      description: 'An intimate classical and contemporary quartet performance under 5,000 candles inside a historic cathedral. Featuring re-imagined works of Hans Zimmer, Ludovico Einaudi, and Max Richter.',
      category: 'Music',
      venue: 'St. Paul Historic Sanctuary, Chicago, IL',
      eventDate: '2026-12-24T19:30:00.000Z',
      salesCutoffDate: '2026-12-24T15:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
      status: 'PUBLISHED',
      featured: false,
      createdAt: '2026-09-25T16:00:00.000Z',
      updatedAt: '2026-09-25T16:00:00.000Z',
    },
    {
      id: 'evt-107',
      organizerId: 'user-org-1',
      title: 'Quantum Computing Developer Sandbox (Draft)',
      description: 'Internal workshop on Qiskit and quantum algorithms for optimization problems.',
      category: 'Technology',
      venue: 'Virtual Room Beta',
      eventDate: '2027-01-15T10:00:00.000Z',
      salesCutoffDate: '2027-01-14T23:59:59.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
      status: 'DRAFT',
      featured: false,
      createdAt: '2026-10-01T12:00:00.000Z',
      updatedAt: '2026-10-01T12:00:00.000Z',
    },
  ];

  const ticketTypes: TicketType[] = [
    // Summit 2026
    {
      id: 'tkt-101-ga',
      eventId: 'evt-101',
      name: 'General Admission',
      price: 299,
      totalQuantity: 250,
      availableQuantity: 182,
      reservedQuantity: 0,
      description: 'Access to all main stage keynotes, exhibition hall, and networking lounge.',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'tkt-101-vip',
      eventId: 'evt-101',
      name: 'VIP Executive Pass',
      price: 799,
      totalQuantity: 60,
      availableQuantity: 38,
      reservedQuantity: 0,
      description: 'Front-row seating, private speaker dinner, backstage lounge, and 1-on-1 advisor sessions.',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },
    {
      id: 'tkt-101-prem',
      eventId: 'evt-101',
      name: 'Workshop & Lab Pass',
      price: 499,
      totalQuantity: 80,
      availableQuantity: 54,
      reservedQuantity: 0,
      description: 'General admission plus access to 4 specialized hands-on architectural code labs.',
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-01T10:00:00.000Z',
    },

    // Neon Horizon
    {
      id: 'tkt-102-ga',
      eventId: 'evt-102',
      name: 'Weekend General Admission',
      price: 145,
      totalQuantity: 500,
      availableQuantity: 340,
      reservedQuantity: 0,
      description: 'Full 2-day pass with entry to all three outdoor stages.',
      createdAt: '2026-08-15T12:00:00.000Z',
      updatedAt: '2026-08-15T12:00:00.000Z',
    },
    {
      id: 'tkt-102-vip',
      eventId: 'evt-102',
      name: 'Ultra VIP Backstage Lounge',
      price: 395,
      totalQuantity: 75,
      availableQuantity: 42,
      reservedQuantity: 0,
      description: 'Fast-track entry, elevated viewing deck, complimentary craft bar, and luxury restrooms.',
      createdAt: '2026-08-15T12:00:00.000Z',
      updatedAt: '2026-08-15T12:00:00.000Z',
    },

    // Fintech
    {
      id: 'tkt-103-ga',
      eventId: 'evt-103',
      name: 'Standard Delegate',
      price: 350,
      totalQuantity: 200,
      availableQuantity: 156,
      reservedQuantity: 0,
      description: 'Full conference access, breakfast buffet, and digital deck downloads.',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },
    {
      id: 'tkt-103-inv',
      eventId: 'evt-103',
      name: 'Investor & Founder Matchmaking',
      price: 850,
      totalQuantity: 40,
      availableQuantity: 26,
      reservedQuantity: 0,
      description: 'Curated 1-on-1 pitch sessions with institutional venture capital partners.',
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    },

    // Wine Tasting
    {
      id: 'tkt-104-ga',
      eventId: 'evt-104',
      name: 'Tasting Pass',
      price: 120,
      totalQuantity: 150,
      availableQuantity: 95,
      reservedQuantity: 0,
      description: 'Souvenir crystal glass and 15 wine tasting tokens + artisan charcuterie.',
      createdAt: '2026-09-10T14:00:00.000Z',
      updatedAt: '2026-09-10T14:00:00.000Z',
    },
    {
      id: 'tkt-104-reserve',
      eventId: 'evt-104',
      name: 'Reserve Cellar & Sommelier Masterclass',
      price: 260,
      totalQuantity: 30,
      availableQuantity: 12,
      reservedQuantity: 0,
      description: 'Private barrel room tasting of 20-year library vintages led by Master Sommeliers.',
      createdAt: '2026-09-10T14:00:00.000Z',
      updatedAt: '2026-09-10T14:00:00.000Z',
    },

    // CyberSec
    {
      id: 'tkt-105-ga',
      eventId: 'evt-105',
      name: 'Standard Practitioner',
      price: 280,
      totalQuantity: 180,
      availableQuantity: 130,
      reservedQuantity: 0,
      description: 'Access to track sessions, keynotes, and vendor exhibits.',
      createdAt: '2026-09-20T11:00:00.000Z',
      updatedAt: '2026-09-20T11:00:00.000Z',
    },
    {
      id: 'tkt-105-lab',
      eventId: 'evt-105',
      name: 'CTF War Room + Ticket',
      price: 450,
      totalQuantity: 50,
      availableQuantity: 32,
      reservedQuantity: 0,
      description: 'Full conference plus entry into the 8-hour live target Capture The Flag hackathon.',
      createdAt: '2026-09-20T11:00:00.000Z',
      updatedAt: '2026-09-20T11:00:00.000Z',
    },

    // Candlelight
    {
      id: 'tkt-106-ga',
      eventId: 'evt-106',
      name: 'Zone B Sanctuary Seating',
      price: 65,
      totalQuantity: 120,
      availableQuantity: 74,
      reservedQuantity: 0,
      description: 'Great acoustics in the mid-nave section of the cathedral.',
      createdAt: '2026-09-25T16:00:00.000Z',
      updatedAt: '2026-09-25T16:00:00.000Z',
    },
    {
      id: 'tkt-106-front',
      eventId: 'evt-106',
      name: 'Zone A Front Candlelight Circle',
      price: 95,
      totalQuantity: 40,
      availableQuantity: 18,
      reservedQuantity: 0,
      description: 'Direct proximity to the musicians within the glowing candlelight perimeter.',
      createdAt: '2026-09-25T16:00:00.000Z',
      updatedAt: '2026-09-25T16:00:00.000Z',
    },
  ];

  // Seed sample confirmed orders and transactions for rich analytics from the start
  const orders: Order[] = [
    {
      id: 'ord-1001',
      userId: 'user-att-1',
      reservationId: 'res-seed-1',
      eventId: 'evt-101',
      orderNumber: 'ORD-2026-8812',
      totalAmount: 1098,
      status: 'CONFIRMED',
      createdAt: '2026-10-12T14:20:00.000Z',
      attendeeName: 'Sarah Chen',
      attendeeEmail: 'attendee@gmail.com',
      items: [
        {
          id: 'item-seed-1',
          reservationId: 'res-seed-1',
          ticketTypeId: 'tkt-101-ga',
          ticketTypeName: 'General Admission',
          quantity: 1,
          unitPrice: 299,
        },
        {
          id: 'item-seed-2',
          reservationId: 'res-seed-1',
          ticketTypeId: 'tkt-101-vip',
          ticketTypeName: 'VIP Executive Pass',
          quantity: 1,
          unitPrice: 799,
        },
      ],
    },
    {
      id: 'ord-1002',
      userId: 'user-att-2',
      reservationId: 'res-seed-2',
      eventId: 'evt-102',
      orderNumber: 'ORD-2026-4439',
      totalAmount: 540,
      status: 'CONFIRMED',
      createdAt: '2026-10-18T16:45:00.000Z',
      attendeeName: 'David Kim',
      attendeeEmail: 'david.kim@example.com',
      items: [
        {
          id: 'item-seed-3',
          reservationId: 'res-seed-2',
          ticketTypeId: 'tkt-102-vip',
          ticketTypeName: 'Ultra VIP Backstage Lounge',
          quantity: 1,
          unitPrice: 395,
        },
        {
          id: 'item-seed-4',
          reservationId: 'res-seed-2',
          ticketTypeId: 'tkt-102-ga',
          ticketTypeName: 'Weekend General Admission',
          quantity: 1,
          unitPrice: 145,
        },
      ],
    },
    {
      id: 'ord-1003',
      userId: 'user-att-1',
      reservationId: 'res-seed-3',
      eventId: 'evt-104',
      orderNumber: 'ORD-2026-9051',
      totalAmount: 380,
      status: 'CONFIRMED',
      createdAt: '2026-10-22T19:10:00.000Z',
      attendeeName: 'Sarah Chen',
      attendeeEmail: 'attendee@gmail.com',
      items: [
        {
          id: 'item-seed-5',
          reservationId: 'res-seed-3',
          ticketTypeId: 'tkt-104-ga',
          ticketTypeName: 'Tasting Pass',
          quantity: 1,
          unitPrice: 120,
        },
        {
          id: 'item-seed-6',
          reservationId: 'res-seed-3',
          ticketTypeId: 'tkt-104-reserve',
          ticketTypeName: 'Reserve Cellar & Sommelier Masterclass',
          quantity: 1,
          unitPrice: 260,
        },
      ],
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'txn-1001',
      orderId: 'ord-1001',
      paymentReference: 'PAY-REF-99281742',
      amount: 1098,
      paymentMethod: 'Credit Card (Visa)',
      status: 'SUCCESS',
      createdAt: '2026-10-12T14:21:00.000Z',
      updatedAt: '2026-10-12T14:21:00.000Z',
    },
    {
      id: 'txn-1002',
      orderId: 'ord-1002',
      paymentReference: 'PAY-REF-44109283',
      amount: 540,
      paymentMethod: 'Apple Pay',
      status: 'SUCCESS',
      createdAt: '2026-10-18T16:46:00.000Z',
      updatedAt: '2026-10-18T16:46:00.000Z',
    },
    {
      id: 'txn-1003',
      orderId: 'ord-1003',
      paymentReference: 'PAY-REF-18274620',
      amount: 380,
      paymentMethod: 'Credit Card (Mastercard)',
      status: 'SUCCESS',
      createdAt: '2026-10-22T19:11:00.000Z',
      updatedAt: '2026-10-22T19:11:00.000Z',
    },
  ];

  return {
    users,
    events,
    ticketTypes,
    reservations: [],
    orders,
    transactions,
    processedIdempotencyKeys: {},
  };
}

export function initDatabase(): void {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(raw);
      // Ensure all collections exist
      if (!db.users) db.users = [];
      if (!db.events) db.events = [];
      if (!db.ticketTypes) db.ticketTypes = [];
      if (!db.reservations) db.reservations = [];
      if (!db.orders) db.orders = [];
      if (!db.transactions) db.transactions = [];
      if (!db.processedIdempotencyKeys) db.processedIdempotencyKeys = {};
      console.log('Loaded EventEase database from file with', db.events.length, 'events and', db.users.length, 'users');
    } else {
      console.log('Initializing fresh EventEase seed data...');
      db = generateInitialSeedData();
      saveDatabase();
    }
  } catch (err) {
    console.warn('Error reading db file, regenerating seed data:', err);
    db = generateInitialSeedData();
    saveDatabase();
  }
}

// Database helper functions
export const Database = {
  // Persistence
  save: saveDatabase,

  // Users
  getUsers: () => db.users,
  findUserById: (id: string) => db.users.find((u) => u.id === id),
  findUserByEmail: (email: string) => db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User) => {
    db.users.push(user);
    saveDatabase();
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDatabase();
    return db.users[idx];
  },

  // Events
  getEvents: () => db.events,
  findEventById: (id: string) => db.events.find((e) => e.id === id),
  createEvent: (event: Event) => {
    db.events.push(event);
    saveDatabase();
    return event;
  },
  updateEvent: (id: string, updates: Partial<Event>) => {
    const idx = db.events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    db.events[idx] = { ...db.events[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDatabase();
    return db.events[idx];
  },
  deleteEvent: (id: string) => {
    const idx = db.events.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    db.events.splice(idx, 1);
    // Also remove tickets for this event
    db.ticketTypes = db.ticketTypes.filter((t) => t.eventId !== id);
    saveDatabase();
    return true;
  },

  // Tickets
  getTicketsByEventId: (eventId: string) => db.ticketTypes.filter((t) => t.eventId === eventId),
  findTicketById: (id: string) => db.ticketTypes.find((t) => t.id === id),
  createTicket: (ticket: TicketType) => {
    db.ticketTypes.push(ticket);
    saveDatabase();
    return ticket;
  },
  updateTicket: (id: string, updates: Partial<TicketType>) => {
    const idx = db.ticketTypes.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    db.ticketTypes[idx] = { ...db.ticketTypes[idx], ...updates, updatedAt: new Date().toISOString() };
    saveDatabase();
    return db.ticketTypes[idx];
  },
  deleteTicket: (id: string) => {
    const idx = db.ticketTypes.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    db.ticketTypes.splice(idx, 1);
    saveDatabase();
    return true;
  },

  // Reservations
  getReservations: () => db.reservations,
  findReservationById: (id: string) => db.reservations.find((r) => r.id === id),
  findReservationsByUserId: (userId: string) => db.reservations.filter((r) => r.userId === userId),
  saveReservation: (reservation: Reservation) => {
    const idx = db.reservations.findIndex((r) => r.id === reservation.id);
    if (idx === -1) {
      db.reservations.push(reservation);
    } else {
      db.reservations[idx] = reservation;
    }
    saveDatabase();
    return reservation;
  },

  // Orders
  getOrders: () => db.orders,
  findOrderById: (id: string) => db.orders.find((o) => o.id === id),
  findOrdersByUserId: (userId: string) => db.orders.filter((o) => o.userId === userId),
  createOrder: (order: Order) => {
    db.orders.push(order);
    saveDatabase();
    return order;
  },

  // Transactions
  getTransactions: () => db.transactions,
  createTransaction: (txn: Transaction) => {
    db.transactions.push(txn);
    saveDatabase();
    return txn;
  },
  findTransactionsByOrderId: (orderId: string) => db.transactions.filter((t) => t.orderId === orderId),

  // Idempotency
  getIdempotencyRecord: (key: string) => db.processedIdempotencyKeys[key],
  setIdempotencyRecord: (key: string, data: { status: string; orderId?: string; createdAt: string }) => {
    db.processedIdempotencyKeys[key] = data;
    saveDatabase();
  },

  // Release expired holds (Background worker logic)
  releaseExpiredHolds: () => {
    const now = new Date().toISOString();
    let releasedCount = 0;

    for (const res of db.reservations) {
      if (res.status === 'PENDING' && res.expiresAt < now) {
        // Expired! Restore tickets
        res.status = 'EXPIRED';
        res.updatedAt = now;

        for (const item of res.items) {
          const tkt = db.ticketTypes.find((t) => t.id === item.ticketTypeId);
          if (tkt) {
            tkt.availableQuantity += item.quantity;
            tkt.reservedQuantity = Math.max(0, tkt.reservedQuantity - item.quantity);
            tkt.updatedAt = now;
          }
        }
        releasedCount++;
      }
    }

    if (releasedCount > 0) {
      saveDatabase();
      console.log(`[ExpirationWorker] Released ${releasedCount} expired ticket reservations`);
    }

    return releasedCount;
  },
};
