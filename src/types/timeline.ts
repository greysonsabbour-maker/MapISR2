export type TimelineEventType =
  | 'train_departed'
  | 'train_arrived'
  | 'train_completed'
  | 'train_spawned'
  | 'locomotive_assigned'
  | 'locomotive_released'
  | 'power_move_created'
  | 'locomotive_maintenance'
  | 'schedule_created'
  | 'schedule_modified'
  | 'schedule_deleted'
  | 'special_train_created'
  | 'system_event';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  train_departed: 'Train Departed',
  train_arrived: 'Train Arrived',
  train_completed: 'Train Completed',
  train_spawned: 'Train Spawned',
  locomotive_assigned: 'Locomotive Assigned',
  locomotive_released: 'Locomotive Released',
  power_move_created: 'Power Move Created',
  locomotive_maintenance: 'Locomotive Maintenance',
  schedule_created: 'Schedule Created',
  schedule_modified: 'Schedule Modified',
  schedule_deleted: 'Schedule Deleted',
  special_train_created: 'Special Train Created',
  system_event: 'System Event',
};
