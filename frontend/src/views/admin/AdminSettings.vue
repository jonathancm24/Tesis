<!-- Ruta: /admin/settings  - Archivo: src/views/admin/AdminSettings.vue -->
<template>
  <section class="admin-settings container-xxl py-4">
    <!-- Encabezado -->
    <div class="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="mb-1 text-primary fw-bold d-flex align-items-center gap-2">
          <i class="fas fa-sliders-h"></i> Ajustes del Sistema
        </h1>
        <p class="text-muted mb-0">Configura información general, horarios, seguridad y notificaciones.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="resetForm">
          <i class="fas fa-undo"></i> Restablecer
        </button>
        <button type="button" class="btn btn-primary" @click="saveSettings" :disabled="saving">
          <i :class="['me-1', saving ? 'fas fa-spinner fa-spin' : 'fas fa-save']"></i>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Columna principal -->
      <div class="col-12 col-lg-8">
        <!-- Tarjeta: Información de la Clínica -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-hospital"></i>
            <h5 class="mb-0">Información de la Clínica</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label for="clinicName" class="form-label">Nombre de la Clínica <span class="text-danger">*</span></label>
                <input
                  id="clinicName"
                  v-model.trim="form.clinicName"
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touched.clinicName && !form.clinicName}"
                  required
                />
                <div class="invalid-feedback">El nombre es obligatorio.</div>
              </div>

              <div class="col-12 col-md-6">
                <label for="contact" class="form-label">Contacto (teléfono o email) <span class="text-danger">*</span></label>
                <input
                  id="contact"
                  v-model.trim="form.contact"
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touched.contact && !form.contact}"
                  required
                />
                <div class="invalid-feedback">El contacto es obligatorio.</div>
              </div>

              <div class="col-12">
                <label for="address" class="form-label">Dirección <span class="text-danger">*</span></label>
                <input
                  id="address"
                  v-model.trim="form.address"
                  type="text"
                  class="form-control"
                  :class="{'is-invalid': touched.address && !form.address}"
                  required
                />
                <div class="invalid-feedback">La dirección es obligatoria.</div>
              </div>

              <div class="col-12 col-md-6">
                <label for="logo" class="form-label">Logo de la Clínica</label>
                <input
                  id="logo"
                  type="file"
                  class="form-control"
                  accept="image/*"
                  @change="onLogoChange"
                />
                <small class="text-muted">PNG/JPG, máx. 1MB</small>
              </div>

              <div class="col-12 col-md-6 d-flex align-items-end">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="showLogo" v-model="form.brand.showLogo">
                  <label class="form-check-label" for="showLogo">Mostrar logo en el login y encabezados</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Horarios y Turnos -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-calendar-day"></i>
            <h5 class="mb-0">Horarios y Turnos</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label for="hours" class="form-label">Horas de Atención</label>
                <input
                  id="hours"
                  v-model.trim="form.hours"
                  type="text"
                  class="form-control"
                  placeholder="Ej. Lun–Vie 8:00–17:00"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="days" class="form-label">Días Hábiles</label>
                <input
                  id="days"
                  v-model.trim="form.days"
                  type="text"
                  class="form-control"
                  placeholder="Ej. Lun, Mar, Mié..."
                />
              </div>

              <div class="col-12 col-md-6">
                <label for="slotMinutes" class="form-label">Duración de turnos (min)</label>
                <input
                  id="slotMinutes"
                  v-model.number="form.schedule.slotMinutes"
                  type="number"
                  min="10"
                  step="5"
                  class="form-control"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="maxPerDay" class="form-label">Citas máx. por día</label>
                <input
                  id="maxPerDay"
                  v-model.number="form.schedule.maxAppointmentsPerDay"
                  type="number"
                  min="1"
                  step="1"
                  class="form-control"
                />
              </div>

              <div class="col-12">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="allowOverlaps" v-model="form.schedule.allowOverlaps">
                  <label class="form-check-label" for="allowOverlaps">
                    Permitir traslape de citas (solo admin/secretaría)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Notificaciones -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-bell"></i>
            <h5 class="mb-0">Notificaciones</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="notifEmail" v-model="form.notifications.email.enabled">
                  <label class="form-check-label" for="notifEmail">Correo electrónico</label>
                </div>
                <input
                  v-model.trim="form.notifications.email.from"
                  type="email"
                  class="form-control mt-2"
                  placeholder="Remitente (ej. clínica@dominio.com)"
                  :disabled="!form.notifications.email.enabled"
                />
              </div>
              <div class="col-12 col-md-6">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="notifSms" v-model="form.notifications.sms.enabled">
                  <label class="form-check-label" for="notifSms">SMS</label>
                </div>
                <input
                  v-model.trim="form.notifications.sms.gateway"
                  type="text"
                  class="form-control mt-2"
                  placeholder="Proveedor/Token"
                  :disabled="!form.notifications.sms.enabled"
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label">Recordatorios de cita</label>
                <select class="form-select" v-model="form.notifications.reminders">
                  <option :value="0">Sin recordatorio</option>
                  <option :value="12">12 horas antes</option>
                  <option :value="24">24 horas antes</option>
                  <option :value="48">48 horas antes</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label" for="notifTemplate">Plantilla base de notificación</label>
                <textarea id="notifTemplate" v-model="form.notifications.template" rows="3" class="form-control"
                  placeholder="Hola {nombre}, te recordamos tu cita el {fecha} a las {hora}..."></textarea>
                <small class="text-muted">Variables: {nombre}, {fecha}, {hora}, {profesional}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Seguridad -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-shield-alt"></i>
            <h5 class="mb-0">Seguridad</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label" for="jwtExpires">Duración de sesión (JWT)</label>
                <select id="jwtExpires" class="form-select" v-model="form.security.jwtExpires">
                  <option value="30m">30 minutos</option>
                  <option value="2h">2 horas</option>
                  <option value="8h">8 horas</option>
                  <option value="1d">1 día</option>
                  <option value="7d">7 días</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label" for="pwdMinLength">Mínimo de caracteres contraseña</label>
                <input id="pwdMinLength" type="number" min="6" class="form-control" v-model.number="form.security.passwordMinLength"/>
              </div>

              <div class="col-12">
                <div class="row g-3">
                  <div class="col-6 col-md-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="pwdUpper" v-model="form.security.requireUppercase">
                      <label class="form-check-label" for="pwdUpper">Mayúscula</label>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="pwdNumber" v-model="form.security.requireNumber">
                      <label class="form-check-label" for="pwdNumber">Número</label>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="pwdSymbol" v-model="form.security.requireSymbol">
                      <label class="form-check-label" for="pwdSymbol">Símbolo</label>
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="twoFA" v-model="form.security.enable2FA">
                      <label class="form-check-label" for="twoFA">2FA (código por email)</label>
                    </div>
                  </div>
                </div>
                <small class="text-muted d-block mt-1">
                  Requisito actual: {{ passwordPolicyText }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Apariencia & Localización -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-paint-brush"></i>
            <h5 class="mb-0">Apariencia & Localización</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label">Tema</label>
                <select class="form-select" v-model="form.ui.theme">
                  <option value="system">Sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label">Zona horaria</label>
                <select class="form-select" v-model="form.locale.timezone">
                  <option value="America/Guayaquil">America/Guayaquil</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label">Idioma</label>
                <select class="form-select" v-model="form.locale.lang">
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>

              <div class="col-12">
                <label for="privacy" class="form-label">Política de Privacidad</label>
                <textarea
                  id="privacy"
                  v-model="form.privacyPolicy"
                  rows="4"
                  class="form-control"
                  :maxlength="2000"
                ></textarea>
                <div class="text-end small text-muted mt-1">
                  {{ form.privacyPolicy.length }}/2000
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta: Mantenimiento -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-tools"></i>
            <h5 class="mb-0">Mantenimiento</h5>
          </div>
          <div class="card-body">
            <div class="row g-3 align-items-center">
              <div class="col-12 col-md-6">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="maintenance" v-model="form.maintenance.enabled">
                  <label class="form-check-label" for="maintenance">Habilitar modo mantenimiento</label>
                </div>
              </div>
              <div class="col-12 col-md-6" v-if="form.maintenance.enabled">
                <input type="text" class="form-control" v-model.trim="form.maintenance.message" placeholder="Mensaje para usuarios"/>
                <small class="text-muted">Ej: “Estamos actualizando el sistema. Volvemos pronto.”</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna lateral: Vista previa -->
      <div class="col-12 col-lg-4">
        <div class="card shadow-sm sticky-lg-top preview-card">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-eye"></i>
            <h6 class="mb-0">Vista Previa</h6>
          </div>
          <div class="card-body">
            <div class="preview-brand d-flex align-items-center gap-3 mb-3">
              <div class="logo-wrapper" v-if="form.brand.showLogo && logoPreviewUrl">
                <img :src="logoPreviewUrl" alt="Logo" />
              </div>
              <div>
                <div class="fw-bold">{{ form.clinicName || 'Nombre de la clínica' }}</div>
                <div class="text-muted small">{{ form.address || 'Dirección...' }}</div>
                <div class="text-muted small">{{ form.contact || 'Contacto...' }}</div>
              </div>
            </div>

            <ul class="list-unstyled small mb-3">
              <li><i class="fas fa-clock me-2 text-primary"></i>{{ form.hours || 'Sin horario' }}</li>
              <li><i class="fas fa-calendar me-2 text-primary"></i>{{ form.days || 'Sin días configurados' }}</li>
              <li>
                <i class="fas fa-bell me-2 text-primary"></i>
                Notif: 
                <span v-if="form.notifications.email.enabled">Email</span>
                <span v-if="form.notifications.email.enabled && form.notifications.sms.enabled"> · </span>
                <span v-if="form.notifications.sms.enabled">SMS</span>
                <span v-if="!form.notifications.email.enabled && !form.notifications.sms.enabled">—</span>
              </li>
              <li><i class="fas fa-shield-alt me-2 text-primary"></i>JWT: {{ form.security.jwtExpires }}</li>
              <li><i class="fas fa-language me-2 text-primary"></i>{{ form.locale.lang }} · {{ form.locale.timezone }}</li>
            </ul>

            <div class="alert p-2" :class="form.maintenance.enabled ? 'alert-warning' : 'alert-success'">
              <i :class="form.maintenance.enabled ? 'fas fa-exclamation-triangle me-1' : 'fas fa-check me-1'"></i>
              {{ form.maintenance.enabled ? 'Modo mantenimiento activo' : 'Sistema operativo' }}
            </div>

            <button type="button" class="btn w-100 btn-outline-primary" @click="saveSettings" :disabled="saving">
              <i class="fas fa-save me-1"></i> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

type Theme = 'system' | 'light' | 'dark'

interface Settings {
  clinicName: string
  address: string
  contact: string
  hours: string
  days: string
  privacyPolicy: string
  brand: { showLogo: boolean }
  schedule: { slotMinutes: number; maxAppointmentsPerDay: number; allowOverlaps: boolean }
  notifications: {
    email: { enabled: boolean; from: string }
    sms: { enabled: boolean; gateway: string }
    reminders: 0 | 12 | 24 | 48
    template: string
  }
  security: {
    jwtExpires: '30m'|'2h'|'8h'|'1d'|'7d'
    passwordMinLength: number
    requireUppercase: boolean
    requireNumber: boolean
    requireSymbol: boolean
    enable2FA: boolean
  }
  ui: { theme: Theme }
  locale: { timezone: string; lang: 'es'|'en' }
  maintenance: { enabled: boolean; message: string }
}

const saving = ref(false)
const touched = reactive<Record<string, boolean>>({
  clinicName: false,
  address: false,
  contact: false
})

const form = reactive<Settings>({
  clinicName: '',
  address: '',
  contact: '',
  hours: 'Lun–Vie 08:00–17:00',
  days: 'Lun, Mar, Mié, Jue, Vie',
  privacyPolicy: '',
  brand: { showLogo: true },
  schedule: { slotMinutes: 30, maxAppointmentsPerDay: 50, allowOverlaps: false },
  notifications: {
    email: { enabled: true, from: 'no-reply@clinic.example' },
    sms: { enabled: false, gateway: '' },
    reminders: 24,
    template: 'Hola {nombre}, te recordamos tu cita el {fecha} a las {hora}.'
  },
  security: {
    jwtExpires: '1d',
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSymbol: false,
    enable2FA: false
  },
  ui: { theme: 'system' },
  locale: { timezone: 'America/Guayaquil', lang: 'es' },
  maintenance: { enabled: false, message: '' }
})

/* Logo preview */
const logoFile = ref<File | null>(null)
const logoPreviewUrl = ref<string | null>(null)

function onLogoChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) { logoFile.value = null; logoPreviewUrl.value = null; return }
  if (file.size > 1024 * 1024) { // 1MB
    alert('El logo supera 1MB. Elige una imagen más ligera.')
    input.value = ''
    return
  }
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = () => logoPreviewUrl.value = String(reader.result)
  reader.readAsDataURL(file)
}

/* Helpers */
const passwordPolicyText = computed(() => {
  const reqs:string[] = []
  if (form.security.requireUppercase) reqs.push('Mayúscula')
  if (form.security.requireNumber) reqs.push('Número')
  if (form.security.requireSymbol) reqs.push('Símbolo')
  return `Mín ${form.security.passwordMinLength} · ${reqs.join(' + ') || 'Sin requisitos especiales'}`
})

function isValid() {
  touched.clinicName = true
  touched.address = true
  touched.contact = true
  return !!(form.clinicName && form.address && form.contact)
}

async function saveSettings() {
  if (!isValid()) return
  saving.value = true
  try {
    // Aquí llamarías a tu API/Store (ej. adminService.saveSettings(form, logoFile))
    await new Promise(r => setTimeout(r, 800)) // fake delay
    console.log('Ajustes guardados', { ...form, logoFile: logoFile.value })
    alert('Ajustes guardados correctamente.')
  } catch (e) {
    console.error(e)
    alert('Error al guardar. Intenta nuevamente.')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  // Resetea a valores por defecto
  Object.assign(form, {
    clinicName: '',
    address: '',
    contact: '',
    hours: 'Lun–Vie 08:00–17:00',
    days: 'Lun, Mar, Mié, Jue, Vie',
    privacyPolicy: '',
    brand: { showLogo: true },
    schedule: { slotMinutes: 30, maxAppointmentsPerDay: 50, allowOverlaps: false },
    notifications: {
      email: { enabled: true, from: 'no-reply@clinic.example' },
      sms: { enabled: false, gateway: '' },
      reminders: 24,
      template: 'Hola {nombre}, te recordamos tu cita el {fecha} a las {hora}.'
    },
    security: {
      jwtExpires: '1d',
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumber: true,
      requireSymbol: false,
      enable2FA: false
    },
    ui: { theme: 'system' },
    locale: { timezone: 'America/Guayaquil', lang: 'es' },
    maintenance: { enabled: false, message: '' }
  })
  logoFile.value = null
  logoPreviewUrl.value = null
  Object.keys(touched).forEach(k => (touched[k] = false))
}

/* Carga inicial (simulada) */
onMounted(async () => {
  // Aquí podrías cargar desde una API real
  // const data = await adminService.getSettings()
  // Object.assign(form, data)
})
</script>

<style src="@/assets/css/pages/admin/AdminSettings.css" scoped></style>
