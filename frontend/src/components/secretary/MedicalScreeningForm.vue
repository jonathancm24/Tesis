<!-- src/components/secretary/MedicalScreeningForm.vue -->
<template>
  <div class="medical-form">
    <h2 class="mb-4">Cuestionario de Tamizaje Médico</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Paciente -->
      <div class="mb-3">
        <label class="form-label">Paciente</label>
        <select v-model.number="form.patientId" class="form-select" required>
          <option disabled value="">Seleccione un paciente</option>
          <option
            v-for="p in store.patients"
            :key="p.id"
            :value="p.id"
          >
            {{ p.nombre }} — {{ p.cedula }}
          </option>
        </select>
      </div>

      <!-- Texto libre -->
      <div class="mb-3">
        <label class="form-label">Enfermedades (separar con coma)</label>
        <input
          v-model="form.enfermedades"
          type="text"
          class="form-control"
          placeholder="Ej. Diabetes, Hipertensión"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Medicamentos (separar con coma)</label>
        <input
          v-model="form.medicamentos"
          type="text"
          class="form-control"
          placeholder="Ej. Metformina"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Alergias (separar con coma)</label>
        <input
          v-model="form.alergias"
          type="text"
          class="form-control"
          placeholder="Ej. Penicilina"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Tipo de Sangre</label>
        <input
          v-model="form.tipoSangre"
          type="text"
          class="form-control"
          placeholder="Ej. O+"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Condiciones sistémicas (separar con coma)</label>
        <input
          v-model="form.condiciones"
          type="text"
          class="form-control"
          placeholder="Ej. Asma"
        />
      </div>

      <!-- Sí/No switches -->
      <div class="form-check form-switch mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="embarazada"
          v-model="form.estaEmbarazada"
        />
        <label class="form-check-label" for="embarazada">
          ¿Está embarazada?
        </label>
      </div>
      <div class="form-check form-switch mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="fuma"
          v-model="form.fuma"
        />
        <label class="form-check-label" for="fuma">
          ¿Fuma?
        </label>
      </div>
      <div class="form-check form-switch mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="alcohol"
          v-model="form.consumeAlcohol"
        />
        <label class="form-check-label" for="alcohol">
          ¿Consume alcohol?
        </label>
      </div>
      <div class="form-check form-switch mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="discapacidad"
          v-model="form.tieneDiscapacidad"
        />
        <label class="form-check-label" for="discapacidad">
          ¿Tiene discapacidad?
        </label>
      </div>
      <div class="form-check form-switch mb-4">
        <input
          class="form-check-input"
          type="checkbox"
          id="hospitalizado"
          v-model="form.haSidoHospitalizado"
        />
        <label class="form-check-label" for="hospitalizado">
          ¿Ha sido hospitalizado recientemente?
        </label>
      </div>

      <!-- Textareas -->
      <div class="mb-3">
        <label class="form-label">Antecedentes Familiares</label>
        <textarea
          v-model="form.antecedentesFamiliares"
          class="form-control"
          rows="2"
          placeholder="Ej. Padre con diabetes..."
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Observaciones</label>
        <textarea
          v-model="form.observaciones"
          class="form-control"
          rows="2"
          placeholder="Notas adicionales..."
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary w-100">
        Guardar Historia Médica
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { MedicalHistory } from '@/mocks/secretary/medicalHistories'

const store = useSecretaryStore()

// Formulario local con todas las propiedades de MedicalHistory
const form = reactive<Omit<MedicalHistory, 'createdAt' | 'updatedAt'>>({
  id: 0,
  patientId: 0,
  enfermedades: [],
  medicamentos: [],
  alergias: [],
  tipoSangre: '',
  condiciones: [],
  estaEmbarazada: false,
  fuma: false,
  consumeAlcohol: false,
  tieneDiscapacidad: false,
  haSidoHospitalizado: false,
  antecedentesFamiliares: '',
  observaciones: ''
})

function limpiarFormulario() {
  form.id = 0
  form.patientId = 0
  form.enfermedades = []
  form.medicamentos = []
  form.alergias = []
  form.tipoSangre = ''
  form.condiciones = []
  form.estaEmbarazada = false
  form.fuma = false
  form.consumeAlcohol = false
  form.tieneDiscapacidad = false
  form.haSidoHospitalizado = false
  form.antecedentesFamiliares = ''
  form.observaciones = ''
}

async function handleSubmit() {
  if (!form.patientId) {
    alert('Debe seleccionar un paciente')
    return
  }

  // Convertir cadenas en arrays
  form.enfermedades = (form.enfermedades as any)
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s)
  form.medicamentos = (form.medicamentos as any)
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s)
  form.alergias = (form.alergias as any)
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s)
  form.condiciones = (form.condiciones as any)
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s)

  // Asignar nuevo id y timestamps
  const now = new Date().toISOString()
  form.id = form.id || Date.now()
  const history: MedicalHistory = {
    ...form,
    createdAt: now,
    updatedAt: now
  }

  await store.addOrUpdateHistory(history)
  alert('Historia médica guardada exitosamente')
  limpiarFormulario()
}
</script>

<style scoped>
.medical-form {
  max-width: 650px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: .5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.mb-3 {
  margin-bottom: 1rem !important;
}
.form-label {
  font-weight: 600;
}
.w-100 {
  width: 100% !important;
}
</style>
