export type TrainType =
  | 'Manifest'
  | 'Local'
  | 'Intermodal'
  | 'Coal'
  | 'Grain'
  | 'Passenger'
  | 'Transfer'
  | 'Work Train'
  | 'Maintenance'
  | 'Power Move'
  | 'Excursion'
  | 'Custom';

export type TrainStatus =
  | 'Scheduled'
  | 'Departing'
  | 'En Route'
  | 'Arriving'
  | 'Completed'
  | 'Cancelled';

export type TrainPriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface Train {
  id: string;
  symbol: string;
  origin: string;
  destination: string;
  route: string[];
  departureTime: string;
  arrivalTime: string;
  estimatedArrival: string;
  priority: TrainPriority;
  trainType: TrainType;
  maxSpeed: number;
  currentSpeed: number;
  currentPosition: { lat: number; lng: number };
  routeProgress: number;
  length: number;
  status: TrainStatus;
  assignedLocomotives: string[];
  assignedCars: string[];
  notes: string;
  isSpecial: boolean;
  isPowerMove: boolean;
  scheduleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainHistoryEntry {
  id: string;
  train: Train;
  completedAt: string;
}

export type ScheduleFrequency = 'Daily' | 'Weekdays' | 'Weekends' | 'Weekly' | 'One-Time';

export interface Schedule {
  id: string;
  symbol: string;
  origin: string;
  destination: string;
  route: string[];
  departureTime: string;
  arrivalTime: string;
  priority: TrainPriority;
  trainType: TrainType;
  maxSpeed: number;
  length: number;
  assignedLocomotives: string[];
  assignedCars: string[];
  notes: string;
  frequency: ScheduleFrequency;
  daysOfWeek: number[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialTrainRequest {
  symbol: string;
  origin: string;
  destination: string;
  route: string[];
  departureTime: string | 'Immediately';
  assignedLocomotives: string[];
  assignedCars: string[];
  trainType: TrainType;
  priority: TrainPriority;
  maxSpeed: number;
  length: number;
  notes: string;
}

export const TRAIN_TYPES: TrainType[] = [
  'Manifest',
  'Local',
  'Intermodal',
  'Coal',
  'Grain',
  'Passenger',
  'Transfer',
  'Work Train',
  'Maintenance',
  'Power Move',
  'Excursion',
  'Custom',
];

export const TRAIN_STATUSES: TrainStatus[] = [
  'Scheduled',
  'Departing',
  'En Route',
  'Arriving',
  'Completed',
  'Cancelled',
];

export const TRAIN_PRIORITIES: TrainPriority[] = ['Low', 'Normal', 'High', 'Critical'];

export const SPECIAL_TRAIN_TYPES: TrainType[] = [
  'Power Move',
  'Excursion',
  'Maintenance',
  'Custom',
];
