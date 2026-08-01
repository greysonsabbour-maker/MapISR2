import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  MapFeature,
  MapFeatureCollection,
  MapLayerVisibility,
  AppSettings,
} from '@/types';
import {
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_SETTINGS,
} from '@/types/app';
import { STORAGE_KEYS, KMZ_PATH } from '@/config/constants';
import { parseKmzFile, extractLocations } from '@/services/map/kmzParser';

interface MapState {
  features: MapFeature[];
  bounds: MapFeatureCollection['bounds'];
  layerVisibility: MapLayerVisibility;
  isLoading: boolean;
  error: string | null;
  locations: {
    yards: string[];
    stations: string[];
    industries: string[];
    all: string[];
  };
  loadKmz: (path?: string) => Promise<void>;
  setLayerVisibility: (layer: keyof MapLayerVisibility, visible: boolean) => void;
  toggleLayer: (layer: keyof MapLayerVisibility) => void;
  setAllLayers: (visibility: MapLayerVisibility) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  features: [],
  bounds: undefined,
  layerVisibility: { ...DEFAULT_LAYER_VISIBILITY },
  isLoading: false,
  error: null,
  locations: {
    yards: [],
    stations: [],
    industries: [],
    all: [],
  },

  loadKmz: async (path = KMZ_PATH) => {
    set({ isLoading: true, error: null });

    try {
      const collection = await parseKmzFile(path);
      const locations = extractLocations(collection.features);

      set({
        features: collection.features,
        bounds: collection.bounds,
        locations,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load KMZ',
        isLoading: false,
      });
    }
  },

  setLayerVisibility: (layer, visible) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: visible,
      },
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),

  setAllLayers: (visibility) =>
    set({
      layerVisibility: visibility,
    }),
}));

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },

      updateSettings: (partial) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...partial,
          },
        })),

      resetSettings: () =>
        set({
          settings: { ...DEFAULT_SETTINGS },
        }),
    }),
    {
      name: STORAGE_KEYS.settings,
    },
  ),
);

interface SearchState {
  query: string;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setIsOpen: (open: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()((set) => ({
  query: '',
  isOpen: false,
  setQuery: (query) => set({ query }),
  setIsOpen: (isOpen) => set({ isOpen }),
  clearSearch: () => set({ query: '', isOpen: false }),
}));

interface SchedulerState {
  isRunning: boolean;
  lastTick: string;
  setRunning: (running: boolean) => void;
  setLastTick: (tick: string) => void;
}

export const useSchedulerStore = create<SchedulerState>()((set) => ({
  isRunning: false,
  lastTick: new Date().toISOString(),
  setRunning: (isRunning) => set({ isRunning }),
  setLastTick: (lastTick) => set({ lastTick }),
}));

interface TimelineState {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useTimelineStore = create<TimelineState>()((set) => ({
  refreshKey: 0,
  triggerRefresh: () =>
    set((state) => ({
      refreshKey: state.refreshKey + 1,
    })),
}));

export { DEFAULT_LAYER_VISIBILITY };