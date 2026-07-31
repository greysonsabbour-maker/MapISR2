import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { addTimelineEvent } from '@/services/timeline/timelineService';

const SEED_KEY = 'mapisr_seeded';

export function seedInitialData(): void {
  if (localStorage.getItem(SEED_KEY)) return;

  const locomotiveStore = useLocomotiveStore.getState();
  const scheduleStore = useScheduleStore.getState();

  if (locomotiveStore.locomotives.length === 0) {
    locomotiveStore.addLocomotiveRange({
      roadName: 'ISR',
      startNumber: 8001,
      endNumber: 8012,
      model: 'SD40-2',
      manufacturer: 'EMD',
      horsepower: 3000,
      axles: 6,
      paintScheme: 'Ironstate Orange',
      homeYard: 'Cliffside Yard',
    });

    locomotiveStore.addLocomotiveRange({
      roadName: 'ISR',
      startNumber: 2000,
      endNumber: 2005,
      model: 'GP38-2',
      manufacturer: 'EMD',
      horsepower: 2000,
      axles: 4,
      paintScheme: 'Ironstate Orange',
      homeYard: 'Cliffside Yard',
    });
  }

  if (scheduleStore.schedules.length === 0) {
    scheduleStore.addSchedule({
      symbol: 'M-101',
      origin: 'Cliffside Yard',
      destination: 'East Terminal',
      route: ['Cliffside Yard', 'East Terminal'],
      departureTime: '06:00',
      arrivalTime: '10:00',
      priority: 'Normal',
      trainType: 'Manifest',
      maxSpeed: 40,
      length: 80,
      assignedLocomotives: [],
      assignedCars: [],
      notes: 'Morning manifest service',
      frequency: 'Daily',
      daysOfWeek: [],
      enabled: true,
    });

    scheduleStore.addSchedule({
      symbol: 'I-202',
      origin: 'East Terminal',
      destination: 'Cliffside Yard',
      route: ['East Terminal', 'Cliffside Yard'],
      departureTime: '14:00',
      arrivalTime: '18:00',
      priority: 'High',
      trainType: 'Intermodal',
      maxSpeed: 50,
      length: 60,
      assignedLocomotives: [],
      assignedCars: [],
      notes: 'Afternoon intermodal',
      frequency: 'Weekdays',
      daysOfWeek: [],
      enabled: true,
    });
  }

  addTimelineEvent(
    'system_event',
    'MapISR Initialized',
    'Ironstate Railroad operations platform started',
  );

  localStorage.setItem(SEED_KEY, 'true');
}
