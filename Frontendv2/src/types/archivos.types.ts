export interface ArchivoUploader {
  id: number
  nombre: string
  apellido: string
  email: string
}

export interface ArchivoItem {
  id: number
  nombre: string
  tipo: string
  descripcion?: string | null
  fechaSubida: string
  entidadTipo: string
  entidadId: number
  subidoPor: ArchivoUploader
  downloadUrl: string
}

export interface UploadArchivoPayload {
  file: File
  descripcion?: string
  entidadTipo: string
  entidadId: number
}
