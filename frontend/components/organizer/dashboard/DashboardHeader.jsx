import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function DashboardHeader({ user }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">
          Organizer Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-medium text-black">{user?.name}</span>
          {user?.organizationName && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-xs text-gray-700">
              {user.organizationName}
            </span>
          )}
        </p>
      </div>
      <Link href="/organizer/events/new">
        <Button className="bg-pfw-gold hover:bg-gold-dark text-white rounded-full px-6 shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </Link>
    </div>
  );
}
