import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

export function RsvpCard({ rsvp, onCancel, formatDate, getStatus }) {
  const { event } = rsvp;
  const eventStatus = getStatus(event.startDate, event.endDate);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge className={`${eventStatus.color} text-white`}>
            {eventStatus.label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {event.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(event.startDate, event.endDate)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {event.location}
              </span>
            </div>
          )}

          {event.category && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 mt-0.5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {event.category}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {event.attendeeCount}{' '}
              {event.capacity ? `/ ${event.capacity}` : ''} attending
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {eventStatus.status !== 'past' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(event.id)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
