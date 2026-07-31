import { useMemo } from 'react';
import { useTrainStore } from '@/stores/trainStore';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useMapStore, useSearchStore } from '@/stores/mapStore';
import { globalSearch } from '@/services/dashboard/dashboardService';
import type { SearchResult } from '@/types';

export function useGlobalSearch(): SearchResult[] {
  const query = useSearchStore((s) => s.query);
  const trains = useTrainStore((s) => s.trains);
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const features = useMapStore((s) => s.features);

  return useMemo(
    () => globalSearch(query, trains, locomotives, features),
    [query, trains, locomotives, features],
  );
}
