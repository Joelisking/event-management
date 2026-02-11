import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';

import { EventsShowcase } from '../events-showcase';
import { Calendar, ArrowRight } from 'lucide-react';

function Explore() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-black mb-2">
              Explore Events
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              Discover the hottest events happening on campus
            </p>
          </div>
          <Link href="/events" className="hidden sm:block">
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full transition-all">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <EventsShowcase />
        <div className="mt-8 text-center sm:hidden">
          <Link href="/events">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Explore;
