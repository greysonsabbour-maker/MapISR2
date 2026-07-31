import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Train, TrainHistoryEntry, SpecialTrainRequest } from '@/types';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { STORAGE_KEYS } from '@/config/constants';
import {
  createSpecialTrain,
  createPowerMoveTrain,
} from '@/services/train/trainService';
import {
  assignLocomotiveToTrain,
  validateLocomotiveAssignments,
} from '@/services/locomotive/locomotiveService';
import { addTimelineEvent } from '@/services/timeline/timelineService';
import type { MapFeature } from '@/types';
import type { LocomotiveAssignmentWarning } from '@/types';

interface TrainState {
  trains: Train[];
  history: TrainHistoryEntry[];
  spawnedSchedules: Record<string, string>;
  addTrain: (train: Train) => void;
  updateTrain: (train: Train) => void;
  removeTrain: (id: string) => void;
  addToHistory: (train: Train) => void;
  createSpecialTrainAction: (
    request: SpecialTrainRequest,
    mapFeatures: MapFeature[],
    assignLocomotives: (ids: string[], trainId: string, symbol: string) => void,
  ) => Train;
  createPowerMove: (
    locomotiveIds: string[],
    origin: string,
    destination: string,
    mapFeatures: MapFeature[],
    assignLocomotives: (ids: string[], trainId: string, symbol: string) => void,
  ) => Train;
  validateAssignments: (
    locomotiveIds: string[],
    origin: string,
    locomotives: import('@/types').Locomotive[],
    mapFeatures: MapFeature[],
  ) => LocomotiveAssignmentWarning[];
  markScheduleSpawned: (scheduleId: string) => void;
  isScheduleSpawnedToday: (scheduleId: string) => boolean;
  getActiveTrains: () => Train[];
  getTrainById: (id: string) => Train | undefined;
}

export const useTrainStore = create<TrainState>()(
  persist(
    (set, get) => ({
      trains: [],
      history: [],
      spawnedSchedules: {},

      addTrain: (train) => {
        set((state) => ({ trains: [...state.trains, train] }));
      },

      updateTrain: (train) => {
        set((state) => ({
          trains: state.trains.map((t) => (t.id === train.id ? train : t)),
        }));
      },

      removeTrain: (id) => {
        set((state) => ({
          trains: state.trains.filter((t) => t.id !== id),
        }));
      },

      addToHistory: (train) => {
        const entry: TrainHistoryEntry = {
          id: train.id,
          train: { ...train, status: 'Completed' },
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          history: [entry, ...state.history].slice(0, 500),
        }));
      },

      createSpecialTrainAction: (request, mapFeatures, assignLocomotives) => {
        const train = createSpecialTrain(request, mapFeatures);
        set((state) => ({ trains: [...state.trains, train] }));
        assignLocomotives(train.assignedLocomotives, train.id, train.symbol);
        addTimelineEvent(
          'special_train_created',
          `Special Train ${train.symbol} Created`,
          `${train.trainType}: ${train.origin} → ${train.destination}`,
          { trainId: train.id },
        );
        return train;
      },

      createPowerMove: (locomotiveIds, origin, destination, mapFeatures, assignLocomotives) => {
        const train = createPowerMoveTrain(locomotiveIds, origin, destination, mapFeatures);
        set((state) => ({ trains: [...state.trains, train] }));
        assignLocomotives(locomotiveIds, train.id, train.symbol);
        addTimelineEvent(
          'power_move_created',
          `Power Move ${train.symbol} Created`,
          `${origin} → ${destination}`,
          { trainId: train.id },
        );
        return train;
      },

      validateAssignments: (locomotiveIds, origin, locomotives, mapFeatures) => {
        return validateLocomotiveAssignments(locomotiveIds, origin, locomotives, mapFeatures);
      },

      markScheduleSpawned: (scheduleId) => {
        set((state) => ({
          spawnedSchedules: {
            ...state.spawnedSchedules,
            [scheduleId]: new Date().toDateString(),
          },
        }));
      },

      isScheduleSpawnedToday: (scheduleId) => {
        const spawned = get().spawnedSchedules[scheduleId];
        return spawned === new Date().toDateString();
      },

      getActiveTrains: () =>
        get().trains.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled'),

      getTrainById: (id) => get().trains.find((t) => t.id === id),
    }),
    {
      name: STORAGE_KEYS.trains,
      partialize: (state) => ({
        trains: state.trains,
        history: state.history,
        spawnedSchedules: state.spawnedSchedules,
      }),
    },
  ),
);

export function useAssignLocomotivesToTrain() {
  const updateLocomotive = useLocomotiveStore.getState().updateLocomotive;
  const getLocomotives = () => useLocomotiveStore.getState().locomotives;

  return (ids: string[], trainId: string, symbol: string) => {
    const locomotives = getLocomotives();
    for (const id of ids) {
      const loco = locomotives.find((l) => l.id === id);
      if (loco) {
        updateLocomotive(assignLocomotiveToTrain(loco, trainId, symbol));
        addTimelineEvent(
          'locomotive_assigned',
          `Locomotive ${loco.roadNumber} Assigned`,
          `Assigned to train ${symbol}`,
          { locomotiveId: id, trainId },
        );
      }
    }
  };
}
