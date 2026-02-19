'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  X,
  Calendar,
  Home,
  User,
  LayoutDashboard,
  Users,
  LogOut,
  Trophy,
  Coins,
  QrCode,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signout();
    setMobileMenuOpen(false);
    router.push('/signin');
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const navLinks = [
    { href: '/events', label: 'Events', icon: Calendar, show: true },
    {
      href: '/events/calendar',
      label: 'Calendar',
      icon: Calendar,
      show: !!user,
    },
    {
      href:
        user?.role === 'student'
          ? '/student/dashboard'
          : '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show:
        user &&
        (user.role === 'student' ||
          user.role === 'organizer' ||
          user.role === 'admin'),
    },
    {
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      show: !!user,
    },
    { href: '/store', label: 'Store', icon: Coins, show: !!user },
    { href: '/scanner', label: 'Scan', icon: QrCode, show: !!user },
    { href: '/profile', label: 'Profile', icon: User, show: !!user },
  ].filter((link) => link.show);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-pfw-gold rounded-xl flex items-center justify-center group-hover:bg-gold-dark transition-colors shadow-md">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-black">
              Campus Pulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-pfw-gold text-black shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden xl:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell user={user} />
                <button
                  onClick={handleSignOut}
                  data-testid="sign-out-button"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/signin')}
                  className="rounded-lg text-gray-700 hover:bg-gray-100 hover:text-black px-5">
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/signup')}
                  className="rounded-lg bg-pfw-gold hover:bg-gold-dark text-black shadow-md transition-all px-5">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-pfw-gold text-black shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Link href="/profile">
                    <div className="px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl">
                      Signed in as{' '}
                      <span className="font-semibold text-black">
                        {user.name}
                      </span>
                    </div>
                  </Link>
                  <button
                    data-testid="sign-out-button-mobile"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                    onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-black"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/signin');
                    }}>
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center rounded-full bg-pfw-gold hover:bg-gold-dark text-black shadow-md"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/signup');
                    }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-pfw-gold rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pfw-gold to-gold-dark bg-clip-text text-transparent">
                Campus Pulse
              </span>
            </div>
            <p className="text-gray-600 text-sm max-w-md leading-relaxed">
              Your one-stop platform for discovering, organizing, and
              attending campus events. Connect with your community and
              never miss out on what's happening around you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-black mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-gray-600 hover:text-pfw-gold text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-pfw-gold rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events/calendar"
                  className="text-gray-600 hover:text-pfw-gold text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Event Calendar
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-gray-600 hover:text-pfw-gold text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-black mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-600 text-sm">
                  Purdue Fort Wayne
                </span>
              </li>
              <li>
                <span className="text-gray-600 text-sm">
                  Campus Events Platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Campus Pulse. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
