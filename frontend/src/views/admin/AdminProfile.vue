<!-- Página de Perfil del Administrador -->
<template>
  <div class="admin-profile">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-user-cog me-3"></i>
            Mi Perfil
          </h1>
          <p class="page-subtitle text-muted">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
        <div class="col-auto">
          <button 
            class="btn btn-outline-primary"
            @click="goBack"
          >
            <i class="fas fa-arrow-left me-2"></i>
            Volver
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3 text-muted">Cargando información del perfil...</p>
    </div>

    <!-- Contenido del perfil -->
    <div v-else-if="profile" class="row">
      <!-- Información básica -->
      <div class="col-lg-4">
        <div class="card profile-card">
          <div class="card-body text-center">
            <!-- Avatar -->
            <div class="profile-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            
            <!-- Información básica -->
            <h4 class="profile-name">
              {{ profile.nombre }} {{ profile.apellido }}
            </h4>
            <p class="profile-role">
              <i class="fas fa-shield-alt me-2"></i>
              {{ profile.role?.nombre || 'Sin rol asignado' }}
            </p>
            <p class="profile-email">
              <i class="fas fa-envelope me-2"></i>
              {{ profile.email }}
            </p>
            
            <!-- Estado de la cuenta -->
            <div class="profile-status">
              <span :class="['badge', profile.activo ? 'bg-success' : 'bg-danger']">
                <i :class="['fas', profile.activo ? 'fa-check-circle' : 'fa-times-circle']" class="me-1"></i>
                {{ profile.activo ? 'Cuenta Activa' : 'Cuenta Inactiva' }}
              </span>
            </div>

            <!-- Fecha de registro -->
            <div class="profile-register-date mt-3">
              <small class="text-muted">
                <i class="fas fa-calendar-alt me-1"></i>
                Miembro desde {{ formatDate(profile.fechaRegistro) }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de edición -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-edit me-2"></i>
              Editar Información Personal
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <!-- Información personal -->
              <div class="form-section">
                <h6 class="section-title">Información Personal</h6>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="nombre" class="form-label">
                        <i class="fas fa-user me-1"></i>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="nombre"
                        v-model="editForm.nombre"
                        :class="{ 'is-invalid': errors.nombre }"
                        required
                      >
                      <div v-if="errors.nombre" class="invalid-feedback">
                        {{ errors.nombre }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="apellido" class="form-label">
                        <i class="fas fa-user me-1"></i>
                        Apellido *
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="apellido"
                        v-model="editForm.apellido"
                        :class="{ 'is-invalid': errors.apellido }"
                        required
                      >
                      <div v-if="errors.apellido" class="invalid-feedback">
                        {{ errors.apellido }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="cedula" class="form-label">
                        <i class="fas fa-id-card me-1"></i>
                        Cédula *
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="cedula"
                        v-model="editForm.cedula"
                        :class="{ 'is-invalid': errors.cedula }"
                        required
                      >
                      <div v-if="errors.cedula" class="invalid-feedback">
                        {{ errors.cedula }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="fechaNacimiento" class="form-label">
                        <i class="fas fa-birthday-cake me-1"></i>
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        class="form-control"
                        id="fechaNacimiento"
                        v-model="editForm.fechaNacimiento"
                        :class="{ 'is-invalid': errors.fechaNacimiento }"
                        required
                      >
                      <div v-if="errors.fechaNacimiento" class="invalid-feedback">
                        {{ errors.fechaNacimiento }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información de contacto -->
              <div class="form-section">
                <h6 class="section-title">Información de Contacto</h6>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="email" class="form-label">
                        <i class="fas fa-envelope me-1"></i>
                        Email *
                      </label>
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        v-model="editForm.email"
                        :class="{ 'is-invalid': errors.email }"
                        required
                      >
                      <div v-if="errors.email" class="invalid-feedback">
                        {{ errors.email }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="telefono" class="form-label">
                        <i class="fas fa-phone me-1"></i>
                        Teléfono
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="telefono"
                        v-model="editForm.telefono"
                        :class="{ 'is-invalid': errors.telefono }"
                      >
                      <div v-if="errors.telefono" class="invalid-feedback">
                        {{ errors.telefono }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="direccion" class="form-label">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    Dirección
                  </label>
                  <textarea
                    class="form-control"
                    id="direccion"
                    v-model="editForm.direccion"
                    rows="3"
                    :class="{ 'is-invalid': errors.direccion }"
                  ></textarea>
                  <div v-if="errors.direccion" class="invalid-feedback">
                    {{ errors.direccion }}
                  </div>
                </div>
              </div>

              <!-- Ubicación geográfica -->
              <div class="form-section">
                <h6 class="section-title">Ubicación Geográfica</h6>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="pais" class="form-label">
                        <i class="fas fa-globe me-1"></i>
                        País
                      </label>
                      <select
                        class="form-select"
                        id="pais"
                        v-model="selectedPais"
                        @change="onPaisChange"
                      >
                        <option value="">Seleccionar país</option>
                        <option
                          v-for="pais in paises"
                          :key="pais.id"
                          :value="pais.id"
                        >
                          {{ pais.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="provincia" class="form-label">
                        <i class="fas fa-map me-1"></i>
                        Provincia
                      </label>
                      <select
                        class="form-select"
                        id="provincia"
                        v-model="selectedProvincia"
                        @change="onProvinciaChange"
                        :disabled="!selectedPais"
                      >
                        <option value="">Seleccionar provincia</option>
                        <option
                          v-for="provincia in provincias"
                          :key="provincia.id"
                          :value="provincia.id"
                        >
                          {{ provincia.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="canton" class="form-label">
                        <i class="fas fa-map-marker me-1"></i>
                        Cantón
                      </label>
                      <select
                        class="form-select"
                        id="canton"
                        v-model="selectedCanton"
                        @change="onCantonChange"
                        :disabled="!selectedProvincia"
                      >
                        <option value="">Seleccionar cantón</option>
                        <option
                          v-for="canton in cantones"
                          :key="canton.id"
                          :value="canton.id"
                        >
                          {{ canton.nombre }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="parroquia" class="form-label">
                        <i class="fas fa-home me-1"></i>
                        Parroquia
                      </label>
                      <select
                        class="form-select"
                        id="parroquia"
                        v-model="editForm.parroquiaId"
                        :disabled="!selectedCanton"
                        :class="{ 'is-invalid': errors.parroquiaId }"
                      >
                        <option value="">Seleccionar parroquia</option>
                        <option
                          v-for="parroquia in parroquias"
                          :key="parroquia.id"
                          :value="parroquia.id"
                        >
                          {{ parroquia.nombre }}
                        </option>
                      </select>
                      <div v-if="errors.parroquiaId" class="invalid-feedback">
                        {{ errors.parroquiaId }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div class="form-section">
                <h6 class="section-title">Información Adicional</h6>
                <div class="mb-3">
                  <label for="notasAdicionales" class="form-label">
                    <i class="fas fa-sticky-note me-1"></i>
                    Notas Adicionales
                  </label>
                  <textarea
                    class="form-control"
                    id="notasAdicionales"
                    v-model="editForm.NotasAdicionales"
                    rows="4"
                    placeholder="Información adicional, comentarios, etc."
                    :class="{ 'is-invalid': errors.NotasAdicionales }"
                  ></textarea>
                  <div v-if="errors.NotasAdicionales" class="invalid-feedback">
                    {{ errors.NotasAdicionales }}
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="updating"
                >
                  <i v-if="updating" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-save me-2"></i>
                  {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary ms-2"
                  @click="resetForm"
                  :disabled="updating"
                >
                  <i class="fas fa-undo me-2"></i>
                  Restaurar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Cambio de Contraseña -->
    <div v-if="!loading && profile" class="row mt-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="fas fa-lock me-2"></i>
              Seguridad
            </h5>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="togglePasswordForm"
            >
              <i :class="showPasswordForm ? 'fas fa-eye-slash' : 'fas fa-key'" class="me-1"></i>
              {{ showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña' }}
            </button>
          </div>
          
          <!-- Formulario de cambio de contraseña -->
          <div v-if="showPasswordForm" class="card-body">
            <form @submit.prevent="changePassword">
              <div class="row">
                <!-- Contraseña actual -->
                <div class="col-12 mb-3">
                  <label for="currentPassword" class="form-label required">
                    <i class="fas fa-unlock-alt me-2"></i>
                    Contraseña Actual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.currentPassword }"
                    v-model="passwordForm.currentPassword"
                    placeholder="Ingresa tu contraseña actual"
                    autocomplete="current-password"
                  />
                  <div v-if="passwordErrors.currentPassword" class="invalid-feedback">
                    {{ passwordErrors.currentPassword }}
                  </div>
                </div>

                <!-- Nueva contraseña -->
                <div class="col-md-6 mb-3">
                  <label for="newPassword" class="form-label required">
                    <i class="fas fa-key me-2"></i>
                    Nueva Contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.newPassword }"
                    v-model="passwordForm.newPassword"
                    placeholder="Ingresa la nueva contraseña"
                    autocomplete="new-password"
                  />
                  <div v-if="passwordErrors.newPassword" class="invalid-feedback">
                    {{ passwordErrors.newPassword }}
                  </div>
                  <div class="form-text">
                    <small>
                      <i class="fas fa-info-circle me-1"></i>
                      La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos especiales.
                    </small>
                  </div>
                </div>

                <!-- Confirmar nueva contraseña -->
                <div class="col-md-6 mb-3">
                  <label for="confirmPassword" class="form-label required">
                    <i class="fas fa-shield-alt me-2"></i>
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordErrors.confirmPassword }"
                    v-model="passwordForm.confirmPassword"
                    placeholder="Confirma la nueva contraseña"
                    autocomplete="new-password"
                  />
                  <div v-if="passwordErrors.confirmPassword" class="invalid-feedback">
                    {{ passwordErrors.confirmPassword }}
                  </div>
                </div>
              </div>

              <!-- Botones de acción para contraseña -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-warning"
                  :disabled="updatingPassword"
                >
                  <i v-if="updatingPassword" class="fas fa-spinner fa-spin me-2"></i>
                  <i v-else class="fas fa-lock me-2"></i>
                  {{ updatingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary ms-2"
                  @click="togglePasswordForm"
                  :disabled="updatingPassword"
                >
                  <i class="fas fa-times me-2"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
          
          <!-- Información de seguridad cuando no se muestra el formulario -->
          <div v-else class="card-body">
            <div class="d-flex align-items-center text-muted">
              <i class="fas fa-shield-check fs-4 me-3 text-success"></i>
              <div>
                <p class="mb-1">Tu cuenta está protegida con contraseña</p>
                <small>Última actualización de contraseña: Información no disponible</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { profileService } from '@//services/profileService'
import { baseDataService } from '@/services/baseDataService'
import { showToast } from '@/utils/toast'
import type { PerfilResponse } from '@//types/profile'
import type { Pais, Provincia, Canton, Parroquia } from '@/types/baseData'

const router = useRouter()

// Estado reactivo
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const profile = ref<PerfilResponse | null>(null)

// Datos geográficos
const paises = ref<Pais[]>([])
const provincias = ref<Provincia[]>([])
const cantones = ref<Canton[]>([])
const parroquias = ref<Parroquia[]>([])

// Selecciones geográficas
const selectedPais = ref<number | ''>('')
const selectedProvincia = ref<number | ''>('')
const selectedCanton = ref<number | ''>('')

// Formulario de edición
const editForm = reactive({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  cedula: '',
  fechaNacimiento: '',
  direccion: '',
  NotasAdicionales: '',
  parroquiaId: '' as number | ''
})

// Formulario de cambio de contraseña
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Estados de carga
const updatingPassword = ref(false)
const showPasswordForm = ref(false)

// Errores de validación
const errors = ref<Record<string, string>>({})
const passwordErrors = ref<Record<string, string>>({})

// Computed para formatear fechas
const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  await loadProfile()
  await loadPaises()
})

// Funciones
async function loadProfile() {
  try {
    loading.value = true
    const data = await profileService.getProfile()
    profile.value = data
    
    // Llenar el formulario con los datos actuales
    editForm.nombre = data.nombre
    editForm.apellido = data.apellido
    editForm.email = data.email
    editForm.telefono = data.telefono || ''
    editForm.cedula = data.cedula
    editForm.fechaNacimiento = new Date(data.fechaNacimiento).toISOString().split('T')[0]
    editForm.direccion = data.direccion || ''
    editForm.NotasAdicionales = data.NotasAdicionales || ''
    editForm.parroquiaId = data.parroquiaId || ''

    // Si tiene parroquia, cargar la jerarquía geográfica
    if (data.parroquia) {
      selectedPais.value = data.parroquia.canton.provincia.pais.id
      await onPaisChange()
      selectedProvincia.value = data.parroquia.canton.provincia.id
      await onProvinciaChange()
      selectedCanton.value = data.parroquia.canton.id
      await onCantonChange()
    }
  } catch (err: any) {
    error.value = 'Error al cargar el perfil: ' + (err.message || err)
    showToast('Error al cargar el perfil', 'error')
  } finally {
    loading.value = false
  }
}

async function loadPaises() {
  try {
    paises.value = await baseDataService.getPaises()
  } catch (err: any) {
    console.error('Error al cargar países:', err)
  }
}

async function onPaisChange() {
  if (selectedPais.value) {
    try {
      provincias.value = await baseDataService.getProvinciasByPais(selectedPais.value as number)
      cantones.value = []
      parroquias.value = []
      selectedProvincia.value = ''
      selectedCanton.value = ''
      editForm.parroquiaId = ''
    } catch (err: any) {
      console.error('Error al cargar provincias:', err)
    }
  } else {
    provincias.value = []
    cantones.value = []
    parroquias.value = []
    selectedProvincia.value = ''
    selectedCanton.value = ''
    editForm.parroquiaId = ''
  }
}

async function onProvinciaChange() {
  if (selectedProvincia.value) {
    try {
      cantones.value = await baseDataService.getCantonesByProvincia(selectedProvincia.value as number)
      parroquias.value = []
      selectedCanton.value = ''
      editForm.parroquiaId = ''
    } catch (err: any) {
      console.error('Error al cargar cantones:', err)
    }
  } else {
    cantones.value = []
    parroquias.value = []
    selectedCanton.value = ''
    editForm.parroquiaId = ''
  }
}

async function onCantonChange() {
  if (selectedCanton.value) {
    try {
      parroquias.value = await baseDataService.getParroquiasByCanton(selectedCanton.value as number)
      editForm.parroquiaId = ''
    } catch (err: any) {
      console.error('Error al cargar parroquias:', err)
    }
  } else {
    parroquias.value = []
    editForm.parroquiaId = ''
  }
}

async function updateProfile() {
  try {
    updating.value = true
    errors.value = {}

    // Validar campos requeridos
    if (!editForm.nombre.trim()) {
      errors.value.nombre = 'El nombre es requerido'
    }
    if (!editForm.apellido.trim()) {
      errors.value.apellido = 'El apellido es requerido'
    }
    if (!editForm.email.trim()) {
      errors.value.email = 'El email es requerido'
    }
    if (!editForm.cedula.trim()) {
      errors.value.cedula = 'La cédula es requerida'
    }
    if (!editForm.fechaNacimiento) {
      errors.value.fechaNacimiento = 'La fecha de nacimiento es requerida'
    }

    if (Object.keys(errors.value).length > 0) {
      return
    }

    // Preparar datos para enviar
    const updateData = {
      ...editForm,
      parroquiaId: editForm.parroquiaId || undefined
    }

    await profileService.updateProfile(updateData)
    await loadProfile() // Recargar datos actualizados
    
    showToast('Perfil actualizado correctamente', 'success')
  } catch (err: any) {
    console.error('Error al actualizar perfil:', err)
    
    if (err.message?.includes('email')) {
      errors.value.email = 'El email ya está en uso por otro usuario'
    } else if (err.message?.includes('cedula')) {
      errors.value.cedula = 'La cédula ya está en uso por otro usuario'
    } else {
      showToast('Error al actualizar el perfil: ' + (err.message || err), 'error')
    }
  } finally {
    updating.value = false
  }
}

// ==================================================
// FUNCIONES DE CAMBIO DE CONTRASEÑA
// ==================================================

function validatePassword(password: string): string[] {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un símbolo especial')
  }
  
  return errors
}

async function changePassword() {
  try {
    updatingPassword.value = true
    passwordErrors.value = {}

    // Validar campos requeridos
    if (!passwordForm.currentPassword.trim()) {
      passwordErrors.value.currentPassword = 'La contraseña actual es requerida'
    }
    
    if (!passwordForm.newPassword.trim()) {
      passwordErrors.value.newPassword = 'La nueva contraseña es requerida'
    } else {
      // Validar fortaleza de la nueva contraseña
      const passwordValidationErrors = validatePassword(passwordForm.newPassword)
      if (passwordValidationErrors.length > 0) {
        passwordErrors.value.newPassword = passwordValidationErrors[0]
      }
    }
    
    if (!passwordForm.confirmPassword.trim()) {
      passwordErrors.value.confirmPassword = 'La confirmación de contraseña es requerida'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordErrors.value.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (Object.keys(passwordErrors.value).length > 0) {
      return
    }

    await profileService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })

    // Limpiar formulario
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showPasswordForm.value = false
    
    showToast('Contraseña cambiada correctamente', 'success')
  } catch (err: any) {
    console.error('Error al cambiar contraseña:', err)
    
    if (err.message?.includes('actual') || err.message?.includes('current')) {
      passwordErrors.value.currentPassword = 'La contraseña actual es incorrecta'
    } else {
      showToast('Error al cambiar la contraseña: ' + (err.message || err), 'error')
    }
  } finally {
    updatingPassword.value = false
  }
}

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
  if (!showPasswordForm.value) {
    // Limpiar formulario al cerrar
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordErrors.value = {}
  }
}

function resetForm() {
  if (profile.value) {
    editForm.nombre = profile.value.nombre
    editForm.apellido = profile.value.apellido
    editForm.email = profile.value.email
    editForm.telefono = profile.value.telefono || ''
    editForm.cedula = profile.value.cedula
    editForm.fechaNacimiento = new Date(profile.value.fechaNacimiento).toISOString().split('T')[0]
    editForm.direccion = profile.value.direccion || ''
    editForm.NotasAdicionales = profile.value.NotasAdicionales || ''
    editForm.parroquiaId = profile.value.parroquiaId || ''
    
    errors.value = {}
    showToast('Formulario restaurado', 'info')
  }
}

function goBack() {
  router.push({ name: 'HomeAdmin' })
}
</script>

<style scoped>
/* =================================================
   VARIABLES Y TEMA
   ================================================= */
.admin-profile {
  --primary-green: #81c784;
  --primary-red: #e57373;
  --soft-green: #c8e6c9;
  --soft-blue: #bbdefb;
  --light-gray: #fafafa;
  --border-light: #e0e0e0;
  --shadow-light: rgba(0, 0, 0, 0.1);
}

/* =================================================
   HEADER DE LA PÁGINA
   ================================================= */
.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--soft-green);
}

.page-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.page-title i {
  color: var(--primary-green);
}

.page-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0;
}

/* =================================================
   TARJETA DE PERFIL
   ================================================= */
.profile-card {
  box-shadow: 0 4px 6px var(--shadow-light);
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.profile-avatar {
  margin-bottom: 1.5rem;
}

.profile-avatar i {
  font-size: 5rem;
  color: var(--primary-green);
}

.profile-name {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-role {
  color: var(--primary-green);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.profile-email {
  color: #666;
  margin-bottom: 1rem;
}

.profile-status {
  margin-bottom: 1rem;
}

.profile-register-date {
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

/* =================================================
   FORMULARIO
   ================================================= */
.card {
  box-shadow: 0 4px 6px var(--shadow-light);
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, var(--soft-green) 0%, #e8f5e9 100%);
  border-bottom: none;
  padding: 1.25rem 1.5rem;
}

.card-title {
  color: #2e7d32;
  font-weight: 600;
}

.card-body {
  padding: 2rem;
}

/* Secciones del formulario */
.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 1.5rem;
}

.section-title {
  color: var(--primary-green);
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--soft-green);
}

/* Estilos de formulario */
.form-label {
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
}

.form-label i {
  color: var(--primary-green);
  width: 16px;
}

.form-control,
.form-select {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary-green);
  box-shadow: 0 0 0 0.2rem rgba(129, 199, 132, 0.25);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: var(--primary-red);
}

.invalid-feedback {
  color: var(--primary-red);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* =================================================
   BOTONES DE ACCIÓN
   ================================================= */
.form-actions {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--primary-green);
  border-color: var(--primary-green);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #66bb6a;
  border-color: #66bb6a;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(129, 199, 132, 0.3);
}

.btn-primary:disabled {
  background: #cccccc;
  border-color: #cccccc;
  transform: none;
  box-shadow: none;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  border-color: #6c757d;
  transform: translateY(-1px);
}

.btn-outline-primary {
  color: var(--primary-green);
  border-color: var(--primary-green);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: var(--primary-green);
  border-color: var(--primary-green);
  transform: translateY(-1px);
}

/* =================================================
   RESPONSIVE DESIGN
   ================================================= */
@media (max-width: 991.98px) {
  .page-header .row {
    text-align: center;
  }
  
  .page-header .col-auto {
    margin-top: 1rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .form-actions {
    justify-content: center;
  }
}

@media (max-width: 767.98px) {
  .card-body {
    padding: 1rem;
  }
  
  .form-section {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}

/* =================================================
   ANIMACIONES
   ================================================= */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-profile {
  animation: fadeIn 0.5s ease;
}

/* =================================================
   ESTADOS DE CARGA
   ================================================= */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 4px var(--shadow-light);
}
</style>
