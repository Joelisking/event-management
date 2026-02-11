'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UsersTable } from '@/components/admin/UsersTable';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('student');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'admin' && user.role !== 'organizer') {
        toast.error('Admin access required');
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading]);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        toast.success('User deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openRoleDialog = (userId, currentRole) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setSelectedUser(user);
    setNewRole(currentRole);
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    if (newRole === selectedUser.role) {
      setIsRoleDialogOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${selectedUser.id}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        fetchUsers();
        setIsRoleDialogOpen(false);
        toast.success('Role updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="User Management" />

      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            User Management
          </h2>
          <p className="text-gray-600">
            Manage user roles and permissions
          </p>
        </div>

        <UsersTable
          users={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          formatDate={formatDate}
          handleChangeRole={openRoleDialog}
          handleDeleteUser={handleDeleteUser}
        />

        <Dialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="bg-white border-gray-200 text-black sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the role for{' '}
                <span className="text-black font-semibold">
                  {selectedUser?.name}
                </span>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="role"
                  className="text-right text-gray-900">
                  Role
                </Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="col-span-3 bg-gray-50 border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900">
                    <SelectItem
                      value="student"
                      className="focus:bg-gray-100 focus:text-black">
                      Student
                    </SelectItem>
                    <SelectItem
                      value="organizer"
                      className="focus:bg-gray-100 focus:text-black">
                      Organizer
                    </SelectItem>
                    <SelectItem
                      value="admin"
                      className="focus:bg-gray-100 focus:text-black">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRoleDialogOpen(false)}
                className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black">
                Cancel
              </Button>
              <Button onClick={handleSaveRole} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
