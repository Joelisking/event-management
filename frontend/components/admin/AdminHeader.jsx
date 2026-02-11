import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Calendar, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function AdminHeader({ title }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className={`text-gray-900 hover:text-black hover:bg-gray-100 ${
                    isActive('/admin/dashboard')
                      ? 'bg-pfw-gold/10 text-black font-medium'
                      : ''
                  }`}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  className={`text-gray-900 hover:text-black hover:bg-gray-100 ${
                    isActive('/admin/users')
                      ? 'bg-pfw-gold/10 text-black font-medium'
                      : ''
                  }`}>
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/events">
                <Button
                  variant="ghost"
                  className={`text-gray-900 hover:text-black hover:bg-gray-100 ${
                    isActive('/admin/events')
                      ? 'bg-pfw-gold/10 text-black font-medium'
                      : ''
                  }`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </Button>
              </Link>
              <Link href="/admin/rewards">
                <Button
                  variant="ghost"
                  className={`text-gray-900 hover:text-black hover:bg-gray-100 ${
                    isActive('/admin/rewards')
                      ? 'bg-pfw-gold/10 text-black font-medium'
                      : ''
                  }`}>
                  <Gift className="w-4 h-4 mr-2" />
                  Rewards
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button>View Site</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
