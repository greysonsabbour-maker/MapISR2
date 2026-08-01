import type {
  Train,
  Locomotive,
  Schedule,
  MapFeature,
  SearchResult,
} from '@/types';
import { formatLocomotiveDisplay } from '@/services/locomotive/locomotiveService';

export function computeDashboardStats(
  trains: Train[],
  locomotives: Locomotive[],
  _history: unknown[],
  yards: { currentOccupancy: number; capacity: number }[],
): {
  activeTrains: number;
  upcomingDepartures: number;
  completedToday: number;
  availableLocomotives: number;
  assignedLocomotives: number;
  yardOccupancy: number;
  totalLocomotives: number;
} {
  const now = new Date();

  const activeTrains = trains.filter(
    (t) => t.status !== 'Completed' && t.status !== 'Cancelled',
  );

  const upcomingDepartures = trains.filter((t) => {
    if (t.status !== 'Scheduled') return false;
    const dep = new Date(t.departureTime);
    return dep > now && dep.getTime() - now.getTime() < 3600000;
  }).length;

  const completedToday = trains.filter(
    (t) => t.status === 'Completed',
  ).length;

  const availableLocomotives = locomotives.filter(
    (l) => l.status === 'Available',
  ).length;

  const assignedLocomotives = locomotives.filter(
    (l) => l.status === 'Assigned',
  ).length;

  const totalCapacity = yards.reduce((sum, y) => sum + y.capacity, 0);
  const totalOccupancy = yards.reduce(
    (sum, y) => sum + y.currentOccupancy,
    0,
  );

  const yardOccupancy =
    totalCapacity > 0
      ? (totalOccupancy / totalCapacity) * 100
      : 0;

  return {
    activeTrains: activeTrains.length,
    upcomingDepartures,
    completedToday,
    availableLocomotives,
    assignedLocomotives,
    yardOccupancy,
    totalLocomotives: locomotives.length,
  };
}

export function globalSearch(
  query: string,
  trains: Train[],
  locomotives: Locomotive[],
  mapFeatures: MapFeature[],
): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const train of trains) {
    if (
      train.symbol.toLowerCase().includes(q) ||
      train.origin.toLowerCase().includes(q) ||
      train.destination.toLowerCase().includes(q)
    ) {
      results.push({
        id: train.id,
        type: 'train',
        title: train.symbol,
        subtitle: `${train.origin} → ${train.destination} (${train.status})`,
        path: '/trains',
      });
    }
  }

  for (const loco of locomotives) {
    const display = formatLocomotiveDisplay(loco);

    if (
      display.toLowerCase().includes(q) ||
      loco.roadNumber.includes(q) ||
      loco.model.toLowerCase().includes(q)
    ) {
      results.push({
        id: loco.id,
        type: 'locomotive',
        title: display,
        subtitle: `${loco.status} — ${loco.currentLocation}`,
        path: '/locomotives',
      });
    }
  }

  for (const feature of mapFeatures) {
    if (!feature.name.toLowerCase().includes(q)) continue;

    let type: SearchResult['type'] = 'waypoint';

    switch (feature.type) {
      case 'yards':
        type = 'yard';
        break;
      case 'industries':
        type = 'industry';
        break;
      case 'stations':
        type = 'station';
        break;
    }

    results.push({
      id: feature.id,
      type,
      title: feature.name,
      subtitle:
        feature.type.charAt(0).toUpperCase() +
        feature.type.slice(1),
      path: '/map',
    });
  }

  return results.slice(0, 20);
}

export function getUpcomingDepartures(
  trains: Train[],
  schedules: Schedule[],
  limit = 5,
): {
  symbol: string;
  origin: string;
  destination: string;
  departureTime: string;
  trainType: string;
}[] {
  const now = new Date();

  const upcoming: {
    symbol: string;
    origin: string;
    destination: string;
    departureTime: string;
    trainType: string;
    sortTime: number;
  }[] = [];

  for (const train of trains) {
    if (train.status !== 'Scheduled') continue;

    const dep = new Date(train.departureTime);

    if (dep > now) {
      upcoming.push({
        symbol: train.symbol,
        origin: train.origin,
        destination: train.destination,
        departureTime: train.departureTime,
        trainType: train.trainType,
        sortTime: dep.getTime(),
      });
    }
  }

  for (const schedule of schedules) {
    if (!schedule.enabled) continue;

    const [h, m] = schedule.departureTime
      .split(':')
      .map(Number);

    const dep = new Date();
    dep.setHours(h ?? 0, m ?? 0, 0, 0);

    if (dep > now) {
      upcoming.push({
        symbol: schedule.symbol,
        origin: schedule.origin,
        destination: schedule.destination,
        departureTime: dep.toISOString(),
        trainType: schedule.trainType,
        sortTime: dep.getTime(),
      });
    }
  }

  return upcoming
    .sort((a, b) => a.sortTime - b.sortTime)
    .slice(0, limit)
    .map(({ sortTime: _, ...rest }) => rest);
}
