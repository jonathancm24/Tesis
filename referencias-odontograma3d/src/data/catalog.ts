import type { CatalogItem, DentalSurface, RecordKind, TreatmentRecord } from '@/types';

/**
 * Catálogo clínico: condiciones (diagnóstico observado) y procedimientos
 * (actuación realizada o planificada). La distinción es explícita mediante `kind`.
 */
export const CATALOG: CatalogItem[] = [
  // ── Condiciones ───────────────────────────────────────────────────────────
  { id: 'sano', label: 'Sano', kind: 'condition', color: '#22c55e', description: 'Pieza sin alteraciones detectadas.', defaultSurface: null },
  { id: 'caries', label: 'Caries', kind: 'condition', color: '#7c4a1e', description: 'Lesión cariosa activa.', defaultSurface: 'occlusal' },
  { id: 'fractura', label: 'Fractura dental', kind: 'condition', color: '#b91c1c', description: 'Fisura o pérdida de estructura dentaria.', defaultSurface: 'occlusal' },
  { id: 'desgaste', label: 'Desgaste dental', kind: 'condition', color: '#a16207', description: 'Desgaste o erosión de la superficie.', defaultSurface: 'occlusal' },
  { id: 'ausente', label: 'Pieza ausente', kind: 'condition', color: '#64748b', description: 'Pieza no presente en boca.', defaultSurface: null },
  { id: 'movilidad', label: 'Movilidad dental', kind: 'condition', color: '#f59e0b', description: 'Grado de movilidad patológica.', defaultSurface: null },

  // ── Procedimientos ────────────────────────────────────────────────────────
  { id: 'endodoncia', label: 'Endodoncia', kind: 'procedure', color: '#ef4444', description: 'Tratamiento de conductos.', defaultSurface: 'occlusal' },
  { id: 'corona', label: 'Corona dental', kind: 'procedure', color: '#e2e8f0', description: 'Prótesis fija sobre la pieza.', defaultSurface: 'occlusal' },
  { id: 'resina', label: 'Resina', kind: 'procedure', color: '#bae6fd', description: 'Restauración con composite.', defaultSurface: 'occlusal' },
  { id: 'obturacion', label: 'Obturación', kind: 'procedure', color: '#94a3b8', description: 'Empaste / restauración convencional.', defaultSurface: 'occlusal' },
  { id: 'extraccion', label: 'Extracción', kind: 'procedure', color: '#475569', description: 'Retirada quirúrgica de la pieza.', defaultSurface: null },
  { id: 'implante', label: 'Implante dental', kind: 'procedure', color: '#a3a3a3', description: 'Fixture implantario en el hueso.', defaultSurface: null },
  { id: 'puente', label: 'Puente dental', kind: 'procedure', color: '#cbd5e1', description: 'Prótesis fija removible de varios elementos.', defaultSurface: null },
  { id: 'carilla', label: 'Carilla', kind: 'procedure', color: '#fde68a', description: 'Lámina estética sobre la cara vestibular.', defaultSurface: 'vestibular' },
  { id: 'sellante', label: 'Sellante', kind: 'procedure', color: '#67e8f9', description: 'Sellado de fosas y surcos oclusales.', defaultSurface: 'occlusal' },
  { id: 'incrustacion', label: 'Incrustación', kind: 'procedure', color: '#fed7aa', description: 'Inlay / onlay sobre la pieza.', defaultSurface: 'occlusal' },
  { id: 'periodontal', label: 'Tratamiento periodontal', kind: 'procedure', color: '#86efac', description: 'Raspado y alisado radicular.', defaultSurface: null },
  { id: 'protesis', label: 'Prótesis', kind: 'procedure', color: '#ddd6fe', description: 'Prótesis removible o total.', defaultSurface: null },
];

const BY_ID = new Map(CATALOG.map((item) => [item.id, item]));

export function getCatalogItem(code: string): CatalogItem | undefined {
  return BY_ID.get(code);
}

export function catalogByKind(kind: RecordKind): CatalogItem[] {
  return CATALOG.filter((item) => item.kind === kind);
}

export const SURFACES: { id: DentalSurface; label: string; hint: string }[] = [
  { id: 'vestibular', label: 'Vestibular', hint: 'Cara hacia el labio/mejilla' },
  { id: 'lingual', label: 'Lingual / palatina', hint: 'Cara hacia la lengua o el paladar' },
  { id: 'mesial', label: 'Mesial', hint: 'Cara hacia la línea media' },
  { id: 'distal', label: 'Distal', hint: 'Cara alejada de la línea media' },
  { id: 'occlusal', label: 'Oclusal / incisal', hint: 'Cara de mordida o borde incisal' },
];

export const STATUSES: { id: TreatmentRecord['status']; label: string }[] = [
  { id: 'planificado', label: 'Planificado' },
  { id: 'en_proceso', label: 'En proceso' },
  { id: 'realizado', label: 'Realizado' },
];

export function surfaceLabel(surface: DentalSurface): string {
  return SURFACES.find((s) => s.id === surface)?.label ?? surface;
}

export function statusLabel(status: TreatmentRecord['status']): string {
  return STATUSES.find((s) => s.id === status)?.label ?? status;
}
