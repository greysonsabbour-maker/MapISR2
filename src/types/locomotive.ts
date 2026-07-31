export type LocomotiveStatus =
  | 'Available'
  | 'Assigned'
  | 'Maintenance'
  | 'Inspection Due'
  | 'Stored'
  | 'Out of Service'
  | 'Shop';

export interface Locomotive {
  id: string;
  roadName: string;
  roadNumber: string;
  model: string;
  manufacturer: string;
  horsepower: number;
  axles: number;
  paintScheme: string;
  homeYard: string;
  currentLocation: string;
  currentYard: string;
  status: LocomotiveStatus;
  currentTrainId: string | null;
  lastMovementTime: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocomotiveRangeInput {
  roadName: string;
  startNumber: number;
  endNumber: number;
  model: string;
  manufacturer: string;
  horsepower: number;
  axles: number;
  paintScheme: string;
  homeYard: string;
}

export interface LocomotiveAssignmentWarning {
  locomotiveId: string;
  roadNumber: string;
  currentLocation: string;
  requestedOrigin: string;
  distance: number;
  currentAssignment: string | null;
  status: LocomotiveStatus;
}

export const LOCOMOTIVE_STATUSES: LocomotiveStatus[] = [
  'Available',
  'Assigned',
  'Maintenance',
  'Inspection Due',
  'Stored',
  'Out of Service',
  'Shop',
];
