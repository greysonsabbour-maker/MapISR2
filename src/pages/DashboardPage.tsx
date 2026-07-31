import { useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { StatCard, Card, Badge, statusToBadgeVariant, EmptyState } from '@/components/ui';
import { useTrainStore } from '@/stores/trainStore';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useMapStore, useSchedulerStore } from '@/stores/mapStore';
import { computeDashboardStats, getUpcomingDepartures } from '@/services/dashboard/dashboardService';
import { getRecentTimelineEvents } from '@/services/timeline/timelineService';
import { formatDateTime, formatTime } from '@/utils';
import {
  Train,
  Calendar,
  CheckCircle,
  TrainFront,
  MapPin,
  Activity,
  Clock,
} from 'lucide-react';
import { TIMELINE_EVENT_LABELS } from '@/types/timeline';

export function DashboardPage() {
  const trains = useTrainStore((s) => s.trains);
  const history = useTrainStore((s) => s.history);
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const schedules = useScheduleStore((s) => s.schedules);
  const locations = useMapStore((s) => s.locations);
  const isRunning = useSchedulerStore((s) => s.isRunning);
  const lastTick = useSchedulerStore((s) => s.lastTick);

  const stats = useMemo(
    () =>
      computeDashboardStats(
        trains,
        locomotives,
        history,
        locations.yards.map((name) => ({
          capacity: 50,
          currentOccupancy: locomotives.filter(
            (l) => l.currentYard === name && l.status === 'Available',
          ).length,
        })),
      ),
    [trains, locomotives, history, locations.yards],
  );

  const upcoming = useMemo(
    () => getUpcomingDepartures(trains, schedules),
    [trains, schedules],
  );

  const activeTrains = trains.filter(
    (t) => t.status !== 'Completed' && t.status !== 'Cancelled',
  );

  const timeline = getRecentTimelineEvents(10);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Dashboard" subtitle="Ironstate Railroad Operations Overview" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Active Trains" value={stats.activeTrains} icon={<Train size={20} />} />
          <StatCard label="Upcoming" value={stats.upcomingDepartures} icon={<Clock size={20} />} />
          <StatCard label="Completed Today" value={stats.completedToday} icon={<CheckCircle size={20} />} />
          <StatCard label="Available Power" value={stats.availableLocomotives} icon={<TrainFront size={20} />} />
          <StatCard label="Assigned Power" value={stats.assignedLocomotives} icon={<TrainFront size={20} />} />
          <StatCard label="Total Locomotives" value={stats.totalLocomotives} icon={<TrainFront size={20} />} />
          <StatCard
            label="Yard Occupancy"
            value={`${stats.yardOccupancy.toFixed(0)}%`}
            icon={<MapPin size={20} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Active Trains" className="lg:col-span-2">
            {activeTrains.length === 0 ? (
              <EmptyState
                icon={<Train size={40} />}
                title="No Active Trains"
                description="Trains will appear here when schedules dispatch or special trains are created."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground/50">
                      <th className="pb-2 pr-4 font-medium">Symbol</th>
                      <th className="pb-2 pr-4 font-medium">Route</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 font-medium">Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrains.slice(0, 10).map((train) => (
                      <tr key={train.id} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 font-medium">{train.symbol}</td>
                        <td className="py-2.5 pr-4 text-foreground/70">
                          {train.origin} → {train.destination}
                        </td>
                        <td className="py-2.5 pr-4 text-foreground/70">{train.trainType}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={statusToBadgeVariant(train.status)}>
                            {train.status}
                          </Badge>
                        </td>
                        <td className="py-2.5">{train.currentSpeed} mph</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="System Health">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Scheduler</span>
                <Badge variant={isRunning ? 'success' : 'danger'}>
                  {isRunning ? 'Running' : 'Stopped'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Last Tick</span>
                <span className="text-sm">{formatDateTime(lastTick)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Schedules</span>
                <span className="text-sm">{schedules.filter((s) => s.enabled).length} active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Map Locations</span>
                <span className="text-sm">{locations.all.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Storage</span>
                <Badge variant="success">Healthy</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Upcoming Departures" subtitle="Next scheduled movements">
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Calendar size={32} />}
                title="No Upcoming Departures"
                description="Create schedules to see upcoming train movements."
              />
            ) : (
              <ul className="space-y-2">
                {upcoming.map((dep, i) => (
                  <li
                    key={`${dep.symbol}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">{dep.symbol}</span>
                      <span className="ml-2 text-sm text-foreground/50">
                        {dep.origin} → {dep.destination}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge variant="accent">{dep.trainType}</Badge>
                      <p className="mt-0.5 text-xs text-foreground/50">
                        {formatTime(dep.departureTime)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recent Activity" subtitle="Railroad timeline">
            {timeline.length === 0 ? (
              <EmptyState
                icon={<Activity size={32} />}
                title="No Activity Yet"
                description="Operations events will appear here as trains move."
              />
            ) : (
              <ul className="space-y-2">
                {timeline.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg bg-background/50 px-3 py-2"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-foreground/50 truncate">{event.description}</p>
                    </div>
                    <span className="text-xs text-foreground/40 shrink-0">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
