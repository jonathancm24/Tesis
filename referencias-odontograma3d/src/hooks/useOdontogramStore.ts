import { create } from 'zustand';
import type { ArchVisibility, CameraView, DisplayOptions, FDI, OdontogramDocument, PatientInfo, TreatmentRecord } from '@/types';

export interface OdontogramState {
  records: TreatmentRecord[];
  patient: PatientInfo;
  selectedFDI: FDI | null;
  view: CameraView;
  archVisibility: ArchVisibility;
  display: DisplayOptions;

  setPatient: (patient: PatientInfo) => void;
  setRecords: (records: TreatmentRecord[]) => void;
  setSelectedFDI: (fdi: FDI | null) => void;
  select: (fdi: FDI | null) => void;
  addRecord: (record: Omit<TreatmentRecord, 'id' | 'createdAt' | 'updatedAt'>) => TreatmentRecord;
  updateRecord: (id: string, patch: Partial<TreatmentRecord>) => void;
  deleteRecord: (id: string) => void;
  setView: (view: CameraView) => void;
  setArchVisibility: (arch: ArchVisibility) => void;
  setDisplay: (patch: Partial<DisplayOptions>) => void;
}

const STORAGE_KEY = 'odontograma3d:v1';

const initialDisplay: DisplayOptions = { gums: true, roots: true, canals: false, labels: true, selected: true };

function initialPatient(): PatientInfo {
  return { id: 'patient-default', name: 'Paciente', document: '', birthDate: '', notes: '' };
}

function loadInitial(): Pick<OdontogramState, 'records' | 'patient'> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OdontogramDocument;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.records)) {
        return { records: parsed.records, patient: parsed.patient ?? initialPatient() };
      }
    }
  } catch {
    // Sin almacenamiento disponible: datos en memoria.
  }
  return { records: [], patient: initialPatient() };
}

export const useOdontogram = create<OdontogramState>((set) => ({
  ...loadInitial(),
  selectedFDI: null,
  view: 'front',
  archVisibility: 'both',
  display: initialDisplay,

  setPatient: (patient) => set({ patient }),
  setRecords: (records) => set({ records }),
  setSelectedFDI: (fdi) => set({ selectedFDI: fdi }),
  select: (fdi) => set({ selectedFDI: fdi }),
  setView: (view) => set({ view }),
  setArchVisibility: (arch) => set({ archVisibility: arch }),
  setDisplay: (patch) => set((state) => ({ display: { ...state.display, ...patch } })),

  addRecord: (record) => {
    const now = new Date().toISOString();
    const created: TreatmentRecord = {
      ...record,
      id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ records: [...state.records, created] }));
    return created;
  },
  updateRecord: (id, patch) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, ...patch, id: r.id, updatedAt: new Date().toISOString() } : r,
      ),
    })),
  deleteRecord: (id) => set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
}));

/** Persistencia local (sustituible por una API REST + PostgreSQL en versión posterior). */
export function persistOdontogram(doc: OdontogramDocument) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // El cuota de almacenamiento puede estar alcanzada; no se debe romper la UX.
  }
}
