import type { TreatmentRecord } from '@/types';
import { getToothInfo } from '@/data/fdi';
import { CATALOG } from '@/data/catalog';
import { STATUS_META, deriveToothStatus, recordsForFDI } from '@/utils/toothStatus';

interface ToothDetailsPanelProps {
  selectedFDI: string | null;
  records: TreatmentRecord[];
}

export function ToothDetailsPanel({ selectedFDI, records }: ToothDetailsPanelProps) {
  const tooth = selectedFDI ? getToothInfo(selectedFDI) : undefined;

  if (!selectedFDI || !tooth) {
    return (
      <section className="flex h-full w-80 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pieza seleccionada</h2>
        <p className="text-sm text-slate-400">Selecciona un diente en el visor 3D para ver su información clínica.</p>
      </section>
    );
  }

  const toothRecords = recordsForFDI(records, selectedFDI);
  const status = deriveToothStatus(records, selectedFDI);
  const conditions = toothRecords.filter((r) => r.kind === 'condition');
  const procedures = toothRecords.filter((r) => r.kind === 'procedure');

  return (
    <section className="flex h-full w-80 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-sm">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Pieza seleccionada</h2>
        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-3xl font-bold text-clinical-700">{tooth.fdi}</p>
          <p className="text-sm font-medium text-slate-600">{tooth.name}</p>
          <p className="text-xs text-slate-400">
            {tooth.arch === 'upper' ? 'Arcada superior' : 'Arcada inferior'} · {tooth.side === 'right' ? 'Lado derecho' : 'Lado izquierdo'} · Posición {tooth.position} ·{' '}
            {tooth.toothClass}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Estado clínico:{' '}
            <span style={{ color: STATUS_META[status].color }}>{STATUS_META[status].label}</span>
          </p>
        </div>
      </section>

      <section className="flex-1 overflow-y-auto">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Condiciones</h3>
        {conditions.length === 0 ? (
          <p className="text-xs text-slate-400">Sin condiciones registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {conditions.map((r) => {
              const item = CATALOG.find((c) => c.id === r.code);
              return (
                <li key={r.id} className="rounded-lg border border-slate-200 p-2">
                  <p className="text-sm font-semibold text-slate-700">{item?.label ?? r.code}</p>
                  <p className="text-xs text-slate-500">{r.notes}</p>
                </li>
              );
            })}
          </ul>
        )}

        <h3 className="mt-4 mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tratamientos</h3>
        {procedures.length === 0 ? (
          <p className="text-xs text-slate-400">Sin tratamientos registrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {procedures.map((r) => {
              const item = CATALOG.find((c) => c.id === r.code);
              return (
                <li key={r.id} className="rounded-lg border border-slate-200 p-2">
                  <p className="text-sm font-semibold text-slate-700">{item?.label ?? r.code}</p>
                  <p className="text-xs text-slate-500">
                    {r.status === 'planificado' ? 'Planificado' : r.status === 'en_proceso' ? 'En proceso' : 'Realizado'} · {r.surfaces.join(', ')}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
