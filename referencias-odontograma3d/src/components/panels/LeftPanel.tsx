import { useMemo } from 'react';
import type { DisplayOptions, PatientInfo, RecordKind, ToothStatus, TreatmentRecord } from '@/types';
import { STATUS_META, deriveToothStatus } from '@/utils/toothStatus';

interface LeftPanelProps {
  records: TreatmentRecord[];
  display: DisplayOptions;
  onDisplayChange: (patch: Partial<DisplayOptions>) => void;
  kindFilter: 'all' | RecordKind;
  onKindFilterChange: (kind: 'all' | RecordKind) => void;
  patient: PatientInfo;
  onPatientChange: (patch: Partial<PatientInfo>) => void;
}

const TOGGLE_ROWS: { key: keyof DisplayOptions; label: string; hint: string }[] = [
  { key: 'gums', label: 'Encías', hint: 'Mostrar / ocultar la encía rosada' },
  { key: 'roots', label: 'Raíces', hint: 'Mostrar / ocultar raíces dentarias' },
  { key: 'canals', label: 'Conductos', hint: 'Mostrar / ocultar conductos dentarios' },
  { key: 'labels', label: 'Etiquetas FDI', hint: 'Mostrar / ocultar etiquetas de pieza' },
  { key: 'selected', label: 'Resaltado', hint: 'Mostrar / ocultar el anillo de selección' },
];

export function LeftPanel({ records, display, onDisplayChange, kindFilter, onKindFilterChange, patient, onPatientChange }: LeftPanelProps) {
  const scopedRecords = kindFilter === 'all' ? records : records.filter((r) => r.kind === kindFilter);

  const counts = useMemo(() => {
    const result: Record<ToothStatus, number> = {
      sano: 0,
      ausente: 0,
      patologia: 0,
      planificado: 0,
      tratado: 0,
    };
    const seen = new Set<string>();
    for (const record of scopedRecords) {
      if (seen.has(record.toothFDI)) continue;
      seen.add(record.toothFDI);
      const status = deriveToothStatus(scopedRecords, record.toothFDI);
      result[status] += 1;
    }
    return result;
  }, [scopedRecords]);

  return (
    <aside className="flex h-full w-80 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-sm">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Resumen clínico</h2>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STATUS_META) as ToothStatus[]).map((status) => (
            <div
              key={status}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              data-status={status}
            >
              <p className="text-xs font-semibold text-slate-500">{STATUS_META[status].label}</p>
              <p className="text-xl font-bold text-slate-800">{counts[status]}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {scopedRecords.length} registro{scopedRecords.length === 1 ? '' : 's'} clínicos registrados en el documento.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Filtros clínicos</h2>
        <div className="flex flex-col gap-2">
          {(['all', 'condition', 'procedure'] as const).map((option) => (
            <label key={option} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-700">
                {option === 'all' ? 'Todos los registros' : option === 'condition' ? 'Solo condiciones' : 'Solo procedimientos'}
              </span>
              <input
                type="radio"
                name="clinical-filter"
                value={option}
                checked={kindFilter === option}
                onChange={() => onKindFilterChange(option)}
                className="h-4 w-4 accent-clinical-600"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="flex-1">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Visualización 3D</h2>
        <div className="flex flex-col gap-2">
          {TOGGLE_ROWS.map((row) => (
            <label key={row.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-700">{row.label}</span>
              <input
                type="checkbox"
                checked={Boolean(display[row.key])}
                onChange={(event) => onDisplayChange({ [row.key]: event.target.checked })}
                className="h-4 w-4 accent-clinical-600"
              />
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Información del paciente</h2>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            Nombre
            <input
              type="text"
              value={patient.name}
              onChange={(e) => onPatientChange({ name: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            Documento
            <input
              type="text"
              value={patient.document}
              onChange={(e) => onPatientChange({ document: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
            Notas
            <textarea
              rows={2}
              value={patient.notes}
              onChange={(e) => onPatientChange({ notes: e.target.value })}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal text-slate-700"
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Interpretación</h2>
        <p className="text-xs text-slate-500">
          Los colores de la escena son informativos: el diente blanco indica la pieza anatómica, mientras que las
          superficies marcadas con los colores del catálogo representan las condiciones y procedimientos registrados.
        </p>
      </section>
    </aside>
  );
}
