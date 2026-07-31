import { cn } from '@/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-border/50 text-foreground/80',
  success: 'bg-emerald-900/50 text-emerald-300',
  warning: 'bg-amber-900/50 text-amber-300',
  danger: 'bg-red-900/50 text-red-300',
  info: 'bg-blue-900/50 text-blue-300',
  accent: 'bg-primary/30 text-accent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(
  status: string,
): BadgeVariant {
  switch (status) {
    case 'Available':
    case 'En Route':
    case 'Completed':
      return 'success';
    case 'Assigned':
    case 'Departing':
    case 'Arriving':
      return 'warning';
    case 'Maintenance':
    case 'Out of Service':
    case 'Cancelled':
      return 'danger';
    case 'Scheduled':
      return 'info';
    default:
      return 'default';
  }
}
