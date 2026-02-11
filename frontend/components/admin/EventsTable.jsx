import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Eye, Trash2, Search } from 'lucide-react';

export function EventsTable({
  events,
  searchTerm,
  setSearchTerm,
  formatDate,
  getEventStatus,
  handleDeleteEvent,
}) {
  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl pt-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-black">
            All Events{' '}
            <span className="text-black0 text-sm ml-2 p-2 bg-gray-100 rounded-full">
              {events.length}
            </span>
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black0 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-black placeholder:text-black0 focus:ring-blue-900/50 focus:border-blue-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Organizer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Attendees</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {events.map((event) => {
                const status = getEventStatus(
                  event.startDate,
                  event.endDate
                );
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-black">
                      {event.title}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="text-black">
                          {event.organizer.name}
                        </div>
                        <div className="text-xs text-black0">
                          {event.organizer.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {event.category ? (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-700 border-gray-300">
                          {event.category}
                        </Badge>
                      ) : (
                        <span className="text-slate-600 text-sm">
                          None
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDate(event.startDate)}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`${
                          status.label === 'Upcoming'
                            ? 'bg-gold-dark/20  border-pfw-gold/30'
                            : status.label === 'Ongoing'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : 'bg-slate-500/10 text-gray-600 border-slate-500/20'
                        } border text-black`}
                        variant="outline">
                        {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {event.attendeeCount}
                      {event.capacity && (
                        <span className="text-slate-600">
                          {' '}
                          / {event.capacity}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-black0">
                      {formatDate(event.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-white hover:bg-gray-100"
                            title="View Event">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          onClick={() =>
                            handleDeleteEvent(event.id, event.title)
                          }
                          title="Delete Event">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
