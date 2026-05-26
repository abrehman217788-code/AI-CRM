'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { formatDate, getScoreColor, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Search, Filter, Upload, Download } from 'lucide-react';
import type { LeadStatus, LeadSource } from '@/types';

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', { search, status, page }],
    queryFn: () => leadService.getAll({ search, status: status || undefined, page, limit: 20 }),
  });

  const statusOptions = ['NEW', 'CONTACTED', 'QUALIFIED', 'MQL', 'SQL', 'OPPORTUNITY', 'DISQUALIFIED', 'ARCHIVED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Leads</h1>
          <p className="text-surface-500 mt-1">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/leads/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as LeadStatus); setPage(1); }}
          className="input-field w-44"
        >
          <option value="">All Status</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Owner</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>
            ) : data?.data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-surface-400">No leads found</td></tr>
            ) : (
              data?.data.map((lead) => (
                <tr key={lead.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-surface-900 hover:text-primary-600">
                      {lead.firstName} {lead.lastName}
                    </Link>
                    {lead.jobTitle && <p className="text-xs text-surface-400">{lead.jobTitle}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600">{lead.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-surface-600">{lead.company?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={getStatusColor(lead.status)}>{lead.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600">
                    {lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-400">{formatDate(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, data.meta.total)} of {data.meta.total}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm">Previous</button>
            <button disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
