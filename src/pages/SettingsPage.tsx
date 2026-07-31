import { Header } from '@/components/layout/Header';
import { Card, Button, Input } from '@/components/ui';
import { useSettingsStore, useMapStore } from '@/stores/mapStore';
import { DEFAULT_LAYER_VISIBILITY } from '@/types/app';
import { LAYER_LABELS } from '@/types/map';
import type { MapLayerVisibility } from '@/types';

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const setAllLayers = useMapStore((s) => s.setAllLayers);
  const loadKmz = useMapStore((s) => s.loadKmz);

  const handleLayerChange = (layer: keyof MapLayerVisibility, visible: boolean) => {
    const updated = { ...settings.mapLayerVisibility, [layer]: visible };
    updateSettings({ mapLayerVisibility: updated });
    setAllLayers(updated);
  };

  const handleKmzUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    await loadKmz(url);
    updateSettings({ kmzFileName: file.name });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateSettings({ logoFileName: file.name });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Settings" subtitle="Application configuration" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
        <Card title="Railroad Configuration">
          <div className="space-y-4">
            <Input
              label="Railroad Name"
              value={settings.railroadName}
              onChange={(e) => updateSettings({ railroadName: e.target.value })}
            />
            <Input
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => updateSettings({ timezone: e.target.value })}
            />
            <Input
              label="Default Max Speed (mph)"
              type="number"
              value={settings.defaultMaxSpeed}
              onChange={(e) => updateSettings({ defaultMaxSpeed: Number(e.target.value) })}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.schedulerEnabled}
                onChange={(e) => updateSettings({ schedulerEnabled: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm">Enable automatic train scheduler</span>
            </label>
          </div>
        </Card>

        <Card title="Map Layer Defaults">
          <div className="space-y-2">
            {(Object.keys(DEFAULT_LAYER_VISIBILITY) as (keyof MapLayerVisibility)[]).map(
              (layer) => (
                <label key={layer} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.mapLayerVisibility[layer]}
                    onChange={(e) => handleLayerChange(layer, e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{LAYER_LABELS[layer]}</span>
                </label>
              ),
            )}
          </div>
        </Card>

        <Card title="File Uploads">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80">KMZ Railroad Map</label>
              <p className="text-xs text-foreground/50 mb-2">
                Current: {settings.kmzFileName}
              </p>
              <input
                type="file"
                accept=".kmz,.kml"
                onChange={handleKmzUpload}
                className="text-sm text-foreground/70"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80">Logo</label>
              <p className="text-xs text-foreground/50 mb-2">
                Current: {settings.logoFileName}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-sm text-foreground/70"
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="danger" onClick={resetSettings}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
