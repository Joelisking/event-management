'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview';
import { UsersByRole } from '@/components/admin/dashboard/UsersByRole';
import { EventsByStatus } from '@/components/admin/dashboard/EventsByStatus';
import { EventsByCategory } from '@/components/admin/dashboard/EventsByCategory';
import { RecentUsers } from '@/components/admin/dashboard/RecentUsers';
import { UpcomingEvents } from '@/components/admin/dashboard/UpcomingEvents';
import { RecentRsvps } from '@/components/admin/dashboard/RecentRsvps';
import { PendingEvents } from '@/components/admin/dashboard/PendingEvents';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { PostponeEventDialog } from '@/components/postpone-event-dialog';
import { CancelEventDialog } from '@/components/cancel-event-dialog';
import { AttendeesModal } from '@/components/attendees-modal';
import { EventsList } from '@/components/organizer/dashboard/EventsList';
import { EmptyState } from '@/components/organizer/dashboard/EmptyState';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Organizer event management state
  const [myEvents, setMyEvents] = useState([]);
  const [myEventsLoading, setMyEventsLoading] = useState(true);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'organizer') {
      toast.error('Access denied');
      router.push('/events');
      return;
    }

    fetchStats();
    fetchMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events/organizer/my-events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setMyEventsLoading(false);
    }
  };

  const handlePostpone = (event) => {
    setSelectedEvent(event);
    setPostponeDialogOpen(true);
  };

  const handleCancelEvent = (event) => {
    setSelectedEvent(event);
    setCancelDialogOpen(true);
  };

  const handlePostponeSuccess = (result) => {
    toast.success(
      `Event postponed successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents();
    fetchStats();
  };

  const handleCancelSuccess = (result) => {
    toast.success(
      `Event cancelled successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents();
    fetchStats();
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setAttendeesModalOpen(true);
  };

  const handleDelete = (eventId, eventTitle, eventStatus) => {
    if (eventStatus !== 'cancelled') {
      toast.error('Please cancel the event first before deleting it.');
      return;
    }
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMyEvents(myEvents.filter((e) => e.id !== eventToDelete.id));
        toast.success('Event deleted successfully');
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <AdminHeader title="Dashboard" />

      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-slate-400">
            Monitor system performance and manage your events
          </p>
        </div>

        <StatsOverview stats={stats} />

        <PendingEvents
          events={stats.pendingEvents || []}
          onUpdate={fetchStats}
        />

        {/* My Events Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">My Events</h3>
              <p className="text-sm text-slate-400">
                Events you&apos;ve created and manage
              </p>
            </div>
            <Link href="/organizer/events/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-600/20">
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </Link>
          </div>

          {myEventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-400">Loading events...</p>
            </div>
          ) : myEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <EventsList
              events={myEvents}
              onViewAttendees={handleViewAttendees}
              onPostpone={handlePostpone}
              onCancel={handleCancelEvent}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsersByRole usersByRole={stats.usersByRole} />
          <EventsByStatus eventsByStatus={stats.eventsByStatus} />
        </div>

        <EventsByCategory eventsByCategory={stats.eventsByCategory} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentUsers recentUsers={stats.recentUsers} />
          <UpcomingEvents upcomingEvents={stats.upcomingEvents} />
        </div>

        <RecentRsvps recentRsvps={stats.recentRsvps} />
      </main>

      {/* Postpone Dialog */}
      {selectedEvent && (
        <PostponeEventDialog
          event={selectedEvent}
          open={postponeDialogOpen}
          onOpenChange={setPostponeDialogOpen}
          onSuccess={handlePostponeSuccess}
        />
      )}

      {/* Cancel Dialog */}
      {selectedEvent && (
        <CancelEventDialog
          event={selectedEvent}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Attendees Modal */}
      {selectedEvent && (
        <AttendeesModal
          event={selectedEvent}
          attendees={selectedEvent.attendees}
          open={attendeesModalOpen}
          onOpenChange={setAttendeesModalOpen}
          getToken={getToken}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the event
              &quot;{eventToDelete?.title}&quot; and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={confirmDelete}>
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
