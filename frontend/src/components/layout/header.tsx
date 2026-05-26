'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-surface-200 bg-white/80 backdrop-blur-sm px-8">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-100 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="text-left">
            <p className="font-medium text-surface-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-surface-500">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-surface-400" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-surface-200 bg-white py-1 shadow-lg">
              <div className="px-3 py-2 border-b border-surface-100">
                <p className="text-sm font-medium text-surface-900">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
