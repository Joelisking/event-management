import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, MoreVertical, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    <>
      <div className="rounded-2xl border border-gray-200 bg-white backdrop-blur-xl overflow-hidden shadow-xl shadow-pfw-gold/10">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="text-gray-600 font-medium">Event</TableHead>
              <TableHead className="text-gray-600 font-medium">Date & Time</TableHead>
              <TableHead className="text-gray-600 font-medium">Status</TableHead>
              <TableHead className="text-gray-600 font-medium">Stats</TableHead>
              <TableHead className="text-right text-gray-600 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">
                  <div className="text-black font-semibold">{event.title}</div>
                  {event.location && (
                    <div className="text-sm text-black0 mt-1 flex items-center gap-1">
                       <span className="truncate max-w-[200px]">{event.location}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-700">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-black0 mt-1">
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`
                      ${
                        event.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : event.status === 'cancelled'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      } border
                    `}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-black0" />
                      <span>
                        <span className="text-black">{event.attendeeCount}</span>
                        <span className="text-slate-600 mx-1">/</span>
                        {event.capacity || '∞'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-600 hover:text-pfw-gold hover:bg-blue-400/10 rounded-full"
                      onClick={() => onViewAttendees(event)}>
                      <Users className="w-4 h-4" />
                    </Button>
                    <Link href={`/organizer/events/edit/${event.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid="edit-event-button"
                        className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid="event-actions-menu"
                          className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-200 text-black w-48">
                        <DropdownMenuItem className="text-gray-700 focus:bg-gray-50 focus:text-gray-900 cursor-pointer">
                          <Link href={`/events/${event.id}`} className="flex w-full">
                            View Public Page
                          </Link>
                        </DropdownMenuItem>
                        {event.status === 'active' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                if (onPostpone) onPostpone(event);
                              }}
                              data-testid="postpone-event-button"
                              className="focus:bg-gray-50 focus:text-gray-900 cursor-pointer">
                              Postpone Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                              data-testid="cancel-event-button"
                              onClick={() => {
                                if (onCancel) onCancel(event);
                              }}>
                              Cancel Event
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                          data-testid="delete-event-button"
                          onClick={() => onDelete(event.id, event.title, event.status)}>
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
