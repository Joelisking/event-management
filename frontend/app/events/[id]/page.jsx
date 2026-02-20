'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { toast } from 'sonner';
import { EventHero } from '@/components/event-detail/EventHero';
import { EventDescription } from '@/components/event-detail/EventDescription';
import { EventSidebar } from '@/components/event-detail/EventSidebar';
import { EventNotFound } from '@/components/event-detail/EventNotFound';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, getToken } = useAuth();

  const [event, setEvent] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const eventId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvent(),
        user ? checkRsvpStatus() : Promise.resolve(),
      ]);
      setLoading(false);
    };

    fetchData();
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
    }
  };

  const checkRsvpStatus = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/rsvp/check/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRsvpStatus(
          data.hasRsvp
            ? data.rsvp
              ? data.rsvp.status
              : 'confirmed'
            : null
        );
      }
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isWaitlist) {
          toast.success('Joined waitlist!');
          setRsvpStatus('waitlist');
        } else {
          toast.success(
            'You have successfully RSVPed to this event!'
          );
          setRsvpStatus('confirmed');
        }
        fetchEvent();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing:', error);
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRsvpStatus(null);
        fetchEvent();
        toast.info('Your RSVP has been cancelled.');
        setIsCancelDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setRsvpLoading(false);
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

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    if (event?.timeSlots && event.timeSlots.length > 0) {
      if (end && start.toDateString() !== end.toDateString()) {
        return `${start.toLocaleDateString('en-US', dateOptions)} - ${end.toLocaleDateString('en-US', dateOptions)}`;
      }
      return start.toLocaleDateString('en-US', dateOptions);
    }

    if (end) {
      // Check if same day
      if (start.toDateString() === end.toDateString()) {
        return `${start.toLocaleDateString(
          'en-US',
          dateOptions
        )} • ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          dateOptions
        )}, ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          dateOptions
        )}, ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString(
      'en-US',
      dateOptions
    )} • ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-gray-300 border-t-pfw-gold animate-spin" />
          <p className="text-sm font-medium text-gray-700">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <EventNotFound />;
  }

  const status = getEventStatus(event.startDate, event.endDate);
  const organizerName =
    event.user?.organizationName ||
    event.user?.name ||
    'Unknown Organizer';
  const attendeeCount = event.attendees?.length || 0;
  const capacity = event.capacity;

  return (
    <div className="min-h-screen bg-white pb-20">
      <EventHero
        event={event}
        status={status}
        organizerName={organizerName}
        formatEventDate={formatEventDate}
        rsvpStatus={rsvpStatus}
        user={user}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <EventDescription event={event} />
          </div>

          <div className="lg:col-span-1">
            <EventSidebar
              event={event}
              user={user}
              rsvpStatus={rsvpStatus}
              rsvpLoading={rsvpLoading}
              attendeeCount={attendeeCount}
              capacity={capacity}
              formatEventDate={formatEventDate}
              onRsvp={handleRsvp}
              onCancelRsvp={() => setIsCancelDialogOpen(true)}
            />
          </div>
        </div>
      </main>

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-white border-gray-200 text-black">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel RSVP?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to cancel your RSVP for this
              event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsCancelDialogOpen(false)}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black">
              Keep RSVP
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelRsvp}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
              disabled={rsvpLoading}>
              {rsvpLoading ? 'Cancelling...' : 'Yes, Cancel RSVP'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
