import { cn } from '@/lib/utils';

export default function ProgressBar({ value = 0, className }) {
  const color = value >= 80 ? 'bg-gb-green' : value >= 50 ? 'bg-gb-amber' : 'bg-gb-blue';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-gb-panel rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${Math.min(100, value)}%`, boxShadow: `0 0 6px ${value >= 80 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#3b82f6'}40` }}
        />
      </div>
      <span className="text-[11px] font-mono text-gb-muted w-8 text-right">{value}%</span>
    </div>
  );
}
