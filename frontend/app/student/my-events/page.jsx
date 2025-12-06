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
import { API_URL } from '@/lib/constants';
import { RsvpCard } from '@/components/student/RsvpCard';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    fetchMyRsvps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyRsvps = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/my-rsvps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRsvps(data);
      } else {
        console.error('Failed to fetch RSVPs');
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRsvp = async (eventId) => {
    if (!confirm('Are you sure you want to cancel your RSVP?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRsvps(rsvps.filter((rsvp) => rsvp.eventId !== eventId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      alert('Failed to cancel RSVP');
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (end) {
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      if (endDay > startDay) {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} - ${end.toLocaleDateString('en-US', formatOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString(
      'en-US',
      formatOptions
    )} at ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return { status: 'past', label: 'Past', color: 'bg-gray-500' };
    } else if (now >= start && (!end || now <= end)) {
      return {
        status: 'ongoing',
        label: 'Ongoing',
        color: 'bg-green-500',
      };
    } else {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'bg-blue-500',
      };
    }
  };

  const groupEventsByStatus = (rsvps) => {
    const upcoming = [];
    const ongoing = [];
    const past = [];

    rsvps.forEach((rsvp) => {
      const { status } = getEventStatus(
        rsvp.event.startDate,
        rsvp.event.endDate
      );
      if (status === 'upcoming') upcoming.push(rsvp);
      else if (status === 'ongoing') ongoing.push(rsvp);
      else past.push(rsvp);
    });

    return { upcoming, ongoing, past };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const { upcoming, ongoing, past } = groupEventsByStatus(rsvps);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your event RSVPs
          </p>
        </div>

        {rsvps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven&apos;t RSVP&apos;d to any events yet.
              </p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {ongoing.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ongoing Events ({ongoing.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoing.map((rsvp) => (
                    <RsvpCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upcoming Events ({upcoming.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((rsvp) => (
                    <RsvpCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Past Events ({past.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((rsvp) => (
                    <RsvpCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
