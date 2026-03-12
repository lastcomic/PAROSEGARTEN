import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(amount) {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getStatusColor(status) {
  const colors = {
    confirmed: 'bg-gb-green/20 text-gb-green border-gb-green/30',
    draft: 'bg-gb-muted/20 text-gb-muted border-gb-muted/30',
    needs_review: 'bg-gb-amber/20 text-gb-amber border-gb-amber/30',
    cancelled: 'bg-gb-red/20 text-gb-red border-gb-red/30',
    completed: 'bg-gb-blue/20 text-gb-blue border-gb-blue/30',
  };
  return colors[status] || colors.draft;
}

export function getConfidenceColor(confidence) {
  if (confidence >= 0.8) return 'text-gb-green';
  if (confidence >= 0.5) return 'text-gb-amber';
  return 'text-gb-red';
}

export function getChecklistProgress(items) {
  if (!items || items.length === 0) return 0;
  const done = items.filter(i => i.status === 'confirmed').length;
  return Math.round((done / items.length) * 100);
}
