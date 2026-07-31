import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTrainStore } from '@/stores/trainStore';
import { useMapStore, useSchedulerStore } from '@/stores/mapStore';
import { getTimelineEvents } from '@/services/timeline/timelineService';
import { formatDateTime } from '@/utils';
import { TIMELINE_EVENT_LABELS } from '@/types/timeline';
import {
  Shield,
  Database,
  Activity,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { clearTimeline } from '@/services/timeline/timelineService';

export function AdminPage() {
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const schedules = useScheduleStore((s) => s.schedules);
  const trains = useTrainStore((s) => s.trains);
  const history = useTrainStore((s) => s.history);
  const features = useMapStore((s) => s.features);
  const isRunning = useSchedulerStore((s) => s.isRunning);
  const [timeline, setTimeline] = useState(getTimelineEvents());

  const refreshTimeline = () => setTimeline(getTimelineEvents());

  const handleClearTimeline = () => {
    if (confirm('Clear all timeline events? This cannot be undone.')) {
      clearTimeline();
      refreshTimeline();
    }
  };

  const viewerPasswords = ['railfan', 'dispatcher', 'freight', 'mainline', 'cabride'];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Administration" subtitle="System management and configuration" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <Database size={24} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{locomotives.length}</p>
                <p className="text-xs text-foreground/50">Locomotives</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{schedules.length}</p>
                <p className="text-xs text-foreground/50">Schedules</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{trains.length}</p>
                <p className="text-xs text-foreground/50">Active Trains</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Database size={24} className="text-accent" />
              <div>
                <p className="text-2xl font-bold">{features.length}</p>
                <p className="text-xs text-foreground/50">Map Features</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="System Status">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-foreground/70">Scheduler</span>
                <Badge variant={isRunning ? 'success' : 'danger'}>
                  {isRunning ? 'Running' : 'Stopped'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-foreground/70">Active Trains</span>
                <span>{trains.filter((t) => t.status !== 'Completed').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-foreground/70">Completed (History)</span>
                <span>{history.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-foreground/70">Timeline Events</span>
                <span>{timeline.length}</span>
              </div>
            </div>
          </Card>

          <Card title="User Access">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-xs text-foreground/50">Password: donut (full access)</p>
              </div>
              <div>
                <p className="text-sm font-medium">Viewers (Read Only)</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {viewerPasswords.map((pw) => (
                    <Badge key={pw} variant="default">{pw}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title="Railroad Timeline"
          subtitle="Permanent chronological log"
          action={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={refreshTimeline}>
                <RefreshCw size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearTimeline}>
                <Trash2 size={14} />
              </Button>
            </div>
          }
        >
          {timeline.length === 0 ? (
            <EmptyState title="No Timeline Events" description="Operations will be logged here." />
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {timeline.slice(0, 50).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg bg-background/50 px-3 py-2"
                >
                  <Badge variant="accent" className="shrink-0">
                    {TIMELINE_EVENT_LABELS[event.type]}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-foreground/50">{event.description}</p>
                  </div>
                  <span className="text-xs text-foreground/40 shrink-0">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
