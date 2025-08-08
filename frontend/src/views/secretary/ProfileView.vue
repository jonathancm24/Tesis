<!-- Página de Perfil del Secretario -->
<template>
  <div class="secretary-profile">
    <!-- Header de la página -->
    <div class="page-header">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-user-tie me-3"></i>
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
              <i class="fas fa-user-tie me-2"></i>
              Secretario
            </p>
            <p class="profile-email">
              <i class="fas fa-envelope me-2"></i>
              {{ profile.email }}
            </p>
            
            <!-- Estado de la cuenta -->
            <div class="account-status">
              <span class="badge bg-success">
                <i class="fas fa-check-circle me-1"></i>
                Cuenta Activa
              </span>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="card">
          <div class="card-header">
            <h6 class="card-title mb-0">
              <i class="fas fa-info-circle me-2"></i>
              Información de Contacto
            </h6>
          </div>
          <div class="card-body">
            <div class="contact-info">
              <div class="info-item">
                <label>Teléfono:</label>
                <span>{{ profile.telefono || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <label>Cédula:</label>
                <span>{{ profile.cedula || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de Nacimiento:</label>
                <span>{{ formatDate(profile.fechaNacimiento) || 'No especificado' }}</span>
              </div>
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
                  <div class="col-md-6 mb-3">
                    <label for="nombre" class="form-label required">
                      <i class="fas fa-user me-2"></i>
                      Nombres
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.nombre }"
                      v-model="editForm.nombre"
                      placeholder="Ingresa tus nombres"
                    />
                    <div v-if="errors.nombre" class="invalid-feedback">
                      {{ errors.nombre }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="apellido" class="form-label required">
                      <i class="fas fa-user me-2"></i>
                      Apellidos
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.apellido }"
                      v-model="editForm.apellido"
                      placeholder="Ingresa tus apellidos"
                    />
                    <div v-if="errors.apellido" class="invalid-feedback">
                      {{ errors.apellido }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label required">
                      <i class="fas fa-envelope me-2"></i>
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      v-model="editForm.email"
                      placeholder="correo@ejemplo.com"
                    />
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="telefono" class="form-label">
                      <i class="fas fa-phone me-2"></i>
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': errors.telefono }"
                      v-model="editForm.telefono"
                      placeholder="+593 99 999 9999"
                    />
                    <div v-if="errors.telefono" class="invalid-feedback">
                      {{ errors.telefono }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información de identificación -->
              <div class="form-section">
                <h6 class="section-title">Información de Identificación</h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="cedula" class="form-label required">
                      <i class="fas fa-id-card me-2"></i>
                      Cédula de Identidad
                    </label>
                    <input
                      id="cedula"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.cedula }"
                      v-model="editForm.cedula"
                      placeholder="1234567890"
                    />
                    <div v-if="errors.cedula" class="invalid-feedback">
                      {{ errors.cedula }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="fechaNacimiento" class="form-label">
                      <i class="fas fa-calendar-alt me-2"></i>
                      Fecha de Nacimiento
                    </label>
                    <input
                      id="fechaNacimiento"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': errors.fechaNacimiento }"
                      v-model="editForm.fechaNacimiento"
                    />
                    <div v-if="errors.fechaNacimiento" class="invalid-feedback">
                      {{ errors.fechaNacimiento }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Información adicional -->
              <div class="form-section">
                <h6 class="section-title">Información Adicional</h6>
                <div class="row">
                  <div class="col-12 mb-3">
                    <label for="direccion" class="form-label">
                      <i class="fas fa-map-marker-alt me-2"></i>
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.direccion }"
                      v-model="editForm.direccion"
                      placeholder="Ingresa tu dirección completa"
                    />
                    <div v-if="errors.direccion" class="invalid-feedback">
                      {{ errors.direccion }}
                    </div>
                  </div>
                </div>

                <!-- Notas adicionales -->
                <div class="col-12 mb-3">
                  <label for="notasAdicionales" class="form-label">
                    <i class="fas fa-sticky-note me-2"></i>
                    Notas Adicionales
                  </label>
                  <textarea
                    id="notasAdicionales"
                    class="form-control"
                    :class="{ 'is-invalid': errors.NotasAdicionales }"
                    v-model="editForm.NotasAdicionales"
                    rows="3"
                    placeholder="Información adicional relevante..."
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
import { profileService } from '@/services/profileService'

const router = useRouter()

// Estados reactivos
const loading = ref(true)
const updating = ref(false)
const error = ref<string | null>(null)
const profile = ref<any>(null)

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

// Errores de validación
const errors = ref<Record<string, string>>({})

// ==================================================
// FUNCIONES DE CARGA DE DATOS
// ==================================================

async function loadProfile() {
  try {
    loading.value = true
    error.value = null
    
    const data = await profileService.getProfile()
    profile.value = data
    
    // Llenar formulario de edición
    editForm.nombre = data.nombre || ''
    editForm.apellido = data.apellido || ''
    editForm.email = data.email || ''
    editForm.telefono = data.telefono || ''
    editForm.cedula = data.cedula || ''
    editForm.fechaNacimiento = data.fechaNacimiento ? 
      new Date(data.fechaNacimiento).toISOString().split('T')[0] : ''
    editForm.direccion = data.direccion || ''
    editForm.NotasAdicionales = data.NotasAdicionales || ''
    editForm.parroquiaId = data.parroquiaId || ''
    
  } catch (err: any) {
    console.error('Error al cargar perfil:', err)
    error.value = 'Error al cargar la información del perfil'
  } finally {
    loading.value = false
  }
}

// ==================================================
// FUNCIONES DE ACTUALIZACIÓN
// ==================================================

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
// FUNCIONES AUXILIARES
// ==================================================

function resetForm() {
  if (profile.value) {
    editForm.nombre = profile.value.nombre || ''
    editForm.apellido = profile.value.apellido || ''
    editForm.email = profile.value.email || ''
    editForm.telefono = profile.value.telefono || ''
    editForm.cedula = profile.value.cedula || ''
    editForm.fechaNacimiento = profile.value.fechaNacimiento ? 
      new Date(profile.value.fechaNacimiento).toISOString().split('T')[0] : ''
    editForm.direccion = profile.value.direccion || ''
    editForm.NotasAdicionales = profile.value.NotasAdicionales || ''
    editForm.parroquiaId = profile.value.parroquiaId || ''
  }
  errors.value = {}
}

function formatDate(dateString: string | null) {
  if (!dateString) return null
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

function goBack() {
  router.go(-1)
}

function showToast(message: string, type: 'success' | 'error') {
  // Implementar sistema de toast o usar el existente
  console.log(`${type.toUpperCase()}: ${message}`)
}

// ==================================================
// CICLO DE VIDA
// ==================================================

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
/* =================================================
   VARIABLES Y LAYOUT PRINCIPAL
   ================================================= */
.secretary-profile {
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* =================================================
   HEADER DE LA PÁGINA
   ================================================= */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border-left: 4px solid #26c6da;
}

.page-title {
  color: #2c3e50;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.page-title i {
  color: #26c6da;
}

.page-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0;
}

/* =================================================
   TARJETA DE PERFIL
   ================================================= */
.profile-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.profile-avatar {
  margin-bottom: 1.5rem;
}

.profile-avatar i {
  font-size: 4rem;
  color: #26c6da;
}

.profile-name {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-role {
  color: #26c6da;
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.profile-email {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.account-status .badge {
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

/* =================================================
   INFORMACIÓN DE CONTACTO
   ================================================= */
.contact-info .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.contact-info .info-item:last-child {
  border-bottom: none;
}

.contact-info .info-item label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0;
}

.contact-info .info-item span {
  color: #6c757d;
  text-align: right;
}

/* =================================================
   FORMULARIO
   ================================================= */
.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card-header {
  background: linear-gradient(135deg, #26c6da 0%, #00acc1 100%);
  color: white;
  border-radius: 15px 15px 0 0 !important;
  border: none;
  padding: 1.5rem;
}

.card-title {
  font-weight: 600;
  font-size: 1.2rem;
}

.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  color: #26c6da;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #dc3545;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #26c6da;
  box-shadow: 0 0 0 0.2rem rgba(38, 198, 218, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* =================================================
   BOTONES DE ACCIÓN
   ================================================= */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f8f9fa;
  margin-top: 2rem;
}

.btn {
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #26c6da 0%, #00acc1 100%);
  border: none;
  box-shadow: 0 3px 10px rgba(38, 198, 218, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(38, 198, 218, 0.4);
}

.btn-outline-secondary {
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  transform: translateY(-1px);
}

.btn-outline-primary {
  border: 2px solid #26c6da;
  color: #26c6da;
}

.btn-outline-primary:hover {
  background-color: #26c6da;
  border-color: #26c6da;
  transform: translateY(-1px);
}

/* =================================================
   RESPONSIVE DESIGN
   ================================================= */
@media (max-width: 991.98px) {
  .page-header {
    padding: 1.5rem;
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

.secretary-profile {
  animation: fadeIn 0.5s ease;
}

/* =================================================
   ESTADOS DE CARGA
   ================================================= */
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
