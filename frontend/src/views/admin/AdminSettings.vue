<!-- Ruta: /admin/settings  - Archivo: src/views/admin/AdminSettings.vue -->
<template>
  <section class="admin-settings container-xxl py-4">
    <!-- Encabezado -->
    <div class="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="mb-1 text-primary fw-bold d-flex align-items-center gap-2">
          <i class="fas fa-hospital"></i> Gestión de Clínicas
        </h1>
        <p class="text-muted mb-0">Configura clínicas, horarios, seguridad y notificaciones del sistema.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="resetForm" :disabled="loading">
          <i class="fas fa-undo"></i> Restablecer
        </button>
        <button type="button" class="btn btn-success" @click="crearNuevaClinica" :disabled="loading">
          <i class="fas fa-plus me-1"></i> Nueva Clínica
        </button>
        <button type="button" class="btn btn-primary" @click="saveSettings" :disabled="saving || loading">
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

        <!-- Tarjeta: Clínicas Registradas -->
        <div class="card shadow-sm settings-card">
          <div class="card-header d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="fas fa-list"></i>
              <h5 class="mb-0">Clínicas Registradas</h5>
            </div>
            <span class="badge bg-primary">{{ clinicas.length }}</span>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <i class="fas fa-spinner fa-spin"></i> Cargando clínicas...
            </div>
            <div v-else-if="clinicas.length === 0" class="text-center py-3 text-muted">
              <i class="fas fa-hospital fa-2x mb-2"></i>
              <p class="mb-0">No hay clínicas registradas</p>
              <small>Haz clic en "Nueva Clínica" para agregar la primera</small>
            </div>
            <div v-else class="row g-3">
              <div v-for="clinica in clinicas" :key="clinica.id" class="col-12 col-md-6">
                <div class="card border">
                  <div class="card-body p-3">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <h6 class="mb-0 fw-bold">{{ clinica.nombre }}</h6>
                      <span 
                        :class="['badge', 
                          clinica.estado === 'ACTIVA' ? 'bg-success' : 
                          clinica.estado === 'INACTIVA' ? 'bg-secondary' : 
                          clinica.estado === 'MANTENIMIENTO' ? 'bg-warning' : 
                          'bg-primary']"
                      >
                        {{ clinica.estado }}
                      </span>
                    </div>
                    <div class="small text-muted mb-2">
                      <i class="fas fa-code me-1"></i>{{ clinica.codigo }}
                      <span class="mx-2">•</span>
                      <i class="fas fa-tag me-1"></i>{{ clinica.tipo }}
                    </div>
                    <div v-if="clinica.descripcion" class="small text-muted mb-2">
                      <i class="fas fa-info-circle me-1"></i>{{ clinica.descripcion }}
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                      <div class="small">
                        <i class="fas fa-users me-1"></i>
                        Cap: {{ clinica.capacidadPacientes || 'N/A' }}
                      </div>
                      <div class="small text-muted">
                        {{ new Date(clinica.fechaCreacion).toLocaleDateString() }}
                      </div>
                    </div>
                    <div v-if="clinica.parroquiaBase" class="small text-muted mt-2">
                      <i class="fas fa-map-marker-alt me-1"></i>
                      {{ clinica.parroquiaBase.nombre }}, {{ clinica.parroquiaBase.canton.nombre }}
                    </div>
                  </div>
                </div>
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
import { clinicaService, type ConfiguracionClinica } from '@/services/clinicaService'
import type { ClinicaRespuestaDto, CrearClinicaDto, TipoClinica } from '@/types/clinica'

type Theme = 'system' | 'light' | 'dark'

const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`)
  alert(message) // Fallback simple
}

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
const loading = ref(false)
const configuracion = ref<ConfiguracionClinica | null>(null)
const clinicas = ref<ClinicaRespuestaDto[]>([])
const clinicaPrincipal = ref<ClinicaRespuestaDto | null>(null)

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
  if (!file) { 
    logoFile.value = null
    logoPreviewUrl.value = null
    return 
  }
  if (file.size > 1024 * 1024) { // 1MB
    showToast('El logo supera 1MB. Elige una imagen más ligera.', 'error')
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

/**
 * Carga la configuración desde el backend
 */
async function cargarConfiguracion() {
  loading.value = true
  try {
    const config = await clinicaService.obtenerConfiguracion()
    configuracion.value = config

    // Mapear configuración al formulario
    if (config.configuracionGeneral) {
      form.clinicName = config.configuracionGeneral.nombreSistema
      form.address = config.configuracionGeneral.direccionBase
      form.contact = config.configuracionGeneral.telefonoContacto
      form.hours = config.configuracionGeneral.horariosDefault
      form.days = config.configuracionGeneral.diasLaborales
      form.schedule.slotMinutes = config.configuracionGeneral.tiempoTurnoDefault
      form.schedule.maxAppointmentsPerDay = config.configuracionGeneral.capacidadDefaultPacientes
      form.schedule.allowOverlaps = config.configuracionGeneral.permitirSolapamientoCitas
    }

    if (config.notificaciones) {
      form.notifications.email.enabled = config.notificaciones.email.habilitado
      form.notifications.email.from = config.notificaciones.email.remitente
      form.notifications.sms.enabled = config.notificaciones.sms.habilitado
      form.notifications.sms.gateway = config.notificaciones.sms.proveedor
      form.notifications.reminders = config.notificaciones.recordatorios.horasAntes as 0 | 12 | 24 | 48
      form.notifications.template = config.notificaciones.recordatorios.plantillaEmail
    }

    if (config.seguridad) {
      form.security.jwtExpires = config.seguridad.tiempoSesion as '30m'|'2h'|'8h'|'1d'|'7d'
      form.security.passwordMinLength = config.seguridad.longitudMinimaPassword
      form.security.requireUppercase = config.seguridad.requiereMayuscula
      form.security.requireNumber = config.seguridad.requiereNumero
      form.security.requireSymbol = config.seguridad.requiereSimbolo
      form.security.enable2FA = config.seguridad.autenticacion2FA
    }

    if (config.interfaz) {
      form.ui.theme = config.interfaz.tema
      form.locale.lang = config.interfaz.idioma
      form.locale.timezone = config.interfaz.zonaHoraria
      form.brand.showLogo = config.interfaz.mostrarLogo
      if (config.interfaz.logoUrl) {
        logoPreviewUrl.value = config.interfaz.logoUrl
      }
    }

    if (config.mantenimiento) {
      form.maintenance.enabled = config.mantenimiento.modoMantenimiento
      form.maintenance.message = config.mantenimiento.mensajeMantenimiento
    }

    if (config.clinicaPrincipal) {
      clinicaPrincipal.value = config.clinicaPrincipal
    }

    showToast('Configuración cargada correctamente', 'success')
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    showToast('Error al cargar configuración, usando valores por defecto', 'warning')
  } finally {
    loading.value = false
  }
}

/**
 * Carga la lista de clínicas
 */
async function cargarClinicas() {
  try {
    const clinicasData = await clinicaService.obtenerClinicasActivas()
    clinicas.value = clinicasData
  } catch (error) {
    console.error('Error al cargar clínicas:', error)
    showToast('Error al cargar clínicas', 'error')
  }
}

/**
 * Guarda la configuración en el backend
 */
async function saveSettings() {
  if (!isValid()) {
    showToast('Por favor completa todos los campos obligatorios', 'error')
    return
  }

  saving.value = true
  try {
    // Mapear formulario a configuración
    const nuevaConfiguracion: ConfiguracionClinica = {
      clinicaPrincipal: clinicaPrincipal.value || undefined,
      configuracionGeneral: {
        nombreSistema: form.clinicName,
        direccionBase: form.address,
        telefonoContacto: form.contact,
        emailContacto: form.notifications.email.from,
        horariosDefault: form.hours,
        diasLaborales: form.days,
        capacidadDefaultPacientes: form.schedule.maxAppointmentsPerDay,
        tiempoTurnoDefault: form.schedule.slotMinutes,
        permitirSolapamientoCitas: form.schedule.allowOverlaps
      },
      notificaciones: {
        email: {
          habilitado: form.notifications.email.enabled,
          remitente: form.notifications.email.from
        },
        sms: {
          habilitado: form.notifications.sms.enabled,
          proveedor: form.notifications.sms.gateway
        },
        recordatorios: {
          horasAntes: form.notifications.reminders,
          plantillaEmail: form.notifications.template,
          plantillaSms: form.notifications.template
        }
      },
      seguridad: {
        tiempoSesion: form.security.jwtExpires,
        longitudMinimaPassword: form.security.passwordMinLength,
        requiereMayuscula: form.security.requireUppercase,
        requiereNumero: form.security.requireNumber,
        requiereSimbolo: form.security.requireSymbol,
        autenticacion2FA: form.security.enable2FA
      },
      interfaz: {
        tema: form.ui.theme,
        idioma: form.locale.lang,
        zonaHoraria: form.locale.timezone,
        mostrarLogo: form.brand.showLogo,
        logoUrl: logoPreviewUrl.value || undefined
      },
      mantenimiento: {
        modoMantenimiento: form.maintenance.enabled,
        mensajeMantenimiento: form.maintenance.message
      }
    }

    // Subir logo si hay uno nuevo
    if (logoFile.value) {
      const logoResponse = await clinicaService.subirLogo(logoFile.value)
      nuevaConfiguracion.interfaz.logoUrl = logoResponse.url
      logoPreviewUrl.value = logoResponse.url
      logoFile.value = null
    }

    // Guardar configuración
    const configGuardada = await clinicaService.guardarConfiguracion(nuevaConfiguracion)
    configuracion.value = configGuardada

    showToast('Configuración guardada correctamente', 'success')
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    showToast('Error al guardar la configuración. Intenta nuevamente.', 'error')
  } finally {
    saving.value = false
  }
}

/**
 * Resetea el formulario a los valores por defecto
 */
function resetForm() {
  if (configuracion.value) {
    // Restaurar desde la configuración cargada
    cargarConfiguracion()
  } else {
    // Resetear a valores por defecto
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
  }
  
  Object.keys(touched).forEach(k => (touched[k] = false))
  showToast('Formulario restablecido', 'info')
}

/**
 * Abre modal para crear nueva clínica
 */
async function crearNuevaClinica() {
  const nombreClinica = prompt('Ingresa el nombre de la nueva clínica:')
  if (!nombreClinica) return

  const codigoClinica = prompt('Ingresa el código de la clínica (ej. CM-001):')
  if (!codigoClinica) return

  const tipoOptions = ['FIJA', 'MOVIL', 'TEMPORAL']
  const tipoInput = prompt(`Selecciona el tipo de clínica:\n1. ${tipoOptions[0]}\n2. ${tipoOptions[1]}\n3. ${tipoOptions[2]}\n\nIngresa el número:`)
  
  if (!tipoInput || !['1', '2', '3'].includes(tipoInput)) {
    showToast('Tipo de clínica inválido', 'error')
    return
  }

  const tipoSeleccionado = tipoOptions[parseInt(tipoInput) - 1] as TipoClinica

  try {
    const nuevaClinica: CrearClinicaDto = {
      nombre: nombreClinica,
      codigo: codigoClinica,
      tipo: tipoSeleccionado,
      descripcion: `Clínica ${tipoSeleccionado.toLowerCase()} creada desde el panel de administración`,
      capacidadPacientes: 8
    }

    const clinicaCreada = await clinicaService.crearClinica(nuevaClinica)
    showToast(`Clínica "${clinicaCreada.nombre}" creada exitosamente`, 'success')
    
    // Recargar lista de clínicas
    await cargarClinicas()
  } catch (error) {
    console.error('Error al crear clínica:', error)
    showToast('Error al crear la clínica. Verifica que el código no esté duplicado.', 'error')
  }
}

/* Carga inicial */
onMounted(async () => {
  await Promise.all([
    cargarConfiguracion(),
    cargarClinicas()
  ])
})
</script>

<style src="@/assets/css/pages/admin/AdminSettings.css" scoped></style>
