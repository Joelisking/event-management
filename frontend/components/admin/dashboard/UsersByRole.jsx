import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UsersByRole({ usersByRole }) {
  if (!usersByRole) return null;

  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
      <CardHeader>
        <CardTitle className="text-black">Users by Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {usersByRole.map((item) => (
            <div
              key={item.role}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg backdrop-blur-sm">
              <span className="capitalize font-medium text-black">{item.role}</span>
              <span className="text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
