<template>
	<Teleport to="body">
		<div v-if="isOpen" class="profesor-historial-overlay" @click.self="emit('close')">
			<div class="profesor-historial-modal">
				<header class="profesor-historial-header">
					<div>
						<p class="profesor-historial-eyebrow">Profesor · Seguimiento</p>
						<h2 class="profesor-historial-title">Historial del estudiante</h2>
						<p class="profesor-historial-subtitle">
							Revisión de casos clínicos, tratamientos, prescripciones y comentarios.
						</p>
					</div>
					<button class="profesor-historial-close" type="button" @click="emit('close')">×</button>
				</header>

				<div class="profesor-historial-body">
					<section class="profesor-historial-summary">
						<article>
							<span class="profesor-historial-label">Estudiante</span>
							<strong>{{ student.nombre }} {{ student.apellido }}</strong>
						</article>
						<article>
							<span class="profesor-historial-label">Documento</span>
							<strong>{{ student.tipoDocumento }} · {{ student.numeroDocumento }}</strong>
						</article>
						<article>
							<span class="profesor-historial-label">Correo</span>
							<strong>{{ student.email }}</strong>
						</article>
						<article>
							<span class="profesor-historial-label">Casos</span>
							<strong>{{ cases.length }}</strong>
						</article>
						<article>
							<span class="profesor-historial-label">Activos</span>
							<strong>{{ activeCasesCount }}</strong>
						</article>
						<article>
							<span class="profesor-historial-label">Finalizados</span>
							<strong>{{ finalizedCasesCount }}</strong>
						</article>
					</section>

					<section class="profesor-historial-section">
						<h3>Datos del estudiante</h3>
						<div class="profesor-historial-grid">
							<div class="profesor-historial-field"><span>Fecha de nacimiento</span><p>{{ formatDate(student.fechaNacimiento) }}</p></div>
							<div class="profesor-historial-field"><span>Teléfono</span><p>{{ student.telefono || 'No registrado' }}</p></div>
							<div class="profesor-historial-field"><span>Dirección</span><p>{{ student.direccion || 'No registrada' }}</p></div>
							<div class="profesor-historial-field"><span>Parroquia</span><p>{{ student.parroquia?.nombre || 'No registrada' }}</p></div>
							<div class="profesor-historial-field"><span>Estado</span><p><span :class="['badge', student.activo ? 'badge-success' : 'badge-muted']">{{ student.activo ? 'Activo' : 'Inactivo' }}</span></p></div>
							<div class="profesor-historial-field"><span>Registro</span><p>{{ formatDate(student.fechaRegistro) }}</p></div>
						</div>
					</section>

					<section class="profesor-historial-section">
						<div class="profesor-historial-section-head">
							<div>
								<h3>Casos clínicos</h3>
								<p>Se listan todos los casos del estudiante.</p>
							</div>
							<span v-if="isLoadingCases" class="profesor-historial-chip profesor-historial-chip--info">Cargando</span>
						</div>

						<div v-if="isLoadingCases" class="profesor-historial-empty">Cargando casos clínicos...</div>
						<div v-else-if="!cases.length" class="profesor-historial-empty">No hay casos clínicos registrados.</div>
						<div v-else class="profesor-historial-stack">
							<article v-for="caso in cases" :key="caso.id" class="profesor-historial-card">
								<div class="profesor-historial-card-head">
									<div>
										<strong>Caso #{{ caso.id }}</strong>
										<p class="profesor-historial-meta">{{ caso.especialidad?.nombre || 'Sin especialidad' }} · {{ formatDate(caso.fechaCreacion) }}</p>
										<p class="profesor-historial-meta">Profesor: {{ formatPersona(caso.profesor) }} · Paciente: {{ formatPersona(caso.paciente) }}</p>
									</div>
									<span :class="['profesor-historial-chip', getEstadoChip(caso.estado)]">{{ caso.estado }}</span>
								</div>

								<div class="profesor-historial-grid profesor-historial-grid--compact">
									<div class="profesor-historial-field"><span>Motivo</span><p>{{ caso.motivoConsulta }}</p></div>
									<div class="profesor-historial-field"><span>Enfermedad actual</span><p>{{ caso.enfermedadActual }}</p></div>
									<div class="profesor-historial-field"><span>ATM</span><p>{{ caso.ATM }}</p></div>
									<div class="profesor-historial-field"><span>Cara y cuello</span><p>{{ caso.CarayCuello }}</p></div>
									<div class="profesor-historial-field"><span>Piel y mucosa</span><p>{{ caso.PielyMucosa }}</p></div>
									<div class="profesor-historial-field"><span>Cráneo</span><p>{{ caso.craneo }}</p></div>
									<div class="profesor-historial-field"><span>Facies</span><p>{{ caso.facies }}</p></div>
									<div class="profesor-historial-field"><span>Marcha</span><p>{{ caso.marcha }}</p></div>
									<div class="profesor-historial-field"><span>Peso</span><p>{{ caso.peso }}</p></div>
									<div class="profesor-historial-field"><span>Talla</span><p>{{ caso.talla }}</p></div>
								</div>

								<details class="profesor-historial-details">
									<summary>Comentarios del caso ({{ getCaseObservations(caso).length }})</summary>
									<div v-if="getCaseObservations(caso).length === 0" class="profesor-historial-empty profesor-historial-empty--nested">Sin comentarios del caso.</div>
									<div v-else class="profesor-historial-stack profesor-historial-stack--nested">
										<article v-for="obs in getCaseObservations(caso)" :key="obs.id" class="profesor-historial-comment">
											<div class="profesor-historial-comment-head">
												<strong>{{ obs.titulo }}</strong>
												<span :class="['profesor-historial-chip', getObservationChip(obs.estado)]">{{ obs.estado }}</span>
											</div>
											<p class="profesor-historial-meta">{{ formatDate(obs.fecha) }}</p>
											<p class="profesor-historial-text">{{ obs.descripcion }}</p>
										</article>
									</div>
								</details>

								<details class="profesor-historial-details">
									<summary>Tratamientos ({{ getTreatments(caso).length }})</summary>
									<div v-if="getTreatments(caso).length === 0" class="profesor-historial-empty profesor-historial-empty--nested">Sin tratamientos registrados.</div>
									<div v-else class="profesor-historial-stack profesor-historial-stack--nested">
										<article v-for="tratamiento in getTreatments(caso)" :key="tratamiento.id" class="profesor-historial-comment">
											<div class="profesor-historial-comment-head">
												<div>
													<strong>Tratamiento #{{ tratamiento.id }}</strong>
													<p class="profesor-historial-meta">{{ formatDate(tratamiento.fechaCreacion) }} · {{ tratamiento.tipoDiagnostico || 'Sin tipo' }}</p>
												</div>
												<span :class="['profesor-historial-chip', getTreatmentChip(tratamiento.estado)]">{{ tratamiento.estado }}</span>
											</div>

											<div class="profesor-historial-grid profesor-historial-grid--compact">
												<div class="profesor-historial-field"><span>Descripción</span><p>{{ tratamiento.descripcion }}</p></div>
												<div class="profesor-historial-field"><span>Frecuencia cardíaca</span><p>{{ tratamiento.frecuenciaCardiaca || '—' }}</p></div>
												<div class="profesor-historial-field"><span>Presión arterial</span><p>{{ tratamiento.presArterial || '—' }}</p></div>
												<div class="profesor-historial-field"><span>Saturación</span><p>{{ tratamiento.saturacionOxigeno || '—' }}</p></div>
												<div class="profesor-historial-field"><span>Temperatura</span><p>{{ tratamiento.temperatura || '—' }}</p></div>
												<div class="profesor-historial-field"><span>CIE10</span><p>{{ formatCodeLabel(tratamiento.cie10) || tratamiento.cie10Codigo || '—' }}</p></div>
												<div class="profesor-historial-field"><span>Procedimiento</span><p>{{ formatCodeLabel(tratamiento.procedimiento) || tratamiento.procedimientoCodigo || '—' }}</p></div>
											</div>

											<details class="profesor-historial-details profesor-historial-details--nested">
												<summary>Comentarios del tratamiento ({{ getTreatmentObservations(tratamiento, caso).length }})</summary>
												<div v-if="getTreatmentObservations(tratamiento, caso).length === 0" class="profesor-historial-empty profesor-historial-empty--nested">Sin comentarios relacionados.</div>
												<div v-else class="profesor-historial-stack profesor-historial-stack--nested">
													<article v-for="obs in getTreatmentObservations(tratamiento, caso)" :key="obs.id" class="profesor-historial-comment">
														<div class="profesor-historial-comment-head">
															<strong>{{ obs.titulo }}</strong>
															<span :class="['profesor-historial-chip', getObservationChip(obs.estado)]">{{ obs.estado }}</span>
														</div>
														<p class="profesor-historial-meta">{{ formatDate(obs.fecha) }}</p>
														<p class="profesor-historial-text">{{ obs.descripcion }}</p>
													</article>
												</div>
											</details>
										</article>
									</div>
								</details>

								<details class="profesor-historial-details">
									<summary>Prescripciones ({{ getPrescriptions(caso).length }})</summary>
									<div v-if="getPrescriptions(caso).length === 0" class="profesor-historial-empty profesor-historial-empty--nested">Sin prescripciones registradas.</div>
									<div v-else class="profesor-historial-stack profesor-historial-stack--nested">
										<article v-for="prescripcion in getPrescriptions(caso)" :key="prescripcion.id" class="profesor-historial-comment">
											<div class="profesor-historial-comment-head">
												<div>
													<strong>Prescripción #{{ prescripcion.id }}</strong>
													<p class="profesor-historial-meta">{{ formatDate(prescripcion.fechaCreacion) }}</p>
												</div>
												<span :class="['profesor-historial-chip', getPrescriptionChip(prescripcion.estado)]">{{ prescripcion.estado }}</span>
											</div>

											<div class="profesor-historial-grid profesor-historial-grid--compact">
												<div class="profesor-historial-field"><span>Medicamento</span><p>{{ prescripcion.medicamento }}</p></div>
												<div class="profesor-historial-field"><span>Dosis</span><p>{{ prescripcion.dosis }}</p></div>
												<div class="profesor-historial-field"><span>Frecuencia</span><p>{{ prescripcion.frecuencia }}</p></div>
												<div class="profesor-historial-field"><span>Duración</span><p>{{ prescripcion.duracion }}</p></div>
												<div class="profesor-historial-field"><span>Concentración</span><p>{{ prescripcion.concentracion || '—' }}</p></div>
												<div class="profesor-historial-field"><span>N° fármacos</span><p>{{ prescripcion.Nrodefarmacos ?? '—' }}</p></div>
												<div class="profesor-historial-field"><span>Presentación</span><p>{{ prescripcion.presentacion || '—' }}</p></div>
												<div class="profesor-historial-field"><span>Vía administración</span><p>{{ prescripcion.viadeadministracion || '—' }}</p></div>
											</div>

											<details class="profesor-historial-details profesor-historial-details--nested">
												<summary>Comentarios de la prescripción ({{ getPrescriptionObservations(prescripcion, caso).length }})</summary>
												<div v-if="getPrescriptionObservations(prescripcion, caso).length === 0" class="profesor-historial-empty profesor-historial-empty--nested">Sin comentarios relacionados.</div>
												<div v-else class="profesor-historial-stack profesor-historial-stack--nested">
													<article v-for="obs in getPrescriptionObservations(prescripcion, caso)" :key="obs.id" class="profesor-historial-comment">
														<div class="profesor-historial-comment-head">
															<strong>{{ obs.titulo }}</strong>
															<span :class="['profesor-historial-chip', getObservationChip(obs.estado)]">{{ obs.estado }}</span>
														</div>
														<p class="profesor-historial-meta">{{ formatDate(obs.fecha) }}</p>
														<p class="profesor-historial-text">{{ obs.descripcion }}</p>
													</article>
												</div>
											</details>
										</article>
									</div>
								</details>
							</article>
						</div>
					</section>
				</div>

				<footer class="profesor-historial-footer">
					<button class="btn btn-secondary" type="button" @click="emit('close')">Cerrar</button>
				</footer>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Usuario } from '@/types/usuarios.types'
import type { CasoClinico, Observacion, PrescripcionDetalle, TratamientoDetalle } from '@/types/casosClinicos.types'
import '@/assets/styles/Profesor/components/HistorialEstudianteModal.css'

interface Props {
	isOpen: boolean
	student: Usuario
	cases: CasoClinico[]
	isLoadingCases: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'close'): void }>()

const activeCasesCount = computed(() => props.cases.filter((caso) => caso.estado !== 'FINALIZADO' && caso.estado !== 'RECHAZADO').length)
const finalizedCasesCount = computed(() => props.cases.filter((caso) => caso.estado === 'FINALIZADO').length)

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

const formatCodeLabel = (item?: { codigo: string; descripcion: string } | null): string => {
	if (!item) return ''
	return `${item.codigo} · ${item.descripcion}`
}

const getEstadoChip = (estado: string) => {
	if (estado === 'FINALIZADO' || estado === 'APROBADO') return 'profesor-historial-chip--success'
	if (estado === 'RECHAZADO' || estado === 'CANCELADO') return 'profesor-historial-chip--danger'
	if (estado === 'EN_PROCESO' || estado === 'EN_TRATAMIENTO') return 'profesor-historial-chip--info'
	return 'profesor-historial-chip--warning'
}

const getTreatmentChip = (estado: string) => {
	if (estado === 'APROBADO' || estado === 'FINALIZADO') return 'profesor-historial-chip--success'
	if (estado === 'RECHAZADO' || estado === 'CANCELADO') return 'profesor-historial-chip--danger'
	if (estado === 'EN_PROCESO') return 'profesor-historial-chip--info'
	return 'profesor-historial-chip--warning'
}

const getPrescriptionChip = (estado: string) => {
	if (estado === 'APROBADO' || estado === 'COMPLETADO') return 'profesor-historial-chip--success'
	if (estado === 'RECHAZADO' || estado === 'CANCELADO') return 'profesor-historial-chip--danger'
	if (estado === 'EN_PROCESO') return 'profesor-historial-chip--info'
	return 'profesor-historial-chip--warning'
}

const getObservationChip = (estado: string) => {
	if (estado === 'APROBADO') return 'profesor-historial-chip--success'
	if (estado === 'RECHAZADO') return 'profesor-historial-chip--danger'
	if (estado === 'PENDIENTE') return 'profesor-historial-chip--warning'
	return 'profesor-historial-chip--neutral'
}

const getCaseObservations = (caso: CasoClinico): Observacion[] => {
	return (caso.observaciones || []).filter((obs) => !obs.tratamientoId && !obs.prescripcionId)
}

const getTreatments = (caso: CasoClinico): TratamientoDetalle[] => {
	return (caso.tratamientos || []) as TratamientoDetalle[]
}

const getPrescriptions = (caso: CasoClinico): PrescripcionDetalle[] => {
	return (caso.prescripciones || []) as PrescripcionDetalle[]
}

const getTreatmentObservations = (tratamiento: TratamientoDetalle, caso: CasoClinico): Observacion[] => {
	if (tratamiento.observaciones?.length) return tratamiento.observaciones
	return (caso.observaciones || []).filter((obs) => obs.tratamientoId === tratamiento.id)
}

const getPrescriptionObservations = (prescripcion: PrescripcionDetalle, caso: CasoClinico): Observacion[] => {
	if (prescripcion.observaciones?.length) return prescripcion.observaciones
	return (caso.observaciones || []).filter((obs) => obs.prescripcionId === prescripcion.id)
}
</script>