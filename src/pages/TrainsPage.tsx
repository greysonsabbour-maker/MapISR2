import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, Badge, statusToBadgeVariant, EmptyState, Button, Modal, Input, Select } from '@/components/ui';
import { useTrainStore, useAssignLocomotivesToTrain } from '@/stores/trainStore';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useMapStore } from '@/stores/mapStore';
import { useIsAdmin } from '@/stores/authStore';
import { formatDateTime } from '@/utils';
import { TRAIN_PRIORITIES, SPECIAL_TRAIN_TYPES } from '@/types/train';
import type { SpecialTrainRequest, TrainType, TrainPriority } from '@/types';
import { Train, Plus } from 'lucide-react';

export function TrainsPage() {
  const trains = useTrainStore((s) => s.trains);
  const history = useTrainStore((s) => s.history);
  const createSpecialTrainAction = useTrainStore((s) => s.createSpecialTrainAction);
  const validateAssignments = useTrainStore((s) => s.validateAssignments);
  const createPowerMove = useTrainStore((s) => s.createPowerMove);
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const features = useMapStore((s) => s.features);
  const locations = useMapStore((s) => s.locations);
  const isAdmin = useIsAdmin();
  const assignLocomotives = useAssignLocomotivesToTrain();

  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [warnings, setWarnings] = useState<ReturnType<typeof validateAssignments>>([]);
  const [pendingRequest, setPendingRequest] = useState<SpecialTrainRequest | null>(null);

  const [form, setForm] = useState<SpecialTrainRequest>({
    symbol: '',
    origin: locations.all[0] ?? '',
    destination: locations.all[1] ?? '',
    route: [],
    departureTime: 'Immediately',
    assignedLocomotives: [],
    assignedCars: [],
    trainType: 'Manifest',
    priority: 'Normal',
    maxSpeed: 40,
    length: 50,
    notes: '',
  });

  const activeTrains = trains.filter(
    (t) => t.status !== 'Completed' && t.status !== 'Cancelled',
  );

  const handleCreate = () => {
    const route =
      form.route.length > 0 ? form.route : [form.origin, form.destination];
    const request = { ...form, route };

    const assignmentWarnings = validateAssignments(
      request.assignedLocomotives,
      request.origin,
      locomotives,
      features,
    );

    if (assignmentWarnings.length > 0) {
      setWarnings(assignmentWarnings);
      setPendingRequest(request);
      return;
    }

    createSpecialTrainAction(request, features, assignLocomotives);
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      symbol: '',
      origin: locations.all[0] ?? '',
      destination: locations.all[1] ?? '',
      route: [],
      departureTime: 'Immediately',
      assignedLocomotives: [],
      assignedCars: [],
      trainType: 'Manifest',
      priority: 'Normal',
      maxSpeed: 40,
      length: 50,
      notes: '',
    });
  };

  const handleAssignAnyway = () => {
    if (pendingRequest) {
      createSpecialTrainAction(pendingRequest, features, assignLocomotives);
      setPendingRequest(null);
      setWarnings([]);
      setShowCreate(false);
      resetForm();
    }
  };

  const handleCreatePowerMove = () => {
    if (!pendingRequest) return;
    for (const warning of warnings) {
      createPowerMove(
        [warning.locomotiveId],
        warning.currentLocation,
        pendingRequest.origin,
        features,
        assignLocomotives,
      );
    }
    createSpecialTrainAction(pendingRequest, features, assignLocomotives);
    setPendingRequest(null);
    setWarnings([]);
    setShowCreate(false);
    resetForm();
  };

  const locationOptions = locations.all.map((l) => ({ value: l, label: l }));
  const locoOptions = locomotives.map((l) => ({
    value: l.id,
    label: `${l.roadName} ${l.roadNumber} (${l.status})`,
  }));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Trains" subtitle="Active and completed train movements" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={tab === 'active' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTab('active')}
            >
              Active ({activeTrains.length})
            </Button>
            <Button
              variant={tab === 'history' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTab('history')}
            >
              History ({history.length})
            </Button>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Special Train
            </Button>
          )}
        </div>

        {tab === 'active' && (
          <Card>
            {activeTrains.length === 0 ? (
              <EmptyState
                icon={<Train size={40} />}
                title="No Active Trains"
                description="Trains are dispatched automatically from schedules."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground/50">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Route</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Departure</th>
                      <th className="pb-2 pr-4">ETA</th>
                      <th className="pb-2">Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrains.map((train) => (
                      <tr key={train.id} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 font-medium">
                          {train.symbol}
                          {train.isSpecial && (
                            <Badge variant="accent" className="ml-2">Special</Badge>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">{train.origin} → {train.destination}</td>
                        <td className="py-2.5 pr-4">{train.trainType}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant={statusToBadgeVariant(train.status)}>{train.status}</Badge>
                        </td>
                        <td className="py-2.5 pr-4">{formatDateTime(train.departureTime)}</td>
                        <td className="py-2.5 pr-4">{formatDateTime(train.estimatedArrival)}</td>
                        <td className="py-2.5">{train.currentSpeed} mph</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {tab === 'history' && (
          <Card>
            {history.length === 0 ? (
              <EmptyState title="No Completed Trains" description="Completed trains are stored here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-foreground/50">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Route</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 font-medium">{entry.train.symbol}</td>
                        <td className="py-2.5 pr-4">
                          {entry.train.origin} → {entry.train.destination}
                        </td>
                        <td className="py-2.5 pr-4">{entry.train.trainType}</td>
                        <td className="py-2.5">{formatDateTime(entry.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Special Train" size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Train Symbol"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            placeholder="e.g. EXTRA-101"
          />
          <Select
            label="Train Type"
            value={form.trainType}
            onChange={(e) => setForm({ ...form, trainType: e.target.value as TrainType })}
            options={SPECIAL_TRAIN_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Origin"
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
            options={locationOptions.length ? locationOptions : [{ value: '', label: 'No locations loaded' }]}
          />
          <Select
            label="Destination"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            options={locationOptions.length ? locationOptions : [{ value: '', label: 'No locations loaded' }]}
          />
          <Select
            label="Departure"
            value={form.departureTime === 'Immediately' ? 'Immediately' : form.departureTime}
            onChange={(e) =>
              setForm({
                ...form,
                departureTime: e.target.value === 'Immediately' ? 'Immediately' : e.target.value,
              })
            }
            options={[
              { value: 'Immediately', label: 'Immediately' },
              ...Array.from({ length: 24 }, (_, h) => ({
                value: `${String(h).padStart(2, '0')}:00`,
                label: `${String(h).padStart(2, '0')}:00`,
              })),
            ]}
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
            label="Length (cars)"
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
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[100px]"
            >
              {locoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.symbol}>Create Train</Button>
        </div>
      </Modal>

      <Modal
        isOpen={warnings.length > 0}
        onClose={() => { setWarnings([]); setPendingRequest(null); }}
        title="Locomotive Location Warning"
      >
        <p className="mb-4 text-sm text-foreground/70">
          Some locomotives are not at the train origin:
        </p>
        <ul className="mb-4 space-y-2">
          {warnings.map((w) => (
            <li key={w.locomotiveId} className="rounded-lg bg-background/50 p-3 text-sm">
              <strong>{w.roadNumber}</strong> at {w.currentLocation}
              {w.distance > 0 && ` (${w.distance.toFixed(1)} mi away)`}
              {w.currentAssignment && ' — Currently assigned'}
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => { setWarnings([]); setPendingRequest(null); }}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleCreatePowerMove}>
            Create Power Move
          </Button>
          <Button onClick={handleAssignAnyway}>Assign Anyway</Button>
        </div>
      </Modal>
    </div>
  );
}
