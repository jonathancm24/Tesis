<template>
  <Teleport to="body">
    <div v-if="isOpen" class="historial-modal-overlay" @click.self="emit('close')">
      <div class="historial-modal-content">
        <header class="historial-modal-header">
          <div>
            <h2>Historial completo del paciente</h2>
            <p v-if="historial?.paciente">
              {{ historial.paciente.nombre }} {{ historial.paciente.apellido }}
            </p>
          </div>
          <button class="historial-btn-close" type="button" @click="emit('close')">×</button>
        </header>

        <div class="historial-modal-body">
          <div v-if="isLoading" class="historial-state-card">Cargando historial completo...</div>
          <div v-else-if="error" class="historial-state-card historial-state-error">{{ error }}</div>
          <template v-else-if="historial">
            <section class="historial-section-card historial-resumen-grid">
              <article>
                <span class="historial-label">Casos clínicos</span>
                <strong>{{ historial.resumen.totalCasosClinicos }}</strong>
              </article>
              <article>
                <span class="historial-label">Encuestas</span>
                <strong>{{ historial.resumen.totalEncuestas }}</strong>
              </article>
              <article>
                <span class="historial-label">Observaciones</span>
                <strong>{{ historial.resumen.totalObservaciones }}</strong>
              </article>
              <article>
                <span class="historial-label">Tratamientos</span>
                <strong>{{ historial.resumen.totalTratamientos }}</strong>
              </article>
              <article>
                <span class="historial-label">Prescripciones</span>
                <strong>{{ historial.resumen.totalPrescripciones }}</strong>
              </article>
            </section>

            <section class="historial-section-card">
              <h3>Datos del paciente</h3>
              <div class="historial-datos-grid">
                <div><span class="historial-label">Documento</span><p>{{ historial.paciente.tipoDocumento }} · {{ historial.paciente.numeroDocumento }}</p></div>
                <div><span class="historial-label">Fecha de nacimiento</span><p>{{ formatDate(historial.paciente.fechaNacimiento) }}</p></div>
                <div><span class="historial-label">Teléfono</span><p>{{ historial.paciente.telefono || '—' }}</p></div>
                <div><span class="historial-label">Email</span><p>{{ historial.paciente.email || '—' }}</p></div>
                <div><span class="historial-label">Dirección</span><p>{{ historial.paciente.direccion || '—' }}</p></div>
                <div><span class="historial-label">Parroquia</span><p>{{ historial.paciente.parroquia?.nombre || '—' }}</p></div>
                <div><span class="historial-label">Género</span><p>{{ historial.paciente.genero || '—' }}</p></div>
                <div><span class="historial-label">Nacionalidad</span><p>{{ historial.paciente.Nacionalidad || '—' }}</p></div>
              </div>
            </section>

            <section class="historial-section-card">
              <h3>Encuestas de tamizaje</h3>
              <div v-if="historial.encuestas.length === 0" class="historial-sub-empty">No hay encuestas registradas.</div>
              <div v-else class="historial-stack">
                <article v-for="encuesta in historial.encuestas" :key="encuesta.encuestaId" class="historial-sub-card">
                  <div class="historial-sub-header">
                    <strong>Encuesta #{{ encuesta.encuestaId }}</strong>
                    <span class="historial-badge">{{ encuesta.estado }}</span>
                  </div>
                  <p class="historial-meta">
                    Fecha: {{ formatDate(encuesta.fecha) }} · Completitud: {{ encuesta.respuestasCompletadas }}/{{ encuesta.totalPreguntas }} ({{ encuesta.porcentaje }}%)
                  </p>
                  <div class="historial-qa-list">
                    <div v-for="respuesta in encuesta.respuestas" :key="respuesta.id" class="historial-qa-item">
                      <p class="historial-pregunta">{{ respuesta.pregunta.texto }}</p>
                      <p class="historial-respuesta">Respuesta: {{ respuesta.respuesta || 'Sin respuesta' }}</p>
                      <p v-if="respuesta.detalle" class="historial-detalle">Detalle: {{ respuesta.detalle }}</p>
                    </div>
                  </div>
                </article>
              </div>
              <p v-if="historial.notaVersionado" class="historial-nota">{{ historial.notaVersionado }}</p>
            </section>

            <section class="historial-section-card">
              <h3>Casos clínicos y evolución</h3>
              <div v-if="historial.casosClinicos.length === 0" class="historial-sub-empty">No hay casos clínicos creados.</div>
              <div v-else class="historial-stack">
                <article v-for="caso in historial.casosClinicos" :key="caso.id" class="historial-sub-card">
                  <div class="historial-sub-header">
                    <strong>Caso #{{ caso.id }} - {{ caso.especialidad?.nombre || 'Sin especialidad' }}</strong>
                    <span class="historial-badge">{{ caso.estado }}</span>
                  </div>
                  <p class="historial-meta">
                    Creado: {{ formatDate(caso.fechaCreacion) }} · Profesor: {{ formatPersona(caso.profesor) }} · Estudiante: {{ formatPersona(caso.estudiante) }}
                  </p>
                  <div class="historial-datos-grid">
                    <div><span class="historial-label">Motivo de consulta</span><p>{{ caso.motivoConsulta }}</p></div>
                    <div><span class="historial-label">Enfermedad actual</span><p>{{ caso.enfermedadActual }}</p></div>
                    <div><span class="historial-label">ATM</span><p>{{ caso.ATM }}</p></div>
                    <div><span class="historial-label">Cara y cuello</span><p>{{ caso.CarayCuello }}</p></div>
                    <div><span class="historial-label">Piel y mucosa</span><p>{{ caso.PielyMucosa }}</p></div>
                    <div><span class="historial-label">Cráneo</span><p>{{ caso.craneo }}</p></div>
                    <div><span class="historial-label">Facies</span><p>{{ caso.facies }}</p></div>
                    <div><span class="historial-label">Marcha</span><p>{{ caso.marcha }}</p></div>
                    <div><span class="historial-label">Peso</span><p>{{ caso.peso }}</p></div>
                    <div><span class="historial-label">Talla</span><p>{{ caso.talla }}</p></div>
                  </div>

                  <details class="historial-detail-block">
                    <summary>Odontograma ({{ caso.odontograma.length }} registros)</summary>
                    <div v-if="caso.odontograma.length === 0" class="historial-sub-empty">Sin odontograma registrado.</div>
                    <div v-else class="historial-odontograma-box">
                      <OdontogramaEditor
                        :model-value="toOdontogramaModel(caso.odontograma)"
                        :general-observacion="getOdontogramaObservacionGeneral(caso.observaciones)"
                        :disabled="true"
                      />
                    </div>
                  </details>

                  <details class="historial-detail-block">
                    <summary>Observaciones ({{ caso.observaciones.length }})</summary>
                    <div v-if="caso.observaciones.length === 0" class="historial-sub-empty">Sin observaciones.</div>
                    <div v-else class="historial-stack">
                      <div v-for="obs in caso.observaciones" :key="obs.id" class="historial-mini-card">
                        <p><strong>{{ obs.titulo }}</strong> · {{ obs.estado }} · {{ formatDate(obs.fecha) }}</p>
                        <p>{{ obs.descripcion }}</p>
                      </div>
                    </div>
                  </details>

                  <details class="historial-detail-block">
                    <summary>Tratamientos ({{ caso.tratamientos.length }})</summary>
                    <div v-if="caso.tratamientos.length === 0" class="historial-sub-empty">Sin tratamientos registrados.</div>
                    <div v-else class="historial-stack">
                      <div v-for="tratamiento in caso.tratamientos" :key="tratamiento.id" class="historial-mini-card">
                        <p><strong>Estado:</strong> {{ tratamiento.estado }} · {{ formatDate(tratamiento.fechaCreacion) }}</p>
                        <p>{{ tratamiento.descripcion }}</p>
                      </div>
                    </div>
                  </details>

                  <details class="historial-detail-block">
                    <summary>Prescripciones ({{ caso.prescripciones.length }})</summary>
                    <div v-if="caso.prescripciones.length === 0" class="historial-sub-empty">Sin prescripciones registradas.</div>
                    <div v-else class="historial-stack">
                      <div v-for="prescripcion in caso.prescripciones" :key="prescripcion.id" class="historial-mini-card">
                        <p>
                          <strong>{{ prescripcion.medicamento }}</strong> · {{ prescripcion.estado }} · {{ formatDate(prescripcion.fechaCreacion) }}
                        </p>
                        <p>Dosis: {{ prescripcion.dosis }} · Frecuencia: {{ prescripcion.frecuencia }} · Duración: {{ prescripcion.duracion }}</p>
                      </div>
                    </div>
                  </details>
                </article>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import OdontogramaEditor from '@/components/estudiantes/Odontograma/OdontogramaEditor.vue'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import type { HistorialCompletoPaciente } from '@/types/pacientes.types'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'
import '@/assets/styles/Estudiantes/components/HistorialCompletoModal.css'

interface Props {
  isOpen: boolean
  pacienteId?: number
}

const props = withDefaults(defineProps<Props>(), {
  pacienteId: 0
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const historial = ref<HistorialCompletoPaciente | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

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

const getOdontogramaObservacionGeneral = (
  observaciones: Array<{ titulo: string; descripcion: string }>
): string => {
  const observacion = observaciones.find((item) => item.titulo === 'Observación general odontograma')
  return observacion?.descripcion || ''
}

const cargarHistorial = async () => {
  if (!props.pacienteId) return

  try {
    isLoading.value = true
    error.value = null
    historial.value = await pacientesService.getHistorialCompleto(props.pacienteId)
  } catch (err) {
    historial.value = null
    error.value = 'No se pudo cargar el historial completo del paciente.'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.isOpen, props.pacienteId],
  async ([isOpen, pacienteId], previousValue) => {
    const [prevOpen, prevPacienteId] = previousValue ?? [false, 0]

    if (!isOpen) return
    if (!pacienteId) return
    if (isOpen !== prevOpen || pacienteId !== prevPacienteId) {
      await cargarHistorial()
    }
  },
  { immediate: true }
)
</script>
