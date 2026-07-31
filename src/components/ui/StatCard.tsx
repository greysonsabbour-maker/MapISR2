import { cn } from '@/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('glass-panel p-4 card-hover animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {trend && <p className="mt-1 text-xs text-foreground/50">{trend}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/20 p-2 text-accent">{icon}</div>
        )}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-foreground/30">{icon}</div>}
      <h3 className="text-lg font-medium text-foreground/80">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-foreground/50">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-border border-t-accent',
          sizeClasses[size],
        )}
      />
      {label && <p className="text-sm text-foreground/50">{label}</p>}
    </div>
  );
}
