'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, Circle, Plus, Calendar, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const priorityColors: Record<string, string> = {
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-neutral',
};

export default function TasksPage() {
  const [filter, setFilter] = useState('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['my-tasks', filter],
    queryFn: () => taskService.getMyTasks({ status: filter === 'all' ? undefined : filter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => taskService.create({ ...data, userId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      toast.success('Task created!');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task completed!');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
          <p className="text-surface-500 mt-1">Manage your tasks and to-dos</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <div className="flex gap-2">
        {['pending', 'completed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              filter === f ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-surface-400">Loading...</div>
      ) : !tasks?.length ? (
        <EmptyState icon={CheckCircle2} title="No tasks found" description="Create your first task to get started." />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="card flex items-start gap-4 hover:border-primary-200 transition-colors">
              <button
                onClick={() => completeMutation.mutate(task.id)}
                className="mt-0.5 text-surface-300 hover:text-emerald-500 transition-colors"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${task.status === 'completed' ? 'text-surface-400 line-through' : 'text-surface-900'}`}>
                    {task.title}
                  </p>
                  <Badge variant={priorityColors[task.priority] as any || 'neutral'}>{task.priority}</Badge>
                  {task.aiGenerated && <Badge variant="primary">AI</Badge>}
                </div>
                {task.description && (
                  <p className="text-sm text-surface-500 mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.lead && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.lead.firstName} {task.lead.lastName}
                    </span>
                  )}
                  <span>Created {formatDate(task.createdAt, 'relative')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <Button
            onClick={() => createMutation.mutate(form)}
            disabled={!form.title}
            className="w-full"
          >
            Create Task
          </Button>
        </div>
      </Modal>
    </div>
  );
}
