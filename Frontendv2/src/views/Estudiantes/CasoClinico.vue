<template>
	<section class="caso-clinico-page">
		<header class="page-header">
			<div class="page-title">
				<h1>Nuevo caso clinico</h1>
				<p>Completa los datos base del caso clinico antes de continuar.</p>
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
					<div class="patient-title">Paciente seleccionado</div>
					<div class="patient-actions">
						<button class="btn btn-secondary" type="button" @click="clearPaciente">
							Cambiar paciente
						</button>
					</div>
				</div>
				<div class="patient-info">
					<div><span>Nombre:</span> {{ paciente.nombre }} {{ paciente.apellido }}</div>
					<div><span>Documento:</span> {{ paciente.numeroDocumento || 'N/A' }}</div>
					<div><span>Genero:</span> {{ paciente.genero || 'N/A' }}</div>
					<div><span>Telefono:</span> {{ paciente.telefono || 'N/A' }}</div>
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
				<h3 class="form-section-title">Datos administrativos</h3>
				<div class="form-grid">
					<div class="form-field">
						<label for="profesor">Profesor asignado</label>
						<select id="profesor" v-model.number="form.profesorId" @change="profesorSeleccionadoId = form.profesorId" required>
							<option :value="0" disabled>Seleccione un profesor</option>
							<option v-for="profesor in profesoresFiltrados" :key="profesor.id" :value="profesor.id">
								{{ profesor.nombre }} {{ profesor.apellido }}
							</option>
						</select>
						<small v-if="form.especialidadId > 0 && profesoresFiltrados.length === 0" class="help-text error">
							No hay profesores con esta especialidad
						</small>
					</div>

					<div class="form-field">
						<label for="especialidad">Especialidad</label>
						<select id="especialidad" v-model.number="form.especialidadId" @change="especialidadSeleccionadaId = form.especialidadId" required>
							<option :value="0" disabled>Seleccione una especialidad</option>
							<option v-for="especialidad in especialidadesFiltradas" :key="especialidad.id" :value="especialidad.id">
								{{ especialidad.nombre }}
							</option>
						</select>
						<small v-if="form.profesorId > 0 && especialidadesFiltradas.length === 0" class="help-text error">
							Este profesor no tiene especialidades asignadas
						</small>
					</div>

					<div class="form-field">
						<label for="estudiante">Estudiante responsable</label>
						<input id="estudiante" type="text" :value="estudianteNombre" disabled />
					</div>
				</div>

				<h3 class="form-section-title">Anamnesis</h3>
				<div class="form-grid">
					<div class="form-field form-field-full">
						<label for="motivo">Motivo de consulta</label>
						<textarea id="motivo" v-model.trim="form.motivoConsulta" rows="2" placeholder="Razón principal por la que el paciente acude a consulta" required></textarea>
					</div>

					<div class="form-field form-field-full">
						<label for="enfermedad">Enfermedad actual</label>
						<textarea id="enfermedad" v-model.trim="form.enfermedadActual" rows="3" placeholder="Historia detallada de la enfermedad actual del paciente" required></textarea>
					</div>
				</div>

				<h3 class="form-section-title">Signos vitales y antropometría</h3>
				<div class="form-grid">
					<div class="form-field">
						<label for="peso">Peso (kg)</label>
						<input id="peso" type="number" min="0" step="0.1" v-model.number="form.peso" placeholder="Ej: 70.5" required />
					</div>

					<div class="form-field">
						<label for="talla">Talla (cm)</label>
						<input id="talla" type="number" min="0" step="0.1" v-model.number="form.talla" placeholder="Ej: 165.0" required />
					</div>
				</div>

				<h3 class="form-section-title">Examen físico general</h3>
				<div class="form-grid">
					<div class="form-field">
						<label for="facies">Facies</label>
						<textarea id="facies" v-model.trim="form.facies" rows="2" placeholder="Aspecto general del rostro" required></textarea>
					</div>

					<div class="form-field">
						<label for="marcha">Marcha</label>
						<textarea id="marcha" v-model.trim="form.marcha" rows="2" placeholder="Descripción de la forma de caminar" required></textarea>
					</div>
				</div>

				<h3 class="form-section-title">Examen regional</h3>
				<div class="form-grid">
					<div class="form-field">
						<label for="craneo">Cráneo</label>
						<textarea id="craneo" v-model.trim="form.craneo" rows="2" placeholder="Forma, simetría, prominencias óseas" required></textarea>
					</div>

					<div class="form-field">
						<label for="caraycuello">Cara y cuello</label>
						<textarea id="caraycuello" v-model.trim="form.CarayCuello" rows="2" placeholder="Simetría facial, ganglios, perfil" required></textarea>
					</div>
				</div>

				<h3 class="form-section-title">Examen estomatológico</h3>
				<div class="form-grid">
					<div class="form-field">
						<label for="atm">ATM (Articulación temporomandibular)</label>
						<textarea id="atm" v-model.trim="form.ATM" rows="2" placeholder="Dolor, chasquidos, limitación de movimiento" required></textarea>
					</div>

					<div class="form-field">
						<label for="pielymucosa">Piel y mucosa oral</label>
						<textarea id="pielymucosa" v-model.trim="form.PielyMucosa" rows="2" placeholder="Color, textura, lesiones, humedad" required></textarea>
					</div>
				</div>

				<PreguntasDinamicas
					:preguntas="preguntasDinamicas"
					@update:respuestas="respuestasDinamicas = $event"
					:disabled="isSaving"
				/>

				<h3 class="form-section-title">Odontograma</h3>
				<OdontogramaEditor
					v-model="odontogramaDientes"
					v-model:general-observacion="odontogramaGeneral"
					:disabled="isSaving"
				/>

				<div class="form-field odontograma-conclusion">
					<label for="odontogramaConclusion">Conclusión del odontograma (opcional)</label>
					<textarea
						id="odontogramaConclusion"
						v-model.trim="odontogramaConclusion"
						rows="2"
						placeholder="Resumen general de hallazgos odontológicos"
					></textarea>
				</div>

				<div class="form-actions">
					<button class="btn btn-secondary" type="button" @click="goBack">Cancelar</button>
					<button class="btn btn-primary" type="submit" :disabled="isSaving || !isFormValid">
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
import OdontogramaEditor from '@/components/estudiantes/Odontograma/OdontogramaEditor.vue'
import PreguntasDinamicas from '@/components/estudiantes/PreguntasDinamicas.vue'
import type { Paciente } from '@/types/pacientes.types'
import type { Especialidad } from '@/types/especialidades.types'
import type { Usuario } from '@/types/usuarios.types'
import type { CrearCasoClinicoDto } from '@/types/casosClinicos.types'
import type { DienteOdontogramaInput } from '@/types/odontograma.types'
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
const odontogramaDientes = ref<DienteOdontogramaInput[]>([])
const odontogramaGeneral = ref('')
const odontogramaConclusion = ref('')
const isSavingOdontograma = ref(false)
const preguntasDinamicas = ref<PreguntaClinica[]>([])
const respuestasDinamicas = ref<RespuestaClinicaInput[]>([])

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
    form.talla > 0
  )
})

const loadData = async () => {
  try {
    const requests: Array<Promise<any>> = [
      especialidadesService.getAll(),
      usuariosService.getAll({ limit: 200 })
    ]

    if (pacienteId.value > 0) {
      requests.push(pacientesService.getById(pacienteId.value))
    }

    const responses = await Promise.all(requests)
    const [especialidadesResponse, usuariosResponse, ...rest] = responses

    todasEspecialidades.value = especialidadesResponse
    todosProfesores.value = usuariosResponse.data.filter((usuario: Usuario) => {
      const roleName = usuario.role?.nombre?.toLowerCase() || ''
      return roleName === 'profesor' || roleName === 'docente'
    })

    const pacienteResponse = rest[0]
    if (pacienteResponse) {
      paciente.value = pacienteResponse
    }

    if (todosProfesores.value.length === 1) {
      form.profesorId = todosProfesores.value[0]?.id || 0
    }

    if (todasEspecialidades.value.length === 1) {
      form.especialidadId = todasEspecialidades.value[0]?.id || 0
    }
  } catch (error) {
    loadError.value = 'Error cargando datos'
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
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
	router.replace({ name: 'estudiantes-casos-clinicos-nuevo', query: {} })
}

const handleSubmit = async () => {
	if (!isFormValid.value) {
		toast.error('Complete todos los campos obligatorios')
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
				odontogramaGuardado = false
				toast.warning('Caso clínico guardado, pero no se pudo guardar el odontograma')
			} finally {
				isSavingOdontograma.value = false
			}
		}

		if (odontogramaGuardado) {
			toast.success('Caso clínico creado correctamente')
		}
		router.push({ name: 'estudiantes-pacientes' })
	} catch (error) {
		toast.error('No se pudo guardar el caso clinico')
	} finally {
		isSaving.value = false
		isSavingOdontograma.value = false
	}
}

const goBack = () => {
	router.push({ name: 'estudiantes-pacientes' })
}

onMounted(loadData)
</script>
