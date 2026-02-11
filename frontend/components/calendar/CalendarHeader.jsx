import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, List } from 'lucide-react';

export function CalendarHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gold-dark/10 border border-pfw-gold/30 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-pfw-gold" />
            </div>
            Events Calendar
          </h1>
          <p className="text-gray-600">
            View all campus events in calendar format
          </p>
        </div>
        <Link href="/events">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full">
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </Link>
      </div>
    </div>
  );
}
