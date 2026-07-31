import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Badge,
  statusToBadgeVariant,
  EmptyState,
} from '@/components/ui';
import { useLocomotiveStore } from '@/stores/locomotiveStore';
import { useMapStore } from '@/stores/mapStore';
import type { Locomotive, LocomotiveStatus, LocomotiveRangeInput } from '@/types';
import { LOCOMOTIVE_STATUSES } from '@/types/locomotive';
import { TrainFront, Plus, Trash2, Edit } from 'lucide-react';

export function LocomotivesPage() {
  const locomotives = useLocomotiveStore((s) => s.locomotives);
  const addLocomotive = useLocomotiveStore((s) => s.addLocomotive);
  const addLocomotiveRange = useLocomotiveStore((s) => s.addLocomotiveRange);
  const updateLocomotive = useLocomotiveStore((s) => s.updateLocomotive);
  const deleteLocomotive = useLocomotiveStore((s) => s.deleteLocomotive);
  const locations = useMapStore((s) => s.locations);

  const [showAdd, setShowAdd] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [editing, setEditing] = useState<Locomotive | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const yardOptions = (locations.yards.length ? locations.yards : ['Cliffside Yard']).map((y) => ({
    value: y,
    label: y,
  }));

  const [singleForm, setSingleForm] = useState({
    roadName: 'ISR',
    roadNumber: '',
    model: 'SD40-2',
    manufacturer: 'EMD',
    horsepower: 3000,
    axles: 6,
    paintScheme: 'Ironstate',
    homeYard: yardOptions[0]?.value ?? 'Cliffside Yard',
    notes: '',
  });

  const [rangeForm, setRangeForm] = useState<LocomotiveRangeInput>({
    roadName: 'ISR',
    startNumber: 8001,
    endNumber: 8010,
    model: 'SD40-2',
    manufacturer: 'EMD',
    horsepower: 3000,
    axles: 6,
    paintScheme: 'Ironstate',
    homeYard: yardOptions[0]?.value ?? 'Cliffside Yard',
  });

  const filtered = locomotives.filter((l) =>
    filter === 'all' ? true : l.status === filter,
  );

  const handleAddSingle = () => {
    addLocomotive({
      ...singleForm,
      currentLocation: singleForm.homeYard,
      currentYard: singleForm.homeYard,
      status: 'Available',
      currentTrainId: null,
    });
    setShowAdd(false);
  };

  const handleAddRange = () => {
    addLocomotiveRange(rangeForm);
    setShowRange(false);
  };

  const handleUpdate = () => {
    if (editing) {
      updateLocomotive(editing);
      setEditing(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Locomotive Roster" subtitle="Permanent locomotive database" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({locomotives.length})
            </Button>
            {LOCOMOTIVE_STATUSES.map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status} ({locomotives.filter((l) => l.status === status).length})
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowRange(true)}>
              Add Range
            </Button>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={16} />
              Add Locomotive
            </Button>
          </div>
        </div>

        <Card>
          {filtered.length === 0 ? (
            <EmptyState
                icon={<TrainFront size={40} />}
              title="No Locomotives"
              description="Add individual locomotives or generate a number range."
              action={
                <div className="flex gap-2">
                  <Button onClick={() => setShowAdd(true)}>Add Locomotive</Button>
                  <Button variant="secondary" onClick={() => setShowRange(true)}>Add Range</Button>
                </div>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-foreground/50">
                    <th className="pb-2 pr-4">Number</th>
                    <th className="pb-2 pr-4">Model</th>
                    <th className="pb-2 pr-4">HP</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4">Home Yard</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loco) => (
                    <tr key={loco.id} className="border-b border-border/50">
                      <td className="py-2.5 pr-4 font-medium">
                        {loco.roadName} {loco.roadNumber}
                      </td>
                      <td className="py-2.5 pr-4">{loco.model}</td>
                      <td className="py-2.5 pr-4">{loco.horsepower}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={statusToBadgeVariant(loco.status)}>{loco.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-4">{loco.currentLocation}</td>
                      <td className="py-2.5 pr-4">{loco.homeYard}</td>
                      <td className="py-2.5">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(loco)}>
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLocomotive(loco.id)}
                            disabled={loco.status === 'Assigned'}
                          >
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Locomotive">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Road Name" value={singleForm.roadName} onChange={(e) => setSingleForm({ ...singleForm, roadName: e.target.value })} />
          <Input label="Road Number" value={singleForm.roadNumber} onChange={(e) => setSingleForm({ ...singleForm, roadNumber: e.target.value })} />
          <Input label="Model" value={singleForm.model} onChange={(e) => setSingleForm({ ...singleForm, model: e.target.value })} />
          <Input label="Manufacturer" value={singleForm.manufacturer} onChange={(e) => setSingleForm({ ...singleForm, manufacturer: e.target.value })} />
          <Input label="Horsepower" type="number" value={singleForm.horsepower} onChange={(e) => setSingleForm({ ...singleForm, horsepower: Number(e.target.value) })} />
          <Input label="Axles" type="number" value={singleForm.axles} onChange={(e) => setSingleForm({ ...singleForm, axles: Number(e.target.value) })} />
          <Select label="Home Yard" value={singleForm.homeYard} onChange={(e) => setSingleForm({ ...singleForm, homeYard: e.target.value })} options={yardOptions} />
          <Input label="Paint Scheme" value={singleForm.paintScheme} onChange={(e) => setSingleForm({ ...singleForm, paintScheme: e.target.value })} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button onClick={handleAddSingle} disabled={!singleForm.roadNumber}>Add</Button>
        </div>
      </Modal>

      <Modal isOpen={showRange} onClose={() => setShowRange(false)} title="Add Locomotive Range">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Road Name" value={rangeForm.roadName} onChange={(e) => setRangeForm({ ...rangeForm, roadName: e.target.value })} />
          <Input label="Start Number" type="number" value={rangeForm.startNumber} onChange={(e) => setRangeForm({ ...rangeForm, startNumber: Number(e.target.value) })} />
          <Input label="End Number" type="number" value={rangeForm.endNumber} onChange={(e) => setRangeForm({ ...rangeForm, endNumber: Number(e.target.value) })} />
          <Input label="Model" value={rangeForm.model} onChange={(e) => setRangeForm({ ...rangeForm, model: e.target.value })} />
          <Input label="Manufacturer" value={rangeForm.manufacturer} onChange={(e) => setRangeForm({ ...rangeForm, manufacturer: e.target.value })} />
          <Input label="Horsepower" type="number" value={rangeForm.horsepower} onChange={(e) => setRangeForm({ ...rangeForm, horsepower: Number(e.target.value) })} />
          <Select label="Home Yard" value={rangeForm.homeYard} onChange={(e) => setRangeForm({ ...rangeForm, homeYard: e.target.value })} options={yardOptions} />
        </div>
        <p className="mt-3 text-sm text-foreground/50">
          Will create {Math.max(0, rangeForm.endNumber - rangeForm.startNumber + 1)} locomotives.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowRange(false)}>Cancel</Button>
          <Button onClick={handleAddRange} disabled={rangeForm.endNumber < rangeForm.startNumber}>
            Generate Range
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Locomotive">
        {editing && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Road Number" value={editing.roadNumber} onChange={(e) => setEditing({ ...editing, roadNumber: e.target.value })} />
              <Select
                label="Status"
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as LocomotiveStatus })}
                options={LOCOMOTIVE_STATUSES.map((s) => ({ value: s, label: s }))}
              />
              <Input label="Current Location" value={editing.currentLocation} onChange={(e) => setEditing({ ...editing, currentLocation: e.target.value })} />
              <Select label="Home Yard" value={editing.homeYard} onChange={(e) => setEditing({ ...editing, homeYard: e.target.value })} options={yardOptions} />
              <div className="sm:col-span-2">
                <Input label="Notes" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
