export const caras = [
  { codigo: 'V', nombre: 'Vestibular' },
  { codigo: 'L', nombre: 'Lingual / Palatina' },
  { codigo: 'M', nombre: 'Mesial' },
  { codigo: 'D', nombre: 'Distal' },
  { codigo: 'O', nombre: 'Oclusal / Incisal' },
]

export const condiciones = [
  { value: 'SIN_HALLAZGO', label: 'Sin hallazgo', colorClass: 'condicion-ok', color: '#28a745' },
  { value: 'CARIES', label: 'Caries', colorClass: 'condicion-caries', color: '#dc3545' },
  { value: 'RESTAURACION', label: 'Restauración', colorClass: 'condicion-restauracion', color: '#17a2b8' },
  { value: 'FRACTURA', label: 'Fractura', colorClass: 'condicion-fractura', color: '#ffc107' },
  { value: 'MOVILIDAD', label: 'Movilidad', colorClass: 'condicion-movilidad', color: '#6f42c1' },
  { value: 'AUSENTE', label: 'Ausente', colorClass: 'condicion-ausente', color: '#6c757d' },
]
