<template>
	<div v-if="preguntas.length > 0" class="preguntas-dinamicas">
		<h3 class="form-section-title"><span class="form-section-number">07</span>Preguntas específicas</h3>
		<div class="form-grid">
			<div
				v-for="pregunta in preguntas"
				:key="pregunta.id"
				class="form-field"
				:class="{
					'form-field-full': pregunta.tipo === 'TEXTAREA',
					'is-invalid': pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id),
					'is-valid': pregunta.obligatoria && touched[pregunta.id] && tieneRespuesta(pregunta.id)
				}"
			>
				<label :for="`pregunta-${pregunta.id}`">
					{{ pregunta.texto }}
					<span v-if="pregunta.obligatoria" class="required-mark" aria-hidden="true"> *</span>
				</label>

				<input
					v-if="pregunta.tipo === 'TEXTO'"
					:id="`pregunta-${pregunta.id}`"
					type="text"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
					@blur="touched[pregunta.id] = true"
				/>

				<textarea
					v-else-if="pregunta.tipo === 'TEXTAREA'"
					:id="`pregunta-${pregunta.id}`"
					rows="3"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLTextAreaElement).value)"
					@blur="touched[pregunta.id] = true"
				></textarea>

				<input
					v-else-if="pregunta.tipo === 'NUMERO'"
					:id="`pregunta-${pregunta.id}`"
					type="number"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
					@blur="touched[pregunta.id] = true"
				/>

				<input
					v-else-if="pregunta.tipo === 'FECHA'"
					:id="`pregunta-${pregunta.id}`"
					type="date"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
					@blur="touched[pregunta.id] = true"
				/>

				<select
					v-else-if="pregunta.tipo === 'SI_NO'"
					:id="`pregunta-${pregunta.id}`"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@change="actualizarRespuesta(pregunta.id, ($event.target as HTMLSelectElement).value)"
					@blur="touched[pregunta.id] = true"
				>
					<option value="" disabled>Seleccione una opción</option>
					<option value="Si">Sí</option>
					<option value="No">No</option>
				</select>

				<input
					v-else
					:id="`pregunta-${pregunta.id}`"
					type="text"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					:aria-invalid="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
					@blur="touched[pregunta.id] = true"
				/>

				<small
					v-if="pregunta.obligatoria && (touched[pregunta.id] || showValidationErrors) && !tieneRespuesta(pregunta.id)"
					class="help-text error"
				>
					Responda esta pregunta antes de guardar el caso clínico.
				</small>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { PreguntaClinica } from '@/types/preguntasClinicas.types'

interface Props {
	preguntas: PreguntaClinica[]
	disabled?: boolean
	showValidationErrors?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	showValidationErrors: false
})

const emit = defineEmits<{
	(e: 'update:respuestas', value: Array<{ preguntaId: number; respuesta: string }>): void
}>()

const respuestas = reactive<Record<number, string>>({})
const touched = reactive<Record<number, boolean>>({})

const getRespuesta = (preguntaId: number): string => {
	return respuestas[preguntaId] || ''
}

const tieneRespuesta = (preguntaId: number): boolean => {
	return getRespuesta(preguntaId).trim().length > 0
}

const actualizarRespuesta = (preguntaId: number, valor: string) => {
	respuestas[preguntaId] = valor
	emitirRespuestas()
}

const emitirRespuestas = () => {
	const respuestasArray = Object.entries(respuestas)
		.filter(([, respuesta]) => respuesta.trim() !== '')
		.map(([preguntaIdStr, respuesta]) => ({
			preguntaId: Number(preguntaIdStr),
			respuesta
		}))
	emit('update:respuestas', respuestasArray)
}

watch(
	() => props.preguntas.map((pregunta) => pregunta.id).join(','),
	() => {
		Object.keys(respuestas).forEach((id) => {
			delete respuestas[Number(id)]
		})
		Object.keys(touched).forEach((id) => {
			delete touched[Number(id)]
		})
		emitirRespuestas()
	},
	{ immediate: true }
)
</script>
