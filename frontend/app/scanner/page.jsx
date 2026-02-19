'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { API_URL } from '@/lib/constants';
import { useSearchParams, useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, QrCode, ScanLine } from 'lucide-react';
import './scanner-styles.css';

function ScannerContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const scannerRef = useRef(null);

  // Redirect to sign-in if auth resolved and user is not logged in
  useEffect(() => {
    if (authLoading) return;
    if (!user && eventIdParam) {
      router.push(
        `/signin?redirect=${encodeURIComponent(`/scanner?eventId=${eventIdParam}`)}`
      );
    }
  }, [authLoading, user, eventIdParam]);

  // Trigger check-in when eventId param is present and user is authenticated
  useEffect(() => {
    if (authLoading || !user || !eventIdParam) return;
    handleCheckIn(eventIdParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdParam, user, authLoading, searchParams]);

  // Initialize QR scanner when idle with no eventId param
  useEffect(() => {
    if (!eventIdParam && status === 'idle') {
      const timer = setTimeout(() => {
        const readerElement = document.getElementById('reader');
        if (!readerElement) return;

        const scanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [eventIdParam, status]);

  const onScanSuccess = (decodedText) => {
    let targetEventId = decodedText;

    try {
      const url = new URL(decodedText);
      const params = new URLSearchParams(url.search);
      if (params.has('eventId')) {
        targetEventId = params.get('eventId');
      }
    } catch (e) {
      // Not a URL, treat as raw ID
    }

    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    router.push(`/scanner?eventId=${encodeURIComponent(targetEventId)}`);
  };

  const onScanFailure = () => {};

  const handleCheckIn = async (id) => {
    setStatus('processing');
    setMessage('Verifying attendance...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/events/${id}/check-in`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.alreadyCheckedIn) {
        setStatus('already_checked_in');
        setPointsEarned(0);
        setMessage('You have already checked in to this event.');
        toast.info('Already checked in');
      } else if (res.ok) {
        setStatus('success');
        setPointsEarned(data.pointsEarned || 0);
        setMessage(data.message || 'Check-in successful!');
        toast.success('Checked in!');
      } else if (res.status === 400 && data.error === 'User is not registered for this event') {
        toast.info('You need to RSVP to this event before checking in.');
        router.push(`/events/${id}`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Check-in failed');
        toast.error(data.error);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Network error occurred');
    }
  };

  // Show spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#9a7d5c]" />
      </div>
    );
  }

  // Not logged in, no eventId — show a prompt instead of a blank redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#9a7d5c]/10 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-[#9a7d5c]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to check in</h2>
          <p className="text-gray-500 text-sm mb-6">You need to be signed in to scan event QR codes.</p>
          <Button
            className="bg-[#9a7d5c] hover:bg-[#836a4c] text-white rounded-xl px-6"
            onClick={() => router.push('/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto py-10 px-4 max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#9a7d5c]/10 border border-[#9a7d5c]/20 flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-7 h-7 text-[#9a7d5c]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Event Check-in</h1>
          <p className="text-sm text-gray-500 mt-1">Scan your event QR code to check in</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {status === 'processing' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
              <p className="text-base font-medium text-gray-700">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Checked In!</h2>
              <p className="text-sm text-gray-500 mb-4">{message}</p>
              {pointsEarned > 0 && (
                <div className="inline-flex items-center gap-2 bg-[#9a7d5c]/10 border border-[#9a7d5c]/20 rounded-full px-4 py-2 mb-6">
                  <span className="text-sm font-bold text-[#9a7d5c]">+{pointsEarned} pts earned</span>
                </div>
              )}
              <Button
                className="w-full bg-[#9a7d5c] hover:bg-[#836a4c] text-white rounded-xl h-11"
                onClick={() => { setStatus('idle'); router.push('/scanner'); }}>
                Scan Another
              </Button>
            </div>
          )}

          {status === 'already_checked_in' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Already Checked In</h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <Button
                className="w-full bg-[#9a7d5c] hover:bg-[#836a4c] text-white rounded-xl h-11"
                onClick={() => { setStatus('idle'); router.push('/scanner'); }}>
                Scan Another
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Check-in Failed</h2>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11"
                onClick={() => { setStatus('idle'); router.push('/scanner'); }}>
                Try Again
              </Button>
            </div>
          )}

          {status === 'idle' && !eventIdParam && (
            <div>
              <div className="flex items-center gap-2 px-5 py-3 bg-[#9a7d5c]/5 border-b border-gray-100">
                <ScanLine className="w-4 h-4 text-[#9a7d5c]" />
                <p className="text-xs font-medium text-gray-600">
                  Point your camera at the event QR code
                </p>
              </div>
              <div className="p-4">
                <div id="reader" className="w-full rounded-xl overflow-hidden" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#9a7d5c]" />
        </div>
      }>
      <ScannerContent />
    </Suspense>
  );
}
