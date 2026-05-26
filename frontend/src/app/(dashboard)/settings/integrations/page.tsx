'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plug, Plus, Check, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations').then(r => r.data),
  });

  const { data: available } = useQuery({
    queryKey: ['available-integrations'],
    queryFn: () => api.get('/integrations/available').then(r => r.data),
  });

  const categories = Array.from(new Set(available?.map((p: any) => p.category) || []));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Integrations</h1>
        <p className="text-surface-500 mt-1">Connect your favorite tools to AI CRM</p>
      </div>

      {categories.map((category) => (
        <div key={category as string}>
          <h3 className="font-semibold text-surface-900 mb-3">{category as string}</h3>
          <div className="grid grid-cols-3 gap-4">
            {available
              ?.filter((p: any) => p.category === category)
              .map((provider: any) => {
                const connected = integrations?.find((i: any) => i.provider === provider.id);
                return (
                  <div key={provider.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-surface-100 p-2">
                        <Plug className="h-5 w-5 text-surface-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-900">{provider.name}</p>
                        <p className="text-xs text-surface-400">{connected ? 'Connected' : 'Available'}</p>
                      </div>
                    </div>
                    {connected ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <button className="btn-ghost text-xs py-1 px-2">Connect</button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
