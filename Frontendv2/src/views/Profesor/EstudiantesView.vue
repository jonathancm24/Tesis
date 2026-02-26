<template>
	<section class="estudiantes-page">
		<header class="page-header">
			<div>
				<p class="eyebrow">Profesor</p>
				<h1>Seguimiento de estudiantes</h1>
				<p class="subtitle">
					Consulta estudiantes, revisa su actividad clinica y explora sus registros.
				</p>
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

		<div class="layout">
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

				<!-- Estado de carga -->
				<div v-if="store.isLoading && !estudiantes.length" class="loading-container">
					<div class="loading-spinner"></div>
					<p>Cargando estudiantes...</p>
				</div>

				<!-- Tabla vacía -->
				<div v-else-if="!store.isLoading && !estudiantes.length" class="empty-state">
					<span class="empty-state-icon">👥</span>
					<p>No hay estudiantes registrados</p>
				</div>

				<!-- Tabla de estudiantes -->
				<div v-else class="table-wrapper">
					<table class="estudiantes-table">
						<thead>
							<tr>
								<th>Estudiante</th>
								<th>Email</th>
								<th>Telefono</th>
								<th>Estado</th>
								<th class="actions-col">Acciones</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="student in estudiantes" :key="student.id">
								<td>
									<div class="student-info">
										<span class="student-name">{{ student.nombre }} {{ student.apellido }}</span>
										<span class="student-doc">
											{{ student.tipoDocumento }} · {{ student.numeroDocumento }}
										</span>
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
										Explorar
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<aside class="card summary-card">
				<div class="card-header">
					<div>
						<h2>Resumen del estudiante</h2>
						<p class="subtitle">
							Selecciona un estudiante para ver detalles rapidos.
						</p>
					</div>
					<span class="badge" :class="selectedStudent ? 'badge-primary' : 'badge-muted'">
						{{ selectedStudent ? 'Activo' : 'Sin seleccion' }}
					</span>
				</div>

				<div v-if="selectedStudent" class="summary-content">
					<div class="summary-main">
						<h3>{{ selectedStudent.nombre }} {{ selectedStudent.apellido }}</h3>
						<p class="summary-meta">{{ selectedStudent.email }}</p>
					</div>

					<div class="summary-grid">
						<div class="summary-item">
							<span class="label">Fecha nacimiento</span>
							<span>{{ formatDate(selectedStudent.fechaNacimiento) }}</span>
						</div>
						<div class="summary-item">
							<span class="label">Telefono</span>
							<span>{{ selectedStudent.telefono || 'No registrado' }}</span>
						</div>
					</div>

					<button class="btn btn-primary" type="button" @click="handleViewHistory">
						Ver historial
					</button>
				</div>

				<div v-else class="summary-empty">
					<p>Selecciona un estudiante para ver su informacion.</p>
				</div>
			</aside>
		</div>

		<!-- Modal de importación -->
		<ImportEstudiantesModal 
			:is-open="isImportModalOpen"
			@close="isImportModalOpen = false"
			@success="handleImportSuccess"
		/>

		<!-- Modal de crear nuevo estudiante -->
		<CreateEstudianteModal 
			:is-open="isCreateModalOpen"
			@close="isCreateModalOpen = false"
			@success="handleCreateSuccess"
		/>
	</section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useEstudiantesStore } from '@/stores/Profesor/estudiantes'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import ImportEstudiantesModal from '@/components/profesor/ImportEstudiantesModal.vue'
import CreateEstudianteModal from '@/components/profesor/CreateEstudianteModal.vue'
import type { Usuario } from '@/types/usuarios.types'

const store = useEstudiantesStore()
const toast = useToast()

const searchTerm = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const selectedStudent = ref<Usuario | null>(null)
const isImportModalOpen = ref(false)
const isCreateModalOpen = ref(false)

const estudiantes = computed(() => store.estudiantes)

// Cargar estudiantes al montar
onMounted(async () => {
	try {
		await store.fetchEstudiantes()
	} catch (error) {
		toast.error(getErrorMessage(error))
	}
})

// Manejar búsqueda con filtros
const handleSearch = async () => {
	try {
		const filters: any = {}
		
		if (searchTerm.value.trim()) {
			filters.search = searchTerm.value.trim()
		}
		
		if (statusFilter.value === 'active') {
			filters.activo = true
		} else if (statusFilter.value === 'inactive') {
			filters.activo = false
		}
		
		await store.fetchEstudiantes(filters)
	} catch (error) {
		toast.error(getErrorMessage(error))
	}
}

const handleExplore = (student: Usuario) => {
	selectedStudent.value = student
}

const handleImportExcel = () => {
	isImportModalOpen.value = true
}

const handleImportSuccess = async () => {
	toast.success('Estudiantes importados correctamente')
	// Refrescar la lista
	await handleSearch()
}

const handleCreateSuccess = async () => {
	toast.success('Estudiante creado correctamente')
	// Refrescar la lista
	await handleSearch()
}

const handleNewRecord = () => {
	isCreateModalOpen.value = true
}

const handleViewHistory = () => {
	if (selectedStudent.value) {
		toast.info(`Ver historial de ${selectedStudent.value.nombre} ${selectedStudent.value.apellido}`)
	}
}

const formatDate = (date: string | Date | null | undefined): string => {
	if (!date) return 'N/A'
	const d = new Date(date)
	return d.toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}
</script>

<style scoped src="@/assets/styles/Profesor/Estudiantes.css"></style>
