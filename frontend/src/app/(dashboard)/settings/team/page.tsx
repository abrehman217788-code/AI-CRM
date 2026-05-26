'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { UserPlus, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SALES_MANAGER: 'bg-purple-100 text-purple-700',
  AE: 'bg-blue-100 text-blue-700',
  SDR: 'bg-emerald-100 text-emerald-700',
  READ_ONLY: 'bg-surface-100 text-surface-500',
};

export default function TeamPage() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/auth/profile').then(r => [r.data]),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Team</h1>
          <p className="text-surface-500 mt-1">Manage team members and permissions</p>
        </div>
        <button className="btn-primary"><UserPlus className="h-4 w-4 mr-2" /> Invite Member</button>
      </div>

      <div className="card p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user: any) => (
              <tr key={user.id} className="border-b border-surface-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="font-medium text-surface-900">{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role] || 'bg-surface-100 text-surface-600'}`}>
                    {user.role?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-surface-400">{user.lastLoginAt ? formatDate(user.lastLoginAt, 'relative') : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
