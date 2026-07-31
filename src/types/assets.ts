import type { GeoCoordinate } from './map';

export interface Yard {
  id: string;
  name: string;
  coordinate: GeoCoordinate;
  capacity: number;
  currentOccupancy: number;
}

export interface Industry {
  id: string;
  name: string;
  coordinate: GeoCoordinate;
  type: string;
}

export interface Station {
  id: string;
  name: string;
  coordinate: GeoCoordinate;
}

export interface Waypoint {
  id: string;
  name: string;
  coordinate: GeoCoordinate;
}

export interface Junction {
  id: string;
  name: string;
  coordinate: GeoCoordinate;
}

export interface TrackSegment {
  id: string;
  name: string;
  type: string;
  coordinates: GeoCoordinate[];
}

export type RailroadAsset = Yard | Industry | Station | Waypoint | Junction;
