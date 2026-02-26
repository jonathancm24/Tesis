<template>
  <section class="tratamientos-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Estudiantes</p>
        <h1>Tratamientos y prescripciones</h1>
        <p class="subtitle">
          Revisa tus casos clínicos y registra tratamientos o prescripciones cuando corresponda.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="cargarCasos" :disabled="isLoading">
          Recargar
        </button>
      </div>
    </header>

    <div class="layout">
      <div class="card">
        <div class="card-header card-header-responsive">
          <div class="search-bar">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar por paciente o especialidad"
              aria-label="Buscar casos"
            />
            <select v-model="estadoFilter" aria-label="Filtrar por estado">
              <option value="all">Todos</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="EN_TRATAMIENTO">En tratamiento</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div class="summary">Mostrando {{ casosFiltrados.length }} casos</div>
        </div>

        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando casos clínicos...</p>
        </div>

        <div v-else-if="!casosFiltrados.length" class="empty-state">
          <span class="empty-state-icon">📋</span>
          <p>No tienes casos clínicos registrados.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="casos-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Especialidad</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Registros</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="caso in casosFiltrados"
                :key="caso.id"
                :class="{ 'active-row': selectedCaso?.id === caso.id }"
              >
                <td>
                  {{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }}
                </td>
                <td>{{ caso.especialidad?.nombre || 'Sin especialidad' }}</td>
                <td>{{ formatFecha(caso.fechaCreacion) }}</td>
                <td>
                  <span :class="['badge', getEstadoBadge(caso.estado)]">
                    {{ getEstadoLabel(caso.estado) }}
                  </span>
                </td>
                <td>
                  T: {{ caso.tratamientos?.length || 0 }} · P: {{ caso.prescripciones?.length || 0 }}
                </td>
                <td class="actions-col">
                  <button class="btn btn-link" type="button" @click="handleSelectCaso(caso)">
                    {{ caso.estado === 'RECHAZADO' ? 'Ver' : 'Abrir' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside class="summary-sidebar">
        <div v-if="!selectedCaso" class="card empty-state-card">
          <div class="empty-icon">🧾</div>
          <p>Selecciona un caso para registrar tratamientos, prescripciones y adjuntos.</p>
        </div>

        <template v-else>
          <div class="card info-card">
            <div class="card-header">
              <div>
                <h3>Caso #{{ selectedCaso.id }}</h3>
                <p class="subtitle">
                  {{ selectedCaso.paciente?.nombre }} {{ selectedCaso.paciente?.apellido }}
                </p>
              </div>
              <span :class="['badge', getEstadoBadge(selectedCaso.estado)]">
                {{ getEstadoLabel(selectedCaso.estado) }}
              </span>
            </div>

            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Especialidad</span>
                <span>{{ selectedCaso.especialidad?.nombre || 'N/A' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Profesor</span>
                <span>{{ selectedCaso.profesor?.nombre }} {{ selectedCaso.profesor?.apellido }}</span>
              </div>
            </div>

            <p v-if="selectedCaso.estado === 'RECHAZADO'" class="warning-text">
              Este caso fue rechazado. Puedes visualizar la información, pero no crear nuevos tratamientos ni prescripciones.
            </p>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Adjuntar archivos al caso</h3>
            </div>
            <div class="upload-actions">
              <input
                ref="fileInputRef"
                type="file"
                multiple
                class="file-input"
                :disabled="isUploadingFiles || selectedCaso.estado === 'RECHAZADO'"
                @change="handleFileChange"
              />
              <input
                v-model="descripcionArchivo"
                type="text"
                placeholder="Descripción opcional"
                :disabled="isUploadingFiles || selectedCaso.estado === 'RECHAZADO'"
              />
              <button
                class="btn btn-secondary"
                type="button"
                :disabled="!filesToUpload.length || isUploadingFiles || selectedCaso.estado === 'RECHAZADO'"
                @click="handleUploadFiles"
              >
                {{ isUploadingFiles ? 'Subiendo...' : 'Subir archivos' }}
              </button>
            </div>
            <ul v-if="archivosCaso.length" class="simple-list">
              <li v-for="archivo in archivosCaso" :key="archivo.id">
                <span>{{ archivo.nombre }}</span>
                <button class="btn btn-link" type="button" @click="handleDownloadFile(archivo.id, archivo.nombre)">
                  Descargar
                </button>
              </li>
            </ul>
            <p v-else class="empty-inline">Sin archivos adjuntos.</p>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Registrar tratamiento</h3>
            </div>
            <form class="compact-form" @submit.prevent="handleCreateTratamiento">
              <textarea
                v-model.trim="tratamientoForm.descripcion"
                rows="2"
                placeholder="Descripción del tratamiento"
                :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'"
                required
              ></textarea>
              <div class="grid-two">
                <input v-model.trim="tratamientoForm.frecuenciaCardiaca" type="text" placeholder="Frecuencia cardíaca" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="tratamientoForm.presArterial" type="text" placeholder="Presión arterial" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="tratamientoForm.saturacionOxigeno" type="text" placeholder="Saturación de oxígeno" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="tratamientoForm.temperatura" type="text" placeholder="Temperatura" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <div class="autocomplete-field">
                  <input
                    v-model.trim="cie10Query"
                    type="text"
                    placeholder="Buscar CIE10 por código o descripción"
                    :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'"
                    @focus="showCie10Suggestions = true"
                    @blur="handleBlurSuggestions('cie10')"
                  />
                  <ul v-if="showCie10Suggestions && cie10Suggestions.length" class="suggestions-list">
                    <li
                      v-for="item in cie10Suggestions"
                      :key="item.codigo"
                      @mousedown.prevent="selectCie10(item)"
                    >
                      {{ item.codigo }} - {{ item.descripcion }}
                    </li>
                  </ul>
                </div>
                <div class="autocomplete-field">
                  <input
                    v-model.trim="procedimientoQuery"
                    type="text"
                    placeholder="Buscar procedimiento por código o descripción"
                    :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'"
                    @focus="showProcedimientoSuggestions = true"
                    @blur="handleBlurSuggestions('procedimiento')"
                  />
                  <ul v-if="showProcedimientoSuggestions && procedimientoSuggestions.length" class="suggestions-list">
                    <li
                      v-for="item in procedimientoSuggestions"
                      :key="item.codigo"
                      @mousedown.prevent="selectProcedimiento(item)"
                    >
                      {{ item.codigo }} - {{ item.descripcion }}
                    </li>
                  </ul>
                </div>
              </div>

              <p v-if="selectedCie10Descripcion" class="empty-inline">
                <strong>CIE10:</strong> {{ selectedCie10Descripcion }}
              </p>
              <p v-if="selectedProcedimientoDescripcion" class="empty-inline">
                <strong>Procedimiento:</strong> {{ selectedProcedimientoDescripcion }}
              </p>

              <label class="checkbox-row">
                <input type="checkbox" v-model="crearPrescripcionEnTratamiento" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" />
                Crear también una prescripción ahora
              </label>

              <div v-if="crearPrescripcionEnTratamiento" class="grid-two">
                <input v-model.trim="prescripcionInline.medicamento" type="text" placeholder="Medicamento" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.dosis" type="text" placeholder="Dosis" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.frecuencia" type="text" placeholder="Frecuencia" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.duracion" type="text" placeholder="Duración" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.concentracion" type="text" placeholder="Concentración" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.number="prescripcionInline.Nrodefarmacos" type="number" min="1" placeholder="N° de fármacos" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.presentacion" type="text" placeholder="Presentación" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionInline.viadeadministracion" type="text" placeholder="Vía de administración" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'" required />
              </div>

              <button class="btn btn-primary" type="submit" :disabled="isSavingTratamiento || selectedCaso.estado === 'RECHAZADO'">
                {{ isSavingTratamiento ? 'Guardando...' : 'Guardar tratamiento' }}
              </button>
            </form>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Registrar prescripción</h3>
            </div>
            <form class="compact-form" @submit.prevent="handleCreatePrescripcion">
              <div class="grid-two">
                <input v-model.trim="prescripcionForm.medicamento" type="text" placeholder="Medicamento" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.dosis" type="text" placeholder="Dosis" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.frecuencia" type="text" placeholder="Frecuencia" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.duracion" type="text" placeholder="Duración" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.concentracion" type="text" placeholder="Concentración" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.number="prescripcionForm.Nrodefarmacos" type="number" min="1" placeholder="N° de fármacos" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.presentacion" type="text" placeholder="Presentación" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
                <input v-model.trim="prescripcionForm.viadeadministracion" type="text" placeholder="Vía de administración" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'" required />
              </div>
              <button class="btn btn-primary" type="submit" :disabled="isSavingPrescripcion || selectedCaso.estado === 'RECHAZADO'">
                {{ isSavingPrescripcion ? 'Guardando...' : 'Guardar prescripción' }}
              </button>
            </form>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Historial del caso</h3>
            </div>
            <p><strong>Tratamientos:</strong> {{ tratamientosCaso.length }}</p>
            <ul v-if="tratamientosCaso.length" class="simple-list">
              <li v-for="item in tratamientosCaso" :key="item.id">
                {{ formatFecha(item.fechaCreacion) }} · {{ item.descripcion }}
              </li>
            </ul>
            <p v-else class="empty-inline">Sin tratamientos registrados.</p>

            <p><strong>Prescripciones:</strong> {{ prescripcionesCaso.length }}</p>
            <ul v-if="prescripcionesCaso.length" class="simple-list">
              <li v-for="item in prescripcionesCaso" :key="item.id">
                {{ formatFecha(item.fechaCreacion) }} · {{ item.medicamento }}
              </li>
            </ul>
            <p v-else class="empty-inline">Sin prescripciones registradas.</p>
          </div>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import { tratamientosService } from '@/services/estudiantes/Tratamientos/tratamientos.service'
import { prescripcionesService } from '@/services/estudiantes/Prescripciones/prescripciones.service'
import { archivosService } from '@/services/common/archivos.service'
import { cie10Service } from '@/services/Admin/cie10.service'
import type { CasoClinicoListItem, EstadoCasoClinico } from '@/types/casosClinicos.types'
import type { ArchivoItem } from '@/types/archivos.types'
import type { Cie10Item } from '@/types/cie10.types'
import type { CreatePrescripcionDto, CreateTratamientoDto, PrescripcionItem, TratamientoItem } from '@/types/tratamientosPrescripciones.types'
import '@/assets/styles/Estudiantes/Tratamientos.css'

const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)
const isSavingTratamiento = ref(false)
const isSavingPrescripcion = ref(false)
const isUploadingFiles = ref(false)

const casos = ref<CasoClinicoListItem[]>([])
const selectedCaso = ref<CasoClinicoListItem | null>(null)
const tratamientosCaso = ref<TratamientoItem[]>([])
const prescripcionesCaso = ref<PrescripcionItem[]>([])
const archivosCaso = ref<ArchivoItem[]>([])

const searchTerm = ref('')
const estadoFilter = ref<'all' | EstadoCasoClinico>('all')

const filesToUpload = ref<File[]>([])
const descripcionArchivo = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const cie10Suggestions = ref<Cie10Item[]>([])
const procedimientoSuggestions = ref<Cie10Item[]>([])
const cie10Query = ref('')
const procedimientoQuery = ref('')
const showCie10Suggestions = ref(false)
const showProcedimientoSuggestions = ref(false)

const crearPrescripcionEnTratamiento = ref(false)

const tratamientoForm = ref<CreateTratamientoDto>({
  descripcion: '',
  frecuenciaCardiaca: '',
  presArterial: '',
  saturacionOxigeno: '',
  temperatura: '',
  cie10Codigo: '',
  procedimientoCodigo: '',
  tipoDiagnostico: 'Presuntivo'
})

const prescripcionInline = ref<CreatePrescripcionDto>({
  medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
  concentracion: '',
  Nrodefarmacos: 1,
  presentacion: '',
  viadeadministracion: ''
})

const prescripcionForm = ref<CreatePrescripcionDto>({
  medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
  concentracion: '',
  Nrodefarmacos: 1,
  presentacion: '',
  viadeadministracion: ''
})

const casosFiltrados = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()

  return casos.value.filter((caso) => {
    const byEstado = estadoFilter.value === 'all' || caso.estado === estadoFilter.value
    if (!byEstado) return false

    if (!term) return true

    const paciente = `${caso.paciente?.nombre || ''} ${caso.paciente?.apellido || ''}`.toLowerCase()
    const especialidad = (caso.especialidad?.nombre || '').toLowerCase()

    return paciente.includes(term) || especialidad.includes(term)
  })
})

const selectedCie10Descripcion = computed(() => {
  if (!tratamientoForm.value.cie10Codigo) return ''
  const item = cie10Suggestions.value.find((entry) => entry.codigo === tratamientoForm.value.cie10Codigo)
  return item?.descripcion || ''
})

const selectedProcedimientoDescripcion = computed(() => {
  if (!tratamientoForm.value.procedimientoCodigo) return ''
  const item = procedimientoSuggestions.value.find(
    (entry) => entry.codigo === tratamientoForm.value.procedimientoCodigo
  )
  return item?.descripcion || ''
})

const buscarCatalogo = async (tipo: 'CIE10' | 'PROCEDIMIENTO', search: string) => {
  if (!search || search.length < 2) {
    if (tipo === 'CIE10') cie10Suggestions.value = []
    if (tipo === 'PROCEDIMIENTO') procedimientoSuggestions.value = []
    return
  }

  try {
    const response = await cie10Service.getAll({ tipo, search, limit: 25 })
    if (tipo === 'CIE10') cie10Suggestions.value = response.data
    if (tipo === 'PROCEDIMIENTO') procedimientoSuggestions.value = response.data
  } catch {
    if (tipo === 'CIE10') cie10Suggestions.value = []
    if (tipo === 'PROCEDIMIENTO') procedimientoSuggestions.value = []
  }
}

watch(cie10Query, (value) => {
  tratamientoForm.value.cie10Codigo = ''
  buscarCatalogo('CIE10', value.trim())
})

watch(procedimientoQuery, (value) => {
  tratamientoForm.value.procedimientoCodigo = ''
  buscarCatalogo('PROCEDIMIENTO', value.trim())
})

const selectCie10 = (item: Cie10Item) => {
  tratamientoForm.value.cie10Codigo = item.codigo
  cie10Query.value = `${item.codigo} - ${item.descripcion}`
  cie10Suggestions.value = [item]
  showCie10Suggestions.value = false
}

const selectProcedimiento = (item: Cie10Item) => {
  tratamientoForm.value.procedimientoCodigo = item.codigo
  procedimientoQuery.value = `${item.codigo} - ${item.descripcion}`
  procedimientoSuggestions.value = [item]
  showProcedimientoSuggestions.value = false
}

const handleBlurSuggestions = (target: 'cie10' | 'procedimiento') => {
  setTimeout(() => {
    if (target === 'cie10') showCie10Suggestions.value = false
    if (target === 'procedimiento') showProcedimientoSuggestions.value = false
  }, 120)
}

const cargarCasos = async () => {
  const estudianteId = authStore.user?.id
  if (!estudianteId) {
    toast.error('No se pudo identificar al estudiante')
    return
  }

  try {
    isLoading.value = true
    casos.value = await casosClinicosService.getByEstudiante(estudianteId)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const cargarDetalleCaso = async (casoId: number) => {
  try {
    const [tratamientos, prescripciones, archivos] = await Promise.all([
      tratamientosService.getByCaso(casoId),
      prescripcionesService.getByCaso(casoId),
      archivosService.listByEntity('CASO_CLINICO', casoId)
    ])

    tratamientosCaso.value = tratamientos
    prescripcionesCaso.value = prescripciones
    archivosCaso.value = archivos
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleSelectCaso = async (caso: CasoClinicoListItem) => {
  selectedCaso.value = caso
  await cargarDetalleCaso(caso.id)
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  filesToUpload.value = Array.from(input.files || [])
}

const handleUploadFiles = async () => {
  if (!selectedCaso.value || !filesToUpload.value.length) return
  if (selectedCaso.value.estado === 'RECHAZADO') {
    toast.error('No puedes adjuntar archivos en un caso rechazado')
    return
  }

  try {
    isUploadingFiles.value = true
    await Promise.all(
      filesToUpload.value.map((file) =>
        archivosService.upload({
          file,
          descripcion: descripcionArchivo.value,
          entidadTipo: 'CASO_CLINICO',
          entidadId: selectedCaso.value!.id
        })
      )
    )

    filesToUpload.value = []
    descripcionArchivo.value = ''
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }

    toast.success('Archivos subidos correctamente')
    await cargarDetalleCaso(selectedCaso.value.id)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isUploadingFiles.value = false
  }
}

const handleDownloadFile = async (archivoId: number, nombreArchivo: string) => {
  try {
    const blob = await archivosService.download(archivoId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const resetTratamientoForm = () => {
  tratamientoForm.value = {
    descripcion: '',
    frecuenciaCardiaca: '',
    presArterial: '',
    saturacionOxigeno: '',
    temperatura: '',
    cie10Codigo: '',
    procedimientoCodigo: '',
    tipoDiagnostico: 'Presuntivo'
  }
  cie10Query.value = ''
  procedimientoQuery.value = ''
  cie10Suggestions.value = []
  procedimientoSuggestions.value = []
  crearPrescripcionEnTratamiento.value = false
  prescripcionInline.value = {
    medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    concentracion: '',
    Nrodefarmacos: 1,
    presentacion: '',
    viadeadministracion: ''
  }
}

const handleCreateTratamiento = async () => {
  if (!selectedCaso.value) return
  if (selectedCaso.value.estado === 'RECHAZADO') {
    toast.error('No puedes crear tratamientos en casos rechazados')
    return
  }

  try {
    isSavingTratamiento.value = true

    const payload: CreateTratamientoDto = {
      ...tratamientoForm.value,
      ...(tratamientoForm.value.cie10Codigo ? { cie10Codigo: tratamientoForm.value.cie10Codigo } : {}),
      ...(tratamientoForm.value.procedimientoCodigo ? { procedimientoCodigo: tratamientoForm.value.procedimientoCodigo } : {}),
      crearPrescripcion: crearPrescripcionEnTratamiento.value,
      prescripcion: crearPrescripcionEnTratamiento.value ? { ...prescripcionInline.value } : undefined
    }

    await tratamientosService.createByCaso(selectedCaso.value.id, payload)

    toast.success('Tratamiento guardado correctamente')
    resetTratamientoForm()
    await Promise.all([cargarCasos(), cargarDetalleCaso(selectedCaso.value.id)])
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSavingTratamiento.value = false
  }
}

const handleCreatePrescripcion = async () => {
  if (!selectedCaso.value) return
  if (selectedCaso.value.estado === 'RECHAZADO') {
    toast.error('No puedes crear prescripciones en casos rechazados')
    return
  }

  try {
    isSavingPrescripcion.value = true
    await prescripcionesService.createByCaso(selectedCaso.value.id, prescripcionForm.value)

    prescripcionForm.value = {
      medicamento: '',
      dosis: '',
      frecuencia: '',
      duracion: '',
      concentracion: '',
      Nrodefarmacos: 1,
      presentacion: '',
      viadeadministracion: ''
    }

    toast.success('Prescripción guardada correctamente')
    await Promise.all([cargarCasos(), cargarDetalleCaso(selectedCaso.value.id)])
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSavingPrescripcion.value = false
  }
}

const getEstadoLabel = (estado: EstadoCasoClinico) => {
  const labels: Record<EstadoCasoClinico, string> = {
    EN_REVISION: 'En revisión',
    EN_TRATAMIENTO: 'En tratamiento',
    FINALIZADO: 'Finalizado',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado'
  }
  return labels[estado] || estado
}

const getEstadoBadge = (estado: EstadoCasoClinico) => {
  const badge: Record<EstadoCasoClinico, string> = {
    EN_REVISION: 'badge-warning',
    EN_TRATAMIENTO: 'badge-info',
    FINALIZADO: 'badge-success',
    APROBADO: 'badge-success',
    RECHAZADO: 'badge-danger'
  }
  return badge[estado] || 'badge-muted'
}

const formatFecha = (fecha: string | Date) => {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarCasos()
})
</script>
