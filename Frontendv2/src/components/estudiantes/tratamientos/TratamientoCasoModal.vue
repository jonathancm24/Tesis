<template>
  <Teleport to="body">
    <div v-if="isOpen" class="tratamientos-modal-overlay" @click.self="cerrarModal">
      <div class="tratamientos-modal-content tratamientos-modal-content--compact">
        <header class="tratamientos-modal-header">
          <div>
            <p class="tratamientos-modal-eyebrow">Estudiantes · Tratamientos</p>
            <h2 class="tratamientos-modal-title">Registrar tratamiento</h2>
            <p class="tratamientos-modal-subtitle">
              <span v-if="caso">
                Caso #{{ caso.id }} · {{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }} ·
                {{ caso.especialidad?.nombre || 'Sin especialidad' }}
              </span>
              <span v-else>Selecciona un caso para continuar.</span>
            </p>
          </div>
          <button class="tratamientos-modal-close" type="button" @click="cerrarModal">×</button>
        </header>

        <div class="tratamientos-modal-body">
          <div v-if="!caso" class="tratamientos-modal-state">
            No hay un caso seleccionado.
          </div>

          <template v-else>
            <section class="tratamientos-modal-section">
              <div class="tratamientos-modal-list-header">
                <div>
                  <h3>Resumen del caso</h3>
                  <p class="tratamientos-modal-helper">
                    Si guardas y finalizas, el caso quedará cerrado y ya no permitirá nuevos tratamientos ni prescripciones.
                  </p>
                </div>
                <span :class="['tratamientos-modal-badge', estadoBadge]">
                  {{ caso.estado }}
                </span>
              </div>

              <div class="tratamientos-modal-detail-grid">
                <div class="tratamientos-modal-detail-item">
                  <span>Paciente</span>
                  <p>{{ caso.paciente?.nombre }} {{ caso.paciente?.apellido }}</p>
                </div>
                <div class="tratamientos-modal-detail-item">
                  <span>Especialidad</span>
                  <p>{{ caso.especialidad?.nombre || 'Sin especialidad' }}</p>
                </div>
                <div class="tratamientos-modal-detail-item">
                  <span>Profesor</span>
                  <p>{{ caso.profesor?.nombre }} {{ caso.profesor?.apellido }}</p>
                </div>
                <div class="tratamientos-modal-detail-item">
                  <span>Estudiante</span>
                  <p>{{ caso.estudiante?.nombre }} {{ caso.estudiante?.apellido }}</p>
                </div>
              </div>
            </section>

            <section class="tratamientos-modal-section">
              <h3>Datos del tratamiento</h3>
              <form class="tratamientos-modal-grid" @submit.prevent="guardarTratamiento(false)">
                <div class="tratamientos-modal-field">
                  <label for="tratamiento-descripcion">Descripción</label>
                  <textarea
                    id="tratamiento-descripcion"
                    v-model.trim="form.descripcion"
                    class="tratamientos-modal-textarea"
                    rows="3"
                    placeholder="Describe el tratamiento"
                    :disabled="isSaving || !canEdit"
                    required
                  ></textarea>
                </div>

                <div class="tratamientos-modal-grid tratamientos-modal-grid--two">
                  <div class="tratamientos-modal-field">
                    <label for="frecuencia-cardiaca">Frecuencia cardíaca</label>
                    <input id="frecuencia-cardiaca" v-model.trim="form.frecuenciaCardiaca" type="text" placeholder="Frecuencia cardíaca" :disabled="isSaving || !canEdit" required />
                  </div>
                  <div class="tratamientos-modal-field">
                    <label for="presion-arterial">Presión arterial</label>
                    <input id="presion-arterial" v-model.trim="form.presArterial" type="text" placeholder="Presión arterial" :disabled="isSaving || !canEdit" required />
                  </div>
                  <div class="tratamientos-modal-field">
                    <label for="saturacion-oxigeno">Saturación de oxígeno</label>
                    <input id="saturacion-oxigeno" v-model.trim="form.saturacionOxigeno" type="text" placeholder="Saturación de oxígeno" :disabled="isSaving || !canEdit" required />
                  </div>
                  <div class="tratamientos-modal-field">
                    <label for="temperatura">Temperatura</label>
                    <input id="temperatura" v-model.trim="form.temperatura" type="text" placeholder="Temperatura" :disabled="isSaving || !canEdit" required />
                  </div>
                </div>

                <div class="tratamientos-modal-grid tratamientos-modal-grid--two">
                  <div class="tratamientos-modal-field">
                    <label for="tipo-diagnostico">Tipo de diagnóstico</label>
                    <select id="tipo-diagnostico" v-model="form.tipoDiagnostico" :disabled="isSaving || !canEdit">
                      <option value="Presuntivo">Presuntivo</option>
                      <option value="Definitivo">Definitivo</option>
                    </select>
                  </div>
                  <div class="tratamientos-modal-field">
                    <label for="cie10-query">Buscar CIE10 por código</label>
                    <div class="tratamientos-modal-autocomplete">
                      <input id="cie10-query" v-model.trim="cie10Query" type="text" placeholder="Escribe el código o parte de él" :disabled="isSaving || !canEdit" @focus="showCie10Suggestions = true" @blur="handleBlurSuggestions('cie10')" />
                      <ul v-if="showCie10Suggestions && cie10Suggestions.length" class="tratamientos-modal-suggestions">
                        <li v-for="item in cie10Suggestions" :key="item.codigo" @mousedown.prevent="selectCie10(item)">
                          {{ item.codigo }}
                        </li>
                      </ul>
                    </div>
                    <div class="tratamientos-modal-detail-item tratamientos-modal-detail-item--compact">
                      <span>Descripción CIE10</span>
                      <p>{{ selectedCie10Descripcion || 'Selecciona un código para ver su descripción.' }}</p>
                    </div>
                  </div>
                </div>

                <div class="tratamientos-modal-grid tratamientos-modal-grid--two">
                  <div class="tratamientos-modal-field">
                    <label for="procedimiento-query">Buscar procedimiento por código</label>
                    <div class="tratamientos-modal-autocomplete">
                      <input id="procedimiento-query" v-model.trim="procedimientoQuery" type="text" placeholder="Escribe el código o parte de él" :disabled="isSaving || !canEdit" @focus="showProcedimientoSuggestions = true" @blur="handleBlurSuggestions('procedimiento')" />
                      <ul v-if="showProcedimientoSuggestions && procedimientoSuggestions.length" class="tratamientos-modal-suggestions">
                        <li v-for="item in procedimientoSuggestions" :key="item.codigo" @mousedown.prevent="selectProcedimiento(item)">
                          {{ item.codigo }}
                        </li>
                      </ul>
                    </div>
                    <div class="tratamientos-modal-detail-item tratamientos-modal-detail-item--compact">
                      <span>Descripción del procedimiento</span>
                      <p>{{ selectedProcedimientoDescripcion || 'Selecciona un código para ver su descripción.' }}</p>
                    </div>
                  </div>
                  <div class="tratamientos-modal-field">
                    <label>Códigos seleccionados</label>
                    <p class="tratamientos-modal-helper"><strong>CIE10:</strong> {{ form.cie10Codigo || 'Sin seleccionar' }}</p>
                    <p class="tratamientos-modal-helper"><strong>Procedimiento:</strong> {{ form.procedimientoCodigo || 'Sin seleccionar' }}</p>
                  </div>
                </div>

                <label class="tratamientos-modal-checkbox">
                  <input type="checkbox" v-model="crearPrescripcionEnTratamiento" :disabled="isSaving || !canEdit" />
                  Crear también una prescripción ahora
                </label>

                <div v-if="crearPrescripcionEnTratamiento" class="tratamientos-modal-section" style="margin-top: 0.25rem;">
                  <h4>Datos de la prescripción</h4>
                  <div class="tratamientos-modal-grid tratamientos-modal-grid--two">
                    <div class="tratamientos-modal-field"><label>Medicamento</label><input v-model.trim="prescripcionInline.medicamento" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Dosis</label><input v-model.trim="prescripcionInline.dosis" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Frecuencia</label><input v-model.trim="prescripcionInline.frecuencia" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Duración</label><input v-model.trim="prescripcionInline.duracion" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Concentración</label><input v-model.trim="prescripcionInline.concentracion" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>N° de fármacos</label><input v-model.number="prescripcionInline.Nrodefarmacos" type="number" min="1" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Presentación</label><input v-model.trim="prescripcionInline.presentacion" type="text" :disabled="isSaving || !canEdit" required /></div>
                    <div class="tratamientos-modal-field"><label>Vía de administración</label><input v-model.trim="prescripcionInline.viadeadministracion" type="text" :disabled="isSaving || !canEdit" required /></div>
                  </div>
                </div>
              </form>
            </section>
          </template>
        </div>

        <footer class="tratamientos-modal-footer">
          <p class="tratamientos-modal-warning">
            <strong>Advertencia</strong>
            Si guardas y finalizas este caso, quedará cerrado y no podrás registrar más tratamientos ni prescripciones.
            Si el paciente necesita más atención, deberás abrir un nuevo caso.
          </p>

          <div class="tratamientos-modal-actions">
            <button class="btn btn-secondary" type="button" @click="cerrarModal">Cancelar</button>
            <button class="btn btn-primary" type="button" :disabled="isSaving || !canEdit" @click="guardarTratamiento(false)">
              {{ isSaving ? 'Guardando...' : 'Guardar' }}
            </button>
            <button class="btn btn-secondary" type="button" :disabled="isSaving || !canEdit" @click="guardarTratamiento(true)">
              {{ isSaving ? 'Procesando...' : 'Guardar y finalizar caso' }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cie10Service } from '@/services/Admin/cie10.service'
import { tratamientosService } from '@/services/estudiantes/Tratamientos/tratamientos.service'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import type { CasoClinicoListItem } from '@/types/casosClinicos.types'
import type { Cie10Item } from '@/types/cie10.types'
import type { CreateTratamientoDto } from '@/types/tratamientosPrescripciones.types'
import '@/assets/styles/Estudiantes/components/TratamientosModals.css'

interface Props {
  isOpen: boolean
  caso: CasoClinicoListItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
const toast = useToast()

const isSaving = ref(false)
const cie10Suggestions = ref<Cie10Item[]>([])
const procedimientoSuggestions = ref<Cie10Item[]>([])
const cie10Query = ref('')
const procedimientoQuery = ref('')
const selectedCie10Item = ref<Cie10Item | null>(null)
const selectedProcedimientoItem = ref<Cie10Item | null>(null)
const showCie10Suggestions = ref(false)
const showProcedimientoSuggestions = ref(false)
const crearPrescripcionEnTratamiento = ref(false)

const form = ref<CreateTratamientoDto>({
  descripcion: '',
  frecuenciaCardiaca: '',
  presArterial: '',
  saturacionOxigeno: '',
  temperatura: '',
  cie10Codigo: '',
  procedimientoCodigo: '',
  tipoDiagnostico: 'Presuntivo'
})

const prescripcionInline = ref({
  medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
  concentracion: '',
  Nrodefarmacos: 1,
  presentacion: '',
  viadeadministracion: ''
})

const canEdit = computed(() => Boolean(props.caso) && props.caso?.estado !== 'RECHAZADO' && props.caso?.estado !== 'FINALIZADO')

const estadoBadge = computed(() => {
  const estado = props.caso?.estado
  if (estado === 'FINALIZADO' || estado === 'APROBADO') return 'tratamientos-modal-badge--success'
  if (estado === 'RECHAZADO') return 'tratamientos-modal-badge--danger'
  if (estado === 'EN_TRATAMIENTO') return 'tratamientos-modal-badge--info'
  return 'tratamientos-modal-badge--warning'
})

const selectedCie10Descripcion = computed(() => {
  return selectedCie10Item.value?.descripcion || ''
})

const selectedProcedimientoDescripcion = computed(() => {
  return selectedProcedimientoItem.value?.descripcion || ''
})

const resetForm = () => {
  form.value = {
    descripcion: '',
    frecuenciaCardiaca: '',
    presArterial: '',
    saturacionOxigeno: '',
    temperatura: '',
    cie10Codigo: '',
    procedimientoCodigo: '',
    tipoDiagnostico: 'Presuntivo'
  }

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

  cie10Query.value = ''
  procedimientoQuery.value = ''
  cie10Suggestions.value = []
  procedimientoSuggestions.value = []
  selectedCie10Item.value = null
  selectedProcedimientoItem.value = null
  showCie10Suggestions.value = false
  showProcedimientoSuggestions.value = false
  crearPrescripcionEnTratamiento.value = false
}

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
  form.value.cie10Codigo = ''
  selectedCie10Item.value = null
  buscarCatalogo('CIE10', value.trim())
})

watch(procedimientoQuery, (value) => {
  form.value.procedimientoCodigo = ''
  selectedProcedimientoItem.value = null
  buscarCatalogo('PROCEDIMIENTO', value.trim())
})

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  },
  { immediate: true }
)

const selectCie10 = (item: Cie10Item) => {
  form.value.cie10Codigo = item.codigo
  cie10Query.value = item.codigo
  cie10Suggestions.value = [item]
  selectedCie10Item.value = item
  showCie10Suggestions.value = false
}

const selectProcedimiento = (item: Cie10Item) => {
  form.value.procedimientoCodigo = item.codigo
  procedimientoQuery.value = item.codigo
  procedimientoSuggestions.value = [item]
  selectedProcedimientoItem.value = item
  showProcedimientoSuggestions.value = false
}

const handleBlurSuggestions = (target: 'cie10' | 'procedimiento') => {
  setTimeout(() => {
    if (target === 'cie10') showCie10Suggestions.value = false
    if (target === 'procedimiento') showProcedimientoSuggestions.value = false
  }, 120)
}

const cerrarModal = () => {
  if (isSaving.value) return
  emit('close')
}

const guardarTratamiento = async (finalizarCaso: boolean) => {
  if (!props.caso) return
  if (!canEdit.value) {
    toast.warning('Este caso ya no admite más registros')
    return
  }

  if (finalizarCaso) {
    const continuar = window.confirm(
      'Al finalizar este caso no podrás agregar más tratamientos ni prescripciones. Si el paciente requiere más atención, deberás abrir un nuevo caso.'
    )
    if (!continuar) return
  }

  try {
    isSaving.value = true

    const payload: CreateTratamientoDto = {
      ...form.value,
      ...(form.value.cie10Codigo ? { cie10Codigo: form.value.cie10Codigo } : {}),
      ...(form.value.procedimientoCodigo ? { procedimientoCodigo: form.value.procedimientoCodigo } : {}),
      crearPrescripcion: crearPrescripcionEnTratamiento.value,
      prescripcion: crearPrescripcionEnTratamiento.value ? { ...prescripcionInline.value } : undefined
    }

    await tratamientosService.createByCaso(props.caso.id, payload)

    if (finalizarCaso) {
      await casosClinicosService.updateEstado(props.caso.id, { estado: 'FINALIZADO' })
      toast.warning('El caso fue finalizado. Ya no podrá recibir nuevos tratamientos ni prescripciones.')
    } else {
      toast.success('Tratamiento guardado correctamente')
    }

    emit('saved')
    emit('close')
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isSaving.value = false
  }
}
</script>