<template>
	<section class="agenda-page">
		<header class="agenda-header">
			<div>
				<p class="eyebrow">Estudiantes</p>
				<h1>Agenda de citas</h1>
				<p class="subtitle">Visualiza tus citas reservadas y gestiona agendamientos.</p>
			</div>
			<button class="btn-primary" type="button" @click="openCrearModal">
				+ Agendar cita
			</button>
		</header>

		<div class="agenda-layout">
			<article class="card calendar-card">
				<div class="calendar-toolbar">
					<button class="nav-btn" type="button" @click="prevMonth">◀</button>
					<h2>{{ monthLabel }}</h2>
					<button class="nav-btn" type="button" @click="nextMonth">▶</button>
				</div>

				<div class="weekday-row">
					<span v-for="day in weekdays" :key="day">{{ day }}</span>
				</div>

				<div class="days-grid">
					<button
						v-for="day in calendarDays"
						:key="day.date"
						type="button"
						class="day-cell"
						:class="{
							muted: !day.inCurrentMonth,
							selected: day.date === selectedDate,
							today: day.isToday,
						}"
						@click="selectedDate = day.date"
					>
						<span class="day-number">{{ day.dayNumber }}</span>
						<span v-if="day.reservadasCount > 0" class="badge-reservadas">
							{{ day.reservadasCount }}
						</span>
					</button>
				</div>
			</article>

			<article class="card list-card">
				<div class="list-header">
					<h2>Citas del {{ formatHumanDate(selectedDate) }}</h2>
					<span class="count-pill">{{ citasDelDia.length }} citas</span>
				</div>

				<div v-if="isLoading" class="state-msg">Cargando citas...</div>
				<div v-else-if="citasDelDia.length === 0" class="state-msg">No hay citas para este día.</div>

				<ul v-else class="citas-list">
					<li v-for="cita in citasDelDia" :key="cita.id" class="cita-item">
						<div class="cita-main">
							<strong>{{ formatHora(cita.horainicio) }} - {{ formatHora(cita.horafin) }}</strong>
							<p>
								{{ cita.paciente.nombre }} {{ cita.paciente.apellido }} · {{ cita.especialidad.nombre }}
							</p>
							<small>Estado: {{ cita.estado }}</small>
						</div>
						<button class="btn-secondary" type="button" @click="openReagendarModal(cita)">
							Reagendar
						</button>
					</li>
				</ul>
			</article>
		</div>

		<div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
			<div class="modal-container" @click.stop>
				<div class="modal-header">
					<h3>{{ modalMode === 'create' ? 'Agendar cita' : 'Reagendar cita' }}</h3>
					<button class="close-btn" type="button" @click="closeModal">×</button>
				</div>

				<form class="modal-body" @submit.prevent="handleSubmit">
					<div class="form-grid">
						<div class="form-group" v-if="modalMode === 'create'">
							<label>Paciente *</label>
							<select v-model.number="form.pacienteId" required>
								<option :value="0" disabled>Seleccione paciente</option>
								<option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
									{{ paciente.nombre }} {{ paciente.apellido }} · {{ paciente.numeroDocumento }}
								</option>
							</select>
						</div>

						<div class="form-group" v-if="modalMode === 'create'">
							<label>Especialidad *</label>
							<select v-model.number="form.especialidadId" required>
								<option :value="0" disabled>Seleccione especialidad</option>
								<option v-for="item in especialidades" :key="item.id" :value="item.id">
									{{ item.nombre }}
								</option>
							</select>
						</div>

						<div class="form-group" v-if="modalMode === 'create'">
							<label>Docente</label>
							<select v-model.number="form.docenteId">
								<option :value="0">Sin asignar</option>
								<option v-for="docente in docentes" :key="docente.id" :value="docente.id">
									{{ docente.nombre }} {{ docente.apellido }}
								</option>
							</select>
						</div>

						<div class="form-group">
							<label>Fecha *</label>
							<input v-model="form.fecha" type="date" :min="today" required />
						</div>

						<div class="form-group">
							<label>Hora inicio *</label>
							<input v-model="form.horainicio" type="time" required />
						</div>

						<div class="form-group">
							<label>Hora fin *</label>
							<input v-model="form.horafin" type="time" required />
						</div>

						<div class="form-group full-width">
							<label>Observaciones</label>
							<textarea v-model="form.observaciones" rows="3" />
						</div>
					</div>

					<p v-if="formError" class="error-text">{{ formError }}</p>

					<div class="modal-actions">
						<button class="btn-secondary" type="button" @click="closeModal">Cancelar</button>
						<button class="btn-primary" type="submit" :disabled="isSaving">
							{{ isSaving ? 'Guardando...' : modalMode === 'create' ? 'Agendar' : 'Reagendar' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { pacientesService } from '@/services/estudiantes/Pacientes/pacientes.service'
import { especialidadesService } from '@/services/Admin/especialidades.service'
import { usuariosService } from '@/services/Admin/usuarios.service'
import citasService, { type Cita } from '@/services/estudiantes/Citas/citas.service'
import type { Paciente } from '@/types/pacientes.types'
import type { Especialidad } from '@/types/especialidades.types'
import type { Usuario } from '@/types/usuarios.types'
import '@/assets/styles/Estudiantes/Agenda.css'

interface CalendarDay {
	date: string
	dayNumber: number
	inCurrentMonth: boolean
	reservadasCount: number
	isToday: boolean
}

const toast = useToast()
const authStore = useAuthStore()

const isLoading = ref(false)
const isSaving = ref(false)
const citas = ref<Cita[]>([])
const pacientes = ref<Paciente[]>([])
const especialidades = ref<Especialidad[]>([])
const docentes = ref<Usuario[]>([])

const currentMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const selectedDate = ref(new Date().toISOString().slice(0, 10))

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingCitaId = ref<number | null>(null)
const formError = ref('')

const form = ref({
	pacienteId: 0,
	especialidadId: 0,
	docenteId: 0,
	fecha: new Date().toISOString().slice(0, 10),
	horainicio: '08:00',
	horafin: '09:00',
	observaciones: '',
})

const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const today = new Date().toISOString().slice(0, 10)

const monthLabel = computed(() =>
	currentMonth.value.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' }),
)

const citasDelDia = computed(() =>
	citas.value.filter((cita) => cita.fecha.slice(0, 10) === selectedDate.value),
)

const calendarDays = computed<CalendarDay[]>(() => {
	const year = currentMonth.value.getFullYear()
	const month = currentMonth.value.getMonth()

	const firstDay = new Date(year, month, 1)
	const lastDay = new Date(year, month + 1, 0)
	const startWeekDay = firstDay.getDay()

	const days: CalendarDay[] = []

	for (let i = startWeekDay - 1; i >= 0; i--) {
		const d = new Date(year, month, -i)
		days.push(buildDay(d, false))
	}

	for (let day = 1; day <= lastDay.getDate(); day++) {
		const d = new Date(year, month, day)
		days.push(buildDay(d, true))
	}

	const remaining = 42 - days.length
	for (let day = 1; day <= remaining; day++) {
		const d = new Date(year, month + 1, day)
		days.push(buildDay(d, false))
	}

	return days
})

const buildDay = (dateObj: Date, inCurrentMonth: boolean): CalendarDay => {
	const date = dateObj.toISOString().slice(0, 10)
	const reservadasCount = citas.value.filter(
		(cita) => cita.fecha.slice(0, 10) === date && cita.estado === 'RESERVADA',
	).length

	return {
		date,
		dayNumber: dateObj.getDate(),
		inCurrentMonth,
		reservadasCount,
		isToday: date === today,
	}
}

const formatHumanDate = (date: string) =>
	new Date(`${date}T00:00:00`).toLocaleDateString('es-EC', {
		weekday: 'long',
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	})

const formatHora = (dateIso: string) => {
	const d = new Date(dateIso)
	const hh = String(d.getHours()).padStart(2, '0')
	const mm = String(d.getMinutes()).padStart(2, '0')
	return `${hh}:${mm}`
}

const prevMonth = () => {
	currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

const nextMonth = () => {
	currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

const resetForm = () => {
	form.value = {
		pacienteId: 0,
		especialidadId: 0,
		docenteId: 0,
		fecha: selectedDate.value,
		horainicio: '08:00',
		horafin: '09:00',
		observaciones: '',
	}
	formError.value = ''
}

const openCrearModal = () => {
	modalMode.value = 'create'
	editingCitaId.value = null
	resetForm()
	isModalOpen.value = true
}

const openReagendarModal = (cita: Cita) => {
	modalMode.value = 'edit'
	editingCitaId.value = cita.id
	form.value = {
		pacienteId: cita.pacienteId,
		especialidadId: cita.especialidadId,
		docenteId: cita.docenteId || 0,
		fecha: cita.fecha.slice(0, 10),
		horainicio: formatHora(cita.horainicio),
		horafin: formatHora(cita.horafin),
		observaciones: cita.observaciones || '',
	}
	formError.value = ''
	isModalOpen.value = true
}

const closeModal = () => {
	if (isSaving.value) return
	isModalOpen.value = false
	resetForm()
}

const validarFormulario = () => {
	if (!authStore.user?.id) {
		formError.value = 'No se encontró sesión de estudiante activa.'
		return false
	}

	if (!form.value.fecha || !form.value.horainicio || !form.value.horafin) {
		formError.value = 'Fecha y horas son obligatorias.'
		return false
	}

	if (form.value.horainicio >= form.value.horafin) {
		formError.value = 'La hora de fin debe ser posterior a la hora de inicio.'
		return false
	}

	if (modalMode.value === 'create') {
		if (!form.value.pacienteId || !form.value.especialidadId) {
			formError.value = 'Paciente y especialidad son obligatorios.'
			return false
		}
	}

	formError.value = ''
	return true
}

const loadData = async () => {
	if (!authStore.user?.id) return

	isLoading.value = true
	try {
		const [citasResponse, pacientesResponse, especialidadesResponse, usuariosResponse] = await Promise.all([
			citasService.obtenerCitasPorEstudiante(authStore.user.id),
			pacientesService.getAll({ limit: 500, activo: true }),
			especialidadesService.getAll(),
			usuariosService.getAll({ limit: 300 }),
		])

		citas.value = citasResponse
		pacientes.value = pacientesResponse.data
		especialidades.value = especialidadesResponse
		docentes.value = usuariosResponse.data.filter((user) => user.role?.nombre === 'PROFESOR')
	} catch (error) {
		toast.error('No se pudo cargar la agenda de citas')
	} finally {
		isLoading.value = false
	}
}

const handleSubmit = async () => {
	if (!validarFormulario() || !authStore.user?.id) return

	isSaving.value = true
	try {
		if (modalMode.value === 'create') {
			await citasService.crearCita({
				fecha: form.value.fecha,
				horainicio: form.value.horainicio,
				horafin: form.value.horafin,
				pacienteId: form.value.pacienteId,
				especialidadId: form.value.especialidadId,
				estudianteId: authStore.user.id,
				docenteId: form.value.docenteId || undefined,
				observaciones: form.value.observaciones || undefined,
			})
			toast.success('Cita agendada correctamente')
		} else if (editingCitaId.value) {
			await citasService.reagendarCita(editingCitaId.value, {
				fecha: form.value.fecha,
				horainicio: form.value.horainicio,
				horafin: form.value.horafin,
				observaciones: form.value.observaciones || undefined,
			})
			toast.success('Cita reagendada correctamente')
		}

		await loadData()
		closeModal()
	} catch (error: any) {
		formError.value = error?.response?.data?.message || 'No se pudo guardar la cita.'
		toast.error(formError.value)
	} finally {
		isSaving.value = false
	}
}

onMounted(async () => {
	selectedDate.value = today
	await loadData()
})
</script>
