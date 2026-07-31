import type { MapLayerType } from '@/types';

export const LAYER_COLORS: Record<MapLayerType, string> = {
  mainline: '#A54A18',
  sidings: '#6B7280',
  yards: '#3B82F6',
  industries: '#10B981',
  crossovers: '#8B5CF6',
  stations: '#F59E0B',
  waypoints: '#64748B',
  junctions: '#EC4899',
  trains: '#F59E0B',
};

export const LAYER_LINE_WEIGHTS: Record<MapLayerType, number> = {
  mainline: 4,
  sidings: 2,
  yards: 3,
  industries: 2,
  crossovers: 2,
  stations: 0,
  waypoints: 0,
  junctions: 3,
  trains: 0,
};
