export const THEME = {
  primary: '#7A330E',
  accent: '#A54A18',
  background: '#101214',
  panel: '#1B1E22',
  border: '#343A40',
  text: '#FFFFFF',
} as const;

export const APP_NAME = 'MapISR';
export const APP_SUBTITLE = 'Ironstate Railroad Operations';
export const RAILROAD_NAME = 'Ironstate Railroad';

export const KMZ_PATH = '/data/railroad.kmz';

export const SCHEDULER_INTERVAL_MS = 1000;
export const TRAIN_UPDATE_INTERVAL_MS = 2000;
export const MAX_ACTIVE_TRAINS = 500;

export const MAP_DEFAULT_CENTER = { lat: 40.5, lng: -79.0 };
export const MAP_DEFAULT_ZOOM = 8;

export const STORAGE_KEYS = {
  locomotives: 'mapisr_locomotives',
  schedules: 'mapisr_schedules',
  trains: 'mapisr_trains',
  trainHistory: 'mapisr_train_history',
  timeline: 'mapisr_timeline',
  settings: 'mapisr_settings',
  yards: 'mapisr_yards',
  industries: 'mapisr_industries',
  stations: 'mapisr_stations',
} as const;
