import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Users, UserCircle } from 'lucide-react';

export function EventCard({
  event,
  status,
  user,
  rsvpStatus,
  rsvpLoading,
  onRsvp,
  onCancelRsvp,
  formatEventDate,
}) {
  const statusStyles = {
    upcoming: 'bg-gold-dark/90 text-white ring-2 ring-pfw-gold/60',
    ongoing:
      'bg-emerald-500/90 text-white ring-2 ring-emerald-400/60',
    past: 'bg-zinc-500/90 text-white ring-2 ring-zinc-400/60',
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-pfw-gold/10 transition-all duration-300 relative overflow-hidden bg-white border-gray-200 backdrop-blur-xl rounded-2xl">
      {/* Image Section */}
      <div className="relative w-full h-48 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pfw-gold via-pfw-gold to-pfw-gold" />
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 ${statusStyles[status]}`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg font-semibold text-black line-clamp-2 leading-snug">
          {event.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
          <UserCircle className="w-3.5 h-3.5" />
          <span>
            by{' '}
            <span className="text-gray-700 font-medium">
              {event.user.organizationName || event.user.name}
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date */}
        <div className="flex items-start gap-2 text-xs text-gray-700">
          <Calendar className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="line-clamp-2">
              {formatEventDate(event.startDate, event.endDate)}
            </span>
            {event.timeSlots && event.timeSlots.length > 0 && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold-dark/10 border border-pfw-gold/30">
                <Calendar className="w-3 h-3 text-pfw-gold" />
                <span className="text-[10px] text-pfw-gold font-medium">
                  Different times daily
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">
              {event.attendeeCount}{' '}
              {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>

          <div className="flex gap-2">
            {user &&
              (rsvpStatus ? (
                <button
                  onClick={() => onCancelRsvp(event.id)}
                  disabled={rsvpLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    rsvpStatus === 'waitlist'
                      ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                      : 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                  }`}>
                  {rsvpLoading
                    ? 'Processing...'
                    : rsvpStatus === 'waitlist'
                      ? 'Leave Waitlist'
                      : 'Cancel RSVP'}
                </button>
              ) : (
                <button
                  onClick={() => onRsvp(event.id)}
                  disabled={rsvpLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    event.capacity &&
                    event.attendeeCount >= event.capacity
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-pfw-gold hover:bg-gold-dark'
                  }`}>
                  {rsvpLoading
                    ? 'Processing...'
                    : event.capacity &&
                        event.attendeeCount >= event.capacity
                      ? 'Join Waitlist'
                      : 'RSVP'}
                </button>
              ))}
            <Link href={`/events/${event.id}`}>
              <button className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-colors">
                View
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
