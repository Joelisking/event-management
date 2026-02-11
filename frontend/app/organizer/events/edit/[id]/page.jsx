'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { EventForm } from '@/components/organizer/EventForm';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, getToken } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [initialData, setInitialData] = useState(null);

  const eventId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('Please sign in to edit events.');
      router.push('/signin');
      return;
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      toast.error('You must be an organizer to edit events.');
      router.push('/events');
      return;
    }

    if (eventId) {
      fetchEvent();
    } else {
      setFetchingEvent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, eventId]);

  const fetchEvent = async () => {
    setFetchingEvent(true);
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        toast.error('Event not found.');
        router.push('/admin/dashboard');
        return;
      }

      const data = await response.json();

      if (
        user.role !== 'admin' &&
        data.userId?.toString() !== user.id?.toString()
      ) {
        toast.error('You can only edit your own events.');
        router.push('/admin/dashboard');
        return;
      }

      const formattedData = {
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        capacity:
          typeof data.capacity === 'number' ? data.capacity : '',
        category: data.category || '',
        imageUrl: data.imageUrl || '',
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : '',
        endDate: data.endDate
          ? new Date(data.endDate).toISOString()
          : '',
      };

      setInitialData(formattedData);
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event. Please try again.');
      router.push('/admin/dashboard');
    } finally {
      setFetchingEvent(false);
    }
  };

  const onSubmit = async (formData) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication error. Please sign in again.');
        setLoading(false);
        router.push('/signin');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || 'Failed to update event');
        return;
      }

      toast.success('Event updated successfully.');
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchingEvent) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-pfw-gold animate-spin" />
          <p className="text-sm font-medium text-gray-700">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-black">
              Edit event
            </h1>
            <Link href="/admin/dashboard">
              <Button className="bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-black border-gray-300 rounded-full text-sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white border-gray-200 shadow-lg rounded-2xl pt-6">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="text-black text-lg">
              Event details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-3 text-xs sm:text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl">
                {error}
              </div>
            )}
            {initialData && (
              <EventForm
                defaultValues={initialData}
                onSubmit={onSubmit}
                loading={loading}
                submitLabel="Update event"
                cancelHref="/admin/dashboard"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
