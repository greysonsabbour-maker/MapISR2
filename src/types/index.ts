export type {
  TrainType,
  TrainStatus,
  TrainPriority,
  Train,
  TrainHistoryEntry,
  Schedule,
  ScheduleFrequency,
  SpecialTrainRequest,
} from './train';

export type {
  LocomotiveStatus,
  Locomotive,
  LocomotiveRangeInput,
  LocomotiveAssignmentWarning,
} from './locomotive';

export type {
  MapLayerType,
  MapFeature,
  MapFeatureCollection,
  MapLayerVisibility,
  GeoCoordinate,
  RailroadLocation,
} from './map';

export type {
  TimelineEventType,
  TimelineEvent,
} from './timeline';

export type {
  Yard,
  Industry,
  Station,
  Waypoint,
  Junction,
  TrackSegment,
  RailroadAsset,
} from './assets';

export type {
  AppSettings,
  SystemHealth,
  DashboardStats,
  SearchResult,
  SearchResultType,
} from './app';

export {
  DEFAULT_LAYER_VISIBILITY,
  DEFAULT_SETTINGS,
} from './app';

export type {
  UserRole,
  AuthUser,
} from '../config/auth';