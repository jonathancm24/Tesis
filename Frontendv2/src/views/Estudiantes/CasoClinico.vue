<template>
	<section class="caso-clinico-page">
		<header class="page-header">
			<div class="page-title">
				<h1>Nuevo caso clinico</h1>
				<p>Completa los datos base del caso clinico antes de continuar.</p>
			</div>
			<div class="case-progress" :class="{ 'case-progress--complete': isFormValid }">
				<div class="case-progress__label">
					<span>{{ isFormValid ? 'Caso listo para guardar' : 'Progreso del caso' }}</span>
					<strong>{{ completionPercentage }}%</strong>
				</div>
				<div class="case-progress__track" aria-hidden="true">
					<div class="case-progress__bar" :style="{ width: `${completionPercentage}%` }"></div>
				</div>
			</div>
			<div class="header-actions">
				<button class="btn btn-secondary" type="button" @click="goBack">Volver</button>
			</div>
		</header>

		<div v-if="isLoading" class="page-state">Cargando informacion...</div>
		<div v-else-if="loadError" class="page-state error">{{ loadError }}</div>
		<div v-else class="page-content">
			<div v-if="paciente" class="patient-card">
				<div class="patient-header">
					<div class="patient-heading">
						<div class="patient-avatar" aria-hidden="true">
							{{ paciente.nombre.charAt(0).toUpperCase() }}{{ paciente.apellido.charAt(0).toUpperCase() }}
						</div>
						<div>
							<div class="patient-title">Paciente seleccionado</div>
							<div class="patient-name">{{ paciente.nombre }} {{ paciente.apellido }}</div>
						</div>
					</div>
					<div class="patient-actions">
						<span class="patient-status">Paciente activo</span>
						<button class="btn btn-secondary" type="button" @click="clearPaciente">
							Cambiar paciente
						</button>
					</div>
				</div>
				<div class="patient-info">
					<div class="patient-info__item"><span>Documento</span><strong>{{ paciente.numeroDocumento || 'N/A' }}</strong></div>
					<div class="patient-info__item"><span>Género</span><strong>{{ paciente.genero || 'N/A' }}</strong></div>
					<div class="patient-info__item"><span>Teléfono</span><strong>{{ paciente.telefono || 'N/A' }}</strong></div>
				</div>
			</div>

			<div v-else class="patient-search">
				<div class="patient-title">Buscar paciente</div>
				<div class="search-row">
					<input
						v-model.trim="searchTerm"
						type="text"
						placeholder="Ingrese nombre o apellido"
						@keydown.enter.prevent="handleSearch"
					/>
					<button class="btn btn-primary" type="button" :disabled="isSearching" @click="handleSearch">
						{{ isSearching ? 'Buscando...' : 'Buscar' }}
					</button>
				</div>
				<div v-if="searchError" class="search-error">{{ searchError }}</div>
				<div v-else-if="hasAttemptedSearch" class="search-error">
					Debe seleccionar un paciente antes de guardar el caso clínico.
				</div>
				<div v-else-if="searchResults.length === 0" class="search-empty">
					No hay resultados. Intenta con otro nombre.
				</div>
				<ul v-else class="search-results">
					<li v-for="item in searchResults" :key="item.id" class="search-item">
						<div>
							<strong>{{ item.nombre }} {{ item.apellido }}</strong>
							<span>{{ item.numeroDocumento || 'N/A' }}</span>
						</div>
						<button class="btn btn-secondary" type="button" @click="selectPaciente(item)">
							Seleccionar
						</button>
					</li>
				</ul>
			</div>

			<form class="case-form" @submit.prevent="handleSubmit">
				<h3 class="form-section-title"><span class="form-section-number">01</span>Datos administrativos</h3>
				<div class="form-grid">
					<div class="form-field" :class="{ 'is-invalid': touched.profesorId && form.profesorId === 0, 'is-valid': touched.profesorId && form.profesorId > 0 }">
						<label for="profesor">Profesor asignado <span class="required-mark" aria-hidden="true">*</span></label>
						<select id="profesor" v-model.number="form.profesorId" :aria-invalid="touched.profesorId && form.profesorId === 0" @change="touched.profesorId = true; profesorSeleccionadoId = form.profesorId" required>
							<option :value="0" disabled>Seleccione un profesor</option>
							<option v-for="profesor in profesoresFiltrados" :key="profesor.id" :value="profesor.id">
								{{ profesor.nombre }} {{ profesor.apellido }}
							</option>
						</select>
						<small v-if="touched.profesorId && form.profesorId === 0" class="help-text error">
							Seleccione el profesor asignado al caso.
						</small>
						<small v-if="form.especialidadId > 0 && profesoresFiltrados.length === 0" class="help-text error">
							No hay profesores con esta especialidad
						</small>
					</div>

					<div class="form-field" :class="{ 'is-invalid': touched.especialidadId && form.especialidadId === 0, 'is-valid': touched.especialidadId && form.especialidadId > 0 }">
						<label for="especialidad">Especialidad <span class="required-mark" aria-hidden="true">*</span></label>
						<select id="especialidad" v-model.number="form.especialidadId" :aria-invalid="touched.especialidadId && form.especialidadId === 0" @change="touched.especialidadId = true; especialidadSeleccionadaId = form.especialidadId" required>
							<option :value="0" disabled>Seleccione una especialidad</option>
							<option v-for="especialidad in especialidadesFiltradas" :key="especialidad.id" :value="especialidad.id">
								{{ especialidad.nombre }}
							</option>
						</select>
						<small v-if="touched.especialidadId && form.especialidadId === 0" class="help-text error">
							Seleccione la especialidad del caso.
						</small>
						<small v-if="form.profesorId > 0 && especialidadesFiltradas.length === 0" class="help-text error">
							Este profesor no tiene especialidades asignadas
						</small>
					</div>

					<div class="form-field">
						<label for="estudiante">Estudiante responsable</label>
						<input id="estudiante" type="text" :value="estudianteNombre" disabled />
					</div>
				</div>

				<h3 class="form-section-title"><span class="form-section-number">02</span>Anamnesis</h3>
				<div class="form-grid">
					<div class="form-field form-field-full" :class="{ 'is-invalid': touched.motivoConsulta && !form.motivoConsulta.trim(), 'is-valid': touched.motivoConsulta && !!form.motivoConsulta.trim() }">
						<label for="motivo">Motivo de consulta <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="motivo" v-model.trim="form.motivoConsulta" :aria-invalid="touched.motivoConsulta && !form.motivoConsulta.trim()" rows="2" placeholder="Razón principal por la que el paciente acude a consulta" required @blur="touched.motivoConsulta = true"></textarea>
						<small v-if="touched.motivoConsulta && !form.motivoConsulta.trim()" class="help-text error">
							Describa el motivo de consulta.
						</small>
					</div>

					<div class="form-field form-field-full" :class="{ 'is-invalid': touched.enfermedadActual && !form.enfermedadActual.trim(), 'is-valid': touched.enfermedadActual && !!form.enfermedadActual.trim() }">
						<label for="enfermedad">Enfermedad actual <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="enfermedad" v-model.trim="form.enfermedadActual" :aria-invalid="touched.enfermedadActual && !form.enfermedadActual.trim()" rows="3" placeholder="Historia detallada de la enfermedad actual del paciente" required @blur="touched.enfermedadActual = true"></textarea>
						<small v-if="touched.enfermedadActual && !form.enfermedadActual.trim()" class="help-text error">
							Describa la enfermedad actual del paciente.
						</small>
					</div>
				</div>

				<h3 class="form-section-title"><span class="form-section-number">03</span>Signos vitales y antropometría</h3>
				<div class="form-grid">
					<div class="form-field" :class="{ 'is-invalid': touched.peso && form.peso <= 0, 'is-valid': touched.peso && form.peso > 0 }">
						<label for="peso">Peso (kg) <span class="required-mark" aria-hidden="true">*</span></label>
						<input id="peso" type="number" min="0" step="0.1" v-model.number="form.peso" :aria-invalid="touched.peso && form.peso <= 0" placeholder="Ej: 70.5" required @blur="touched.peso = true" />
						<small v-if="touched.peso && form.peso <= 0" class="help-text error">
							Ingrese un peso mayor que cero.
						</small>
					</div>

					<div class="form-field" :class="{ 'is-invalid': touched.talla && form.talla <= 0, 'is-valid': touched.talla && form.talla > 0 }">
						<label for="talla">Talla (cm) <span class="required-mark" aria-hidden="true">*</span></label>
						<input id="talla" type="number" min="0" step="0.1" v-model.number="form.talla" :aria-invalid="touched.talla && form.talla <= 0" placeholder="Ej: 165.0" required @blur="touched.talla = true" />
						<small v-if="touched.talla && form.talla <= 0" class="help-text error">
							Ingrese una talla mayor que cero.
						</small>
					</div>
				</div>

				<h3 class="form-section-title"><span class="form-section-number">04</span>Examen físico general</h3>
				<div class="form-grid">
					<div class="form-field" :class="{ 'is-invalid': touched.facies && !form.facies.trim(), 'is-valid': touched.facies && !!form.facies.trim() }">
						<label for="facies">Facies <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="facies" v-model.trim="form.facies" :aria-invalid="touched.facies && !form.facies.trim()" rows="2" placeholder="Aspecto general del rostro" required @blur="touched.facies = true"></textarea>
						<small v-if="touched.facies && !form.facies.trim()" class="help-text error">
							Describa las facies del paciente.
						</small>
					</div>
					<div class="form-field" :class="{ 'is-invalid': touched.marcha && !form.marcha.trim(), 'is-valid': touched.marcha && !!form.marcha.trim() }">
						<label for="marcha">Marcha <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="marcha" v-model.trim="form.marcha" :aria-invalid="touched.marcha && !form.marcha.trim()" rows="2" placeholder="Descripción de la forma de caminar" required @blur="touched.marcha = true"></textarea>
						<small v-if="touched.marcha && !form.marcha.trim()" class="help-text error">
							Describa la marcha del paciente.
						</small>
					</div>
				</div>

				<h3 class="form-section-title"><span class="form-section-number">05</span>Examen regional</h3>
				<div class="form-grid">
					<div class="form-field" :class="{ 'is-invalid': touched.craneo && !form.craneo.trim(), 'is-valid': touched.craneo && !!form.craneo.trim() }">
						<label for="craneo">Cráneo <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="craneo" v-model.trim="form.craneo" :aria-invalid="touched.craneo && !form.craneo.trim()" rows="2" placeholder="Forma, simetría, prominencias óseas" required @blur="touched.craneo = true"></textarea>
						<small v-if="touched.craneo && !form.craneo.trim()" class="help-text error">
							Describa el examen del cráneo.
						</small>
					</div>
					<div class="form-field" :class="{ 'is-invalid': touched.CarayCuello && !form.CarayCuello.trim(), 'is-valid': touched.CarayCuello && !!form.CarayCuello.trim() }">
						<label for="caraycuello">Cara y cuello <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="caraycuello" v-model.trim="form.CarayCuello" :aria-invalid="touched.CarayCuello && !form.CarayCuello.trim()" rows="2" placeholder="Simetría facial, ganglios, perfil" required @blur="touched.CarayCuello = true"></textarea>
						<small v-if="touched.CarayCuello && !form.CarayCuello.trim()" class="help-text error">
							Describa el examen de cara y cuello.
						</small>
					</div>
				</div>

				<h3 class="form-section-title"><span class="form-section-number">06</span>Examen estomatológico</h3>
				<div class="form-grid">
					<div class="form-field" :class="{ 'is-invalid': touched.ATM && !form.ATM.trim(), 'is-valid': touched.ATM && !!form.ATM.trim() }">
						<label for="atm">ATM (Articulación temporomandibular) <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="atm" v-model.trim="form.ATM" :aria-invalid="touched.ATM && !form.ATM.trim()" rows="2" placeholder="Dolor, chasquidos, limitación de movimiento" required @blur="touched.ATM = true"></textarea>
						<small v-if="touched.ATM && !form.ATM.trim()" class="help-text error">
							Describa el examen de la ATM.
						</small>
					</div>
					<div class="form-field" :class="{ 'is-invalid': touched.PielyMucosa && !form.PielyMucosa.trim(), 'is-valid': touched.PielyMucosa && !!form.PielyMucosa.trim() }">
						<label for="pielymucosa">Piel y mucosa oral <span class="required-mark" aria-hidden="true">*</span></label>
						<textarea id="pielymucosa" v-model.trim="form.PielyMucosa" :aria-invalid="touched.PielyMucosa && !form.PielyMucosa.trim()" rows="2" placeholder="Color, textura, lesiones, humedad" required @blur="touched.PielyMucosa = true"></textarea>
						<small v-if="touched.PielyMucosa && !form.PielyMucosa.trim()" class="help-text error">
							Describa el estado de piel y mucosa oral.
						</small>
					</div>
				</div>

				<PreguntasDinamicas
					:preguntas="preguntasDinamicas"
					@update:respuestas="respuestasDinamicas = $event"
					:disabled="isSaving"
					:show-validation-errors="showDynamicValidationErrors"
				/>

				<h3 class="form-section-title"><span class="form-section-number">08</span>Odontograma</h3>
				<OdontogramaSincronizado :estado="estadoOdontograma" :disabled="isSaving" />

				<h3 class="form-section-title"><span class="form-section-number">09</span>Adjuntos del caso</h3>
				<div class="adjuntos-box">
					<div class="adjuntos-actions">
						<input
							ref="adjuntosInputRef"
							type="file"
							class="adjuntos-input"
							multiple
							accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
							@change="handleAdjuntosSeleccionados"
						/>
						<button class="btn btn-secondary" type="button" :disabled="isSaving" @click="abrirSelectorAdjuntos">
							Añadir archivos o imágenes
						</button>
					</div>

					<p v-if="adjuntosSeleccionados.length === 0" class="adjuntos-empty">
						No hay adjuntos seleccionados.
					</p>

					<ul v-else class="adjuntos-list">
						<li v-for="(archivo, index) in adjuntosSeleccionados" :key="`${archivo.name}-${index}`" class="adjunto-item">
							<div class="adjunto-info">
								<strong>{{ archivo.name }}</strong>
								<span>{{ formatFileSize(archivo.size) }}</span>
							</div>
							<button class="btn btn-link danger" type="button" :disabled="isSaving" @click="removeAdjunto(index)">
								Quitar
							</button>
						</li>
					</ul>
				</div>

				<div class="form-actions">
					<button class="btn btn-secondary" type="button" @click="goBack">Cancelar</button>
					<button class="btn btn-primary save-case-button" type="submit" :disabled="isSaving || !isFormValid" :aria-busy="isSaving">
						{{ isSaving ? 'Guardando...' : 'Guardar caso clinico' }}
					</button>
				</div>
			</form>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useProfesoresEspecialidades } from '@/composables/useProfesoresEspecialidades'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import { especialidadesService } from '@/services/Admin/especialidades.service'
import { usuariosService } from '@/services/Admin/usuarios.service'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import { odontogramaService } from '@/services/estudiantes/Odontograma/odontograma.service'
import { preguntasClinicasService } from '@/services/Profesores/preguntas-clinicas.service'
import { archivosService } from '@/services/common/archivos.service'
import OdontogramaSincronizado from '@/components/estudiantes/Odontograma/OdontogramaSincronizado.vue'
import PreguntasDinamicas from '@/components/estudiantes/PreguntasDinamicas.vue'
import type { Paciente } from '@/types/pacientes.types'
import type { Especialidad } from '@/types/especialidades.types'
import type { Usuario } from '@/types/usuarios.types'
import type { CrearCasoClinicoDto } from '@/types/casosClinicos.types'
import { useOdontograma } from '@/composables/useOdontograma'
import type { PreguntaClinica, RespuestaClinicaInput } from '@/types/preguntasClinicas.types'
import '@/assets/styles/Estudiantes/Casoclinico.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const paciente = ref<Paciente | null>(null)
const todosProfesores = ref<Usuario[]>([])
const todasEspecialidades = ref<Especialidad[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref<string | null>(null)
const searchTerm = ref('')
const searchResults = ref<Paciente[]>([])
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const estadoOdontograma = useOdontograma()
const { dientes: odontogramaDientes, observacionGeneral: odontogramaGeneral,
	conclusion: odontogramaConclusion } = estadoOdontograma
const isSavingOdontograma = ref(false)
const preguntasDinamicas = ref<PreguntaClinica[]>([])
const respuestasDinamicas = ref<RespuestaClinicaInput[]>([])
const adjuntosInputRef = ref<HTMLInputElement | null>(null)
const adjuntosSeleccionados = ref<File[]>([])
const hasAttemptedSearch = ref(false)
const showDynamicValidationErrors = ref(false)

const touched = reactive({
  profesorId: false,
  especialidadId: false,
  motivoConsulta: false,
  enfermedadActual: false,
  peso: false,
  talla: false,
  facies: false,
  marcha: false,
  craneo: false,
  CarayCuello: false,
  ATM: false,
  PielyMucosa: false,
})

const pacienteId = computed(() => Number(route.query.pacienteId || 0))
const estudianteId = computed(() => authStore.user?.id || 0)
const estudianteNombre = computed(() => authStore.fullName || 'Estudiante')
const pacienteSeleccionadoId = computed(() => paciente.value?.id || 0)

// Usar el composable para filtrado inteligente
const {
  profesorSeleccionadoId,
  especialidadSeleccionadaId,
  profesoresFiltrados,
  especialidadesFiltradas,
  isValidCombination,
} = useProfesoresEspecialidades(todosProfesores, todasEspecialidades)

const form = reactive({
  profesorId: 0,
  especialidadId: 0,
  ATM: '',
  CarayCuello: '',
  PielyMucosa: '',
  craneo: '',
  enfermedadActual: '',
  facies: '',
  marcha: '',
  motivoConsulta: '',
  peso: 0,
  talla: 0
})

// Cargar preguntas dinámicas cuando cambia la especialidad
watch(
	() => form.especialidadId,
	async (newEspecialidadId) => {
		showDynamicValidationErrors.value = false
		if (newEspecialidadId > 0) {
			try {
				preguntasDinamicas.value = await preguntasClinicasService.getAll({
					especialidadId: newEspecialidadId
				})
			} catch (error) {
				console.error('Error cargando preguntas dinámicas:', error)
				preguntasDinamicas.value = []
			}
		} else {
			preguntasDinamicas.value = []
		}
	}
)

const isFormValid = computed(() => {
  const requiredDynamicQuestionsValid = preguntasDinamicas.value
    .filter((pregunta) => pregunta.obligatoria)
    .every((pregunta) => respuestasDinamicas.value.some(
      (respuesta) =>
        respuesta.preguntaId === pregunta.id &&
        respuesta.respuesta.trim().length > 0
    ))

  return Boolean(
    pacienteSeleccionadoId.value > 0 &&
    estudianteId.value > 0 &&
    form.profesorId > 0 &&
    form.especialidadId > 0 &&
    isValidCombination.value &&
    form.motivoConsulta.trim() &&
    form.ATM.trim() &&
    form.CarayCuello.trim() &&
    form.PielyMucosa.trim() &&
    form.craneo.trim() &&
    form.enfermedadActual.trim() &&
    form.facies.trim() &&
    form.marcha.trim() &&
    form.peso > 0 &&
    form.talla > 0 &&
    requiredDynamicQuestionsValid
  )
})

const completionPercentage = computed(() => {
  const checks = [
    pacienteSeleccionadoId.value > 0,
    form.profesorId > 0,
    form.especialidadId > 0,
    isValidCombination.value,
    Boolean(form.motivoConsulta.trim()),
    Boolean(form.enfermedadActual.trim()),
    form.peso > 0,
    form.talla > 0,
    Boolean(form.facies.trim()),
    Boolean(form.marcha.trim()),
    Boolean(form.craneo.trim()),
    Boolean(form.CarayCuello.trim()),
    Boolean(form.ATM.trim()),
    Boolean(form.PielyMucosa.trim()),
  ]

  const requiredQuestions = preguntasDinamicas.value.filter((pregunta) => pregunta.obligatoria)
  const completedQuestions = requiredQuestions.filter((pregunta) =>
    respuestasDinamicas.value.some(
      (respuesta) =>
        respuesta.preguntaId === pregunta.id &&
        respuesta.respuesta.trim().length > 0
    )
  )

  const total = checks.length + requiredQuestions.length
  const completed = checks.filter(Boolean).length + completedQuestions.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const loadData = async () => {
  try {
    const [especialidadesResponse, usuariosResponse] = await Promise.all([
      especialidadesService.getAll(),
      usuariosService.getAll({ limit: 200 })
    ])

    todasEspecialidades.value = especialidadesResponse
    todosProfesores.value = usuariosResponse.data.filter((usuario: Usuario) => {
      const roleName = usuario.role?.nombre?.toLowerCase() || ''
      return roleName === 'profesor' || roleName === 'docente'
    })

    if (pacienteId.value > 0) {
      paciente.value = await pacientesService.getById(pacienteId.value)
    }

    if (todosProfesores.value.length === 1) {
      form.profesorId = todosProfesores.value[0]?.id || 0
    }

    if (todasEspecialidades.value.length === 1) {
      form.especialidadId = todasEspecialidades.value[0]?.id || 0
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    loadError.value = 'Error cargando datos'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
	hasAttemptedSearch.value = true
	const term = searchTerm.value.trim()
	if (!term) {
		searchError.value = 'Ingrese un nombre o apellido para buscar.'
		searchResults.value = []
		return
	}

	const parts = term.split(/\s+/).filter(p => p.length > 0)
	if (parts.length === 0) {
		searchError.value = 'Ingrese un nombre o apellido válido.'
		searchResults.value = []
		return
	}

	const filters: Record<string, string | number> = {
		nombre: parts[0] || ''
	}
	if (parts.length > 1) {
		filters.apellido = parts.slice(1).join(' ')
	}
	filters.limit = 15

	try {
		isSearching.value = true
		searchError.value = null
		const response = await pacientesService.getAll(filters)
		searchResults.value = response.data
		if (response.data.length === 0) {
			searchError.value = 'No se encontraron pacientes con ese criterio.'
		}
	} catch (error) {
		console.error('Error buscando pacientes:', error)
		searchError.value = 'No se pudo buscar pacientes.'
		searchResults.value = []
	} finally {
		isSearching.value = false
	}
}

const selectPaciente = (item: Paciente) => {
	paciente.value = item
	searchResults.value = []
	searchError.value = null
	hasAttemptedSearch.value = false
	searchTerm.value = `${item.nombre} ${item.apellido}`.trim()
	router.replace({
		name: 'estudiantes-casos-clinicos-nuevo',
		query: { pacienteId: String(item.id) }
	})
}

const clearPaciente = () => {
	paciente.value = null
	searchTerm.value = ''
	searchResults.value = []
	searchError.value = null
	hasAttemptedSearch.value = false
	router.replace({ name: 'estudiantes-casos-clinicos-nuevo', query: {} })
}

const handleSubmit = async () => {
	if (!isFormValid.value) {
		touched.profesorId = true
		touched.especialidadId = true
		touched.motivoConsulta = true
		touched.enfermedadActual = true
		touched.peso = true
		touched.talla = true
		touched.facies = true
		touched.marcha = true
		touched.craneo = true
		touched.CarayCuello = true
		touched.ATM = true
		touched.PielyMucosa = true
		hasAttemptedSearch.value = paciente.value === null
		showDynamicValidationErrors.value = true
		toast.error('Revise los campos marcados antes de guardar el caso clínico.')
		return
	}

	if (!paciente.value) {
		toast.error('Paciente no encontrado')
		return
	}

	const payload: CrearCasoClinicoDto = {
		pacienteId: paciente.value.id,
		profesorId: form.profesorId,
		estudianteId: estudianteId.value,
		especialidadId: form.especialidadId,
		ATM: form.ATM.trim(),
		CarayCuello: form.CarayCuello.trim(),
		PielyMucosa: form.PielyMucosa.trim(),
		craneo: form.craneo.trim(),
		enfermedadActual: form.enfermedadActual.trim(),
		facies: form.facies.trim(),
		marcha: form.marcha.trim(),
		motivoConsulta: form.motivoConsulta.trim(),
		peso: form.peso,
		talla: form.talla,
		respuestas: respuestasDinamicas.value.length > 0 ? respuestasDinamicas.value : undefined
	}

	try {
		isSaving.value = true
		const casoCreado = await casosClinicosService.create(payload)

		let odontogramaGuardado = true
		const debeGuardarOdontograma =
			odontogramaDientes.value.length > 0 ||
			Boolean(odontogramaGeneral.value.trim()) ||
			Boolean(odontogramaConclusion.value.trim())

		if (debeGuardarOdontograma) {
			try {
				isSavingOdontograma.value = true
				await odontogramaService.save({
					casoClinicoId: casoCreado.id,
					estudianteId: estudianteId.value,
					conclusion: odontogramaConclusion.value.trim() || undefined,
					observacionGeneral: odontogramaGeneral.value.trim() || undefined,
					dientes: odontogramaDientes.value
				})
			} catch (error) {
        console.error('Error guardando odontograma:', error)
				odontogramaGuardado = false
				toast.warning('Caso clínico guardado, pero no se pudo guardar el odontograma')
			} finally {
				isSavingOdontograma.value = false
			}
		}

		let adjuntosFallidos = 0
		if (adjuntosSeleccionados.value.length > 0) {
			const resultados = await Promise.allSettled(
				adjuntosSeleccionados.value.map((file) =>
					archivosService.upload({
						file,
						entidadTipo: 'CASO_CLINICO',
						entidadId: casoCreado.id,
						descripcion: `Adjunto de caso clínico #${casoCreado.id}`
					})
				)
			)

			adjuntosFallidos = resultados.filter((resultado) => resultado.status === 'rejected').length
		}

		if (odontogramaGuardado && adjuntosFallidos === 0) {
			toast.success('Caso clínico creado correctamente')
		} else if (adjuntosFallidos > 0) {
			toast.warning(
				`Caso clínico creado, pero ${adjuntosFallidos} archivo(s) no se pudieron adjuntar`
			)
		}
		router.push({ name: 'estudiantes-pacientes' })
	} catch (error) {
    console.error('Error guardando caso clínico:', error)
		toast.error('No se pudo guardar el caso clinico')
	} finally {
		isSaving.value = false
		isSavingOdontograma.value = false
	}
}

const goBack = () => {
	router.push({ name: 'estudiantes-pacientes' })
}

const abrirSelectorAdjuntos = () => {
	adjuntosInputRef.value?.click()
}

const handleAdjuntosSeleccionados = (event: Event) => {
	const input = event.target as HTMLInputElement
	const files = input.files ? Array.from(input.files) : []

	if (files.length === 0) {
		return
	}

	adjuntosSeleccionados.value = [...adjuntosSeleccionados.value, ...files]
	input.value = ''
}

const removeAdjunto = (index: number) => {
	adjuntosSeleccionados.value.splice(index, 1)
}

const formatFileSize = (size: number) => {
	if (size < 1024) return `${size} B`
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
	return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(loadData)
</script>
