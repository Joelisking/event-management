import Link from 'next/link';
import { normalizeLocation } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Tag, Users } from 'lucide-react';
import { AddToCalendar } from '@/components/add-to-calendar';
import { QRCodeSVG } from 'qrcode.react';

export function EventSidebar({
  event,
  user,
  rsvpStatus,
  rsvpLoading,
  attendeeCount,
  capacity,
  formatEventDate,
  onRsvp,
  onCancelRsvp,
}) {
  return (
    <aside className="space-y-5 lg:space-y-6 lg:sticky lg:top-24 self-start">
      {/* Event details */}
      <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-xl rounded-2xl pt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-black">
            Event details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-black">
          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gold-dark/10 border border-pfw-gold/30 flex-shrink-0">
              <Calendar className="w-4 h-4 text-pfw-gold" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-medium text-gray-900">
                Date &amp; time
              </h4>
              {event.timeSlots && event.timeSlots.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">
                    Multi-day event with custom times:
                  </p>
                  {event.timeSlots.map((slot, index) => {
                    if (!slot.date) return null;
                    let dateStr = slot.date;
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
                        className="text-xs sm:text-sm text-gray-700 p-2 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="font-medium text-black">
                          {dateObj.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-gray-600 mt-0.5">
                          {new Date(
                            `2000-01-01T${slot.startTime}`,
                          ).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(
                            `2000-01-01T${slot.endTime}`,
                          ).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-gray-700">
                  {formatEventDate(event.startDate, event.endDate)}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (() => {
            const loc = normalizeLocation(event.location);
            const isUrl = loc.startsWith('http://') || loc.startsWith('https://');
            return (
              <div className="flex gap-3 min-w-0">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-medium text-gray-900">
                    Location
                  </h4>
                  {isUrl ? (
                    <a
                      href={loc}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer">
                      Join Online Meeting
                    </a>
                  ) : (
                    <p
                      title={loc}
                      className="text-xs sm:text-sm text-gray-700 truncate">
                      {loc}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Category */}
          {event.category && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex-shrink-0">
                <Tag className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900">
                  Category
                </h4>
                <p className="text-xs sm:text-sm text-gray-700">
                  {event.category}
                </p>
              </div>
            </div>
          )}

          {/* Capacity */}
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 flex-shrink-0">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900">
                Attendance
              </h4>
              <p className="text-xs sm:text-sm text-gray-700">
                {capacity
                  ? `${attendeeCount} / ${capacity} ${
                      attendeeCount === 1 ? 'person' : 'people'
                    }`
                  : `${attendeeCount} ${
                      attendeeCount === 1
                        ? 'person attending'
                        : 'people attending'
                    }`}
                {capacity && attendeeCount >= capacity && (
                  <span className="ml-2 text-xs font-semibold text-red-400">
                    (Full)
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardContent className="py-5 space-y-4">
          {event.status === 'past' ? (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-gray-600">
                This event has ended
              </p>
            </div>
          ) : user ? (
            rsvpStatus ? (
              <Button
                variant="outline"
                onClick={onCancelRsvp}
                disabled={rsvpLoading}
                data-testid="cancel-rsvp-button"
                className={`w-full h-11 rounded-full border-2 ${
                  rsvpStatus === 'waitlist'
                    ? 'border-amber-500/40 bg-transparent text-amber-500 hover:bg-amber-500/10 hover:text-amber-400'
                    : 'border-red-500/40 bg-red-500 hover:bg-red-500/10 text-white hover:text-red-300'
                }`}>
                {rsvpLoading
                  ? 'Processing...'
                  : rsvpStatus === 'waitlist'
                    ? 'Leave Waitlist'
                    : 'Cancel RSVP'}
              </Button>
            ) : capacity && attendeeCount >= capacity ? (
              <Button
                onClick={onRsvp}
                disabled={rsvpLoading}
                className="w-full h-11 rounded-full bg-amber-600 hover:bg-amber-500 text-white">
                {rsvpLoading ? 'joining...' : 'Join Waitlist'}
              </Button>
            ) : (
              <Button
                onClick={onRsvp}
                disabled={rsvpLoading}
                data-testid="rsvp-button"
                className="w-full h-11 rounded-full bg-pfw-gold hover:bg-gold-dark">
                {rsvpLoading ? 'RSVPing…' : 'RSVP to event'}
              </Button>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-center text-gray-600">
                Sign in to RSVP to this event.
              </p>
              <Link href="/signin">
                <Button className="w-full h-11 rounded-full bg-pfw-gold hover:bg-gold-dark">
                  Sign in to RSVP
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="pt-1">
              <AddToCalendar event={event} />
            </div>
          )}
        </CardContent>
      </Card>

      {(user?.role === 'admin' ||
        (user && user.id === event.organizer?.id) ||
        (user && user.id === event.userId)) && (
        <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-xl rounded-2xl pt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-black">
              Check-in QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={
                  event.qrCodeUrl ||
                  `https://campuspulse.com/scanner?eventId=${event.id}`
                }
                size={200}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">
              Scan this code to check in attendees
            </p>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
