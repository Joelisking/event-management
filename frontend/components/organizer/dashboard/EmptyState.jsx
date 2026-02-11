import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 backdrop-blur-xl rounded-2xl shadow-xl shadow-pfw-gold/10">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-200 shadow-inner">
        <Calendar className="w-10 h-10 text-black0" />
      </div>
      <h3 className="text-xl font-bold text-black mb-2">
        No events created yet
      </h3>
      <p className="text-gray-600 mb-6">
        You haven&apos;t created any events yet.
      </p>
      <Link href="/organizer/events/new">
        <Button className="bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20 transition-all hover:scale-105">
          Create Your First Event
        </Button>
      </Link>
    </div>
  );
}
