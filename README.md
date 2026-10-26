# EventEase – Multi-Tenant Event & Ticket Reservation System

EventEase is a production-style, multi-tenant event ticketing and reservation platform engineered for high-concurrency ticket reservations, atomic 10-minute inventory holds, role-based access control, simulated checkout, and real-time organizer analytics.

---

## 1. Key Capabilities & Architecture

- **Multi-Tenant RBAC:**
  - **Admin:** System oversight, platform GMV telemetry, organizer verification/deactivation, user role assignment, and transaction audit trails.
  - **Organizer:** Event studio, multi-tier ticket configuration (VIP, Premium, General Admission, Early Bird), real-time Recharts revenue analytics, attendee gate check-in rosters.
  - **Attendee:** Event discovery, multi-tier ticket selection, temporary 10-minute hold reservation with real-time countdown, simulated payment gateway with idempotency, downloadable digital pass with QR code.
- **Atomic 10-Minute Reservation Hold Engine:**
  - Prevents double-booking through mutex locks and atomic database transactions.
  - Decrements `availableQuantity` and tracks `reservedQuantity` during the hold window.
  - Automatically sweeps and releases expired holds back into the inventory pool every 5 seconds.
  - Supports explicit user cancellation and automated payment-failure inventory rollback.
- **Simulated Payment Gateway & Idempotency:**
  - `POST /api/payments/process` with idempotency token verification.
  - Evaluator simulation modes: Force Success, Force Decline, or Gateway Random.
- **Analytics Dashboards (Recharts):**
  - Revenue trend line chart with area gradient.
  - Ticket sales by event bar chart.
  - Ticket category distribution pie chart.
- **Prisma ORM & PostgreSQL Database Schema:**
  - Normalized relational database models in `prisma/schema.prisma`.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, React Router, Recharts, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express.js REST API architecture, JWT authentication, bcrypt password hashing.
- **Database & Persistence:** Prisma ORM schema, PostgreSQL-compatible relational structure with ACID transaction locks.
- **Background Jobs:** Automated reservation hold expiration worker process.

---

## 3. Demo Credentials

The platform features an **instant 1-click demo switcher** in the top navigation bar and login card, or you can sign in manually:

| Role | Email | Password | Organization / Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eventease.com` | `admin123` | Platform Global Ops |
| **Organizer** | `organizer@techpulse.io` | `organizer123` | TechPulse Summits |
| **Organizer** | `organizer@soundwave.com` | `organizer123` | SoundWave Festivals |
| **Attendee** | `attendee@gmail.com` | `attendee123` | Sarah Chen |

---

## 4. REST API Documentation

### Authentication
- `POST /api/auth/register` – Create Attendee or Organizer account
- `POST /api/auth/login` – Authenticate with email/password
- `GET /api/auth/me` – Fetch authenticated session user
- `POST /api/auth/demo-switch` – Instant demo role switcher

### Events & Tickets
- `GET /api/events` – Browse published events with filters (category, search, sort)
- `GET /api/events/:id` – Event details and active ticket tier quantities
- `POST /api/events` – Create new event (Organizer/Admin)
- `PUT /api/events/:id` – Update event details or publish status
- `DELETE /api/events/:id` – Remove event
- `POST /api/events/:eventId/tickets` – Add ticket tier to event
- `PUT /api/tickets/:ticketId` – Update ticket tier price or capacity
- `DELETE /api/tickets/:ticketId` – Remove ticket tier

### Reservation Engine & Holds
- `POST /api/reservations` – Atomically acquire a 10-minute hold for selected tickets
- `GET /api/reservations/:id` – Check hold status and remaining seconds
- `POST /api/reservations/:id/cancel` – Explicitly release held tickets back into inventory

### Simulated Payments & Orders
- `POST /api/payments/process` – Process simulated payment with idempotency verification
- `GET /api/payments/:id` – View transaction details
- `GET /api/orders/my-orders` – Attendee booking history
- `GET /api/orders/:id` – Digital pass with QR code and print receipt

### Analytics & Administration
- `GET /api/analytics/organizer` – Organizer KPIs and Recharts chart datasets
- `GET /api/analytics/admin` – Platform-wide GMV, users, and ticket volume
- `GET /api/admin/users` – User management and RBAC role reassignment
- `PUT /api/admin/organizers/:id/approve` – Approve or suspend event organizers
- `GET /api/admin/events` – Content moderation across all platform events
- `GET /api/admin/transactions` – Financial ledger audit trail
