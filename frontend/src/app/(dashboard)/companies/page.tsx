'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Building2, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', { search: debouncedSearch, industry, page }],
    queryFn: () => companyService.getAll({ search: debouncedSearch, industry: industry || undefined, page, limit: 20 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Companies</h1>
          <p className="text-surface-500 mt-1">Manage companies and organizations</p>
        </div>
        <Link href="/companies/new" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <select
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
          className="input-field w-44"
        >
          <option value="">All Industries</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Marketing">Marketing</option>
          <option value="Recruitment">Recruitment</option>
          <option value="Education">Education</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Company</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Industry</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Employees</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Revenue</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Location</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Leads</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>
            ) : !data?.data.length ? (
              <tr><td colSpan={7} className="py-12"><EmptyState icon={Building2} title="No companies found" description="Get started by adding your first company." /></td></tr>
            ) : (
              data.data.map((company) => (
                <tr key={company.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 text-sm font-bold">
                        {company.name[0]}
                      </div>
                      <div>
                        <Link href={`/companies/${company.id}`} className="font-medium text-surface-900 hover:text-primary-600">
                          {company.name}
                        </Link>
                        {company.domain && <p className="text-xs text-surface-400">{company.domain}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {company.industry ? <Badge>{company.industry}</Badge> : <span className="text-surface-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600">{company.employeeCount?.toLocaleString() || '-'}</td>
                  <td className="px-4 py-3 text-sm text-surface-600">{company.revenue || '-'}</td>
                  <td className="px-4 py-3 text-sm text-surface-600">
                    {[company.city, company.state].filter(Boolean).join(', ') || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-600">{company._count?.leads || 0}</td>
                  <td className="px-4 py-3 text-sm text-surface-400">{formatDate(company.createdAt)}</td>
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
