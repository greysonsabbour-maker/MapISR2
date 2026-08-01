import type { MapLayerVisibility } from './map';

export interface AppSettings {
  railroadName: string;
  timezone: string;
  defaultMaxSpeed: number;
  schedulerEnabled: boolean;
  mapLayerVisibility: MapLayerVisibility;
  kmzFileName: string;
  logoFileName: string;
}

export interface SystemHealth {
  schedulerRunning: boolean;
  activeTrains: number;
  lastSchedulerTick: string;
  mapLoaded: boolean;
  storageHealthy: boolean;
}

export interface DashboardStats {
  activeTrains: number;
  upcomingDepartures: number;
  completedToday: number;
  availableLocomotives: number;
  assignedLocomotives: number;
  yardOccupancy: number;
  totalLocomotives: number;
}

export type SearchResultType =
  | 'train'
  | 'locomotive'
  | 'yard'
  | 'industry'
  | 'station'
  | 'waypoint';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  path?: string;
}

export const DEFAULT_LAYER_VISIBILITY: MapLayerVisibility = {
  mainline: true,
  sidings: true,
  yards: true,
  industries: true,
  crossovers: true,
  stations: true,
  waypoints: false,
  junctions: true,
  trains: true,
};

export const DEFAULT_SETTINGS: AppSettings = {
  railroadName: 'Ironstate Railroad',
  timezone: 'America/New_York',
  defaultMaxSpeed: 40,
  schedulerEnabled: true,
  mapLayerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
  kmzFileName: 'railroad.kmz',
  logoFileName: 'logo-full.png',
};