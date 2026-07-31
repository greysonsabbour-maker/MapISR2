import { useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { RailroadMap } from '@/components/map/RailroadMap';
import { LayerTogglePanel, MapInfoPanel } from '@/components/map/LayerTogglePanel';
import { LoadingSpinner } from '@/components/ui';
import { useMapStore } from '@/stores/mapStore';
import { useTrainStore } from '@/stores/trainStore';
import type { MapFeature, Train } from '@/types';

export function MapPage() {
  const features = useMapStore((s) => s.features);
  const bounds = useMapStore((s) => s.bounds);
  const layerVisibility = useMapStore((s) => s.layerVisibility);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const isLoading = useMapStore((s) => s.isLoading);
  const error = useMapStore((s) => s.error);
  const trains = useTrainStore((s) => s.trains);

  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const featureCounts = useMemo(() => {
    const counts: Partial<Record<keyof typeof layerVisibility, number>> = {};
    for (const feature of features) {
      const layer = feature.type as keyof typeof layerVisibility;
      if (layer in layerVisibility) {
        counts[layer] = (counts[layer] ?? 0) + 1;
      }
    }
    counts.trains = trains.filter(
      (t) => t.status !== 'Completed' && t.status !== 'Cancelled',
    ).length;
    return counts;
  }, [features, trains, layerVisibility]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Operations Map" subtitle="Live railroad network view" />

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <LoadingSpinner label="Loading railroad network..." />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <RailroadMap
          features={features}
          layerVisibility={layerVisibility}
          trains={trains}
          bounds={bounds}
          onFeatureClick={(f) => {
            setSelectedFeature(f);
            setSelectedTrain(null);
          }}
          onTrainClick={(t) => {
            setSelectedTrain(t);
            setSelectedFeature(null);
          }}
        />

        <div className="absolute left-4 top-4 z-10 w-56">
          <LayerTogglePanel
            visibility={layerVisibility}
            onToggle={toggleLayer}
            featureCounts={featureCounts}
          />
        </div>

        {selectedFeature && (
          <div className="absolute right-4 top-4 z-10 w-64">
            <MapInfoPanel
              title={selectedFeature.name}
              details={[
                { label: 'Type', value: selectedFeature.type },
                { label: 'Points', value: String(selectedFeature.coordinates.length) },
                ...(selectedFeature.description
                  ? [{ label: 'Description', value: selectedFeature.description }]
                  : []),
              ]}
            />
            <button
              onClick={() => setSelectedFeature(null)}
              className="mt-2 text-xs text-foreground/50 hover:text-foreground"
            >
              Close
            </button>
          </div>
        )}

        {selectedTrain && (
          <div className="absolute right-4 top-4 z-10 w-72">
            <MapInfoPanel
              title={selectedTrain.symbol}
              details={[
                { label: 'Status', value: selectedTrain.status },
                { label: 'Type', value: selectedTrain.trainType },
                { label: 'Route', value: `${selectedTrain.origin} → ${selectedTrain.destination}` },
                { label: 'Speed', value: `${selectedTrain.currentSpeed} mph` },
                { label: 'Progress', value: `${(selectedTrain.routeProgress * 100).toFixed(0)}%` },
              ]}
            />
            <button
              onClick={() => setSelectedTrain(null)}
              className="mt-2 text-xs text-foreground/50 hover:text-foreground"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
