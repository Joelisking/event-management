import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RecentUsers({ recentUsers }) {
  if (!recentUsers) return null;

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
        <CardTitle className="text-black">Recent Users</CardTitle>
        <CardDescription className="text-gray-600">
          Latest 10 registered users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-start p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div>
                <div className="font-medium text-black">
                  {user.name}
                </div>
                <div className="text-sm text-gray-600">
                  {user.email}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div
                  className={`text-xs capitalize px-2 py-0.5 rounded inline-block ${
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-black'
                      : user.role === 'organizer'
                        ? 'bg-amber-500/20 text-black'
                        : 'bg-gold-dark/20 text-black'
                  }`}>
                  {user.role}
                </div>
                <div className="text-xs text-black0">
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
