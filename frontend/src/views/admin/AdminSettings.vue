<!-- Ruta: /admin/settings  - Archivo: src/views/admin/AdminSettings.vue -->
<template>
  <section class="admin-settings container py-4">
    <h1 class="mb-4 text-center text-primary">Ajustes del Sistema</h1>
    <form @submit.prevent="saveSettings" class="row g-4 needs-validation" novalidate>
      <!-- Nombre de la clínica -->
      <div class="col-12 col-md-6">
        <label for="clinicName" class="form-label">Nombre de la Clínica</label>
        <input
          id="clinicName"
          v-model="settings.clinicName"
          type="text"
          class="form-control"
          required
        />
        <div class="invalid-feedback">
          El nombre de la clínica es obligatorio.
        </div>
      </div>

      <!-- Dirección -->
      <div class="col-12 col-md-6">
        <label for="address" class="form-label">Dirección</label>
        <input
          id="address"
          v-model="settings.address"
          type="text"
          class="form-control"
          required
        />
        <div class="invalid-feedback">
          La dirección es obligatoria.
        </div>
      </div>

      <!-- Contacto -->
      <div class="col-12 col-md-6">
        <label for="contact" class="form-label">Contacto (teléfono o email)</label>
        <input
          id="contact"
          v-model="settings.contact"
          type="text"
          class="form-control"
          required
        />
        <div class="invalid-feedback">
          El contacto es obligatorio.
        </div>
      </div>

      <!-- Horas de atención -->
      <div class="col-12 col-md-6">
        <label for="hours" class="form-label">Horas de Atención</label>
        <input
          id="hours"
          v-model="settings.hours"
          type="text"
          class="form-control"
          placeholder="Ej. Lun–Vie 8:00–17:00"
        />
      </div>

      <!-- Días hábiles -->
      <div class="col-12">
        <label for="days" class="form-label">Días Hábiles</label>
        <input
          id="days"
          v-model="settings.days"
          type="text"
          class="form-control"
          placeholder="Ej. Lun, Mar, Mié..."
        />
      </div>

      <!-- Política de privacidad -->
      <div class="col-12">
        <label for="privacy" class="form-label">Política de Privacidad</label>
        <textarea
          id="privacy"
          v-model="settings.privacyPolicy"
          rows="4"
          class="form-control"
        ></textarea>
      </div>

      <!-- Logo -->
      <div class="col-12 col-md-6">
        <label class="form-label">Logo de la Clínica</label>
        <input
          type="file"
          @change="onLogoChange"
          accept="image/*"
          class="form-control"
        />
      </div>

      <!-- Botón de guardar -->
      <div class="col-12 d-flex justify-content-end">
        <button type="submit" class="btn btn-primary">
          Guardar Ajustes
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Settings {
  clinicName: string
  address: string
  contact: string
  hours: string
  days: string
  privacyPolicy: string
  logoFile: File | null
}

const settings = ref<Settings>({
  clinicName: '',
  address: '',
  contact: '',
  hours: '',
  days: '',
  privacyPolicy: '',
  logoFile: null
})

// Cargar ajustes iniciales (placeholder)
onMounted(() => {
  // Aquí cargarías desde tu AdminStore o API
})

// Guardar ajustes (placeholder)
function saveSettings() {
  // Aquí llamarías a tu store o API para guardar
  console.log('Ajustes guardados:', settings.value)
}

// Manejar selección de logo
function onLogoChange(e: Event) {
  const input = e.target as HTMLInputElement
  settings.value.logoFile = input.files?.[0] ?? null
}
</script>

<style src="@/assets/css/pages/admin/AdminSettings.css" scoped></style>
