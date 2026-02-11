import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Search, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function AttendeesModal({
  event,
  attendees = [],
  open,
  onOpenChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      attendee.user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-gray-200 text-black backdrop-blur-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-pfw-gold" />
            Event Attendees
          </DialogTitle>
          <DialogDescription>{event?.title}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Count */}
        <p className="text-sm text-gray-600 mt-2">
          {filteredAttendees.length} attendees
        </p>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-4">
          {filteredAttendees.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No attendees yet
            </div>
          ) : (
            filteredAttendees.map((attendee, index) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold-dark/10 border border-pfw-gold/30 text-pfw-gold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">
                      {attendee.user.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {attendee.user.email}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {attendee.status || 'Confirmed'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-pfw-gold hover:bg-gold-dark text-black">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
