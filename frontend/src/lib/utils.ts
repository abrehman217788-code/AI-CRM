import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short') {
  const d = new Date(date);
  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  }
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-surface-500 bg-surface-50 border-surface-200';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: 'badge-neutral',
    CONTACTED: 'badge-primary',
    QUALIFIED: 'badge-success',
    MQL: 'badge-warning',
    SQL: 'badge-warning',
    OPPORTUNITY: 'badge-primary',
    CONVERTED: 'badge-success',
    DISQUALIFIED: 'badge-danger',
    ARCHIVED: 'badge-neutral',
  };
  return colors[status] || 'badge-neutral';
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    PROSPECTING: 'bg-surface-100 text-surface-600',
    QUALIFICATION: 'bg-blue-100 text-blue-700',
    NEED_ANALYSIS: 'bg-indigo-100 text-indigo-700',
    PROPOSAL: 'bg-amber-100 text-amber-700',
    NEGOTIATION: 'bg-orange-100 text-orange-700',
    CLOSED_WON: 'bg-emerald-100 text-emerald-700',
    CLOSED_LOST: 'bg-red-100 text-red-700',
  };
  return colors[stage] || 'bg-surface-100 text-surface-600';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
