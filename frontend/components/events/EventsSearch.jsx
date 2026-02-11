import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function EventsSearch({ searchQuery, onSearchChange }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-600" />
      </div>
      <Input
        type="text"
        placeholder="Search events by title, description, or organizer..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 h-12 sm:h-14 text-base bg-white border-gray-200 text-black placeholder:text-gray-600 rounded-2xl focus:ring-2 focus:ring-pfw-gold/20 focus:border-pfw-gold/30"
      />
    </div>
  );
}
