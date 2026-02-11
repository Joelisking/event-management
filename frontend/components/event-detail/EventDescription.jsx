import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function EventDescription({ event }) {
  const { user } = useAuth();
  return (
    <section className="space-y-6">
      <Card className="bg-white border-gray-200 shadow-2xl backdrop-blur-xl rounded-2xl pt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-black">
            About this event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-black">
          {event.description ? (
            <p className="leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          ) : (
            <p className="text-gray-600 italic">
              No description provided for this event.
            </p>
          )}

          {/* Event Schedule for Multi-day events with different times */}
          {event.timeSlots && event.timeSlots.length > 0 && (
            <div className="pt-5 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-black mb-3">
                Event Schedule
              </h3>
              <div className="space-y-2">
                {event.timeSlots.map((slot, index) => {
                  // Ensure format is YYYY-MM-DD for consistency
                  // If slot.date is invalid or missing, handle gracefully
                  if (!slot.date) return null;

                  let dateStr = slot.date;
                  // If it's a full ISO string (e.g. from DB/JSON), extract just the date part
                  if (
                    typeof dateStr === 'string' &&
                    dateStr.includes('T')
                  ) {
                    dateStr = dateStr.split('T')[0];
                  }

                  const dateObj = new Date(`${dateStr}T00:00:00`);
                  if (isNaN(dateObj.getTime())) return null;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-black">
                          <span className="text-[10px] uppercase font-bold text-gray-600">
                            {dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                            })}
                          </span>
                          <span className="text-sm font-bold">
                            {dateObj.getDate()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-black">
                          {dateObj.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                        {new Date(
                          `2000-01-01T${slot.startTime}`
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(
                          `2000-01-01T${slot.endTime}`
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attendees - Only visible to admin or event organizer */}
          {(user?.role === 'admin' ||
            (user &&
              event.organizer &&
              user.id === event.organizer.id)) &&
            event.attendees &&
            event.attendees.length > 0 && (
              <div className="pt-5 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-700" />
                    <h3 className="text-sm font-semibold text-black">
                      Attendees
                    </h3>
                  </div>
                  <span className="text-xs text-gray-600">
                    {event.attendees.length}{' '}
                    {event.attendees.length === 1
                      ? 'person attending'
                      : 'people attending'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.attendees.map((attendee) => {
                    const name = attendee?.user?.name || 'Guest';
                    const initial =
                      name?.charAt(0)?.toUpperCase() || '?';

                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                          {initial}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </section>
  );
}
