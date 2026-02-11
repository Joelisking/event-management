'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
} from '@/lib/calendar-export';

import { toast } from 'sonner';

export function AddToCalendar({ event }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadICS = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadICalFile(event);
    } catch (error) {
      console.error('Failed to download calendar file:', error);
      toast.error('Failed to download calendar file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center justify-between gap-2 border-gray-300 bg-gray-50 text-black hover:bg-gray-100 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-56 bg-white border-gray-200 text-black"
      >
        <DropdownMenuLabel className="text-gray-600">Select calendar</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={handleGoogleCalendar}
          className="text-sm focus:bg-gray-100 focus:text-white cursor-pointer"
        >
          Google Calendar
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-100" />

        <DropdownMenuItem
          onClick={handleDownloadICS}
          disabled={isDownloading}
          className={`flex items-center gap-2 text-sm focus:bg-gray-100 focus:text-white cursor-pointer ${
            isDownloading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Downloading…' : 'Download .ics file'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
