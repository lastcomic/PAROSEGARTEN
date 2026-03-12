import { cn } from '@/lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div className={cn('bg-gb-card border border-gb-border rounded-lg', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-4 py-3 border-b border-gb-border flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-semibold text-gb-text', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}
