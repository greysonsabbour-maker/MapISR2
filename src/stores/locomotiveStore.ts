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
  addLocomotive: (partial: Partial<Locomotive> & Pick<Locomotive, 'roadName' | 'roadNumber'>) => void;
  addLocomotiveRange: (input: LocomotiveRangeInput) => void;
  updateLocomotive: (locomotive: Locomotive) => void;
  deleteLocomotive: (id: string) => void;
  getLocomotiveById: (id: string) => Locomotive | undefined;
  getAvailableLocomotives: () => Locomotive[];
}

export const useLocomotiveStore = create<LocomotiveState>()(
  persist(
    (set, get) => ({
      locomotives: [],

      addLocomotive: (partial) => {
        const loco = createLocomotive(partial);
        set((state) => ({ locomotives: [...state.locomotives, loco] }));
        addTimelineEvent(
          'system_event',
          `Locomotive ${loco.roadName} ${loco.roadNumber} Added`,
          `Added to roster at ${loco.homeYard}`,
        );
      },

      addLocomotiveRange: (input) => {
        const newLocos = generateLocomotivesFromRange(input);
        set((state) => ({ locomotives: [...state.locomotives, ...newLocos] }));
        addTimelineEvent(
          'system_event',
          `Locomotive Range Added`,
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
          locomotives: state.locomotives.filter((l) => l.id !== id),
        }));
      },

      getLocomotiveById: (id) => get().locomotives.find((l) => l.id === id),

      getAvailableLocomotives: () =>
        get().locomotives.filter((l) => l.status === 'Available' && !l.currentTrainId),
    }),
    { name: STORAGE_KEYS.locomotives },
  ),
);
