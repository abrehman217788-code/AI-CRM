'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  LayoutDashboard, Users, Target, Mail, BarChart3, Brain, Workflow, Building2, Calendar, Settings, Activity, Bot,
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Pipeline', href: '/pipeline', icon: Target },
  { label: 'Sequences', href: '/sequences', icon: Mail },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'AI Insights', href: '/ai-insights', icon: Brain },
  { label: 'Workflows', href: '/workflows', icon: Workflow },
  { label: 'Companies', href: '/companies', icon: Building2 },
  { label: 'Tasks', href: '/tasks', icon: Calendar },
  { label: 'Campaigns', href: '/campaigns', icon: Activity },
  { label: 'Chatbot', href: '/chatbot', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings, roles: [UserRole.ADMIN, UserRole.SALES_MANAGER] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role as UserRole)),
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-surface-200 bg-white">
      <Link href="/dashboard" className="flex items-center gap-2 border-b border-surface-200 px-6 py-4">
        <Activity className="h-7 w-7 text-primary-600" />
        <span className="text-lg font-bold text-surface-900">AI CRM</span>
      </Link>

      <nav className="mt-4 px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
