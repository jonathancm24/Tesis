<template>
	<div class="modal-overlay" @click.self="$emit('close')">
		<div class="modal-content">
			<div class="modal-header">
				<h2>{{ pregunta ? 'Editar pregunta' : 'Nueva pregunta' }}</h2>
				<button class="btn-close" type="button" @click="$emit('close')">&times;</button>
			</div>

			<form class="modal-body" @submit.prevent="handleSubmit">
				<div class="form-grid">
					<div class="form-field">
						<label for="texto">Texto de la pregunta *</label>
						<textarea
							id="texto"
							v-model.trim="form.texto"
							placeholder="¿Cuál es el diagnóstico preliminar del paciente?"
							required
						></textarea>
					</div>

					<div class="form-field">
						<label for="tipo">Tipo de respuesta *</label>
						<select id="tipo" v-model="form.tipo" required>
							<option value="" disabled>Seleccione el tipo</option>
							<option value="TEXTO">Texto corto</option>
							<option value="TEXTO_LARGO">Texto largo</option>
							<option value="NUMERO">Número</option>
							<option value="FECHA">Fecha</option>
							<option value="BOOLEANO">Sí/No</option>
							<option value="SELECCION_MULTIPLE">Selección múltiple</option>
						</select>
					</div>

					<div class="form-field">
						<label for="especialidad">Especialidad</label>
						<select id="especialidad" v-model.number="form.especialidadId">
							<option :value="0">General (todas las especialidades)</option>
							<option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
								{{ esp.nombre }}
							</option>
						</select>
						<small style="color: var(--color-text-secondary); font-size: 0.75rem;">
							Si seleccionas una especialidad, solo aparecerá en casos de esa especialidad
						</small>
					</div>

					<div class="checkbox-field">
						<input id="obligatoria" type="checkbox" v-model="form.obligatoria" />
						<label for="obligatoria">Respuesta obligatoria</label>
					</div>
				</div>

				<div class="modal-footer">
					<button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
					<button class="btn btn-primary" type="submit" :disabled="isSaving">
						{{ isSaving ? 'Guardando...' : 'Guardar' }}
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { preguntasClinicasService } from '@/services/Profesores/preguntas-clinicas.service'
import { useToast } from '@/composables/useToast'
import type { PreguntaClinica, TipoPregunta } from '@/types/preguntasClinicas.types'
import type { Especialidad } from '@/types/especialidades.types'
import '@/assets/styles/Profesor/components/PreguntaModal.css'

interface Props {
	pregunta?: PreguntaClinica | null
	especialidades: Especialidad[]
}

const props = withDefaults(defineProps<Props>(), {
	pregunta: null
})

const emit = defineEmits<{
	(e: 'close'): void
	(e: 'save'): void
}>()

const toast = useToast()
const isSaving = ref(false)

const form = reactive({
	texto: props.pregunta?.texto || '',
	tipo: (props.pregunta?.tipo || '') as TipoPregunta | '',
	obligatoria: props.pregunta?.obligatoria ?? false,
	especialidadId: props.pregunta?.especialidadId || 0
})

const handleSubmit = async () => {
	if (!form.texto.trim() || !form.tipo) {
		toast.error('Complete los campos obligatorios')
		return
	}

	try {
		isSaving.value = true

		const dto = {
			texto: form.texto,
			tipo: form.tipo as TipoPregunta,
			obligatoria: form.obligatoria,
			especialidadId: form.especialidadId > 0 ? form.especialidadId : undefined
		}

		if (props.pregunta) {
			await preguntasClinicasService.update(props.pregunta.id, dto)
		} else {
			await preguntasClinicasService.create(dto)
		}

		emit('save')
	} catch (error) {
		toast.error('No se pudo guardar la pregunta')
	} finally {
		isSaving.value = false
	}
}
</script>
