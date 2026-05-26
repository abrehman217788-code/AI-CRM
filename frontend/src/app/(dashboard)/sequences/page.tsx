'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Play, Pause, Edit2, Trash2, Mail, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SequencesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newSequence, setNewSequence] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['sequences'],
    queryFn: () => api.get('/sequences').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/sequences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      setShowCreate(false);
      setNewSequence({ name: '', description: '' });
      toast.success('Sequence created!');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Sequences</h1>
          <p className="text-surface-500 mt-1">Create and manage email outreach sequences</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Create Sequence
        </button>
      </div>

      {showCreate && (
        <div className="card">
          <h3 className="font-semibold mb-4">New Sequence</h3>
          <div className="space-y-3">
            <input
              placeholder="Sequence name"
              value={newSequence.name}
              onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
              className="input-field"
            />
            <input
              placeholder="Description (optional)"
              value={newSequence.description}
              onChange={(e) => setNewSequence({ ...newSequence, description: e.target.value })}
              className="input-field"
            />
            <button
              onClick={() => createMutation.mutate(newSequence)}
              disabled={!newSequence.name}
              className="btn-primary"
            >
              Create Sequence
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {data?.data?.map((seq: any) => (
          <div key={seq.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-surface-900">{seq.name}</h3>
                {seq.description && <p className="text-xs text-surface-500 mt-1">{seq.description}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${seq.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>
                {seq.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2">
              {seq.steps?.map((step: any) => (
                <div key={step.id} className="flex items-center gap-2 text-xs text-surface-600">
                  {step.type === 'WAIT' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Mail className="h-3 w-3" />
                  )}
                  <span>{step.type} — {step.delayDays}d delay</span>
                  {step.subject && <span className="text-surface-400 truncate">: {step.subject}</span>}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100">
              <button className="btn-ghost text-xs py-1 px-2"><Mail className="h-3 w-3 mr-1" /> {seq.steps?.length || 0} steps</button>
              <button className="btn-ghost text-xs py-1 px-2 ml-auto"><Edit2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
