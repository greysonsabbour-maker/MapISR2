import { GlobalSearchBar } from './GlobalSearchBar';
import { useSchedulerStore } from '@/stores/mapStore';
import { formatRelativeTime } from '@/utils';
import { Activity, Circle } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const isRunning = useSchedulerStore((s) => s.isRunning);
  const lastTick = useSchedulerStore((s) => s.lastTick);

  return (
    <header className="flex items-center justify-between border-b border-border bg-panel/30 px-6 py-4 backdrop-blur-glass">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-foreground/50">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <Activity size={14} className={isRunning ? 'text-emerald-400' : 'text-foreground/30'} />
          <span>Scheduler</span>
          <Circle
            size={8}
            className={isRunning ? 'fill-emerald-400 text-emerald-400' : 'fill-foreground/20 text-foreground/20'}
          />
          {isRunning && <span>Last tick {formatRelativeTime(lastTick)}</span>}
        </div>
        <GlobalSearchBar />
      </div>
    </header>
  );
}
