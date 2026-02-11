import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Edit } from 'lucide-react';

export function UsersTable({
  users,
  searchTerm,
  setSearchTerm,
  formatDate,
  handleChangeRole,
  handleDeleteUser,
}) {
  return (
    <Card className="bg-white border-gray-200 backdrop-blur-xl pt-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-black">
            All Users{' '}
            <span className="text-black text-sm ml-2 p-2 bg-gray-100 rounded-full">
              {users.length}
            </span>
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black0 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-black placeholder:text-black0 focus:ring-blue-900/50 focus:border-blue-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Events Created</th>
                <th className="p-4 text-center">Events Attended</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-black">
                    {u.name}
                  </td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <Badge
                      className={`capitalize duration-100 transition-colors ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20'
                          : u.role === 'organizer'
                            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                      }`}
                      variant="outline">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    {u.events_created}
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    {u.events_attended}
                  </td>
                  <td className="p-4 text-gray-600">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => handleChangeRole(u.id, u.role)}
                        title="Change Role">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
