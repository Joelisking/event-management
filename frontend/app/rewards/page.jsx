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
import { Loader2, Coins, CheckCircle2 } from 'lucide-react';

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [redeemedIds, setRedeemedIds] = useState(new Set());

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/rewards`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || data);
        if (data.redeemedRewardIds) {
          setRedeemedIds(new Set(data.redeemedRewardIds));
        }
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
        setRedeemedIds((prev) => new Set([...prev, reward.id]));
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
      <div className="min-h-screen bg-cream-50 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-pfw-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">
              Rewards Store
            </h1>
            <p className="text-gray-600 mt-2">
              Redeem your hard-earned points for awesome rewards!
            </p>
          </div>
          {user && (
            <Card className="bg-pfw-gold/40 border-pfw-gold/30 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="h-6 w-6 text-black" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold text-black">
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
              className="overflow-hidden bg-white border-gray-200 hover:border-gray-300 transition-all">
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
                  <CardTitle className="text-black">
                    {reward.name}
                  </CardTitle>
                  <span className="bg-pfw-gold text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-pfw-gold/30">
                    {reward.cost}
                    {/* pts */}
                  </span>
                </div>
                <CardDescription className="text-gray-600">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {redeemedIds.has(reward.id) ? (
                  <Button
                    disabled
                    className="w-full bg-green-600 hover:bg-green-600 text-white opacity-100 cursor-default">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Redeemed
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={
                      !user ||
                      user.total_points < reward.cost ||
                      redeeming === reward.id
                    }
                    className="w-full">
                    {redeeming === reward.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Coins className="h-4 w-4 mr-2" />
                    )}
                    Redeem
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No rewards available yet. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
