import { Mail, Clock, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Sequence } from '@/types';

interface SequenceCardProps {
  sequence: Sequence;
  onEdit?: (id: string) => void;
}

export function SequenceCard({ sequence, onEdit }: SequenceCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-surface-900">{sequence.name}</h3>
          {sequence.description && <p className="text-xs text-surface-500 mt-1">{sequence.description}</p>}
        </div>
        <Badge variant={sequence.isActive ? 'success' : 'neutral'}>
          {sequence.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-2">
        {sequence.steps?.map((step) => (
          <div key={step.id} className="flex items-center gap-2 text-xs text-surface-600">
            {step.type === 'WAIT' ? (
              <Clock className="h-3 w-3 shrink-0" />
            ) : (
              <Mail className="h-3 w-3 shrink-0" />
            )}
            <span className="font-medium">{step.type}</span>
            <span className="text-surface-400">— {step.delayDays}d delay</span>
            {step.subject && <span className="text-surface-400 truncate">: {step.subject}</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100">
        <span className="text-xs text-surface-400">{sequence.steps?.length || 0} steps</span>
        {onEdit && (
          <button onClick={() => onEdit(sequence.id)} className="btn-ghost text-xs py-1 px-2 ml-auto">
            <Edit2 className="h-3 w-3 mr-1" /> Edit
          </button>
        )}
      </div>
    </div>
  );
}
