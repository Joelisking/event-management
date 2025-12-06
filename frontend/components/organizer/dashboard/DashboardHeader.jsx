import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-2">
            Organizer Dashboard
          </h1>
          <p className="text-slate-400">
            Manage your events and track attendees
          </p>
        </div>
        <Link href="/organizer/events/new">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
            Create New Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
