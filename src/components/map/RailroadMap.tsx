import { useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import type { MapFeature, MapLayerVisibility, Train } from '@/types';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/config/constants';
import { LAYER_COLORS } from './mapStyles';

const libraries: ('geometry' | 'places')[] = ['geometry'];

interface RailroadMapProps {
  features: MapFeature[];
  layerVisibility: MapLayerVisibility;
  trains: Train[];
  bounds?: { north: number; south: number; east: number; west: number };
  onFeatureClick?: (feature: MapFeature) => void;
  onTrainClick?: (train: Train) => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  ],
};

export function RailroadMap({
  features,
  layerVisibility,
  trains,
  bounds,
  onFeatureClick,
  onTrainClick,
  center,
  zoom,
}: RailroadMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    libraries,
  });

  const visibleFeatures = useMemo(() => {
    return features.filter((f) => {
      if (f.type === 'trains') return false;
      return layerVisibility[f.type as keyof MapLayerVisibility];
    });
  }, [features, layerVisibility]);

  const mapCenter = useMemo(() => {
    if (center) return center;
    if (bounds) {
      return {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
    }
    return MAP_DEFAULT_CENTER;
  }, [center, bounds]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (bounds) {
        map.fitBounds({
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west,
        });
      }
    },
    [bounds],
  );

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-panel">
        <p className="text-red-400">Failed to load Google Maps. Check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-panel">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={mapCenter}
      zoom={zoom ?? MAP_DEFAULT_ZOOM}
      options={mapOptions}
      onLoad={onLoad}
    >
      {visibleFeatures.map((feature) => {
        const color = LAYER_COLORS[feature.type] ?? '#A54A18';

        if (feature.coordinates.length === 1) {
          return (
            <Marker
              key={feature.id}
              position={feature.coordinates[0]}
              title={feature.name}
              onClick={() => onFeatureClick?.(feature)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#FFFFFF',
                strokeWeight: 1,
              }}
            />
          );
        }

        return (
          <Polyline
            key={feature.id}
            path={feature.coordinates}
            options={{
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: feature.type === 'mainline' ? 4 : 2,
              clickable: true,
            }}
            onClick={() => onFeatureClick?.(feature)}
          />
        );
      })}

      {layerVisibility.trains &&
        trains
          .filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled')
          .map((train) => (
            <Marker
              key={train.id}
              position={train.currentPosition}
              title={`${train.symbol} — ${train.status}`}
              onClick={() => onTrainClick?.(train)}
              icon={{
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: '#F59E0B',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1,
                rotation: 0,
              }}
              label={{
                text: train.symbol,
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            />
          ))}
    </GoogleMap>
  );
}
