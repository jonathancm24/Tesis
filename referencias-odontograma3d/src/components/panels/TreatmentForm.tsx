import { useState, type FormEvent } from 'react';
import type { DentalSurface, RecordKind, RecordStatus, TreatmentRecord } from '@/types';
import { SURFACES, STATUSES, catalogByKind } from '@/data/catalog';

export interface TreatmentDraft {
  kind: RecordKind;
  code: string;
  status: RecordStatus;
  surfaces: DentalSurface[];
  date: string;
  notes: string;
  linkedTeeth: string[];
}

interface TreatmentFormProps {
  initial?: TreatmentRecord | null;
  onSubmit: (draft: TreatmentDraft) => void;
  onCancel: () => void;
}

export function TreatmentForm({ initial, onSubmit, onCancel }: TreatmentFormProps) {
  const isEditing = Boolean(initial);
  const [kind, setKind] = useState<RecordKind>(initial?.kind ?? 'condition');
  const [code, setCode] = useState(initial?.code ?? 'caries');
  const [status, setStatus] = useState<RecordStatus>(initial?.status ?? 'planificado');
  const [surfaces, setSurfaces] = useState<DentalSurface[]>(initial?.surfaces ?? ['occlusal']);
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const linkedTeeth = (initial?.linkedTeeth ?? []).join(',');

  const items = catalogByKind(kind);

  const toggleSurface = (surface: DentalSurface) => {
    setSurfaces((prev) => (prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (surfaces.length === 0) return;
    onSubmit({
      kind,
      code,
      status,
      surfaces,
      date,
      notes,
      linkedTeeth: linkedTeeth.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{isEditing ? 'Editar registro' : 'Nuevo registro clínico'}</h2>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Tipo
          <select value={kind} onChange={(e) => { setKind(e.target.value as RecordKind); setCode('caries'); }} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700">
            <option value="condition">Condición</option>
            <option value="procedure">Procedimiento</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Código
          <select value={code} onChange={(e) => setCode(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700">
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Estado
          <select value={status} onChange={(e) => setStatus(e.target.value as RecordStatus)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700">
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Fecha
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700" />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-slate-500">Superficies</legend>
        {SURFACES.map((surface) => (
          <label key={surface.id} className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={surfaces.includes(surface.id)}
              onChange={() => toggleSurface(surface.id)}
              className="h-4 w-4 accent-clinical-600"
            />
            {surface.label} — {surface.hint}
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
        Notas clínicas
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700" placeholder="Observaciones del tratamiento..." />
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
        <button type="submit" className="rounded-lg bg-clinical-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-clinical-700 disabled:opacity-50" disabled={surfaces.length === 0 || !date}>Guardar</button>
      </div>
    </form>
  );
}

export function draftFromRecord(r: TreatmentRecord): TreatmentDraft {
  return {
    kind: r.kind,
    code: r.code,
    status: r.status,
    surfaces: r.surfaces,
    date: r.date,
    notes: r.notes,
    linkedTeeth: r.linkedTeeth ?? [],
  };
}

export function draftToText(d: TreatmentDraft): string {
  return JSON.stringify({
    kind: d.kind,
    code: d.code,
    status: d.status,
    surfaces: d.surfaces,
    date: d.date,
    notes: d.notes,
    linkedTeeth: d.linkedTeeth,
  });
}
