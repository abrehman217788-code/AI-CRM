'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Shield, Bell, Key, Database, Webhook } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    title: user?.title || '',
  });

  const handleSave = () => {
    toast.success('Settings saved (API integration pending)');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your account and integration preferences</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1">
          <h3 className="font-semibold text-surface-900">Navigation</h3>
          <nav className="space-y-1">
            {[
              { icon: User, label: 'Profile', active: true },
              { icon: Shield, label: 'Security', active: false },
              { icon: Bell, label: 'Notifications', active: false },
              { icon: Key, label: 'API Keys', active: false },
              { icon: Database, label: 'Integrations', active: false },
              { icon: Webhook, label: 'Webhooks', active: false },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.active ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="col-span-2 space-y-6">
          <Card>
            <CardTitle>Profile</CardTitle>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="First Name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
              <Input label="Last Name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
              <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1-555-0000" />
              <Input label="Job Title" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Sales Rep" />
              <Input label="Email" value={user?.email || ''} disabled />
              <Input label="Role" value={user?.role?.replace(/_/g, ' ') || ''} disabled />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSave}>Save Changes</Button>
              <Badge variant="warning">Demo Mode</Badge>
            </div>
          </Card>

          <Card>
            <CardTitle>Integrations</CardTitle>
            <p className="text-sm text-surface-500 mt-1 mb-4">Connect your tools to sync data automatically</p>
            <div className="space-y-3">
              {[
                { name: 'Salesforce', connected: false },
                { name: 'HubSpot', connected: false },
                { name: 'Slack', connected: false },
                { name: 'Gmail', connected: false },
                { name: 'LinkedIn', connected: false },
                { name: 'Clearbit', connected: false },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border border-surface-200">
                  <div>
                    <p className="font-medium text-surface-900 text-sm">{integration.name}</p>
                    <p className="text-xs text-surface-400">{integration.connected ? 'Connected' : 'Not connected'}</p>
                  </div>
                  <Button variant={integration.connected ? 'secondary' : 'primary'} size="sm">
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
