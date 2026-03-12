import { cn, getStatusColor } from '@/lib/utils';

export default function StatusBadge({ status, className }) {
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border',
      getStatusColor(status),
      className,
    )}>
      {label}
    </span>
  );
}
