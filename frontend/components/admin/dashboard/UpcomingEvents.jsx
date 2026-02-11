import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UpcomingEvents({ upcomingEvents }) {
  if (!upcomingEvents) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl h-full pt-6">
      <CardHeader>
        <CardTitle className="text-black">Upcoming Events</CardTitle>
        <CardDescription className="text-gray-600">Next 10 active events</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="font-medium text-black">
                  {event.title}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  By {event.organizerName}
                </div>
                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-200">
                  <div className="text-xs text-black0">
                    {formatDate(event.startDate)}
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    👥 {event.attendeeCount} attendee
                    {event.attendeeCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-black0">
            No upcoming events
          </p>
        )}
      </CardContent>
    </Card>
  );
}
