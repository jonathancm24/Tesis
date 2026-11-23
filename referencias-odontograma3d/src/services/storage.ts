import type { OdontogramDocument, PatientInfo } from '@/types';

/**
 * Contrato de repositorio de la odontograma.
 *
 * La primera implementación persiste en LocalStorage (para la versión
 * inicial). La interfaz está preparada para migrar a una API REST + PostgreSQL
 * sin cambios en la capa de negocio: los datos ya se serializan como un
 * documento versionado (`odontograma:v1`).
 */
export interface OdontogramRepository {
  load(): Promise<Pick<OdontogramDocument, 'records' | 'patient'>>;
  save(doc: OdontogramDocument): Promise<void>;
}

export class LocalStorageRepository implements OdontogramRepository {
  constructor(private readonly prefix: string = 'odontograma3d') {}

  private read(): Pick<OdontogramDocument, 'records' | 'patient'> {
    try {
      const raw = window.localStorage.getItem(this.prefix);
      if (!raw) throw new Error('empty');
      const parsed = JSON.parse(raw) as OdontogramDocument;
      return { records: parsed.records ?? [], patient: parsed.patient ?? ({} as PatientInfo) };
    } catch {
      return { records: [], patient: {} as PatientInfo };
    }
  }

  private write(payload: OdontogramDocument): void {
    try {
      window.localStorage.setItem(this.prefix, JSON.stringify(payload));
    } catch {
      // Quota agotada: no se permite la pérdida de datos en memoria.
    }
  }

  async load(): Promise<Pick<OdontogramDocument, 'records' | 'patient'>> {
    const { records, patient } = this.read();
    return { records, patient };
  }

  async save(doc: OdontogramDocument): Promise<void> {
    const { records, patient } = doc;
    this.write({ version: 1, records, patient, updatedAt: new Date().toISOString() });
  }
}

/** Cliente REST de ejemplo para la integración futura (base URL configurable). */
export class ApiDentogramRepository implements OdontogramRepository {
  constructor(private readonly baseUrl: string = '') {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/odontograms${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!response.ok) throw new Error(`Error ${response.status} en odontograma: ${path}`);
    return (await response.json()) as T;
  }

  async load(): Promise<Pick<OdontogramDocument, 'records' | 'patient'>> {
    const doc = await this.request<OdontogramDocument>('/current');
    return { records: doc.records, patient: doc.patient };
  }

  async save(doc: OdontogramDocument): Promise<void> {
    await this.request('/current', { method: 'POST', body: JSON.stringify(doc) });
  }
}
