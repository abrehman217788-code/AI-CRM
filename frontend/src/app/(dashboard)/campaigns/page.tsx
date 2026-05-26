'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { campaignService } from '@/services/campaign.service';
import { formatDate } from '@/lib/utils';
import { Plus, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CampaignsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', page],
    queryFn: () => campaignService.getAll({ page, limit: 20 }),
  });

  const totalSpent = data?.data.reduce((sum, c) => sum + Number(c.spent), 0) || 0;
  const totalLeads = data?.data.reduce((sum, c) => sum + c.leadsGenerated, 0) || 0;
  const totalConversions = data?.data.reduce((sum, c) => sum + c.conversions, 0) || 0;
  const totalRevenue = data?.data.reduce((sum, c) => sum + Number(c.revenue || 0), 0) || 0;
  const avgRoi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Campaigns</h1>
          <p className="text-surface-500 mt-1">Track marketing campaign performance</p>
        </div>
        <Link href="/campaigns/new" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5"><DollarSign className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-xs font-medium text-surface-500">Total Spent</p><p className="text-xl font-bold">${totalSpent.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5"><Users className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-xs font-medium text-surface-500">Leads Generated</p><p className="text-xl font-bold">{totalLeads}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5"><Target className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-xs font-medium text-surface-500">Conversions</p><p className="text-xl font-bold">{totalConversions}</p></div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-xs font-medium text-surface-500">Avg ROI</p><p className="text-xl font-bold">{avgRoi.toFixed(1)}%</p></div>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Campaign</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Source</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Spent</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Leads</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Conv.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Start</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-12 text-surface-400">Loading...</td></tr>
            ) : !data?.data.length ? (
              <tr><td colSpan={8} className="py-12"><EmptyState title="No campaigns" description="Create your first campaign to start tracking." /></td></tr>
            ) : (
              data.data.map((campaign) => (
                <tr key={campaign.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${campaign.id}`} className="font-medium text-surface-900 hover:text-primary-600">
                      {campaign.name}
                    </Link>
                    {campaign.description && <p className="text-xs text-surface-400">{campaign.description}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge>{campaign.source.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-4 py-3 text-sm">${Number(campaign.budget).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">${Number(campaign.spent).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">{campaign.leadsGenerated}</td>
                  <td className="px-4 py-3 text-sm font-medium">{campaign.conversions}</td>
                  <td className="px-4 py-3">
                    <Badge variant={campaign.isActive ? 'success' : 'neutral'}>
                      {campaign.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">
                    {campaign.startDate ? formatDate(campaign.startDate) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
