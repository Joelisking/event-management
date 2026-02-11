'use client';

import React from 'react';
import { BenefitsSection } from '@/components/auth/BenefitsSection';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Calendar } from 'lucide-react';

function SignUp() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-pfw-gold rounded-xl flex items-center justify-center shadow-lg shadow-pfw-gold/30">
              <Calendar className="w-7 h-7 text-black" />
            </div>
            <span className="text-2xl font-bold text-black">
              Campus Pulse
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
            Join Campus Pulse
          </h1>
          <p className="text-gray-600">
            Create your account and start discovering amazing events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <BenefitsSection />
          <SignUpForm />
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to our Terms of Service
          and Privacy Policy
        </p>
      </div>
    </main>
  );
}

export default SignUp;
