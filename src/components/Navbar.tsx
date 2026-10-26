import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Ticket,
  Search,
  PlusCircle,
  Calendar,
  Shield,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function Navbar() {
  const { user, role, isAuthenticated, logout, quickSwitchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleDemoSwitch = async (targetRole: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE') => {
    setDemoMenuOpen(false);
    await quickSwitchDemoRole(targetRole);
    if (targetRole === 'ADMIN') navigate('/admin');
    else if (targetRole === 'ORGANIZER') navigate('/organizer');
    else navigate('/events');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top micro-bar for quick demo role switching */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-300">Live Multi-Tenant Reservation Engine</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Atomic 10-min inventory holds & background expiration</span>
        </div>

        {/* Demo Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Switch Demo Role:</span>
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => handleDemoSwitch('ATTENDEE')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'ATTENDEE'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Attendee
            </button>
            <button
              onClick={() => handleDemoSwitch('ORGANIZER')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'ORGANIZER'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Organizer
            </button>
            <button
              onClick={() => handleDemoSwitch('ADMIN')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                role === 'ADMIN'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                Event<span className="text-indigo-600">Ease</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-1">
                Multi-Tenant Ticketing
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concerts, tech summits, food festivals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/events"
              className={`hover:text-indigo-600 transition-colors ${
                location.pathname === '/events' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Explore Events
            </Link>

            {role === 'ORGANIZER' && (
              <Link
                to="/organizer/events/new"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            )}

            {role === 'ATTENDEE' && isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`flex items-center gap-1.5 hover:text-indigo-600 transition-colors ${
                  location.pathname === '/my-bookings' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            )}

            {role === 'ORGANIZER' && (
              <Link
                to="/organizer"
                className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Organizer Studio</span>
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 font-medium"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <img
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-100"
                  />
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
                    <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    {role === 'ORGANIZER' && (
                      <>
                        <Link
                          to="/organizer"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                          <span>Organizer Dashboard</span>
                        </Link>
                        <Link
                          to="/organizer/events"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span>Manage Events</span>
                        </Link>
                      </>
                    )}

                    {role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Platform Console</span>
                      </Link>
                    )}

                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Ticket className="w-4 h-4 text-emerald-500" />
                      <span>My Ticket Orders</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200"
              />
            </form>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-700"
            >
              Explore Events
            </Link>
            {role === 'ORGANIZER' && (
              <Link
                to="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-sm font-medium text-indigo-600"
              >
                Organizer Studio
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 text-sm font-medium text-purple-700"
              >
                Admin Console
              </Link>
            )}
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-sm font-medium text-slate-700"
            >
              My Bookings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
