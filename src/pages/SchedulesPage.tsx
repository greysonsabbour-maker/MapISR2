import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Badge,
  EmptyState,
} from '@/components/ui';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useMapStore } from '@/stores/mapStore';
import type { Schedule, ScheduleFrequency, TrainType, TrainPriority } from '@/types';
import { TRAIN_TYPES, TRAIN_PRIORITIES } from '@/types/train';
import { Calendar, Plus, Copy, Trash2, Edit } from 'lucide-react';

const FREQUENCIES: ScheduleFrequency[] = ['Daily', 'Weekdays', 'Weekends', 'Weekly', 'One-Time'];

const emptySchedule = (): Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> => ({
  symbol: '',
  origin: '',
  destination: '',
  route: [],
  departureTime: '08:00',
  arrivalTime: '12:00',
  priority: 'Normal',
  trainType: 'Manifest',
  maxSpeed: 40,
  length: 50,
  assignedLocomotives: [],
  assignedCars: [],
  notes: '',
  frequency: 'Daily',
  daysOfWeek: [],
  enabled: true,
});

export function SchedulesPage() {
  const schedules = useScheduleStore((s) => s.schedules);
  const addSchedule = useScheduleStore((s) => s.addSchedule);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const duplicateScheduleById = useScheduleStore((s) => s.duplicateScheduleById);
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const locations = useMapStore((s) => s.locations);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState(emptySchedule());

  const locationOptions = locations.all.map((l) => ({ value: l, label: l }));

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptySchedule(),
      origin: locations.all[0] ?? '',
      destination: locations.all[1] ?? '',
    });
    setShowModal(true);
  };

  const openEdit = (schedule: Schedule) => {
    setEditing(schedule);
    setForm({ ...schedule });
    setShowModal(true);
  };

  const handleSave = () => {
    const route =
      form.route.length > 0 ? form.route : [form.origin, form.destination];

    if (editing) {
      updateSchedule({ ...editing, ...form, route });
    } else {
      addSchedule({ ...form, route });
    }
    setShowModal(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Schedules" subtitle="Automatic train dispatch configuration" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} />
            New Schedule
          </Button>
        </div>

        <Card>
          {schedules.length === 0 ? (
            <EmptyState
              icon={<Calendar size={40} />}
              title="No Schedules"
              description="Create schedules to automatically dispatch trains."
              action={<Button onClick={openCreate}>Create Schedule</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-foreground/50">
                    <th className="pb-2 pr-4">Symbol</th>
                    <th className="pb-2 pr-4">Route</th>
                    <th className="pb-2 pr-4">Departure</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Frequency</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">{schedule.symbol}</td>
                      <td className="py-2.5 pr-4">
                        {schedule.origin} → {schedule.destination}
                      </td>
                      <td className="py-2.5 pr-4">{schedule.departureTime}</td>
                      <td className="py-2.5 pr-4">{schedule.trainType}</td>
                      <td className="py-2.5 pr-4">{schedule.frequency}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={schedule.enabled ? 'success' : 'default'}>
                          {schedule.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(schedule)}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => duplicateScheduleById(schedule.id)}>
                            <Copy size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteSchedule(schedule.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Schedule' : 'New Schedule'}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Train Symbol"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          />
          <Select
            label="Train Type"
            value={form.trainType}
            onChange={(e) => setForm({ ...form, trainType: e.target.value as TrainType })}
            options={TRAIN_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Origin"
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
            options={locationOptions.length ? locationOptions : [{ value: '', label: 'Loading...' }]}
          />
          <Select
            label="Destination"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            options={locationOptions.length ? locationOptions : [{ value: '', label: 'Loading...' }]}
          />
          <Input
            label="Departure Time"
            type="time"
            value={form.departureTime}
            onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
          />
          <Input
            label="Arrival Time"
            type="time"
            value={form.arrivalTime}
            onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
          />
          <Select
            label="Frequency"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as ScheduleFrequency })}
            options={FREQUENCIES.map((f) => ({ value: f, label: f }))}
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as TrainPriority })}
            options={TRAIN_PRIORITIES.map((p) => ({ value: p, label: p }))}
          />
          <Input
            label="Max Speed (mph)"
            type="number"
            value={form.maxSpeed}
            onChange={(e) => setForm({ ...form, maxSpeed: Number(e.target.value) })}
          />
          <Input
            label="Length"
            type="number"
            value={form.length}
            onChange={(e) => setForm({ ...form, length: Number(e.target.value) })}
          />
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground/80">Assigned Locomotives</label>
            <select
              multiple
              value={form.assignedLocomotives}
              onChange={(e) =>
                setForm({
                  ...form,
                  assignedLocomotives: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
            >
              {locomotives.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.roadName} {l.roadNumber} ({l.status})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="rounded border-border"
            />
            <span className="text-sm">Schedule enabled</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.symbol}>Save Schedule</Button>
        </div>
      </Modal>
    </div>
  );
}
