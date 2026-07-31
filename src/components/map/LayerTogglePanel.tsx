import { LAYER_LABELS } from '@/types/map';
import type { MapLayerVisibility } from '@/types';
import { cn } from '@/utils';

interface LayerTogglePanelProps {
  visibility: MapLayerVisibility;
  onToggle: (layer: keyof MapLayerVisibility) => void;
  featureCounts: Partial<Record<keyof MapLayerVisibility, number>>;
}

const TOGGLEABLE_LAYERS: (keyof MapLayerVisibility)[] = [
  'mainline',
  'sidings',
  'yards',
  'industries',
  'crossovers',
  'stations',
  'waypoints',
  'junctions',
  'trains',
];

export function LayerTogglePanel({
  visibility,
  onToggle,
  featureCounts,
}: LayerTogglePanelProps) {
  return (
    <div className="glass-panel p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground/80 mb-3">Map Layers</h3>
      {TOGGLEABLE_LAYERS.map((layer) => (
        <label
          key={layer}
          className="flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibility[layer]}
              onChange={() => onToggle(layer)}
              className="rounded border-border bg-background text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground/70 group-hover:text-foreground">
              {LAYER_LABELS[layer]}
            </span>
          </div>
          {featureCounts[layer] !== undefined && (
            <span className="text-xs text-foreground/40">{featureCounts[layer]}</span>
          )}
        </label>
      ))}
    </div>
  );
}

interface MapInfoPanelProps {
  title: string;
  details: { label: string; value: string }[];
  className?: string;
}

export function MapInfoPanel({ title, details, className }: MapInfoPanelProps) {
  return (
    <div className={cn('glass-panel p-4 animate-slide-in', className)}>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <dl className="space-y-1.5">
        {details.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <dt className="text-foreground/50">{label}</dt>
            <dd className="font-medium text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
