import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByCategory({ eventsByCategory }) {
  if (!eventsByCategory || eventsByCategory.length === 0) return null;

  return (
    <div className="mb-8">
      <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-black">
            Events by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventsByCategory.map((item) => (
              <div
                key={item.category}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center hover:bg-gray-100 transition-colors">
                <div className="text-2xl font-bold text-black mb-1">
                  {item.count}
                </div>
                <div className="text-sm text-black">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
