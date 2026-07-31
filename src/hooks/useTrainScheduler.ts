import { useEffect, useRef } from 'react';
import {
  startScheduler,
  stopScheduler,
  getLastSchedulerTick,
} from '@/services/scheduler/trainScheduler';
import { useTrainStore } from '@/stores/trainStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useMapStore } from '@/stores/mapStore';
import { useSettingsStore } from '@/stores/mapStore';
import { useSchedulerStore } from '@/stores/mapStore';

export function useTrainScheduler(): void {
  const started = useRef(false);
  const settings = useSettingsStore((s) => s.settings);
  const setRunning = useSchedulerStore((s) => s.setRunning);
  const setLastTick = useSchedulerStore((s) => s.setLastTick);

  useEffect(() => {
    if (!settings.schedulerEnabled || started.current) return;
    started.current = true;

    startScheduler({
      getSchedules: () => useScheduleStore.getState().schedules,
      getActiveTrains: () => useTrainStore.getState().getActiveTrains(),
      getLocomotives: () => useLocomotiveStore.getState().locomotives,
      getMapFeatures: () => useMapStore.getState().features,
      addTrain: (train) => useTrainStore.getState().addTrain(train),
      updateTrain: (train) => useTrainStore.getState().updateTrain(train),
      removeTrain: (id) => useTrainStore.getState().removeTrain(id),
      addToHistory: (train) => useTrainStore.getState().addToHistory(train),
      updateLocomotive: (loco) => useLocomotiveStore.getState().updateLocomotive(loco),
      isScheduleSpawnedToday: (id) => useTrainStore.getState().isScheduleSpawnedToday(id),
      markScheduleSpawned: (id) => useTrainStore.getState().markScheduleSpawned(id),
    });

    setRunning(true);

    const tickInterval = setInterval(() => {
      setLastTick(getLastSchedulerTick());
    }, 2000);

    return () => {
      stopScheduler();
      setRunning(false);
      started.current = false;
      clearInterval(tickInterval);
    };
  }, [settings.schedulerEnabled, setRunning, setLastTick]);
}

export function useKmzLoader(): void {
  const loadKmz = useMapStore((s) => s.loadKmz);
  const isLoading = useMapStore((s) => s.isLoading);
  const features = useMapStore((s) => s.features);

  useEffect(() => {
    if (features.length === 0 && !isLoading) {
      void loadKmz();
    }
  }, [loadKmz, features.length, isLoading]);
}
