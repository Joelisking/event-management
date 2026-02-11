'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { createPortal } from 'react-dom';

export function PendingEvents({ events = [], onUpdate }) {
  const [processing, setProcessing] = useState(null);
  const pendingEvents = events.filter((e) => e.status === 'pending');

  if (pendingEvents.length === 0) return null;

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      const token = localStorage.getItem('token');
      let body = {};
      if (action === 'reject') {
        const reason = prompt('Reason for rejection:');
        if (!reason) {
          setProcessing(null);
          return;
        }
        body = { reason };
      }

      const res = await fetch(
        `${API_URL}/api/admin/events/${id}/${action}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        toast.success(`Event ${action}ed`);
        onUpdate && onUpdate();
      } else {
        toast.error('Action failed');
      }
    } catch (e) {
      toast.error('Error processing event');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card className="bg-gray-50 border-gray-200 mb-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          Pending Approvals ({pendingEvents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div>
                <h4 className="font-semibold text-white">
                  {event.title}
                </h4>
                <p className="text-sm text-gray-600">
                  by {event.organizer?.name} •{' '}
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-500"
                  onClick={() => handleAction(event.id, 'approve')}
                  disabled={processing === event.id}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleAction(event.id, 'reject')}
                  disabled={processing === event.id}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
