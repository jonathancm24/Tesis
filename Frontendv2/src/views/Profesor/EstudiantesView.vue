<template>
	<section class="estudiantes-page">
		<header class="page-header">
			<div>
				<p class="eyebrow">Profesor</p>
				<h1>Seguimiento de estudiantes</h1>
				<p class="subtitle">Consulta estudiantes y abre su historial clínico completo en un modal.</p>
			</div>
			<div class="header-actions">
				<button class="btn btn-secondary" type="button" @click="handleImportExcel">
					<span class="icon">📥</span>
					Importar Excel
				</button>
				<button class="btn btn-primary" type="button" @click="handleNewRecord">
					<span class="icon">+</span>
					Nuevo registro
				</button>
			</div>
		</header>

		<div class="card">
			<div class="card-header">
				<div class="search-bar">
					<input
						v-model="searchTerm"
						type="search"
						placeholder="Buscar por nombre, apellido o email"
						aria-label="Buscar estudiantes"
						@input="handleSearch"
					/>
					<select v-model="statusFilter" aria-label="Filtrar por estado" @change="handleSearch">
						<option value="all">Todos</option>
						<option value="active">Activos</option>
						<option value="inactive">Inactivos</option>
					</select>
				</div>
				<div class="summary">
					<span>Mostrando {{ estudiantes.length }} estudiantes</span>
				</div>
			</div>

			<div v-if="store.isLoading && !estudiantes.length" class="loading-container">
				<div class="loading-spinner"></div>
				<p>Cargando estudiantes...</p>
			</div>

			<div v-else-if="!store.isLoading && !estudiantes.length" class="empty-state">
				<span class="empty-state-icon">👥</span>
				<p>No hay estudiantes registrados</p>
			</div>

			<div v-else class="table-wrapper">
				<table class="estudiantes-table">
					<thead>
						<tr>
							<th>Estudiante</th>
							<th>Email</th>
							<th>Teléfono</th>
							<th>Estado</th>
							<th class="actions-col">Acciones</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="student in estudiantes" :key="student.id">
							<td>
								<div class="student-info">
									<span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
									<span class="student-doc">{{ student.tipoDocumento }} · {{ student.numeroDocumento }}</span>
								</div>
							</td>
							<td>{{ student.email }}</td>
							<td>{{ student.telefono || 'No registrado' }}</td>
							<td>
								<span :class="['badge', student.activo ? 'badge-success' : 'badge-muted']">
									{{ student.activo ? 'Activo' : 'Inactivo' }}
								</span>
							</td>
							<td class="actions-col">
								<button class="btn btn-link" type="button" @click="handleExplore(student)">
									Ver historial
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<HistorialEstudianteModal
			v-if="selectedStudent"
			:is-open="isHistorialModalOpen"
			:student="selectedStudent"
			:cases="studentCases"
			:is-loading-cases="isCasesLoading"
			@close="isHistorialModalOpen = false"
		/>

		<ImportEstudiantesModal
			:is-open="isImportModalOpen"
			@close="isImportModalOpen = false"
			@success="handleImportSuccess"
		/>

		<CreateEstudianteModal
			:is-open="isCreateModalOpen"
			@close="isCreateModalOpen = false"
			@success="handleCreateSuccess"
		/>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEstudiantesStore } from '@/stores/Profesor/estudiantes'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import ImportEstudiantesModal from '@/components/profesor/ImportEstudiantesModal.vue'
import CreateEstudianteModal from '@/components/profesor/CreateEstudianteModal.vue'
import HistorialEstudianteModal from '@/components/profesor/HistorialEstudianteModal.vue'
import { casosClinicosService } from '@/services/estudiantes/CasosClinicos/casos-clinicos.service'
import type { Usuario } from '@/types/usuarios.types'
import type { CasoClinico } from '@/types/casosClinicos.types'

const store = useEstudiantesStore()
const authStore = useAuthStore()
const toast = useToast()

const searchTerm = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedStudent = ref<Usuario | null>(null)
const isImportModalOpen = ref(false)
const isCreateModalOpen = ref(false)
const isHistorialModalOpen = ref(false)
const isCasesLoading = ref(false)
const studentCases = ref<CasoClinico[]>([])
const studentCasesCache = ref<Record<number, CasoClinico[]>>({})

const estudiantes = computed(() => store.estudiantes)

onMounted(async () => {
	try {
		await store.fetchEstudiantes()
	} catch (error) {
		toast.error(getErrorMessage(error))
	}
})

const handleSearch = async () => {
	try {
		const filters: Record<string, unknown> = {}

		if (searchTerm.value.trim()) {
			filters.search = searchTerm.value.trim()
		}

		if (statusFilter.value === 'active') {
			filters.activo = true
		} else if (statusFilter.value === 'inactive') {
			filters.activo = false
		}

		await store.fetchEstudiantes(filters)
		selectedStudent.value = null
		isHistorialModalOpen.value = false
		studentCases.value = []
		studentCasesCache.value = {}
	} catch (error) {
		toast.error(getErrorMessage(error))
	}
}

const loadStudentCases = async (studentId: number) => {
	if (studentCasesCache.value[studentId]) {
		studentCases.value = studentCasesCache.value[studentId]
		return
	}

	const profesorId = authStore.user?.id
	if (!profesorId) {
		studentCases.value = []
		toast.error('No se pudo identificar al profesor')
		return
	}

	isCasesLoading.value = true
	try {
		const casosProfesor = await casosClinicosService.getByProfesor(profesorId)
		const casosDelEstudiante = casosProfesor.filter((caso) => caso.estudiante?.id === studentId)

		if (!casosDelEstudiante.length) {
			studentCases.value = []
			studentCasesCache.value[studentId] = []
			return
		}

		const casosDetalle = await Promise.all(casosDelEstudiante.map((caso) => casosClinicosService.getById(caso.id)))
		studentCases.value = casosDetalle
		studentCasesCache.value[studentId] = casosDetalle
	} catch (error) {
		studentCases.value = []
		toast.error(getErrorMessage(error))
	} finally {
		isCasesLoading.value = false
	}
}

const handleExplore = async (student: Usuario) => {
	selectedStudent.value = student
	isHistorialModalOpen.value = true
	await loadStudentCases(student.id)
}

const handleImportExcel = () => {
	isImportModalOpen.value = true
}

const handleImportSuccess = async () => {
	toast.success('Estudiantes importados correctamente')
	studentCasesCache.value = {}
	await handleSearch()
}

const handleCreateSuccess = async () => {
	toast.success('Estudiante creado correctamente')
	studentCasesCache.value = {}
	await handleSearch()
}

const handleNewRecord = () => {
	isCreateModalOpen.value = true
}
</script>

<style scoped src="@/assets/styles/Profesor/Estudiantes.css"></style>
