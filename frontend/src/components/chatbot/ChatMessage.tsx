import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'bot';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn('flex items-start gap-3', role === 'user' && 'flex-row-reverse')}>
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
        role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600',
      )}>
        {role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn(
        'max-w-[70%] rounded-lg px-4 py-2 text-sm',
        role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900',
      )}>
        {content}
      </div>
    </div>
  );
}
