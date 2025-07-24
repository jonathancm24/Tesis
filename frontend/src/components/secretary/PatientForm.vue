<!-- src/components/secretary/PatientForm.vue -->
<template>
  <div class="patient-form">
    <h3>Registrar Paciente</h3>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label>Nombre completo</label>
        <input v-model="form.nombre" type="text" required />
      </div>
      <div class="form-group">
        <label>Cédula</label>
        <input v-model="form.cedula" type="text" required />
      </div>
      <div class="form-group">
        <label>Cantón</label>
        <input v-model="form.canton" type="text" required />
      </div>
      <div class="form-group">
        <label>Contacto</label>
        <input v-model="form.contacto" type="text" required />
      </div>
      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSecretaryStore } from '@/store/secretary'
import type { Patient } from '@/mocks/secretary/patients'

const store = useSecretaryStore()

const form = ref<Omit<Patient, 'createdAt' | 'updatedAt'>>({
  id: Date.now(),
  nombre: '',
  cedula: '',
  canton: '',
  contacto: ''
})

const submitForm = async () => {
  await store.addOrUpdatePatient({
    ...form.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Patient)

  // Reiniciar formulario
  form.value = {
    id: Date.now(),
    nombre: '',
    cedula: '',
    canton: '',
    contacto: ''
  }
}
</script>

<style scoped>
.patient-form {
  background: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}
h3 {
  margin-bottom: 1rem;
  color: #2e7d32;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  padding: 0.5rem 1rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
button:hover {
  background-color: #1b5e20;
}
</style>
