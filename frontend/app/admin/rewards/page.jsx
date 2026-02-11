'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Loader2,
  Plus,
  Coins,
  Trash2,
  Edit,
  Upload,
  X,
} from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminRewardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    imageUrl: '',
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'organizer') {
      router.push('/');
      return;
    }
    fetchRewards();
  }, [user, router]);

  const fetchRewards = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rewards`);
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || data);
      }
    } catch (error) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const res = await fetch(`${API_URL}/api/upload/event-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
        setImagePreview(null);
      }
    } catch (error) {
      toast.error('Error uploading image');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/rewards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          cost: parseInt(formData.cost),
          imageUrl: formData.imageUrl || null,
        }),
      });

      if (res.ok) {
        toast.success('Reward created successfully');
        setDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          cost: '',
          imageUrl: '',
        });
        setImagePreview(null);
        fetchRewards();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create reward');
      }
    } catch (error) {
      toast.error('Error creating reward');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'organizer') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="Rewards Management" />

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">
              Rewards Management
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage rewards for students
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-gray-200 text-black">
              <DialogHeader>
                <DialogTitle>Create New Reward</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add a new reward that students can redeem with their
                  points
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-900">
                      Reward Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      required
                      className="bg-gray-50 border-gray-300 text-gray-900"
                      placeholder="e.g., Free Coffee Voucher"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-gray-900">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="bg-gray-50 border-gray-300 text-gray-900"
                      placeholder="Describe the reward..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost" className="text-gray-900">
                      Points Cost *
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      min="1"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost: e.target.value,
                        })
                      }
                      required
                      className="bg-gray-50 border-gray-300 text-gray-900"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-900">
                      Image (optional)
                    </Label>
                    {imagePreview || formData.imageUrl ? (
                      <div className="relative mt-2 w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1">
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pfw-gold transition-colors">
                        <Upload className="h-8 w-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Reward'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white border-gray-200 pt-4">
          <CardHeader>
            <CardTitle className="text-black">All Rewards</CardTitle>
            <CardDescription className="text-gray-600">
              {rewards.length} reward{rewards.length !== 1 ? 's' : ''}{' '}
              available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No rewards created yet. Create your first reward to
                get started!
              </div>
            ) : (
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="border-slate-800/70 hover:bg-slate-800/30">
                    <TableHead className="text-gray-700 w-28">
                      Image
                    </TableHead>
                    <TableHead className="text-gray-700">
                      Name
                    </TableHead>
                    <TableHead className="text-gray-700">
                      Description
                    </TableHead>
                    <TableHead className="text-gray-700 text-right">
                      Cost
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((reward) => (
                    <TableRow
                      key={reward.id}
                      className="border-slate-800/70 hover:bg-slate-800/30">
                      <TableCell>
                        {reward.image_url ? (
                          <img
                            src={reward.image_url}
                            alt={reward.name}
                            className="h-24 w-24 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-xl bg-slate-800 flex items-center justify-center">
                            <Coins className="h-8 w-8 text-slate-600" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 max-w-[150px]">
                        <span className="block truncate">
                          {reward.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 max-w-[250px]">
                        <span className="block truncate">
                          {reward.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                          <Coins className="h-4 w-4" />
                          {reward.cost}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
