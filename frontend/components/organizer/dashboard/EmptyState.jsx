import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/40">
        <svg
          className="w-9 h-9 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-50 mb-2">
        No events yet
      </h3>
      <p className="text-slate-400 mb-6">
        You haven&apos;t created any events yet.
      </p>
      <Link href="/organizer/events/new">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
          Create Your First Event
        </Button>
      </Link>
    </div>
  );
}
