<template>
  <Teleport to="body">
    <div v-if="isOpen" class="tratamientos-modal-overlay" @click.self="cerrarModal">
      <div class="tratamientos-modal-content">
        <header class="tratamientos-modal-header">
          <div>
            <p class="tratamientos-modal-eyebrow">Estudiantes · Historial</p>
            <h2 class="tratamientos-modal-title">Historial completo del paciente</h2>
            <p class="tratamientos-modal-subtitle">Revisión detallada de casos clínicos, tratamientos, prescripciones y archivos.</p>
          </div>
          <button class="tratamientos-modal-close" type="button" @click="cerrarModal">×</button>
        </header>

        <div class="tratamientos-modal-body">
          <div v-if="isLoading" class="tratamientos-modal-state">Cargando historial completo...</div>
          <div v-else-if="error" class="tratamientos-modal-state">{{ error }}</div>

          <template v-else-if="historial">
            <section class="tratamientos-modal-section">
              <div class="tratamientos-modal-list-header">
                <div>
                  <h3>{{ historial.paciente.nombre }} {{ historial.paciente.apellido }}</h3>
                  <p class="tratamientos-modal-helper">Documento: {{ historial.paciente.tipoDocumento }} · {{ historial.paciente.numeroDocumento }}</p>
                </div>
                <span class="tratamientos-modal-badge tratamientos-modal-badge--info">Resumen general</span>
              </div>

              <div class="tratamientos-modal-grid tratamientos-modal-grid--three">
                <div class="tratamientos-modal-detail-item"><span>Casos clínicos</span><p>{{ historial.resumen.totalCasosClinicos }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Tratamientos</span><p>{{ historial.resumen.totalTratamientos }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Prescripciones</span><p>{{ historial.resumen.totalPrescripciones }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Encuestas</span><p>{{ historial.resumen.totalEncuestas }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Observaciones</span><p>{{ historial.resumen.totalObservaciones }}</p></div>
              </div>
            </section>

            <section class="tratamientos-modal-section">
              <h3>Datos del paciente</h3>
              <div class="tratamientos-modal-detail-grid">
                <div class="tratamientos-modal-detail-item"><span>Fecha de nacimiento</span><p>{{ formatDate(historial.paciente.fechaNacimiento) }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Teléfono</span><p>{{ historial.paciente.telefono || '—' }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Email</span><p>{{ historial.paciente.email || '—' }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Dirección</span><p>{{ historial.paciente.direccion || '—' }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Parroquia</span><p>{{ historial.paciente.parroquia?.nombre || '—' }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Género</span><p>{{ historial.paciente.genero || '—' }}</p></div>
                <div class="tratamientos-modal-detail-item"><span>Nacionalidad</span><p>{{ historial.paciente.Nacionalidad || '—' }}</p></div>
              </div>
            </section>

            <section class="tratamientos-modal-section">
              <h3>Casos clínicos</h3>
              <div v-if="historial.casosClinicos.length === 0" class="tratamientos-modal-state">No hay casos clínicos creados.</div>
              <div v-else class="tratamientos-modal-list">
                <article v-for="caso in historial.casosClinicos" :key="caso.id" class="tratamientos-modal-list-card">
                  <div class="tratamientos-modal-list-header">
                    <div>
                      <strong>Caso #{{ caso.id }}</strong>
                      <p class="tratamientos-modal-meta">{{ caso.especialidad?.nombre || 'Sin especialidad' }} · {{ formatDate(caso.fechaCreacion) }}</p>
                      <p class="tratamientos-modal-meta">Profesor: {{ formatPersona(caso.profesor) }} · Estudiante: {{ formatPersona(caso.estudiante) }}</p>
                    </div>
                    <span :class="['tratamientos-modal-badge', getEstadoBadge(caso.estado)]">{{ caso.estado }}</span>
                  </div>

                  <div class="tratamientos-modal-detail-grid" style="margin-top: 0.75rem;">
                    <div class="tratamientos-modal-detail-item"><span>Motivo de consulta</span><p>{{ caso.motivoConsulta }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Enfermedad actual</span><p>{{ caso.enfermedadActual }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>ATM</span><p>{{ caso.ATM }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Cara y cuello</span><p>{{ caso.CarayCuello }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Piel y mucosa</span><p>{{ caso.PielyMucosa }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Cráneo</span><p>{{ caso.craneo }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Facies</span><p>{{ caso.facies }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Marcha</span><p>{{ caso.marcha }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Peso</span><p>{{ caso.peso }}</p></div>
                    <div class="tratamientos-modal-detail-item"><span>Talla</span><p>{{ caso.talla }}</p></div>
                  </div>

                  <details class="tratamientos-modal-subsection">
                    <summary>Odontograma ({{ caso.odontograma.length }})</summary>
                    <div v-if="caso.odontograma.length === 0" class="tratamientos-modal-state" style="margin-top: 0.75rem;">Sin odontograma registrado.</div>
                    <div v-else class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                      <div class="tratamientos-modal-list-card">
                        <OdontogramaEditor :model-value="toOdontogramaModel(caso.odontograma)" :general-observacion="getOdontogramaObservacionGeneral(caso.observaciones)" :disabled="true" />
                      </div>
                    </div>
                  </details>

                  <details class="tratamientos-modal-subsection">
                    <summary>Observaciones ({{ caso.observaciones.length }})</summary>
                    <div v-if="caso.observaciones.length === 0" class="tratamientos-modal-state" style="margin-top: 0.75rem;">Sin observaciones.</div>
                    <div v-else class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                      <article v-for="obs in caso.observaciones" :key="obs.id" class="tratamientos-modal-observation">
                        <div class="tratamientos-modal-list-header">
                          <strong>{{ obs.titulo }}</strong>
                          <span :class="['tratamientos-modal-badge', getObservacionBadge(obs.estado)]">{{ obs.estado }}</span>
                        </div>
                        <p class="tratamientos-modal-meta">{{ formatDate(obs.fecha) }}</p>
                        <p>{{ obs.descripcion }}</p>
                      </article>
                    </div>
                  </details>

                  <details class="tratamientos-modal-subsection">
                    <summary>Tratamientos ({{ caso.tratamientos.length }})</summary>
                    <div v-if="caso.tratamientos.length === 0" class="tratamientos-modal-state" style="margin-top: 0.75rem;">Sin tratamientos registrados.</div>
                    <div v-else class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                      <article v-for="tratamiento in caso.tratamientos" :key="tratamiento.id" class="tratamientos-modal-list-card">
                        <div class="tratamientos-modal-list-header">
                          <div>
                            <strong>Tratamiento #{{ tratamiento.id }}</strong>
                            <p class="tratamientos-modal-meta">{{ formatDate(tratamiento.fechaCreacion) }} · Tipo: {{ tratamiento.tipoDiagnostico || '—' }}</p>
                          </div>
                          <span :class="['tratamientos-modal-badge', getEstadoBadge(tratamiento.estado)]">{{ tratamiento.estado }}</span>
                        </div>

                        <div class="tratamientos-modal-detail-grid" style="margin-top: 0.75rem;">
                          <div class="tratamientos-modal-detail-item"><span>Descripción</span><p>{{ tratamiento.descripcion }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Frecuencia cardíaca</span><p>{{ tratamiento.frecuenciaCardiaca || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Presión arterial</span><p>{{ tratamiento.presArterial || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Saturación de oxígeno</span><p>{{ tratamiento.saturacionOxigeno || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Temperatura</span><p>{{ tratamiento.temperatura || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>CIE10</span><p>{{ tratamiento.cie10 ? `${tratamiento.cie10.codigo} · ${tratamiento.cie10.descripcion}` : tratamiento.cie10Codigo || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Procedimiento</span><p>{{ tratamiento.procedimiento ? `${tratamiento.procedimiento.codigo} · ${tratamiento.procedimiento.descripcion}` : tratamiento.procedimientoCodigo || '—' }}</p></div>
                        </div>

                        <div v-if="tratamiento.observaciones?.length" class="tratamientos-modal-subsection">
                          <div class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                            <article v-for="obs in tratamiento.observaciones" :key="obs.id" class="tratamientos-modal-observation">
                              <div class="tratamientos-modal-list-header">
                                <strong>{{ obs.titulo }}</strong>
                                <span :class="['tratamientos-modal-badge', getObservacionBadge(obs.estado)]">{{ obs.estado }}</span>
                              </div>
                              <p class="tratamientos-modal-meta">{{ formatDate(obs.fecha) }}</p>
                              <p>{{ obs.descripcion }}</p>
                            </article>
                          </div>
                        </div>
                      </article>
                    </div>
                  </details>

                  <details class="tratamientos-modal-subsection">
                    <summary>Prescripciones ({{ caso.prescripciones.length }})</summary>
                    <div v-if="caso.prescripciones.length === 0" class="tratamientos-modal-state" style="margin-top: 0.75rem;">Sin prescripciones registradas.</div>
                    <div v-else class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                      <article v-for="prescripcion in caso.prescripciones" :key="prescripcion.id" class="tratamientos-modal-list-card">
                        <div class="tratamientos-modal-list-header">
                          <div>
                            <strong>Prescripción #{{ prescripcion.id }}</strong>
                            <p class="tratamientos-modal-meta">{{ formatDate(prescripcion.fechaCreacion) }}</p>
                          </div>
                          <span :class="['tratamientos-modal-badge', getEstadoBadge(prescripcion.estado)]">{{ prescripcion.estado }}</span>
                        </div>

                        <div class="tratamientos-modal-detail-grid" style="margin-top: 0.75rem;">
                          <div class="tratamientos-modal-detail-item"><span>Medicamento</span><p>{{ prescripcion.medicamento }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Dosis</span><p>{{ prescripcion.dosis }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Frecuencia</span><p>{{ prescripcion.frecuencia }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Duración</span><p>{{ prescripcion.duracion }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Concentración</span><p>{{ prescripcion.concentracion || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>N° de fármacos</span><p>{{ prescripcion.Nrodefarmacos ?? '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Presentación</span><p>{{ prescripcion.presentacion || '—' }}</p></div>
                          <div class="tratamientos-modal-detail-item"><span>Vía de administración</span><p>{{ prescripcion.viadeadministracion || '—' }}</p></div>
                        </div>

                        <div v-if="prescripcion.observaciones?.length" class="tratamientos-modal-subsection">
                          <div class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                            <article v-for="obs in prescripcion.observaciones" :key="obs.id" class="tratamientos-modal-observation">
                              <div class="tratamientos-modal-list-header">
                                <strong>{{ obs.titulo }}</strong>
                                <span :class="['tratamientos-modal-badge', getObservacionBadge(obs.estado)]">{{ obs.estado }}</span>
                              </div>
                              <p class="tratamientos-modal-meta">{{ formatDate(obs.fecha) }}</p>
                              <p>{{ obs.descripcion }}</p>
                            </article>
                          </div>
                        </div>
                      </article>
                    </div>
                  </details>

                  <details class="tratamientos-modal-subsection">
                    <summary>Archivos adjuntos</summary>
                    <div v-if="getArchivosCaso(caso.id).length === 0" class="tratamientos-modal-state" style="margin-top: 0.75rem;">Sin archivos adjuntos.</div>
                    <div v-else class="tratamientos-modal-list" style="margin-top: 0.75rem;">
                      <article v-for="archivo in getArchivosCaso(caso.id)" :key="archivo.id" class="tratamientos-modal-file-card">
                        <div class="tratamientos-modal-list-header">
                          <div>
                            <strong>{{ archivo.nombre }}</strong>
                            <p class="tratamientos-modal-meta">{{ archivo.tipo }} · {{ formatDate(archivo.fechaSubida) }}</p>
                            <p class="tratamientos-modal-meta">{{ archivo.subidoPor.nombre }} {{ archivo.subidoPor.apellido }}</p>
                          </div>
                          <span v-if="esArchivoPrevisualizable(archivo)" class="tratamientos-modal-badge tratamientos-modal-badge--info">Vista previa</span>
                        </div>

                        <p v-if="archivo.descripcion" class="tratamientos-modal-helper">{{ archivo.descripcion }}</p>

                        <div class="tratamientos-modal-file-actions">
                          <button v-if="esArchivoPrevisualizable(archivo)" class="tratamientos-modal-link-btn" type="button" @click="mostrarVistaPrevia(archivo)">Ver</button>
                        </div>
                      </article>
                    </div>
                  </details>
                </article>
              </div>
            </section>

            <section v-if="archivoSeleccionado && archivoVistaPrevia" class="tratamientos-modal-section">
              <div class="tratamientos-modal-list-header">
                <div>
                  <h3>Vista previa</h3>
                  <p class="tratamientos-modal-helper">{{ archivoSeleccionado.nombre }}</p>
                </div>
                <div class="tratamientos-modal-file-actions">
                  <button class="tratamientos-modal-link-btn" type="button" @click="cerrarVistaPrevia">Cerrar vista previa</button>
                </div>
              </div>

              <div class="tratamientos-modal-file-preview">
                <template v-if="previewKind === 'image'">
                  <img :src="archivoVistaPrevia" :alt="archivoSeleccionado.nombre" />
                </template>
                <template v-else-if="previewKind === 'pdf'">
                  <iframe :src="archivoVistaPrevia" title="Vista previa de PDF"></iframe>
                </template>
                <template v-else>
                  <div class="tratamientos-modal-file-placeholder">Este archivo no puede previsualizarse directamente.</div>
                </template>
              </div>
            </section>
          </template>
        </div>

        <footer class="tratamientos-modal-footer">
          <div class="tratamientos-modal-actions">
            <button class="btn btn-secondary" type="button" @click="cerrarModal">Cerrar</button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import OdontogramaEditor from '@/components/estudiantes/Odontograma/OdontogramaEditor.vue'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import { archivosService } from '@/services/common/archivos.service'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import type { HistorialCompletoPaciente, HistorialObservacion } from '@/types/pacientes.types'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'
import type { ArchivoItem } from '@/types/archivos.types'
import '@/assets/styles/Estudiantes/components/TratamientosModals.css'

interface Props {
  isOpen: boolean
  pacienteId?: number
}

const props = withDefaults(defineProps<Props>(), {
  pacienteId: 0
})

const emit = defineEmits<{ (e: 'close'): void }>()
const historial = ref<HistorialCompletoPaciente | null>(null)
const archivosPorCaso = ref<Record<number, ArchivoItem[]>>({})
const isLoading = ref(false)
const error = ref<string | null>(null)
const toast = useToast()
const archivoSeleccionado = ref<ArchivoItem | null>(null)
const archivoVistaPrevia = ref<string | null>(null)
const previewKind = ref<'image' | 'pdf' | 'other' | null>(null)

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPersona = (persona?: { nombre: string; apellido: string } | null): string => {
  if (!persona) return 'No asignado'
  return `${persona.nombre} ${persona.apellido}`
}

const getEstadoBadge = (estado: string) => {
  if (estado === 'FINALIZADO' || estado === 'APROBADO' || estado === 'COMPLETADA') return 'tratamientos-modal-badge--success'
  if (estado === 'RECHAZADO') return 'tratamientos-modal-badge--danger'
  if (estado === 'EN_TRATAMIENTO' || estado === 'EN_PROCESO') return 'tratamientos-modal-badge--info'
  return 'tratamientos-modal-badge--warning'
}

const getObservacionBadge = (estado: string) => {
  if (estado === 'APROBADO') return 'tratamientos-modal-badge--success'
  if (estado === 'RECHAZADO') return 'tratamientos-modal-badge--danger'
  if (estado === 'PENDIENTE') return 'tratamientos-modal-badge--warning'
  return 'tratamientos-modal-badge--neutral'
}

const toOdontogramaModel = (
  registros: Array<{
    diente: string
    condicion: {
      caras: Array<{ cara: string; observacion?: string | null; condicion?: string | null }>
    }
  }>
): DienteOdontogramaInput[] => {
  return registros.map((registro) => ({
    diente: registro.diente,
    caras: (registro.condicion?.caras || []).map((cara) => ({
      cara: cara.cara,
      observacion: cara.observacion || undefined,
      condicion: cara.condicion || undefined
    }))
  }))
}

const getOdontogramaObservacionGeneral = (observaciones: HistorialObservacion[]): string => {
  const observacion = observaciones.find((item) => item.titulo === 'Observación general odontograma')
  return observacion?.descripcion || ''
}

const getArchivosCaso = (casoId: number): ArchivoItem[] => {
  return archivosPorCaso.value[casoId] || []
}

const esArchivoPrevisualizable = (archivo: ArchivoItem) => {
  const extension = archivo.nombre.split('.').pop()?.toLowerCase() || ''
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'].includes(extension)
}

const tipoVistaPrevia = (archivo: ArchivoItem): 'image' | 'pdf' | 'other' => {
  const extension = archivo.nombre.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  return 'other'
}

const limpiarVistaPrevia = () => {
  if (archivoVistaPrevia.value) {
    URL.revokeObjectURL(archivoVistaPrevia.value)
  }
  archivoSeleccionado.value = null
  archivoVistaPrevia.value = null
  previewKind.value = null
}

const cargarArchivosPorCaso = async (casoIds: number[]) => {
  if (!casoIds.length) {
    archivosPorCaso.value = {}
    return
  }

  const resultados = await Promise.all(
    casoIds.map(async (casoId) => {
      try {
        const archivos = await archivosService.listByEntity('CASO_CLINICO', casoId)
        return [casoId, archivos] as const
      } catch {
        return [casoId, []] as const
      }
    })
  )

  archivosPorCaso.value = Object.fromEntries(resultados)
}

const mostrarVistaPrevia = async (archivo: ArchivoItem) => {
  try {
    limpiarVistaPrevia()
    const blob = await archivosService.download(archivo.id)
    archivoSeleccionado.value = archivo
    archivoVistaPrevia.value = URL.createObjectURL(blob)
    previewKind.value = tipoVistaPrevia(archivo)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const cerrarVistaPrevia = () => {
  limpiarVistaPrevia()
}

const cerrarModal = () => {
  limpiarVistaPrevia()
  emit('close')
}

const cargarHistorial = async () => {
  if (!props.pacienteId) return

  try {
    isLoading.value = true
    error.value = null
    historial.value = await pacientesService.getHistorialCompleto(props.pacienteId)
    await cargarArchivosPorCaso(historial.value.casosClinicos.map((caso) => caso.id))
  } catch {
    historial.value = null
    archivosPorCaso.value = {}
    error.value = 'No se pudo cargar el historial completo del paciente.'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.isOpen, props.pacienteId],
  async ([isOpen, pacienteId], previousValue) => {
    const [prevOpen, prevPacienteId] = previousValue ?? [false, 0]

    if (!isOpen) {
      limpiarVistaPrevia()
      return
    }

    if (!pacienteId) return
    if (isOpen !== prevOpen || pacienteId !== prevPacienteId) {
      await cargarHistorial()
    }
  },
  { immediate: true }
)
</script>