'use client';

import { useState } from 'react';
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
import { Eye, EyeOff, Lock } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { toast } from 'sonner';

export function ChangePassword({ getToken }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password changed successfully');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setOpen(false);
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setOpen(false);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-2xl shadow-pfw-gold/10 rounded-2xl pt-6">
      <CardHeader>
        <CardTitle className="text-black flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          Password
        </CardTitle>
        <CardDescription className="text-gray-600">
          Keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!open ? (
          <Button
            onClick={() => setOpen(true)}
            className="w-full bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20">
            Change Password
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-gray-700">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={form.currentPassword}
                  onChange={handleChange('currentPassword')}
                  required
                  className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={handleChange('newPassword')}
                  required
                  minLength={8}
                  className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  required
                  minLength={8}
                  className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={saving}
                className="bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
