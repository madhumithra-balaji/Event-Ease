import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { DashboardLayout } from './components/DashboardLayout.js';

// Public & Attendee Pages
import { LandingPage } from './pages/LandingPage.js';
import { EventsPage } from './pages/EventsPage.js';
import { EventDetailPage } from './pages/EventDetailPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard.js';
import { ManageEventsPage } from './pages/organizer/ManageEventsPage.js';
import { CreateEventPage } from './pages/organizer/CreateEventPage.js';
import { EditEventPage } from './pages/organizer/EditEventPage.js';
import { EventAttendeesPage } from './pages/organizer/EventAttendeesPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { ManageUsersPage } from './pages/admin/ManageUsersPage.js';
import { ManageOrganizersPage } from './pages/admin/ManageOrganizersPage.js';
import { AdminEventsPage } from './pages/admin/AdminEventsPage.js';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage.js';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public & Attendee Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
                <Route path="/confirmation/:orderId" element={<BookingConfirmationPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />

                {/* Organizer Studio Routes */}
                <Route
                  path="/organizer"
                  element={
                    <DashboardLayout requiredRole="ORGANIZER">
                      <OrganizerDashboard />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/organizer/events"
                  element={
                    <DashboardLayout requiredRole="ORGANIZER">
                      <ManageEventsPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/organizer/events/new"
                  element={
                    <DashboardLayout requiredRole="ORGANIZER">
                      <CreateEventPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/organizer/events/:id/edit"
                  element={
                    <DashboardLayout requiredRole="ORGANIZER">
                      <EditEventPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/organizer/events/:id/attendees"
                  element={
                    <DashboardLayout requiredRole="ORGANIZER">
                      <EventAttendeesPage />
                    </DashboardLayout>
                  }
                />

                {/* Admin Platform Console Routes */}
                <Route
                  path="/admin"
                  element={
                    <DashboardLayout requiredRole="ADMIN">
                      <AdminDashboard />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <DashboardLayout requiredRole="ADMIN">
                      <ManageUsersPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/admin/organizers"
                  element={
                    <DashboardLayout requiredRole="ADMIN">
                      <ManageOrganizersPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <DashboardLayout requiredRole="ADMIN">
                      <AdminEventsPage />
                    </DashboardLayout>
                  }
                />
                <Route
                  path="/admin/transactions"
                  element={
                    <DashboardLayout requiredRole="ADMIN">
                      <AdminTransactionsPage />
                    </DashboardLayout>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
