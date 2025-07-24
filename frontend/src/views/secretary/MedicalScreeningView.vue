<!-- src/components/secretary/MedicalScreeningForm.vue -->
<template>
  <div class="medical-form">
    <h2>Cuestionario de Tamizaje Médico</h2>
    <form @submit.prevent="handleSubmit">
      <!-- Selector de paciente -->
      <div class="form-group">
        <label for="paciente">Paciente:</label>
        <select
          id="paciente"
          v-model="form.patientId"
          class="form-control"
          required
        >
          <option disabled value="">Seleccione un paciente</option>
          <option
            v-for="p in secretaryStore.patients"
            :key="p.id"
            :value="String(p.id)"
          >
            {{ p.nombre }} — {{ p.cedula }}
          </option>
        </select>
      </div>

      <!-- Datos médicos -->
      <div class="form-group">
        <label>Enfermedades (coma separadas)</label>
        <input
          type="text"
          v-model="form.enfermedades"
          class="form-control"
          placeholder="Ej. Diabetes, Hipertensión"
        />
      </div>

      <div class="form-group">
        <label>Medicamentos (coma separadas)</label>
        <input
          type="text"
          v-model="form.medicamentos"
          class="form-control"
          placeholder="Ej. Metformina"
        />
      </div>

      <div class="form-group">
        <label>Alergias (coma separadas)</label>
        <input
          type="text"
          v-model="form.alergias"
          class="form-control"
          placeholder="Ej. Penicilina"
        />
      </div>

      <div class="form-group">
        <label>Tipo de Sangre</label>
        <input
          type="text"
          v-model="form.tipoSangre"
          class="form-control"
          placeholder="Ej. O+"
        />
      </div>

      <div class="form-group">
        <label>Condiciones sistémicas (coma separadas)</label>
        <input
          type="text"
          v-model="form.condiciones"
          class="form-control"
          placeholder="Ej. Asma"
        />
      </div>

      <!-- Nuevos campos requeridos -->
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="embarazada"
          v-model="form.estaEmbarazada"
        />
        <label class="form-check-label" for="embarazada">
          Está embarazada
        </label>
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="fuma"
          v-model="form.fuma"
        />
        <label class="form-check-label" for="fuma">Fuma</label>
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="alcohol"
          v-model="form.consumeAlcohol"
        />
        <label class="form-check-label" for="alcohol">Consume alcohol</label>
      </div>
      <div class="form-check form-switch">
        <input
          class="form-check-input"
          type="checkbox"
          id="discapacidad"
          v-model="form.tieneDiscapacidad"
        />
        <label class="form-check-label" for="discapacidad">
          Tiene discapacidad
        </label>
      </div>
      <div class="form-check form-switch mb-3">
        <input
          class="form-check-input"
          type="checkbox"
          id="hospitalizado"
          v-model="form.haSidoHospitalizado"
        />
        <label class="form-check-label" for="hospitalizado">
          Ha sido hospitalizado
        </label>
      </div>

      <div class="form-group">
        <label>Antecedentes Familiares</label>
        <textarea
          class="form-control"
          v-model="form.antecedentesFamiliares"
          rows="2"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Observaciones</label>
        <textarea
          class="form-control"
          v-model="form.observaciones"
          rows="2"
        ></textarea>
      </div>

      <button type="submit" class="btn btn-primary mt-4">
        Guardar Historia Médica
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { MedicalHistory } from '@/mocks/secretary/medicalHistories'

const secretaryStore = useSecretaryStore()

interface Formulario {
  patientId: string
  enfermedades: string
  medicamentos: string
  alergias: string
  tipoSangre: string
  condiciones: string
  estaEmbarazada: boolean
  fuma: boolean
  consumeAlcohol: boolean
  tieneDiscapacidad: boolean
  haSidoHospitalizado: boolean
  antecedentesFamiliares: string
  observaciones: string
}

const form = reactive<Formulario>({
  patientId: '',
  enfermedades: '',
  medicamentos: '',
  alergias: '',
  tipoSangre: '',
  condiciones: '',
  estaEmbarazada: false,
  fuma: false,
  consumeAlcohol: false,
  tieneDiscapacidad: false,
  haSidoHospitalizado: false,
  antecedentesFamiliares: '',
  observaciones: '',
})

function limpiarFormulario() {
  form.patientId = ''
  form.enfermedades = ''
  form.medicamentos = ''
  form.alergias = ''
  form.tipoSangre = ''
  form.condiciones = ''
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
    alert('Seleccione un paciente')
    return
  }

  const history: MedicalHistory = {
    id: Date.now(),
    patientId: Number(form.patientId),
    enfermedades: form.enfermedades
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    medicamentos: form.medicamentos
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    alergias: form.alergias
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    tipoSangre: form.tipoSangre.trim(),
    condiciones: form.condiciones
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    estaEmbarazada: form.estaEmbarazada,
    fuma: form.fuma,
    consumeAlcohol: form.consumeAlcohol,
    tieneDiscapacidad: form.tieneDiscapacidad,
    haSidoHospitalizado: form.haSidoHospitalizado,
    antecedentesFamiliares: form.antecedentesFamiliares.trim(),
    observaciones: form.observaciones.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await secretaryStore.addOrUpdateHistory(history)
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
  border-radius: 0.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
h2 {
  margin-bottom: 1.5rem;
  color: #153b50;
}
.form-group,
.form-check {
  margin-bottom: 1rem;
}
.form-check-label {
  margin-left: .5rem;
}
.btn-primary {
  width: 100%;
}
</style>
