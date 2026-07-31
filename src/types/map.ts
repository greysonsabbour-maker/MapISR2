export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export type MapLayerType =
  | 'mainline'
  | 'sidings'
  | 'yards'
  | 'industries'
  | 'crossovers'
  | 'stations'
  | 'waypoints'
  | 'junctions'
  | 'trains';

export interface MapFeature {
  id: string;
  name: string;
  type: MapLayerType;
  coordinates: GeoCoordinate[];
  description?: string;
  properties: Record<string, string>;
}

export interface MapFeatureCollection {
  features: MapFeature[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface MapLayerVisibility {
  mainline: boolean;
  sidings: boolean;
  yards: boolean;
  industries: boolean;
  crossovers: boolean;
  stations: boolean;
  waypoints: boolean;
  junctions: boolean;
  trains: boolean;
}

export interface RailroadLocation {
  id: string;
  name: string;
  type: MapLayerType;
  coordinate: GeoCoordinate;
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

export const LAYER_LABELS: Record<MapLayerType, string> = {
  mainline: 'Mainline',
  sidings: 'Sidings',
  yards: 'Yards',
  industries: 'Industries',
  crossovers: 'Crossovers',
  stations: 'Stations',
  waypoints: 'Waypoints',
  junctions: 'Junctions',
  trains: 'Trains',
};
