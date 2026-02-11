import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  UserCircle,
  MapPin,
  Tag,
} from 'lucide-react';

export function EventHero({
  event,
  status,
  organizerName,
  formatEventDate,
}) {
  const statusStyles = {
    upcoming: 'bg-gold-dark/90 text-white ring-2 ring-blue-400/60',
    ongoing:
      'bg-emerald-500/90 text-white ring-2 ring-emerald-400/60',
    past: 'bg-zinc-500/90 text-white ring-2 ring-zinc-400/60',
  };

  return (
    <div className="relative w-full min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]">
      <div className="relative h-[280px] sm:h-[340px] lg:h-[420px] overflow-hidden">
        {/* Background image / gradient */}
        <div className="absolute inset-0">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              priority
              className="object-cover scale-105 blur-[0.5px]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
          )}
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/20" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between gap-4">
              <Link href="/events">
                <div className="flex gap-1 items-center px-3 py-1.5 border rounded-full border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </div>
              </Link>

              <span
                className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 ${statusStyles[status]}`}>
                <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-xs font-medium text-white">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {formatEventDate(event.startDate, event.endDate)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-lg">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="inline-flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-white" />
                  </div>
                  <span>
                    Organized by{' '}
                    <span className="font-medium text-white">
                      {organizerName}
                    </span>
                  </span>
                </div>

                {event.location && (
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white" />
                    <span className="truncate max-w-xs">
                      {event.location}
                    </span>
                  </div>
                )}

                {event.category && (
                  <div className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4 text-white" />
                    <span>{event.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
