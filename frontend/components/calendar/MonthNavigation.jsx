import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthNavigation({
  monthName,
  onPrev,
  onNext,
  onToday,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-black text-lg font-semibold">{monthName}</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToday}
          size="sm"
          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full">
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full w-9 h-9 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full w-9 h-9 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
