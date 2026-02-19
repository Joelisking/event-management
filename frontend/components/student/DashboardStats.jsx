import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-lg shadow-pfw-gold/10 pt-6">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total RSVPs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-black">{stats.totalRsvps}</div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-lg shadow-pfw-gold/10 pt-6">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-sm font-medium text-gray-600">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-pfw-gold">
            {stats.upcomingEvents}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-lg shadow-pfw-gold/10 pt-6">
        <CardHeader className="pb-3 border-b border-gray-200">
          <CardTitle className="text-sm font-medium text-gray-600">
            Past Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-gray-500">
            {stats.pastEvents}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
