import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RecentRsvps({ recentRsvps }) {
  if (!recentRsvps || recentRsvps.length === 0) return null;

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
    <div className="mt-6">
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-black">Recent RSVPs</CardTitle>
          <CardDescription className="text-gray-600">Latest 10 event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-medium text-black">
                    {rsvp.userName}
                  </span>
                  <span className="text-black0 mx-1">
                    registered for
                  </span>
                  <span className="font-medium text-pfw-gold">
                    {rsvp.eventTitle}
                  </span>
                </div>
                <div className="text-xs text-black0 ml-4">
                  {formatDate(rsvp.rsvpDate)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
