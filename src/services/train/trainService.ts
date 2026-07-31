import type {
  Train,
  Schedule,
  SpecialTrainRequest,
  TrainStatus,
  MapFeature,
  GeoCoordinate,
} from '@/types';
import { generateId, timeToISO, interpolatePosition } from '@/utils';
import {
  buildRouteCoordinates,
  getLocationByName,
} from '@/services/map/kmzParser';

export function createTrainFromSchedule(
  schedule: Schedule,
  mapFeatures: MapFeature[],
): Train {
  const now = new Date().toISOString();
  const routeCoords = buildRouteCoordinates(mapFeatures, schedule.route);
  const originFeature = getLocationByName(mapFeatures, schedule.origin);
  const position = originFeature?.coordinates[0] ?? routeCoords[0] ?? { lat: 0, lng: 0 };

  return {
    id: generateId(),
    symbol: schedule.symbol,
    origin: schedule.origin,
    destination: schedule.destination,
    route: schedule.route,
    departureTime: timeToISO(schedule.departureTime),
    arrivalTime: timeToISO(schedule.arrivalTime),
    estimatedArrival: timeToISO(schedule.arrivalTime),
    priority: schedule.priority,
    trainType: schedule.trainType,
    maxSpeed: schedule.maxSpeed,
    currentSpeed: 0,
    currentPosition: position,
    routeProgress: 0,
    length: schedule.length,
    status: 'Scheduled',
    assignedLocomotives: [...schedule.assignedLocomotives],
    assignedCars: [...schedule.assignedCars],
    notes: schedule.notes,
    isSpecial: false,
    isPowerMove: schedule.trainType === 'Power Move',
    scheduleId: schedule.id,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSpecialTrain(
  request: SpecialTrainRequest,
  mapFeatures: MapFeature[],
): Train {
  const now = new Date().toISOString();
  const departureTime =
    request.departureTime === 'Immediately'
      ? now
      : timeToISO(request.departureTime);

  const routeCoords = buildRouteCoordinates(mapFeatures, request.route);
  const originFeature = getLocationByName(mapFeatures, request.origin);
  const position = originFeature?.coordinates[0] ?? routeCoords[0] ?? { lat: 0, lng: 0 };

  const arrivalDate = new Date(departureTime);
  arrivalDate.setHours(arrivalDate.getHours() + 2);

  return {
    id: generateId(),
    symbol: request.symbol,
    origin: request.origin,
    destination: request.destination,
    route: request.route,
    departureTime,
    arrivalTime: arrivalDate.toISOString(),
    estimatedArrival: arrivalDate.toISOString(),
    priority: request.priority,
    trainType: request.trainType,
    maxSpeed: request.maxSpeed,
    currentSpeed: 0,
    currentPosition: position,
    routeProgress: 0,
    length: request.length,
    status: request.departureTime === 'Immediately' ? 'Departing' : 'Scheduled',
    assignedLocomotives: [...request.assignedLocomotives],
    assignedCars: [...request.assignedCars],
    notes: request.notes,
    isSpecial: true,
    isPowerMove: request.trainType === 'Power Move',
    createdAt: now,
    updatedAt: now,
  };
}

export function createPowerMoveTrain(
  locomotiveIds: string[],
  origin: string,
  destination: string,
  mapFeatures: MapFeature[],
): Train {
  const now = new Date().toISOString();
  const symbol = `PM-${Date.now().toString(36).toUpperCase()}`;
  const originFeature = getLocationByName(mapFeatures, origin);
  const position = originFeature?.coordinates[0] ?? { lat: 0, lng: 0 };

  const arrivalDate = new Date();
  arrivalDate.setHours(arrivalDate.getHours() + 1);

  return {
    id: generateId(),
    symbol,
    origin,
    destination,
    route: [origin, destination],
    departureTime: now,
    arrivalTime: arrivalDate.toISOString(),
    estimatedArrival: arrivalDate.toISOString(),
    priority: 'High',
    trainType: 'Power Move',
    maxSpeed: 30,
    currentSpeed: 0,
    currentPosition: position,
    routeProgress: 0,
    length: locomotiveIds.length * 70,
    status: 'Departing',
    assignedLocomotives: locomotiveIds,
    assignedCars: [],
    notes: `Power move from ${origin} to ${destination}`,
    isSpecial: true,
    isPowerMove: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function shouldSpawnSchedule(schedule: Schedule, now: Date): boolean {
  if (!schedule.enabled) return false;

  const [depHours, depMinutes] = schedule.departureTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const scheduleMinutes = (depHours ?? 0) * 60 + (depMinutes ?? 0);

  if (Math.abs(currentMinutes - scheduleMinutes) > 1) return false;

  const dayOfWeek = now.getDay();

  switch (schedule.frequency) {
    case 'Daily':
      return true;
    case 'Weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'Weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'Weekly':
      return schedule.daysOfWeek.includes(dayOfWeek);
    case 'One-Time':
      return true;
    default:
      return false;
  }
}

export function updateTrainPosition(
  train: Train,
  mapFeatures: MapFeature[],
  deltaSeconds: number,
): Train {
  if (train.status === 'Completed' || train.status === 'Cancelled') {
    return train;
  }

  const routeCoords = buildRouteCoordinates(mapFeatures, train.route);
  if (routeCoords.length < 2) return train;

  const now = new Date();
  const departure = new Date(train.departureTime);
  const arrival = new Date(train.arrivalTime);
  const totalDurationMs = arrival.getTime() - departure.getTime();

  if (now < departure) {
    return { ...train, status: 'Scheduled' as TrainStatus, currentSpeed: 0 };
  }

  const elapsedMs = now.getTime() - departure.getTime();
  const progress = Math.min(1, elapsedMs / totalDurationMs);

  const speedFactor = train.maxSpeed / 60;
  const progressIncrement = (speedFactor * deltaSeconds) / (totalDurationMs / 1000 / 60);
  const newProgress = Math.min(1, train.routeProgress + progressIncrement || progress);

  const position = interpolatePosition(routeCoords, newProgress);
  const currentSpeed = newProgress >= 1 ? 0 : train.maxSpeed;

  let status: TrainStatus = 'En Route';
  if (newProgress <= 0.01 && now >= departure) status = 'Departing';
  if (newProgress >= 0.95) status = 'Arriving';
  if (newProgress >= 1) status = 'Completed';

  const remainingMs = totalDurationMs - elapsedMs;
  const eta = new Date(now.getTime() + Math.max(0, remainingMs));

  return {
    ...train,
    currentPosition: position,
    routeProgress: newProgress,
    currentSpeed,
    status,
    estimatedArrival: eta.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function getRouteCoordinatesForTrain(
  train: Train,
  mapFeatures: MapFeature[],
): GeoCoordinate[] {
  return buildRouteCoordinates(mapFeatures, train.route);
}

export function duplicateSchedule(schedule: Schedule): Schedule {
  const now = new Date().toISOString();
  return {
    ...schedule,
    id: generateId(),
    symbol: `${schedule.symbol}-COPY`,
    createdAt: now,
    updatedAt: now,
  };
}

export function getTrainStatusColor(status: TrainStatus): string {
  switch (status) {
    case 'Scheduled':
      return '#6B7280';
    case 'Departing':
      return '#F59E0B';
    case 'En Route':
      return '#10B981';
    case 'Arriving':
      return '#3B82F6';
    case 'Completed':
      return '#8B5CF6';
    case 'Cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}

export function getTrainTypeIcon(type: string): string {
  switch (type) {
    case 'Passenger':
      return 'passenger';
    case 'Intermodal':
      return 'intermodal';
    case 'Coal':
    case 'Grain':
      return 'freight';
    case 'Power Move':
      return 'power';
    case 'Maintenance':
    case 'Work Train':
      return 'maintenance';
    default:
      return 'freight';
  }
}
