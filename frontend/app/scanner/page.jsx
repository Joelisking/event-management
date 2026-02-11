'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { API_URL } from '@/lib/constants';
import { useSearchParams, useRouter } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './scanner-styles.css';

function ScannerContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const router = useRouter();
  const { user } = useAuth();

  const [status, setStatus] = useState('idle'); // idle, scanning, processing, success, already_checked_in, error
  const [message, setMessage] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const scannerRef = useRef(null);

  useEffect(() => {
    // If eventId param is present, always attempt check-in on mount/navigation
    if (eventIdParam && user) {
      handleCheckIn(eventIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventIdParam, user, searchParams]);

  useEffect(() => {
    // Initialize scanner if no param and not processing
    if (!eventIdParam && status === 'idle') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const readerElement = document.getElementById('reader');
        if (!readerElement) {
          console.error('Reader element not found');
          return;
        }

        const scanner = new Html5QrcodeScanner(
          'reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
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

  const onScanSuccess = (decodedText, decodedResult) => {
    // Handle the scanned code
    // Expecting URL: .../scanner?eventId=123 OR just 123
    console.log(`Code matched = ${decodedText}`, decodedResult);

    let targetEventId = decodedText;

    // Try to parse URL parameters
    try {
      const url = new URL(decodedText);
      const params = new URLSearchParams(url.search);
      if (params.has('eventId')) {
        targetEventId = params.get('eventId');
      }
    } catch (e) {
      // Not a URL, treat as ID
    }

    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    handleCheckIn(targetEventId);
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleCheckIn = async (id) => {
    setStatus('processing');
    setMessage('Verifying attendance...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/events/${id}/check-in`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-8">
          Please sign in to scan.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto py-10 px-4 max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-50">
          Event Check-in
        </h1>

        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            {status === 'processing' && (
              <div className="text-center py-10">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
                <p className="text-lg text-gray-700">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2 text-green-400">
                  Checked In!
                </h2>
                <p className="text-gray-700">{message}</p>
                {pointsEarned > 0 && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/30 p-3 rounded-lg inline-block">
                    <span className="font-bold text-green-400">
                      +{pointsEarned} Points Earned
                    </span>
                  </div>
                )}
                <Button
                  className="mt-6 w-full"
                  onClick={() => {
                    setStatus('idle');
                    router.push('/scanner'); // Reset
                  }}>
                  Scan Another
                </Button>
              </div>
            )}

            {status === 'already_checked_in' && (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2 text-green-400">
                  Already Checked In
                </h2>
                <p className="text-gray-700">{message}</p>
                <Button
                  className="mt-6 w-full"
                  onClick={() => {
                    setStatus('idle');
                    router.push('/scanner');
                  }}>
                  Scan Another
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold mb-2 text-red-400">
                  Error
                </h2>
                <p className="text-gray-700">{message}</p>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-slate-700 text-gray-700 hover:bg-slate-800 hover:text-slate-100"
                  onClick={() => {
                    setStatus('idle');
                    router.push('/scanner');
                  }}>
                  Try Again
                </Button>
              </div>
            )}

            {status === 'idle' && !eventIdParam && (
              <div>
                <div id="reader" className="w-full"></div>
                <p className="text-center text-sm text-gray-600 mt-4">
                  Point your camera at the event QR code to check in.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fallback for testing on desktop */}
        {status === 'idle' && !eventIdParam && (
          <div className="text-center mt-8">
            <p className="text-xs text-slate-500 mb-2">
              Dev Check-in (Manual ID)
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const id = e.target.elements.eventId.value;
                if (id) handleCheckIn(id);
              }}
              className="flex gap-2">
              <input
                name="eventId"
                placeholder="Event UUID"
                className="flex-1 border border-slate-700 bg-slate-800/50 text-gray-900 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500">
                Go
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      }>
      <ScannerContent />
    </Suspense>
  );
}
