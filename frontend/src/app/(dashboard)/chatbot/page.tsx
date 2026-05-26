'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { chatbotService } from '@/services/chatbot.service';
import { formatDate } from '@/lib/utils';
import { Bot, Send, MessageSquare, User, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatbotPage() {
  const [visitorId] = useState(() => 'visitor_' + Math.random().toString(36).slice(2, 9));
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSessions, setShowSessions] = useState(false);

  const { data: sessions } = useQuery({
    queryKey: ['chatbot-sessions'],
    queryFn: () => chatbotService.getSessions(),
  });

  const sendMutation = useMutation({
    mutationFn: () => chatbotService.sendMessage(visitorId, message),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: message },
        { role: 'bot', content: data.response || data.message },
      ]);
      setMessage('');
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate();
  };

  const startNewSession = () => {
    setMessages([
      { role: 'bot', content: 'Hi! I\'m the AI CRM assistant. I can help you find leads, check pipeline status, or answer questions about your sales data. How can I help?' },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Chatbot</h1>
          <p className="text-surface-500 mt-1">AI-powered sales assistant</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSessions(true)} className="btn-secondary">
            <MessageSquare className="h-4 w-4 mr-2" /> Sessions
          </button>
          <button onClick={startNewSession} className="btn-primary">
            <Bot className="h-4 w-4 mr-2" /> New Chat
          </button>
        </div>
      </div>

      <div className="card flex flex-col h-[600px]">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="rounded-full bg-primary-100 p-4 inline-block mb-4">
                <Bot className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-surface-900">AI CRM Assistant</h3>
              <p className="text-sm text-surface-500 mt-1">Start a conversation to get started</p>
              <button onClick={startNewSession} className="btn-primary mt-4">Start Chat</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-900'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-100">
                  <Bot className="h-4 w-4 text-surface-600" />
                </div>
                <div className="bg-surface-100 rounded-lg px-4 py-2 text-sm text-surface-500">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-surface-200 p-4">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={sendMutation.isPending}
            />
            <button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} className="btn-primary px-4">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-2">Ask about leads, pipeline, or sales data</p>
        </div>
      </div>

      <Modal open={showSessions} onClose={() => setShowSessions(false)} title="Chat Sessions" size="lg">
        {sessions?.length ? (
          <div className="space-y-2">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:border-primary-200 transition-colors">
                <div>
                  <p className="font-medium text-surface-900 text-sm">
                    {session.lead?.firstName} {session.lead?.lastName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-surface-400">{session.intent || 'No intent detected'} • {formatDate(session.createdAt, 'relative')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {session.qualified && <Badge variant="success">Qualified</Badge>}
                  {session.bookedMeeting && <Badge variant="primary">Meeting</Badge>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No sessions" description="Chat sessions will appear here." />
        )}
      </Modal>
    </div>
  );
}
