'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
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
import { Loader2, Coins } from 'lucide-react';

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/rewards`
      );
      if (res.ok) {
        const data = await res.json();
        setRewards(data);
      }
    } catch (error) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (!user) return;
    if (user.total_points < reward.cost) {
      toast.error('Not enough points!');
      return;
    }

    setRedeeming(reward.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/rewards/${reward.id}/redeem`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        toast.success(`Redeemed ${reward.name}!`);
        // Refresh user to update points locally
        refreshUser && refreshUser();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Redemption failed');
      }
    } catch (error) {
      toast.error('Error redeeming reward');
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-50">
              Rewards Store
            </h1>
            <p className="text-slate-400 mt-2">
              Redeem your hard-earned points for awesome rewards!
            </p>
          </div>
          {user && (
            <Card className="bg-blue-600/10 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="h-6 w-6 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {user.total_points || 0} pts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card
              key={reward.id}
              className="overflow-hidden bg-slate-900/70 border-slate-800/70 backdrop-blur-sm hover:border-slate-700/70 transition-all">
              {reward.image_url && (
                <div className="h-48 overflow-hidden bg-slate-800/50">
                  <img
                    src={reward.image_url}
                    alt={reward.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-slate-50">
                    {reward.name}
                  </CardTitle>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-blue-500/30">
                    {reward.cost} pts
                  </span>
                </div>
                <CardDescription className="text-slate-400">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => handleRedeem(reward)}
                  disabled={
                    !user ||
                    user.total_points < reward.cost ||
                    redeeming === reward.id
                  }
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                  {redeeming === reward.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Coins className="h-4 w-4 mr-2" />
                  )}
                  Redeem
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No rewards available yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
