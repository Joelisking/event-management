'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400">Redirecting...</p>
    </div>
  );
}
