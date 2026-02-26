<template>
	<section class="preguntas-clinicas-page">
		<header class="page-header">
			<div class="page-title">
				<h1>Preguntas clínicas</h1>
				<p>Gestiona las preguntas dinámicas que aparecerán en los casos clínicos según especialidad</p>
			</div>
			<button class="btn btn-primary" type="button" @click="openCreateModal">
				+ Nueva pregunta
			</button>
		</header>

		<div class="filters-card">
			<div class="filters-row">
				<div class="filter-field">
					<label for="filterEspecialidad">Filtrar por especialidad</label>
					<select id="filterEspecialidad" v-model.number="filtroEspecialidadId">
						<option :value="0">Todas las especialidades</option>
						<option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
							{{ esp.nombre }}
						</option>
					</select>
				</div>

				<div class="filter-field">
					<label for="filterTipo">Filtrar por tipo</label>
					<select id="filterTipo" v-model="filtroTipo">
						<option value="">Todos los tipos</option>
						<option value="TEXTO">Texto</option>
						<option value="TEXTAREA">Texto largo</option>
						<option value="NUMERO">Número</option>
						<option value="FECHA">Fecha</option>
						<option value="SI_NO">Sí/No</option>
						<option value="MULTIPLE_SELECCION">Selección múltiple</option>
					</select>
				</div>
			</div>
		</div>

		<div v-if="isLoading" class="loading-state">Cargando preguntas...</div>
		<div v-else-if="loadError" class="error-state">{{ loadError }}</div>
		<div v-else-if="preguntasFiltradas.length === 0" class="empty-state">
			<h3>No hay preguntas registradas</h3>
			<p>Crea la primera pregunta clínica para empezar</p>
		</div>
		<div v-else class="preguntas-table-wrapper">
			<table class="preguntas-table">
				<thead>
					<tr>
						<th>Texto</th>
						<th>Tipo</th>
						<th>Especialidad</th>
						<th>Obligatoria</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="pregunta in preguntasFiltradas" :key="pregunta.id">
						<td>{{ pregunta.texto }}</td>
						<td><span class="badge badge-tipo">{{ formatTipo(pregunta.tipo) }}</span></td>
						<td>{{ pregunta.especialidad?.nombre || 'General' }}</td>
						<td>
							<span class="badge" :class="pregunta.obligatoria ? 'badge-obligatoria' : 'badge-opcional'">
								{{ pregunta.obligatoria ? 'Obligatoria' : 'Opcional' }}
							</span>
						</td>
						<td>
							<div class="actions-cell">
								<button class="btn btn-secondary" type="button" @click="openEditModal(pregunta)">
									Editar
								</button>
								<button class="btn btn-link" type="button" @click="confirmDelete(pregunta.id)">
									Eliminar
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<PreguntaModal
			v-if="showModal"
			:pregunta="preguntaSeleccionada"
			:especialidades="especialidades"
			@close="closeModal"
			@save="handleSave"
		/>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { preguntasClinicasService } from '@/services/Profesores/preguntas-clinicas.service'
import { especialidadesService } from '@/services/Admin/especialidades.service'
import PreguntaModal from '@/components/profesor/PreguntaModal.vue'
import type { PreguntaClinica } from '@/types/preguntasClinicas.types'
import type { Especialidad } from '@/types/especialidades.types'
import '@/assets/styles/Profesor/PreguntasClinicas.css'

const toast = useToast()

const preguntas = ref<PreguntaClinica[]>([])
const especialidades = ref<Especialidad[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const filtroEspecialidadId = ref(0)
const filtroTipo = ref('')
const showModal = ref(false)
const preguntaSeleccionada = ref<PreguntaClinica | null>(null)

const preguntasFiltradas = computed(() => {
	let resultado = preguntas.value

	if (filtroEspecialidadId.value > 0) {
		resultado = resultado.filter((p) => p.especialidadId === filtroEspecialidadId.value)
	}

	if (filtroTipo.value) {
		resultado = resultado.filter((p) => p.tipo === filtroTipo.value)
	}

	return resultado
})

const formatTipo = (tipo: string): string => {
	const tipos: Record<string, string> = {
		TEXTO: 'Texto',
		TEXTAREA: 'Texto largo',
		NUMERO: 'Número',
		FECHA: 'Fecha',
		SI_NO: 'Sí/No',
		MULTIPLE_SELECCION: 'Selección múltiple'
	}
	return tipos[tipo] || tipo
}

const loadData = async () => {
	try {
		isLoading.value = true
		const [preguntasData, especialidadesData] = await Promise.all([
			preguntasClinicasService.getAll(),
			especialidadesService.getAll()
		])
		preguntas.value = preguntasData
		especialidades.value = especialidadesData
	} catch (error) {
		loadError.value = 'Error al cargar los datos'
		toast.error('No se pudieron cargar las preguntas')
	} finally {
		isLoading.value = false
	}
}

const openCreateModal = () => {
	preguntaSeleccionada.value = null
	showModal.value = true
}

const openEditModal = (pregunta: PreguntaClinica) => {
	preguntaSeleccionada.value = pregunta
	showModal.value = true
}

const closeModal = () => {
	showModal.value = false
	preguntaSeleccionada.value = null
}

const handleSave = async () => {
	await loadData()
	closeModal()
	toast.success('Pregunta guardada correctamente')
}

const confirmDelete = async (id: number) => {
	if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return

	try {
		await preguntasClinicasService.delete(id)
		await loadData()
		toast.success('Pregunta eliminada correctamente')
	} catch (error) {
		toast.error('No se pudo eliminar la pregunta')
	}
}

onMounted(loadData)
</script>
