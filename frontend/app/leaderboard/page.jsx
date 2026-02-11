'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="text-xl font-bold w-6 text-center text-muted-foreground">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3 text-black">
            {/* <Trophy className="h-10 w-10 text-blue-500" /> */}
            Campus Leaderboard
          </h1>

          <Card className="bg-white border-gray-200 pt-4">
            <CardHeader>
              <CardTitle className="text-black">
                Top Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-700">
                  Loading rankings...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800/70 hover:bg-slate-800/30">
                      <TableHead className="w-[100px] text-center text-gray-700">
                        Rank
                      </TableHead>
                      <TableHead className="text-gray-700">
                        Student
                      </TableHead>
                      <TableHead className="text-right text-gray-700">
                        Events
                      </TableHead>
                      <TableHead className="text-right text-gray-700">
                        Total Points
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, index) => (
                      <TableRow
                        key={u.id}
                        className={`border-slate-800/70 transition-colors ${
                          user?.id === u.id
                            ? 'bg-blue-600/10 hover:bg-blue-600/20'
                            : 'hover:bg-slate-800/30'
                        }`}>
                        <TableCell className="font-medium flex justify-center items-center">
                          {getRankIcon(index)}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {u.name}
                        </TableCell>
                        <TableCell className="text-right text-gray-700">
                          {u.events_attended}
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-400">
                          {u.total_points}
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
    </div>
  );
}
