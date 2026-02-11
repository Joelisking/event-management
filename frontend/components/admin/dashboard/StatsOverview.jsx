import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function StatsOverview({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-black">
            {stats.totals.users}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Total Users
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-black">
            {stats.totals.events}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Total Events
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-black">
            {stats.totals.rsvps}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Total RSVPs
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-yellow-500">
            {stats.totals.points || 0}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Points Awarded
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-purple-500">
            {stats.totals.redemptions || 0}
          </CardTitle>
          <CardDescription className="text-gray-600">
            Redemptions
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
