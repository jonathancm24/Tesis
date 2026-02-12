<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-container create-estudiante" @click.stop>
          <div class="modal-header">
            <h2>Crear nuevo estudiante</h2>
            <button class="btn-close" @click="handleClose" aria-label="Cerrar">×</button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="form-container">
              <!-- Sección 1: Datos personales -->
              <div class="form-section">
                <h3>📋 Datos personales</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="nombre">Nombre *</label>
                    <input
                      id="nombre"
                      v-model="formData.nombre"
                      type="text"
                      placeholder="Juan"
                      required
                    />
                    <small v-if="errors.nombre" class="error-text">{{ errors.nombre }}</small>
                  </div>

                  <div class="form-group">
                    <label for="apellido">Apellido *</label>
                    <input
                      id="apellido"
                      v-model="formData.apellido"
                      type="text"
                      placeholder="Pérez"
                      required
                    />
                    <small v-if="errors.apellido" class="error-text">{{ errors.apellido }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input
                      id="email"
                      v-model="formData.email"
                      type="email"
                      placeholder="juan.perez@ejemplo.com"
                      required
                    />
                    <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
                  </div>

                  <div class="form-group">
                    <label for="fechaNacimiento">Fecha de nacimiento *</label>
                    <input
                      id="fechaNacimiento"
                      v-model="formData.fechaNacimiento"
                      type="date"
                      required
                    />
                    <small v-if="errors.fechaNacimiento" class="error-text">{{ errors.fechaNacimiento }}</small>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="telefono">Teléfono</label>
                    <input
                      id="telefono"
                      v-model="formData.telefono"
                      type="tel"
                      placeholder="0999999999"
                    />
                  </div>

                  <div class="form-group">
                    <label for="direccion">Dirección</label>
                    <input
                      id="direccion"
                      v-model="formData.direccion"
                      type="text"
                      placeholder="Calle Principal 123"
                    />
                  </div>
                </div>
              </div>

              <!-- Sección 2: Documento -->
              <div class="form-section">
                <h3>🆔 Información de documento</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label for="tipoDocumento">Tipo de documento *</label>
                    <select id="tipoDocumento" v-model="formData.tipoDocumento" required>
                      <option value="">Seleccionar...</option>
                      <option value="CEDULA">Cédula de ciudadanía</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    <small v-if="errors.tipoDocumento" class="error-text">{{ errors.tipoDocumento }}</small>
                  </div>

                  <div class="form-group">
                    <label for="numeroDocumento">Número de documento *</label>
                    <input
                      id="numeroDocumento"
                      v-model="formData.numeroDocumento"
                      type="text"
                      placeholder="1712345678"
                      required
                    />
                    <small v-if="errors.numeroDocumento" class="error-text">{{ errors.numeroDocumento }}</small>
                  </div>
                </div>
              </div>

              <!-- Sección 3: Seguridad -->
              <div class="form-section">
                <h3>🔐 Seguridad</h3>

                <div class="form-row">
                  <div class="form-group">
                    <label for="password">Contraseña *</label>
                    <input
                      id="password"
                      v-model="formData.password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <small v-if="errors.password" class="error-text">{{ errors.password }}</small>
                    <small class="hint-text">Min. 8 caracteres</small>
                  </div>

                  <div class="form-group">
                    <label for="confirmPassword">Confirmar contraseña *</label>
                    <input
                      id="confirmPassword"
                      v-model="formData.confirmPassword"
                      type="password"
                      placeholder="Repite la contraseña"
                      required
                    />
                    <small v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</small>
                  </div>
                </div>
              </div>

              <!-- Estado general -->
              <div v-if="submitting" class="loading-state">
                <div class="loading-spinner-small"></div>
                <p>Creando estudiante...</p>
              </div>

              <!-- Errores generales -->
              <div v-if="generalError" class="error-banner">
                <p>{{ generalError }}</p>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button
              class="btn btn-secondary"
              @click="handleClose"
              :disabled="submitting"
            >
              Cancelar
            </button>

            <button
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="submitting"
            >
              {{ submitting ? 'Creando...' : 'Crear estudiante' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { estudiantesService } from '@/services/estudiantes/estudiantes.service'
import { getErrorMessage } from '@/utils/errorHandler'
import type { TipoDocumento } from '@/types/usuarios.types'
import '@/assets/styles/Profesor/components/CreateEstudianteModal.css'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Formulario reactivo
const formData = reactive({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  tipoDocumento: '' as TipoDocumento | '',
  numeroDocumento: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  tipoDocumento: '',
  numeroDocumento: '',
  password: '',
  confirmPassword: ''
})

const submitting = ref(false)
const generalError = ref<string | null>(null)

// Validar formulario
const validateForm = (): boolean => {
  let isValid = true

  // Limpiar errores
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  // Validaciones
  if (!formData.nombre || formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  }

  if (!formData.apellido || formData.apellido.trim().length < 2) {
    errors.apellido = 'El apellido debe tener al menos 2 caracteres'
    isValid = false
  }

  if (!formData.email || !formData.email.includes('@')) {
    errors.email = 'Por favor ingresa un email válido'
    isValid = false
  }

  if (!formData.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida'
    isValid = false
  }

  if (!formData.tipoDocumento) {
    errors.tipoDocumento = 'Selecciona un tipo de documento'
    isValid = false
  }

  if (!formData.numeroDocumento || formData.numeroDocumento.length < 8) {
    errors.numeroDocumento = 'El número de documento debe tener al menos 8 caracteres'
    isValid = false
  }

  if (!formData.password || formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

// Enviar formulario
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    generalError.value = null

    await estudiantesService.create({
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim(),
      fechaNacimiento: formData.fechaNacimiento,
      telefono: formData.telefono.trim() || undefined,
      direccion: formData.direccion.trim() || undefined,
      tipoDocumento: formData.tipoDocumento as TipoDocumento,
      numeroDocumento: formData.numeroDocumento.trim(),
      password: formData.password,
      activo: true
    })

    emit('success')
    handleClose()
  } catch (error) {
    generalError.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

// Cerrar modal
const handleClose = () => {
  if (!submitting.value) {
    resetForm()
    emit('close')
  }
}

// Resetear formulario
const resetForm = () => {
  formData.nombre = ''
  formData.apellido = ''
  formData.email = ''
  formData.fechaNacimiento = ''
  formData.telefono = ''
  formData.direccion = ''
  formData.tipoDocumento = '' as TipoDocumento | ''
  formData.numeroDocumento = ''
  formData.password = ''
  formData.confirmPassword = ''
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  generalError.value = null
}
</script>
