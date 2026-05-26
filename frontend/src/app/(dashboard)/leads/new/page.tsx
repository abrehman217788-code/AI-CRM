'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { leadService } from '@/services/lead.service';
import { companyService } from '@/services/company.service';
import type { LeadStatus, LeadSource } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
    status: 'NEW', source: 'MANUAL', notes: '', companyId: '',
  });

  const { data: companies } = useQuery({
    queryKey: ['companies-select'],
    queryFn: () => companyService.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: () => leadService.create(form as any),
    onSuccess: (data) => {
      toast.success('Lead created!');
      router.push(`/leads/${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/leads" className="btn-ghost p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Add Lead</h1>
          <p className="text-surface-500 mt-1">Create a new lead in the system</p>
        </div>
      </div>

      <Card>
        <CardTitle>Lead Information</CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="First Name *"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <Input
            label="Last Name *"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="Job Title"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          <Select
            label="Company"
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            options={(companies?.data || []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select company"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'NEW', label: 'New' },
              { value: 'CONTACTED', label: 'Contacted' },
              { value: 'QUALIFIED', label: 'Qualified' },
              { value: 'MQL', label: 'MQL' },
              { value: 'SQL', label: 'SQL' },
            ]}
          />
          <Select
            label="Source"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            options={[
              { value: 'MANUAL', label: 'Manual' },
              { value: 'WEBSITE_FORM', label: 'Website Form' },
              { value: 'LANDING_PAGE', label: 'Landing Page' },
              { value: 'LINKEDIN_IMPORT', label: 'LinkedIn' },
              { value: 'REFERRAL', label: 'Referral' },
              { value: 'AD_PLATFORM', label: 'Ad Platform' },
            ]}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-surface-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="input-field"
            placeholder="Any additional notes..."
          />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => createMutation.mutate()} disabled={!form.firstName || !form.lastName || createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Lead'}
          </Button>
          <Link href="/leads" className="btn-secondary">Cancel</Link>
        </div>
      </Card>
    </div>
  );
}
