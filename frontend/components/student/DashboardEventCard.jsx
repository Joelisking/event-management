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

export function DashboardEventCard({ event, formatDate }) {
  return (
    <Card className="group hover:shadow-2xl hover:shadow-pfw-gold/10 transition-all duration-300 bg-white border-gray-200 backdrop-blur-xl pt-6">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="text-lg font-semibold text-black line-clamp-1 group-hover:text-pfw-gold transition-colors">
          {event.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-gray-600 text-xs mt-2">
          {event.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-500/70 mt-0.5" />
            <span className="text-gray-700 font-medium">
              {formatDate(event.startDate)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600 line-clamp-1">
                {event.location}
              </span>
            </div>
          )}

          {event.category && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-slate-700 border-gray-300 text-[10px] h-5 px-2">
                {event.category}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              <span className="text-black font-semibold">{event.attendeeCount}</span>{' '}
              {event.capacity ? `/ ${event.capacity}` : ''} attending
            </span>
          </div>
        </div>

        <Link href={`/events/${event.id}`} className="block pt-2">
          <Button className="w-full bg-pfw-gold hover:bg-gold-dark text-white shadow-lg shadow-pfw-gold/10 border-0 h-9 rounded-lg text-xs font-medium">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
