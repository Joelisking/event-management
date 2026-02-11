'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
