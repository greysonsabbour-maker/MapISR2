import type { Locomotive, LocomotiveRangeInput, LocomotiveAssignmentWarning } from '@/types';
import { generateId, haversineDistance } from '@/utils';
import type { MapFeature, GeoCoordinate } from '@/types';

export function createLocomotive(
  partial: Partial<Locomotive> & Pick<Locomotive, 'roadName' | 'roadNumber'>,
): Locomotive {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    model: 'SD40-2',
    manufacturer: 'EMD',
    horsepower: 3000,
    axles: 6,
    paintScheme: 'Ironstate',
    homeYard: 'Cliffside Yard',
    currentLocation: 'Cliffside Yard',
    currentYard: 'Cliffside Yard',
    status: 'Available',
    currentTrainId: null,
    lastMovementTime: now,
    notes: '',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function generateLocomotivesFromRange(input: LocomotiveRangeInput): Locomotive[] {
  const locomotives: Locomotive[] = [];
  for (let num = input.startNumber; num <= input.endNumber; num++) {
    locomotives.push(
      createLocomotive({
        roadName: input.roadName,
        roadNumber: String(num),
        model: input.model,
        manufacturer: input.manufacturer,
        horsepower: input.horsepower,
        axles: input.axles,
        paintScheme: input.paintScheme,
        homeYard: input.homeYard,
        currentLocation: input.homeYard,
        currentYard: input.homeYard,
      }),
    );
  }
  return locomotives;
}

export function validateLocomotiveAssignments(
  locomotiveIds: string[],
  origin: string,
  locomotives: Locomotive[],
  mapFeatures: MapFeature[],
): LocomotiveAssignmentWarning[] {
  const warnings: LocomotiveAssignmentWarning[] = [];
  const originFeature = mapFeatures.find(
    (f) => f.name.toLowerCase() === origin.toLowerCase(),
  );
  const originCoord = originFeature?.coordinates[0];

  for (const id of locomotiveIds) {
    const loco = locomotives.find((l) => l.id === id);
    if (!loco) continue;

    const locAtOrigin =
      loco.currentLocation.toLowerCase() === origin.toLowerCase() ||
      loco.currentYard.toLowerCase() === origin.toLowerCase();

    if (locAtOrigin) continue;

    let distance = 0;
    if (originCoord) {
      const locFeature = mapFeatures.find(
        (f) => f.name.toLowerCase() === loco.currentLocation.toLowerCase(),
      );
      if (locFeature?.coordinates[0]) {
        distance = haversineDistance(
          originCoord.lat,
          originCoord.lng,
          locFeature.coordinates[0].lat,
          locFeature.coordinates[0].lng,
        );
      }
    }

    warnings.push({
      locomotiveId: loco.id,
      roadNumber: loco.roadNumber,
      currentLocation: loco.currentLocation,
      requestedOrigin: origin,
      distance,
      currentAssignment: loco.currentTrainId,
      status: loco.status,
    });
  }

  return warnings;
}

export function assignLocomotiveToTrain(
  locomotive: Locomotive,
  trainId: string,
  trainSymbol: string,
): Locomotive {
  return {
    ...locomotive,
    status: 'Assigned',
    currentTrainId: trainId,
    currentLocation: `Train ${trainSymbol}`,
    lastMovementTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function releaseLocomotive(
  locomotive: Locomotive,
  destinationYard: string,
): Locomotive {
  return {
    ...locomotive,
    status: 'Available',
    currentTrainId: null,
    currentLocation: destinationYard,
    currentYard: destinationYard,
    lastMovementTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function moveLocomotiveWithTrain(
  locomotive: Locomotive,
  position: GeoCoordinate,
  locationName: string,
): Locomotive {
  return {
    ...locomotive,
    currentLocation: locationName,
    lastMovementTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function isLocomotiveAvailable(locomotive: Locomotive): boolean {
  return locomotive.status === 'Available' && locomotive.currentTrainId === null;
}

export function formatLocomotiveDisplay(locomotive: Locomotive): string {
  return `${locomotive.roadName} ${locomotive.roadNumber}`;
}
