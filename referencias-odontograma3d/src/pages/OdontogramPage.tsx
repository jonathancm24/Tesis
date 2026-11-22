import { useEffect, useMemo, useRef, useState } from 'react';
import { useOdontogram, persistOdontogram } from '@/hooks/useOdontogramStore';
import { createDocument, downloadJson, importJson } from '@/services/exportImport';
import { validateRecords } from '@/utils/validation';
import { Odontograma3D } from '@/components/odontogram/Odontograma3D';
import { ViewToolbar } from '@/components/layout/ViewToolbar';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { ToothDetailsPanel } from '@/components/panels/ToothDetailsPanel';
import { TreatmentHistory } from '@/components/panels/TreatmentHistory';
import { TreatmentForm, type TreatmentDraft } from '@/components/panels/TreatmentForm';
import type { RecordKind, TreatmentRecord } from '@/types';

export function OdontogramPage() {
  const {
    records,
    patient,
    selectedFDI,
    view,
    archVisibility,
    display,
    setRecords,
    setDisplay,
    setPatient,
    setArchVisibility,
    addRecord,
    updateRecord,
    deleteRecord,
    setSelectedFDI,
  } = useOdontogram();

  const [editing, setEditing] = useState<TreatmentRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const jawAngle = 0;
  const [kindFilter, setKindFilter] = useState<'all' | RecordKind>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    persistOdontogram(createDocument(patient, records));
  }, [patient, records]);

  const recordsByFDI = useMemo(() => {
    const map = new Map<string, TreatmentRecord[]>();
    for (const r of records) {
      const list = map.get(r.toothFDI) ?? [];
      list.push(r);
      map.set(r.toothFDI, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return map;
  }, [records]);

  const handleSubmitDraft = (draft: TreatmentDraft) => {
    if (!selectedFDI) return;
    const now = new Date().toISOString();
    const base: TreatmentRecord = editing
      ? { ...editing, ...draft, toothFDI: selectedFDI, updatedAt: now }
      : {
          ...draft,
          toothFDI: selectedFDI,
          id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: now,
          updatedAt: now,
        };
    const nextRecords = editing
      ? records.map((r) => (r.id === editing.id ? base : r))
      : [...records, base];
    const validation = validateRecords(nextRecords);
    if (validation.valid) {
      if (editing) {
        updateRecord(editing.id, { ...draft, toothFDI: selectedFDI });
      } else {
        addRecord({ ...draft, toothFDI: selectedFDI });
      }
      setRecords(nextRecords);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const doc = importJson(text);
    setRecords(doc.records);
    setPatient(doc.patient);
  };

  const handleReset = () => {
    setResetToken((token) => token + 1);
  };

  const handleSelect = (fdi: string) => {
    setSelectedFDI(fdi);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100 font-sans text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-clinical-700">Odontograma 3D</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">FDI ISO 3950</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadJson(createDocument(patient, records))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportFile(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPatient({ id: 'patient-default', name: 'Paciente', document: '', birthDate: '', notes: '' });
              setRecords([]);
            }}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Limpiar datos
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <LeftPanel
          records={records}
          display={display}
          onDisplayChange={setDisplay}
          kindFilter={kindFilter}
          onKindFilterChange={setKindFilter}
          patient={patient}
          onPatientChange={(patch) => setPatient({ ...patient, ...patch })}
        />

        <main className="relative min-w-0 flex-1 overflow-hidden">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
            {selectedFDI ? (
              <>
                <p className="text-sm font-bold text-clinical-700">Diente {selectedFDI}</p>
                <p className="text-xs text-slate-600">Pieza seleccionada</p>
              </>
            ) : (
              <p className="text-xs font-semibold text-slate-500">Sin pieza seleccionada</p>
            )}
          </div>
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
            <ViewToolbar
              view={view}
              onViewChange={handleReset}
              archVisibility={archVisibility}
              onArchVisibilityChange={setArchVisibility}
            />
          </div>
          <Odontograma3D
            archVisibility={archVisibility}
            display={display}
            selectedFDI={selectedFDI}
            recordsByFDI={recordsByFDI}
            jawAngle={jawAngle}
            view={view}
            resetToken={resetToken}
            onToothClick={handleSelect}
          />
        </main>

        <section className="flex h-full w-80 flex-col gap-3 overflow-hidden border-l border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ToothDetailsPanel selectedFDI={selectedFDI} records={records} />
          </div>
          <TreatmentHistory records={records} selectedFDI={selectedFDI} kindFilter={kindFilter} onEdit={setEditing} onDelete={deleteRecord} />
          {formOpen ? (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <TreatmentForm
                key={editing?.id ?? 'new'}
                initial={editing}
                onSubmit={handleSubmitDraft}
                onCancel={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="rounded-lg bg-clinical-600 px-3 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
            >
              + Nuevo registro clínico
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
