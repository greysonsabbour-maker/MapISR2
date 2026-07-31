import type { Train, Schedule, MapFeature, Locomotive } from '@/types';
import {
  createTrainFromSchedule,
  shouldSpawnSchedule,
  updateTrainPosition,
} from '@/services/train/trainService';
import {
  assignLocomotiveToTrain,
  releaseLocomotive,
} from '@/services/locomotive/locomotiveService';
import { addTimelineEvent } from '@/services/timeline/timelineService';
import { getLocationByName } from '@/services/map/kmzParser';

export interface SchedulerCallbacks {
  getSchedules: () => Schedule[];
  getActiveTrains: () => Train[];
  getLocomotives: () => Locomotive[];
  getMapFeatures: () => MapFeature[];
  addTrain: (train: Train) => void;
  updateTrain: (train: Train) => void;
  removeTrain: (trainId: string) => void;
  addToHistory: (train: Train) => void;
  updateLocomotive: (locomotive: Locomotive) => void;
  isScheduleSpawnedToday: (scheduleId: string) => boolean;
  markScheduleSpawned: (scheduleId: string) => void;
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let lastTick = new Date().toISOString();
const spawnedToday = new Set<string>();

export function startScheduler(callbacks: SchedulerCallbacks): void {
  if (schedulerInterval) return;

  schedulerInterval = setInterval(() => {
    lastTick = new Date().toISOString();
    tick(callbacks);
  }, 1000);
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

export function isSchedulerRunning(): boolean {
  return schedulerInterval !== null;
}

export function getLastSchedulerTick(): string {
  return lastTick;
}

function tick(callbacks: SchedulerCallbacks): void {
  checkSchedules(callbacks);
  updateActiveTrains(callbacks);
}

function checkSchedules(callbacks: SchedulerCallbacks): void {
  const now = new Date();
  const schedules = callbacks.getSchedules();
  const activeTrains = callbacks.getActiveTrains();
  const mapFeatures = callbacks.getMapFeatures();

  for (const schedule of schedules) {
    if (!shouldSpawnSchedule(schedule, now)) continue;
    if (callbacks.isScheduleSpawnedToday(schedule.id)) continue;
    if (spawnedToday.has(`${schedule.id}-${now.toDateString()}`)) continue;

    const existing = activeTrains.find(
      (t) => t.scheduleId === schedule.id && t.status !== 'Completed',
    );
    if (existing) continue;

    const train = createTrainFromSchedule(schedule, mapFeatures);
    train.status = 'Departing';

    callbacks.addTrain(train);
    callbacks.markScheduleSpawned(schedule.id);
    spawnedToday.add(`${schedule.id}-${now.toDateString()}`);

    const locomotives = callbacks.getLocomotives();
    for (const locoId of train.assignedLocomotives) {
      const loco = locomotives.find((l) => l.id === locoId);
      if (loco) {
        callbacks.updateLocomotive(
          assignLocomotiveToTrain(loco, train.id, train.symbol),
        );
      }
    }

    addTimelineEvent(
      'train_spawned',
      `Train ${train.symbol} Departed`,
      `${train.trainType} from ${train.origin} to ${train.destination}`,
      { trainId: train.id, symbol: train.symbol },
    );
  }
}

function updateActiveTrains(callbacks: SchedulerCallbacks): void {
  const activeTrains = callbacks.getActiveTrains();
  const mapFeatures = callbacks.getMapFeatures();
  const locomotives = callbacks.getLocomotives();

  for (const train of activeTrains) {
    if (train.status === 'Completed' || train.status === 'Cancelled') continue;

    const previousStatus = train.status;
    const updated = updateTrainPosition(train, mapFeatures, 2);
    callbacks.updateTrain(updated);

    for (const locoId of updated.assignedLocomotives) {
      const loco = locomotives.find((l) => l.id === locoId);
      if (loco && loco.currentTrainId === updated.id) {
        const routePoint = getLocationByName(
          mapFeatures,
          updated.route[Math.floor(updated.routeProgress * (updated.route.length - 1))] ?? '',
        );
        const locationName = routePoint?.name ?? updated.destination;
        callbacks.updateLocomotive({
          ...loco,
          currentLocation: locationName,
          lastMovementTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (previousStatus !== 'Arriving' && updated.status === 'Arriving') {
      addTimelineEvent(
        'train_arrived',
        `Train ${updated.symbol} Arriving`,
        `Approaching ${updated.destination}`,
        { trainId: updated.id },
      );
    }

    if (updated.status === 'Completed') {
      completeTrain(updated, callbacks);
    }
  }
}

function completeTrain(train: Train, callbacks: SchedulerCallbacks): void {
  callbacks.addToHistory(train);
  callbacks.removeTrain(train.id);

  const locomotives = callbacks.getLocomotives();
  for (const locoId of train.assignedLocomotives) {
    const loco = locomotives.find((l) => l.id === locoId);
    if (loco) {
      callbacks.updateLocomotive(releaseLocomotive(loco, train.destination));
    }
  }

  addTimelineEvent(
    'train_completed',
    `Train ${train.symbol} Completed`,
    `Arrived at ${train.destination}`,
    { trainId: train.id, symbol: train.symbol },
  );
}

export function resetDailySpawns(): void {
  spawnedToday.clear();
}
