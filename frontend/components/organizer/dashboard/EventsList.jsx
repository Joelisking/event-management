import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EventsList({
  events,
  onViewAttendees,
  onPostpone,
  onCancel,
  onDelete,
}) {
  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
        )} ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )}, ${start.toLocaleTimeString(
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="group hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl">
          {event.imageUrl && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <CardTitle className="text-slate-50 line-clamp-1">
                  {event.title}
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  {formatEventDate(event.startDate, event.endDate)}
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => onViewAttendees(event)}
                  className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer">
                  {event.attendeeCount} RSVPs
                </button>
                {event.status && event.status !== 'active' && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      event.status === 'cancelled'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                        : event.status === 'postponed'
                        ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                        : 'bg-slate-500/10 border border-slate-500/30 text-slate-300'
                    }`}>
                    {event.status === 'cancelled'
                      ? 'Cancelled'
                      : event.status === 'postponed'
                      ? 'Rescheduled'
                      : event.status}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {event.description && (
                <p className="text-sm text-slate-400 line-clamp-2">
                  {event.description}
                </p>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-slate-300">
                    Attendees:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.slice(0, 5).map((attendee) => (
                      <div
                        key={attendee.id}
                        className="flex items-center space-x-1 text-xs bg-slate-900/70 border border-slate-800/50 px-2 py-1 rounded-lg text-slate-300">
                        <span>{attendee.user.name}</span>
                      </div>
                    ))}
                    {event.attendees.length > 5 && (
                      <span className="text-xs text-slate-500 px-2 py-1">
                        +{event.attendees.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <Link href={`/events/${event.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full"
                      size="sm">
                      View
                    </Button>
                  </Link>
                  {event.status !== 'cancelled' && (
                    <Link
                      href={`/organizer/events/edit/${event.id}`}
                      className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full"
                        size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>

                {event.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-yellow-500 rounded-full text-white hover:bg-yellow-500/80"
                      size="sm"
                      onClick={() => onPostpone(event)}>
                      Postpone
                    </Button>
                    <Button
                      className="flex-1 bg-red-500 rounded-full hover:bg-red-500/80"
                      size="sm"
                      onClick={() => onCancel(event)}>
                      Cancel Event
                    </Button>
                  </div>
                )}

                {event.status === 'cancelled' && (
                  <Button
                    variant="outline"
                    className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 rounded-full"
                    size="sm"
                    onClick={() =>
                      onDelete(event.id, event.title, event.status)
                    }>
                    Delete Permanently
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
