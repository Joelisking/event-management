import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function ProfileInfo({
  profile,
  onUpdateProfile,
  formatDate,
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [organizationName, setOrganizationName] = useState(
    profile.organization_name || ''
  );
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    await onUpdateProfile({
      name,
      organizationName,
    });
    setUpdating(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(profile.name);
    setOrganizationName(profile.organization_name || '');
  };

  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl shadow-2xl shadow-pfw-gold/10 rounded-2xl pt-6">
      <CardHeader>
        <CardTitle className="text-black">
          Profile Information
        </CardTitle>
        <CardDescription className="text-gray-600">
          Your account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
              />
            </div>
            {profile.role === 'organizer' && (
              <div>
                <Label
                  htmlFor="organizationName"
                  className="text-gray-700">
                  Organization Name{' '}
                  <span className="text-gray-500 font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) =>
                    setOrganizationName(e.target.value)
                  }
                  placeholder="e.g., Computer Science Club"
                  className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                <p className="text-xs text-gray-600 mt-1">
                  This name will be displayed as the event organizer
                  instead of your personal name
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={updating}
                className="bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20">
                {updating ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={updating}
                className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-300 rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Name
              </p>
              <p className="text-lg text-black mt-1">
                {profile.name}
              </p>
            </div>
            {profile.role === 'organizer' && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Organization Name
                </p>
                <p className="text-lg text-black mt-1">
                  {profile.organization_name || (
                    <span className="text-gray-500 italic">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">
                Email
              </p>
              <p className="text-lg text-black mt-1">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Role
              </p>
              <p className="text-lg text-black mt-1 capitalize">
                {profile.role}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Points
                </p>
                <p className="text-xl text-yellow-500 font-bold">
                  {profile.total_points || 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Attended
                </p>
                <p className="text-xl text-pfw-gold font-bold">
                  {profile.events_attended || 0}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Member Since
              </p>
              <p className="text-lg text-black mt-1">
                {profile.createdAt
                  ? formatDate(profile.createdAt)
                  : '—'}
              </p>
            </div>
            <Button
              onClick={() => setEditing(true)}
              className="w-full bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20">
              Edit Profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
