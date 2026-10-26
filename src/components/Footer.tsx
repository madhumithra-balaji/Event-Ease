import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ShieldCheck, Zap, Lock, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                <Ticket className="w-4 h-4 -rotate-12" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Event<span className="text-indigo-400">Ease</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enterprise multi-tenant event management and high-concurrency ticket reservation platform with guaranteed atomic inventory holds.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                ACID Concurrency
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                10-Min Reservation Holds
              </span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Event Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/events?category=Technology" className="hover:text-indigo-400 transition-colors">
                  Technology & Cloud Summits
                </Link>
              </li>
              <li>
                <Link to="/events?category=Music" className="hover:text-indigo-400 transition-colors">
                  Concerts & Electronic Festivals
                </Link>
              </li>
              <li>
                <Link to="/events?category=Business" className="hover:text-indigo-400 transition-colors">
                  Fintech & Venture Forums
                </Link>
              </li>
              <li>
                <Link to="/events?category=Food%20%26%20Wine" className="hover:text-indigo-400 transition-colors">
                  Food & Culinary Tastings
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizers */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              For Organizers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/organizer/events/new" className="hover:text-indigo-400 transition-colors">
                  Create & Publish Event
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-indigo-400 transition-colors">
                  Revenue Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link to="/organizer/events" className="hover:text-indigo-400 transition-colors">
                  Ticket Tier Management
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Automatic Hold Release Worker</span>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Architecture & Security
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Role-Based Access Control (RBAC)
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Double-Booking Concurrency Lock
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Simulated Payment Idempotency
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Prisma ORM Normalized Schema
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EventEase Multi-Tenant Ticketing. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high reliability, zero double-booking, and real-time organizer analytics.
          </p>
        </div>
      </div>
    </footer>
  );
}
