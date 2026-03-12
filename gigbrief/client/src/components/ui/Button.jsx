import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-gb-blue text-white hover:bg-gb-blue/90 border-gb-blue/50',
  secondary: 'bg-gb-panel text-gb-text hover:bg-gb-panel/80 border-gb-border',
  danger: 'bg-gb-red/10 text-gb-red hover:bg-gb-red/20 border-gb-red/30',
  ghost: 'text-gb-muted hover:text-gb-text hover:bg-gb-panel border-transparent',
  success: 'bg-gb-green/10 text-gb-green hover:bg-gb-green/20 border-gb-green/30',
};

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children, variant = 'primary', size = 'md', className, disabled, ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-md border transition-all',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
