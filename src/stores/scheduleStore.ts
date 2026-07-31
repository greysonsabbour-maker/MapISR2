import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Schedule } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import { generateId } from '@/utils';
import { duplicateSchedule } from '@/services/train/trainService';
import { addTimelineEvent } from '@/services/timeline/timelineService';

interface ScheduleState {
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSchedule: (schedule: Schedule) => void;
  deleteSchedule: (id: string) => void;
  duplicateScheduleById: (id: string) => void;
  getScheduleById: (id: string) => Schedule | undefined;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],

      addSchedule: (partial) => {
        const now = new Date().toISOString();
        const schedule: Schedule = {
          ...partial,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ schedules: [...state.schedules, schedule] }));
        addTimelineEvent(
          'schedule_created',
          `Schedule ${schedule.symbol} Created`,
          `${schedule.origin} → ${schedule.destination} at ${schedule.departureTime}`,
          { scheduleId: schedule.id },
        );
      },

      updateSchedule: (schedule) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === schedule.id
              ? { ...schedule, updatedAt: new Date().toISOString() }
              : s,
          ),
        }));
        addTimelineEvent(
          'schedule_modified',
          `Schedule ${schedule.symbol} Modified`,
          `Updated departure ${schedule.departureTime}`,
          { scheduleId: schedule.id },
        );
      },

      deleteSchedule: (id) => {
        const schedule = get().schedules.find((s) => s.id === id);
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
        }));
        if (schedule) {
          addTimelineEvent(
            'schedule_deleted',
            `Schedule ${schedule.symbol} Deleted`,
            `${schedule.origin} → ${schedule.destination}`,
            { scheduleId: id },
          );
        }
      },

      duplicateScheduleById: (id) => {
        const original = get().schedules.find((s) => s.id === id);
        if (!original) return;
        const copy = duplicateSchedule(original);
        set((state) => ({ schedules: [...state.schedules, copy] }));
        addTimelineEvent(
          'schedule_created',
          `Schedule ${copy.symbol} Duplicated`,
          `Copy of ${original.symbol}`,
          { scheduleId: copy.id },
        );
      },

      getScheduleById: (id) => get().schedules.find((s) => s.id === id),
    }),
    { name: STORAGE_KEYS.schedules },
  ),
);
