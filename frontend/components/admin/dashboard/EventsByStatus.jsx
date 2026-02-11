import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByStatus({ eventsByStatus }) {
  if (!eventsByStatus) return null;

  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl pt-6">
      <CardHeader>
        <CardTitle className="text-black">Events by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {eventsByStatus.map((item) => (
            <div
              key={item.status}
              className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg backdrop-blur-sm">
              <span className="capitalize font-medium text-black">{item.status}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                item.status === 'upcoming' ? 'bg-gold-dark/20 text-pfw-gold' :
                item.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300' :
                item.status === 'past' ? 'bg-slate-500/20 text-gray-700' :
                'bg-red-500/20 text-red-300'
              }`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
