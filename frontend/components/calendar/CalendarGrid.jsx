import Link from 'next/link';

export function CalendarGrid({
  days,
  getEventsForDay,
  currentDate,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="p-2 text-center font-semibold text-gray-600 text-sm">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => {
        if (day === null) {
          return (
            <div key={`empty-${index}`} className="p-2 min-h-[120px]" />
          );
        }

        const dayEvents = getEventsForDay(day);
        const currentDateObj = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
        currentDateObj.setHours(0, 0, 0, 0);
        const isToday = currentDateObj.getTime() === today.getTime();

        return (
          <div
            key={day}
            className={`p-2 min-h-[120px] border rounded-xl transition-all ${
              isToday
                ? 'bg-gold-dark/10 border-pfw-gold/30 shadow-lg shadow-pfw-gold/10'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}>
            <div
              className={`text-sm font-semibold mb-2 ${
                isToday ? 'text-pfw-gold' : 'text-gray-700'
              }`}>
              {day}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block">
                  <div className="text-xs p-1.5 bg-pfw-gold text-white rounded-lg hover:bg-gold-dark transition-colors truncate shadow-sm">
                    {event.title}
                  </div>
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-600 pl-1">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
