import type { TimelineEvent, TimelineEventType } from '@/types';
import { generateId } from '@/utils';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/services/storage/localStorage';

const MAX_EVENTS = 1000;

export function getTimelineEvents(): TimelineEvent[] {
  return loadFromStorage<TimelineEvent[]>(STORAGE_KEYS.timeline, []);
}

export function addTimelineEvent(
  type: TimelineEventType,
  title: string,
  description: string,
  metadata?: Record<string, string>,
): TimelineEvent {
  const events = getTimelineEvents();
  const event: TimelineEvent = {
    id: generateId(),
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    metadata,
  };
  const updated = [event, ...events].slice(0, MAX_EVENTS);
  saveToStorage(STORAGE_KEYS.timeline, updated);
  return event;
}

export function getRecentTimelineEvents(limit = 20): TimelineEvent[] {
  return getTimelineEvents().slice(0, limit);
}

export function clearTimeline(): void {
  saveToStorage(STORAGE_KEYS.timeline, []);
}
