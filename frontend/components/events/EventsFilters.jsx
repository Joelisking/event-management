import { Button } from '@/components/ui/button';

export function EventsFilters({ filterStatus, onFilterChange, eventStats }) {
  const filters = [
    { value: 'all', label: 'All Events', count: eventStats.all },
    { value: 'upcoming', label: 'Upcoming', count: eventStats.upcoming },
    { value: 'ongoing', label: 'Ongoing', count: eventStats.ongoing },
    { value: 'past', label: 'Past', count: eventStats.past },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            filterStatus === filter.value
              ? 'bg-pfw-gold text-white ring-2 ring-pfw-gold/20 shadow-lg shadow-pfw-gold/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
          }`}>
          {filter.label}{' '}
          <span className={filterStatus === filter.value ? 'opacity-90' : 'opacity-60'}>
            ({filter.count})
          </span>
        </button>
      ))}
    </div>
  );
}
