import type { RecordKind, TreatmentRecord } from '@/types';
import { CATALOG } from '@/data/catalog';

interface TreatmentHistoryProps {
  records: TreatmentRecord[];
  selectedFDI: string | null;
  kindFilter: 'all' | RecordKind;
  onEdit: (record: TreatmentRecord) => void;
  onDelete: (id: string) => void;
}

export function TreatmentHistory({ records, selectedFDI, kindFilter, onEdit, onDelete }: TreatmentHistoryProps) {
  const visible = records.filter(
    (r) =>
      (selectedFDI === null || r.toothFDI === selectedFDI) &&
      (kindFilter === 'all' || r.kind === kindFilter),
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Historial clínico</h2>
        <span className="rounded-full bg-clinical-50 px-2 py-0.5 text-xs font-semibold text-clinical-700">
          {visible.length} registro{visible.length === 1 ? '' : 's'}
        </span>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No hay registros para esta pieza/paciente.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map((r) => {
              const item = CATALOG.find((c) => c.id === r.code);
              return (
                <li key={r.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item?.label ?? r.code}</p>
                      <p className="text-xs text-slate-500">
                        {r.kind === 'condition' ? 'Condición' : 'Procedimiento'} · {r.status === 'planificado' ? 'Planificado' : r.status === 'en_proceso' ? 'En proceso' : 'Realizado'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(r)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Superficies: {r.surfaces.join(', ') || '—'} · Fecha: {r.date}
                  </p>
                  {r.notes ? <p className="mt-1 text-xs text-slate-400">{r.notes}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}