import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { Button } from '../ui/button';

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Hero Banner Image Section */}
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[80vh]">
        <Image
          src="/hero-banner.jpg"
          alt="Campus Pulse"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Content Section Below Banner */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-dark/10 border border-pfw-gold/30 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-pfw-gold" />
            <span className="text-sm font-medium text-pfw-gold">
              Discover Amazing Campus Events
            </span>
          </div>

          <p className="text-lg sm:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your one-stop platform for discovering, organizing, and
            attending campus events. Connect with your community and
            never miss out on what's happening around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button className="h-12 px-8 bg-pfw-gold hover:bg-gold-dark text-white rounded-full text-base font-medium shadow-lg shadow-pfw-gold/20 transition-all hover:scale-105">
                <Search className="w-5 h-5 mr-2" />
                Browse All Events
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="h-12 px-8 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full text-base font-medium transition-all hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '1000+', label: 'Events Hosted' },
              { value: '5000+', label: 'Active Students' },
              { value: '50+', label: 'Organizations' },
              { value: '100%', label: 'Free to Use' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-2xl bg-white border border-gray-200 backdrop-blur-sm">
                <div className="text-3xl sm:text-4xl font-bold text-black mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
