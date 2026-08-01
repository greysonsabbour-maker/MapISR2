import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locomotive, LocomotiveRangeInput } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import {
  createLocomotive,
  generateLocomotivesFromRange,
} from '@/services/locomotive/locomotiveService';
import { addTimelineEvent } from '@/services/timeline/timelineService';

interface LocomotiveState {
  locomotives: Locomotive[];

  addLocomotive: (
    partial: Partial<Locomotive> &
      Pick<Locomotive, 'roadName' | 'roadNumber'>
  ) => void;

  addLocomotiveRange: (
    input: LocomotiveRangeInput
  ) => void;

  updateLocomotive: (
    locomotive: Locomotive
  ) => void;

  deleteLocomotive: (
    id: string
  ) => void;

  getLocomotiveById: (
    id: string
  ) => Locomotive | undefined;

  getAvailableLocomotives: () => Locomotive[];

  getAvailableAtYard: (
    yard: string
  ) => Locomotive[];

  assignLocomotive: (
    locomotiveId: string,
    trainId: string,
    originYard: string
  ) => boolean;

  releaseLocomotive: (
    locomotiveId: string,
    destinationYard: string
  ) => void;

  moveLocomotive: (
    locomotiveId: string,
    destinationYard: string
  ) => void;
}

export const useLocomotiveStore = create<LocomotiveState>()(
  persist(
    (set, get) => ({
      locomotives: [],

      addLocomotive: (partial) => {
        const loco = createLocomotive(partial);

        set((state) => ({
          locomotives: [...state.locomotives, loco],
        }));

        addTimelineEvent(
          'system_event',
          `Locomotive ${loco.roadName} ${loco.roadNumber} Added`,
          `Added to roster at ${loco.homeYard}`,
        );
      },

      addLocomotiveRange: (input) => {
        const newLocos = generateLocomotivesFromRange(input);

        set((state) => ({
          locomotives: [...state.locomotives, ...newLocos],
        }));

        addTimelineEvent(
          'system_event',
          'Locomotive Range Added',
          `${input.roadName} ${input.startNumber}-${input.endNumber} (${newLocos.length} units)`,
        );
      },

      updateLocomotive: (locomotive) => {
        set((state) => ({
          locomotives: state.locomotives.map((l) =>
            l.id === locomotive.id ? locomotive : l,
          ),
        }));
      },

      deleteLocomotive: (id) => {
        set((state) => ({
          locomotives: state.locomotives.filter(
            (l) => l.id !== id,
          ),
        }));
      },

      getLocomotiveById: (id) =>
        get().locomotives.find((l) => l.id === id),

      getAvailableLocomotives: () =>
        get().locomotives.filter(
          (l) =>
            l.status === 'Available' &&
            !l.currentTrainId,
        ),

      getAvailableAtYard: (yard) =>
        get().locomotives.filter(
          (l) =>
            l.status === 'Available' &&
            l.currentYard === yard &&
            !l.currentTrainId,
        ),

      assignLocomotive: (
        locomotiveId,
        trainId,
        originYard,
      ) => {
        const loco =
          get().getLocomotiveById(locomotiveId);

        if (!loco) return false;

        if (loco.status !== 'Available')
          return false;

        if (loco.currentYard !== originYard)
          return false;

        get().updateLocomotive({
          ...loco,
          status: 'Assigned',
          currentTrainId: trainId,
          currentLocation: `Train ${trainId}`,
          lastMovementTime:
            new Date().toISOString(),
        });

        addTimelineEvent(
          'system_event',
          'Locomotive Assigned',
          `${loco.roadName} ${loco.roadNumber} → ${trainId}`,
        );

        return true;
      },

      releaseLocomotive: (
        locomotiveId,
        destinationYard,
      ) => {
        const loco =
          get().getLocomotiveById(locomotiveId);

        if (!loco) return;

        get().updateLocomotive({
          ...loco,
          status: 'Available',
          currentTrainId: undefined,
          currentYard: destinationYard,
          currentLocation: destinationYard,
          lastMovementTime:
            new Date().toISOString(),
        });

        addTimelineEvent(
          'system_event',
          'Locomotive Released',
          `${loco.roadName} ${loco.roadNumber} → ${destinationYard}`,
        );
      },

      moveLocomotive: (
        locomotiveId,
        destinationYard,
      ) => {
        const loco =
          get().getLocomotiveById(locomotiveId);

        if (!loco) return;

        if (loco.status === 'Assigned')
          return;

        get().updateLocomotive({
          ...loco,
          currentYard: destinationYard,
          currentLocation: destinationYard,
          lastMovementTime:
            new Date().toISOString(),
        });

        addTimelineEvent(
          'system_event',
          'Locomotive Moved',
          `${loco.roadName} ${loco.roadNumber} → ${destinationYard}`,
        );
      },
    }),
    {
      name: STORAGE_KEYS.locomotives,
    },
  ),
);