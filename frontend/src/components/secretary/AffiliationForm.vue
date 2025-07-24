<!-- src/components/secretary/AffiliationForm.vue -->
<template>
  <form @submit.prevent="onSave" class="affiliation-form row g-3">
    <div class="col-md-6">
      <label class="form-label">Nº de Afiliado</label>
      <input v-model="local.numAfiliado" type="text" class="form-control" />
    </div>
    <div class="col-md-6">
      <label class="form-label">Plan de Afiliación</label>
      <input v-model="local.planAfiliacion" type="text" class="form-control" />
    </div>
    <div class="col-md-6">
      <label class="form-label">Inicio Afiliación</label>
      <input v-model="local.fechaInicioAfiliacion" type="date" class="form-control" />
    </div>
    <div class="col-md-6">
      <label class="form-label">Fin Afiliación</label>
      <input v-model="local.fechaFinAfiliacion" type="date" class="form-control" />
    </div>
    <div class="col-12 d-flex justify-content-end mt-4">
      <button type="button" class="btn btn-secondary me-2" @click="$emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn btn-success">
        Guardar Afiliación
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface Affiliation {
  numAfiliado?: string
  planAfiliacion?: string
  fechaInicioAfiliacion?: string
  fechaFinAfiliacion?: string
}

const props = defineProps<{
  modelValue: Affiliation
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Affiliation): void
  (e: 'save', value: Affiliation): void
  (e: 'cancel'): void
}>()

// Local copy to edit
const local = reactive<Affiliation>({ ...props.modelValue })

// Sync incoming changes
watch(() => props.modelValue, v => {
  Object.assign(local, v || {})
})

// On save, emit both update:modelValue and save
function onSave() {
  emit('update:modelValue', { ...local })
  emit('save', { ...local })
}
</script>

<style scoped>
.affiliation-form {
  max-width: 700px;
  margin: auto;
}
.form-label {
  font-weight: 600;
}
</style>
