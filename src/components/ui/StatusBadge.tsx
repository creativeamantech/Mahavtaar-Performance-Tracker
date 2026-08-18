import { cn } from '@/lib/utils';

type BadgeVariant = 'paid' | 'unpaid' | 'bucket' | 'manual' | 'file' | 'info' | 'admin' | 'manager' | 'executive' | 'viewer';

const variantStyles: Record<BadgeVariant, string> = {
  paid: 'bg-success/20 text-success',
  unpaid: 'bg-destructive/20 text-destructive',
  bucket: 'bg-primary/20 text-primary',
  manual: 'bg-info/20 text-info',
  file: 'bg-[#A855F7]/20 text-[#A855F7]',
  info: 'bg-info/20 text-info',
  admin: 'bg-[#A855F7]/20 text-[#A855F7]',
  manager: 'bg-info/20 text-info',
  executive: 'bg-primary/20 text-primary',
  viewer: 'bg-muted text-muted-foreground',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-sm px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-wide',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}
