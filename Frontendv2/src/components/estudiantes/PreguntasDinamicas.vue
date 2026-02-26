<template>
	<div v-if="preguntas.length > 0" class="preguntas-dinamicas">
		<h3 class="form-section-title">Preguntas específicas</h3>
		<div class="form-grid">
			<div
				v-for="pregunta in preguntas"
				:key="pregunta.id"
				class="form-field"
				:class="{ 'form-field-full': pregunta.tipo === 'TEXTO_LARGO' }"
			>
				<label :for="`pregunta-${pregunta.id}`">
					{{ pregunta.texto }}
					<span v-if="pregunta.obligatoria" style="color: var(--color-error)"> *</span>
				</label>

				<input
					v-if="pregunta.tipo === 'TEXTO'"
					:id="`pregunta-${pregunta.id}`"
					type="text"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
				/>

				<textarea
					v-else-if="pregunta.tipo === 'TEXTO_LARGO'"
					:id="`pregunta-${pregunta.id}`"
					rows="3"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLTextAreaElement).value)"
				></textarea>

				<input
					v-else-if="pregunta.tipo === 'NUMERO'"
					:id="`pregunta-${pregunta.id}`"
					type="number"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
				/>

				<input
					v-else-if="pregunta.tipo === 'FECHA'"
					:id="`pregunta-${pregunta.id}`"
					type="date"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
				/>

				<select
					v-else-if="pregunta.tipo === 'BOOLEANO'"
					:id="`pregunta-${pregunta.id}`"
					:value="getRespuesta(pregunta.id)"
					:required="pregunta.obligatoria"
					:disabled="disabled"
					@change="actualizarRespuesta(pregunta.id, ($event.target as HTMLSelectElement).value)"
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
					@input="actualizarRespuesta(pregunta.id, ($event.target as HTMLInputElement).value)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { PreguntaClinica } from '@/types/preguntasClinicas.types'

interface Props {
	preguntas: PreguntaClinica[]
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false
})

const emit = defineEmits<{
	(e: 'update:respuestas', value: Array<{ preguntaId: number; respuesta: string }>): void
}>()

const respuestas = reactive<Record<number, string>>({})

const getRespuesta = (preguntaId: number): string => {
	return respuestas[preguntaId] || ''
}

const actualizarRespuesta = (preguntaId: number, valor: string) => {
	respuestas[preguntaId] = valor
	emitirRespuestas()
}

const emitirRespuestas = () => {
	const respuestasArray = Object.entries(respuestas)
		.filter(([_, respuesta]) => respuesta.trim() !== '')
		.map(([preguntaIdStr, respuesta]) => ({
			preguntaId: Number(preguntaIdStr),
			respuesta
		}))
	emit('update:respuestas', respuestasArray)
}
</script>
