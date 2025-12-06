'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Clock } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { DashboardStats } from '@/components/student/DashboardStats';
import { DashboardEventCard } from '@/components/student/DashboardEventCard';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    try {
      const token = getToken();

      // Fetch user's RSVPs
      const rsvpResponse = await fetch(`${API_URL}/api/rsvp/my-rsvps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rsvpResponse.ok) {
        const rsvpData = await rsvpResponse.json();
        setRsvps(rsvpData);
      }

      // Fetch all events for recommendations
      const eventsResponse = await fetch(`${API_URL}/api/events`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setAllEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return 'past';
    } else if (now >= start && (!end || now <= end)) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  };

  const formatEventDate = (startDate) => {
    if (!startDate) return 'Date TBA';
    const date = new Date(startDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const upcomingRsvps = rsvps
    .filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'upcoming'
    )
    .slice(0, 3);

  const recommendedEvents = allEvents
    .filter((event) => {
      // Filter out events user has already RSVP'd to
      const hasRsvp = rsvps.some((rsvp) => rsvp.eventId === event.id);
      const status = getEventStatus(event.startDate, event.endDate);
      const isFull = event.capacity && event.attendeeCount >= event.capacity;
      return !hasRsvp && status === 'upcoming' && !isFull;
    })
    .slice(0, 6);

  const stats = {
    totalRsvps: rsvps.length,
    upcomingEvents: rsvps.filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'upcoming'
    ).length,
    pastEvents: rsvps.filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'past'
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}!
          </p>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Upcoming Events */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Upcoming Events
            </h3>
            <Link href="/student/my-events">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {upcomingRsvps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No upcoming events. Browse events to RSVP!
                </p>
                <Link href="/events">
                  <Button>Browse Events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingRsvps.map((rsvp) => (
                <DashboardEventCard
                  key={rsvp.id}
                  event={rsvp.event}
                  formatDate={formatEventDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommended Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recommended Events
            </h3>
            <Link href="/events">
              <Button variant="outline" size="sm">
                Browse All
              </Button>
            </Link>
          </div>

          {recommendedEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No recommended events at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <DashboardEventCard
                  key={event.id}
                  event={event}
                  formatDate={formatEventDate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
