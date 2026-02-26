<template>
  <section class="perfil-page">
    <header class="perfil-header">
      <div>
        <p class="eyebrow">Cuenta</p>
        <h1>Mi perfil</h1>
        <p class="subtitle">Mantén tus datos actualizados y cambia tu contraseña cuando lo necesites.</p>
      </div>
      <span class="role-pill">{{ authStore.userRole }}</span>
    </header>

    <div class="perfil-grid">
      <article class="card">
        <h2>Datos personales</h2>

        <form class="form-grid" @submit.prevent="handleSaveProfile">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="profileForm.nombre" type="text" required />
          </div>

          <div class="form-group">
            <label>Apellido *</label>
            <input v-model="profileForm.apellido" type="text" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="profileForm.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Fecha de nacimiento *</label>
            <input v-model="profileForm.fechaNacimiento" type="date" required />
          </div>

          <div class="form-group">
            <label>Tipo de documento *</label>
            <select v-model="profileForm.tipoDocumento" required>
              <option v-for="tipo in tiposDocumento" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Número de documento *</label>
            <input v-model="profileForm.numeroDocumento" type="text" required />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="profileForm.telefono" type="text" />
          </div>

          <div class="form-group full-width">
            <label>Buscar parroquia *</label>
            <div class="parroquias-search-wrapper">
              <input
                v-model="parroquiaSearchTerm"
                type="text"
                placeholder="Buscar por nombre de parroquia..."
                class="parroquias-search-input"
                @input="handleSearchParroquias"
              />

              <div v-if="showParroquiasResults" class="parroquias-results">
                <div
                  v-for="pq in parroquiasResultados"
                  :key="pq.id"
                  class="parroquias-result-item"
                  @click="handleSelectParroquia(pq)"
                >
                  <div class="parroquias-result-main">{{ pq.nombre }}</div>
                  <div class="parroquias-result-meta">
                    <span>{{ pq.canton?.nombre }}</span>
                    <span>{{ pq.canton?.provincia?.nombre }}</span>
                    <span>{{ pq.canton?.provincia?.pais?.nombre }}</span>
                  </div>
                </div>

                <div v-if="parroquiasResultados.length === 0 && parroquiaSearchTerm.length >= 2" class="parroquias-no-results">
                  No se encontraron parroquias
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedParroquiaData" class="form-group full-width parroquias-location-display">
            <div class="parroquias-location-item">
              <label>País</label>
              <span>{{ selectedParroquiaData.canton?.provincia?.pais?.nombre || '-' }}</span>
            </div>
            <div class="parroquias-location-item">
              <label>Provincia</label>
              <span>{{ selectedParroquiaData.canton?.provincia?.nombre || '-' }}</span>
            </div>
            <div class="parroquias-location-item">
              <label>Cantón</label>
              <span>{{ selectedParroquiaData.canton?.nombre || '-' }}</span>
            </div>
            <div class="parroquias-location-item">
              <label>Parroquia</label>
              <span>{{ selectedParroquiaData.nombre }}</span>
            </div>
          </div>

          <div class="form-group full-width" v-if="requiereEspecialidades">
            <label>
              Especialidades * {{ esProfesor ? '(máximo 2)' : '(puedes seleccionar varias)' }}
            </label>
            <div class="especialidades-checkboxes">
              <div
                v-for="especialidad in especialidades"
                :key="especialidad.id"
                class="checkbox-item"
              >
                <input
                  :id="`esp-${especialidad.id}`"
                  type="checkbox"
                  :value="especialidad.id"
                  :checked="profileForm.especialidadIds.includes(especialidad.id)"
                  :disabled="esProfesor && profileForm.especialidadIds.length >= 2 && !profileForm.especialidadIds.includes(especialidad.id)"
                  @change="handleEspecialidadToggle(especialidad.id)"
                />
                <label :for="`esp-${especialidad.id}`">{{ especialidad.nombre }}</label>
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Dirección</label>
            <textarea v-model="profileForm.direccion" rows="2" />
          </div>

          <div class="form-group full-width">
            <label>Notas adicionales</label>
            <textarea v-model="profileForm.NotasAdicionales" rows="3" />
          </div>

          <p v-if="profileError" class="error-text">{{ profileError }}</p>

          <div class="actions full-width">
            <button class="btn-primary" type="submit" :disabled="isSavingProfile">
              {{ isSavingProfile ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </article>

      <article class="card">
        <h2>Seguridad</h2>

        <form class="form-grid" @submit.prevent="handleChangePassword">
          <div class="form-group full-width">
            <label>Contraseña actual *</label>
            <input v-model="passwordForm.currentPassword" type="password" required />
          </div>

          <div class="form-group">
            <label>Nueva contraseña *</label>
            <input v-model="passwordForm.newPassword" type="password" required minlength="8" />
          </div>

          <div class="form-group">
            <label>Confirmar contraseña *</label>
            <input v-model="passwordForm.confirmPassword" type="password" required minlength="8" />
          </div>

          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>

          <div class="actions full-width">
            <button class="btn-primary" type="submit" :disabled="isSavingPassword">
              {{ isSavingPassword ? 'Actualizando...' : 'Cambiar contraseña' }}
            </button>
          </div>
        </form>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { useParroquiasSearch } from '@/composables/useParroquiasSearch'
import { useAuthStore } from '@/stores/auth'
import { usuariosService } from '@/services/Admin/usuarios.service'
import { especialidadesService } from '@/services/Admin/especialidades.service'
import { getErrorMessage } from '@/utils/errorHandler'
import { TipoDocumento, type UpdateUsuarioDto, type Usuario } from '@/types/usuarios.types'
import type { Especialidad } from '@/types/especialidades.types'
import '@/assets/styles/Perfil.css'

const toast = useToast()
const authStore = useAuthStore()
const {
  parroquiaSearchTerm,
  parroquiasResultados,
  showParroquiasResults,
  selectedParroquiaData,
  handleSearchParroquias,
  selectParroquia,
  loadParroquiaActual,
  reset: resetParroquiasSearch,
} = useParroquiasSearch()

const isSavingProfile = ref(false)
const isSavingPassword = ref(false)
const profileError = ref('')
const passwordError = ref('')
const especialidades = ref<Especialidad[]>([])
const tiposDocumento = Object.values(TipoDocumento)

const normalizedRole = computed(() => {
  return (authStore.userRole || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
})

const esEstudiante = computed(() => normalizedRole.value === 'ESTUDIANTE')
const esProfesor = computed(() => normalizedRole.value === 'PROFESOR' || normalizedRole.value === 'DOCENTE')
const requiereEspecialidades = computed(() => esEstudiante.value || esProfesor.value)

const profileForm = ref({
  nombre: '',
  apellido: '',
  email: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  tipoDocumento: TipoDocumento.CEDULA,
  numeroDocumento: '',
  parroquiaId: 0,
  especialidadIds: [] as number[],
  NotasAdicionales: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const hydrateProfileForm = (usuario: Usuario) => {
  profileForm.value = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    fechaNacimiento: usuario.fechaNacimiento?.slice(0, 10) || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    tipoDocumento: usuario.tipoDocumento,
    numeroDocumento: usuario.numeroDocumento,
    parroquiaId: usuario.parroquiaId || 0,
    especialidadIds: usuario.especialidades?.map((esp) => esp.id) || [],
    NotasAdicionales: usuario.NotasAdicionales || '',
  }
}

const loadProfile = async () => {
  if (!authStore.user?.id) return

  try {
    const usuario = await usuariosService.getById(authStore.user.id)
    hydrateProfileForm(usuario)
    // Cargar información de parroquia si existe
    if (usuario.parroquiaId && usuario.parroquia?.nombre) {
      await loadParroquiaActual(usuario.parroquiaId, usuario.parroquia.nombre)
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const loadEspecialidades = async () => {
  try {
    especialidades.value = await especialidadesService.getAll()
  } catch {
    toast.warning('No se pudo cargar el catálogo de especialidades')
  }
}

const handleEspecialidadToggle = (especialidadId: number) => {
  const index = profileForm.value.especialidadIds.indexOf(especialidadId)
  if (index > -1) {
    profileForm.value.especialidadIds.splice(index, 1)
  } else {
    // Si es profesor y ya tiene 2, no permitir
    if (esProfesor.value && profileForm.value.especialidadIds.length >= 2) {
      return
    }
    profileForm.value.especialidadIds.push(especialidadId)
  }
}

const handleSelectParroquia = (parroquia: any) => {
  selectParroquia(parroquia)
  profileForm.value.parroquiaId = parroquia.id
}

const handleSaveProfile = async () => {
  if (!authStore.user?.id) return

  profileError.value = ''
  isSavingProfile.value = true

  try {
    if (!profileForm.value.parroquiaId) {
      profileError.value = 'Debes seleccionar una parroquia válida'
      return
    }

    if (requiereEspecialidades.value && profileForm.value.especialidadIds.length === 0) {
      profileError.value = 'Debes seleccionar al menos una especialidad para tu rol'
      return
    }

    if (esProfesor.value && profileForm.value.especialidadIds.length > 2) {
      profileError.value = 'Para profesores/docentes solo se permiten máximo 2 especialidades'
      return
    }

    const payload: UpdateUsuarioDto = {
      nombre: profileForm.value.nombre.trim(),
      apellido: profileForm.value.apellido.trim(),
      email: profileForm.value.email.trim(),
      fechaNacimiento: profileForm.value.fechaNacimiento,
      telefono: profileForm.value.telefono.trim() || undefined,
      direccion: profileForm.value.direccion.trim() || undefined,
      tipoDocumento: profileForm.value.tipoDocumento,
      numeroDocumento: profileForm.value.numeroDocumento.trim(),
      parroquiaId: profileForm.value.parroquiaId || undefined,
      especialidadIds: requiereEspecialidades.value ? profileForm.value.especialidadIds : undefined,
      NotasAdicionales: profileForm.value.NotasAdicionales.trim() || undefined,
    }

    const updated = await usuariosService.update(authStore.user.id, payload)

    if (authStore.user) {
      authStore.user = {
        ...authStore.user,
        nombre: updated.nombre,
        apellido: updated.apellido,
        email: updated.email,
      }
      localStorage.setItem('user-data', JSON.stringify(authStore.user))
    }

    toast.success('Perfil actualizado correctamente')
  } catch (error) {
    profileError.value = getErrorMessage(error)
    toast.error(profileError.value)
  } finally {
    isSavingProfile.value = false
  }
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const handleChangePassword = async () => {
  if (!authStore.user?.id) return

  passwordError.value = ''

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'La confirmación de contraseña no coincide'
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'La nueva contraseña debe tener al menos 8 caracteres'
    return
  }

  isSavingPassword.value = true
  try {
    await usuariosService.changePassword(authStore.user.id, passwordForm.value)
    resetPasswordForm()
    toast.success('Contraseña actualizada correctamente')
  } catch (error) {
    passwordError.value = getErrorMessage(error)
    toast.error(passwordError.value)
  } finally {
    isSavingPassword.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadEspecialidades()])
})
</script>
