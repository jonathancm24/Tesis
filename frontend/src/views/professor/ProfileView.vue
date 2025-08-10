<!-- Ruta: /professor/profile - Archivo: src/views/professor/ProfileView.vue -->
<template>
  <section class="professor-profile container py-4">
    <!-- Header -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h2 class="mb-1 d-flex align-items-center gap-2 text-primary fw-bold">
          <i class="fas fa-user-tie"></i> Perfil de Profesor
        </h2>
        <p class="text-muted mb-0">Resumen personal, cursos y últimas asignaciones.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary" @click="reload" :disabled="loading">
          <i :class="loading ? 'fas fa-sync fa-spin' : 'fas fa-sync'"></i>
          <span class="ms-1">Actualizar</span>
        </button>
        <button class="btn btn-primary" @click="openEdit">
          <i class="fas fa-pen"></i>
          <span class="ms-1">Editar perfil</span>
        </button>
      </div>
    </div>

    <!-- Estados -->
    <div v-if="loading" class="alert alert-info d-flex align-items-center gap-2">
      <i class="fas fa-spinner fa-spin"></i> Cargando perfil y datos…
    </div>
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center gap-2">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <!-- Top: Información y Métricas -->
    <div class="row mb-4" v-if="!loading">
      <!-- Datos personales -->
      <div class="col-lg-6">
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center gap-2">
            <i class="fas fa-id-card"></i> <span class="fw-semibold">Información Personal</span>
          </div>
          <div class="card-body d-grid gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar" :title="user.nombre">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Foto" />
                <span v-else>{{ initials(user.nombre) }}</span>
              </div>
              <div>
                <div class="fw-bold fs-5">{{ user.nombre || '—' }}</div>
                <div class="text-muted small">{{ user.email || '—' }}</div>
                <span class="badge bg-success text-uppercase">{{ user.role }}</span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="openEdit">
                <i class="fas fa-pen"></i> Editar
              </button>
              <button class="btn btn-outline-secondary btn-sm" @click="toggleAvatar">
                <i class="fas fa-image"></i> {{ avatarUrl ? 'Quitar foto' : 'Cargar foto' }}
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="onAvatarChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas rápidas -->
      <div class="col-lg-6">
        <div class="row g-3">
          <div class="col-6">
            <div class="stat-card bg-primary text-white">
              <div class="stat-icon"><i class="fas fa-tasks"></i></div>
              <div class="stat-content">
                <div class="stat-label">Asignaciones</div>
                <div class="stat-number">{{ assignments.length }}</div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="stat-card bg-success text-white">
              <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
              <div class="stat-content">
                <div class="stat-label">Cursos</div>
                <div class="stat-number">{{ courses.length }}</div>
              </div>
            </div>
          </div>

          <div class="col-6">
            <div class="stat-card bg-info text-white">
              <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
              <div class="stat-content">
                <div class="stat-label">Próxima entrega</div>
                <div class="stat-number small">
                  <span v-if="nextDue">{{ formatDate(nextDue) }}</span>
                  <span v-else>—</span>
                </div>
              </div>
            </div>
          </div>

          <div class="col-6">
            <div class="stat-card bg-warning text-dark">
              <div class="stat-icon"><i class="fas fa-search"></i></div>
              <div class="stat-content">
                <div class="stat-label">Pendientes de revisión</div>
                <div class="stat-number">{{ pendingCount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtro de asignaciones -->
    <div class="row mb-3" v-if="!loading">
      <div class="col-12 col-md-6">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-search"></i></span>
          <input
            v-model="query"
            type="text"
            class="form-control"
            placeholder="Buscar por título o curso…"
            aria-label="Buscar asignaciones"
          />
        </div>
      </div>
    </div>

    <!-- Últimas asignaciones -->
    <div class="card shadow-sm" v-if="!loading">
      <div class="card-header d-flex align-items-center gap-2">
        <i class="fas fa-list-ul"></i> <span class="fw-semibold">Últimas Asignaciones</span>
        <span class="badge bg-secondary ms-auto">{{ filteredAssignments.length }}</span>
      </div>

      <div class="table-responsive">
        <table class="table mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th class="w-40">Título</th>
              <th>Curso</th>
              <th class="text-nowrap">Entrega</th>
              <th class="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filteredAssignments.slice(0, 8)" :key="a.id">
              <td>
                <div class="fw-semibold">{{ a.title }}</div>
                <div class="text-muted small">ID: {{ a.id }}</div>
              </td>
              <td>{{ a.course }}</td>
              <td class="text-nowrap">{{ formatDate(a.dueDate) }}</td>
              <td class="text-center">
                <span :class="['badge', statusBadgeClass(a.status)]">
                  {{ statusText(a.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredAssignments.length === 0">
              <td colspan="4" class="text-center text-muted py-4">
                No hay asignaciones que coincidan con tu búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Perfil -->
    <transition name="fade">
      <div v-if="isEditOpen" class="modal-backdrop fade show"></div>
    </transition>
    <transition name="fade">
      <div v-if="isEditOpen" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Editar Perfil</h5>
              <button type="button" class="btn-close btn-close-white" @click="closeEdit" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveProfile" class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nombre</label>
                  <input v-model.trim="editForm.nombre" type="text" required class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">Email</label>
                  <input v-model.trim="editForm.email" type="email" required class="form-control" />
                </div>
                <div class="col-12 d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-outline-secondary" @click="closeEdit">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                    <i :class="savingProfile ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
                    <span class="ms-1">{{ savingProfile ? 'Guardando...' : 'Guardar' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { User } from '../../mocks/admin/user'
import { fetchUsersMock } from '../../mocks/api'
import type { Assignment } from '../../mocks/professor/assignments'
import { fetchAssignmentsMock } from '../../mocks/professor/assignments'
import { fetchCoursesMock } from '../../mocks/professor/studentsByCourse'

/** Estado */
const loading = ref(false)
const error = ref('')
const user = ref<User>({ id: 0, nombre: '', email: '', role: 'profesor', password: '' })
const assignments = ref<(Assignment & { status?: 'pending' | 'review' | 'done' })[]>([])
const courses = ref<string[]>([])

/** UI */
const query = ref('')
const avatarUrl = ref<string | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)

/** Modal edición */
const isEditOpen = ref(false)
const savingProfile = ref(false)
const editForm = reactive<{ nombre: string; email: string }>({ nombre: '', email: '' })

/** Carga */
const reload = async () => {
  loading.value = true
  error.value = ''
  try {
    // Cargar en paralelo
    const [users, asgs, crs] = await Promise.all([
      fetchUsersMock(),
      fetchAssignmentsMock(),
      fetchCoursesMock()
    ])
    const prof = users.find(u => u.role === 'profesor') || users[0]
    if (prof) user.value = prof

    // Asignar estado de ejemplo si no viene del mock
    assignments.value = asgs.map((a, i) => ({
      ...a,
      status: (['pending', 'review', 'done'] as const)[i % 3]
    }))
    courses.value = crs
  } catch (e: any) {
    console.error(e)
    error.value = e?.message || 'No se pudieron cargar los datos.'
  } finally {
    loading.value = false
  }
}

onMounted(reload)

/** Derivados */
const filteredAssignments = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return assignments.value
  return assignments.value.filter(a =>
    a.title.toLowerCase().includes(q) || a.course.toLowerCase().includes(q)
  )
})

const nextDue = computed(() => {
  const future = assignments.value
    .map(a => new Date(a.dueDate))
    .filter(d => !isNaN(d.getTime()) && d.getTime() >= Date.now())
    .sort((a, b) => a.getTime() - b.getTime())
  return future[0] || null
})

const pendingCount = computed(
  () => assignments.value.filter(a => a.status === 'pending' || a.status === 'review').length
)

/** Helpers */
function formatDate(dateLike: string | Date) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
}

function statusText(s?: 'pending' | 'review' | 'done') {
  return s === 'pending' ? 'Pendiente'
    : s === 'review' ? 'En revisión'
    : s === 'done' ? 'Completada'
    : '—'
}

function statusBadgeClass(s?: 'pending' | 'review' | 'done') {
  return s === 'pending' ? 'bg-warning text-dark'
    : s === 'review' ? 'bg-info text-dark'
    : s === 'done' ? 'bg-success'
    : 'bg-secondary'
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('')
}

/** Avatar */
function toggleAvatar() {
  if (avatarUrl.value) {
    avatarUrl.value = null
  } else {
    avatarInput.value?.click()
  }
}
function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 1024 * 1024) {
    alert('La imagen supera 1MB.')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => (avatarUrl.value = String(reader.result))
  reader.readAsDataURL(file)
}

/** Editar perfil */
function openEdit() {
  editForm.nombre = user.value.nombre
  editForm.email = user.value.email
  isEditOpen.value = true
}
function closeEdit() {
  isEditOpen.value = false
}
async function saveProfile() {
  if (!editForm.nombre || !editForm.email) return
  savingProfile.value = true
  try {
    // Aquí llamarías a tu API/servicio real para actualizar
    await new Promise(r => setTimeout(r, 600))
    user.value = { ...user.value, nombre: editForm.nombre, email: editForm.email }
    isEditOpen.value = false
  } catch (e) {
    console.error(e)
    alert('No se pudo guardar el perfil.')
  } finally {
    savingProfile.value = false
  }
}
</script>

<style scoped>
/* Títulos */
h2 { line-height: 1.2; }

/* Avatar */
.avatar{
  width:64px; height:64px; border-radius:12px; overflow:hidden;
  display:grid; place-items:center; font-weight:800; letter-spacing:.5px;
  background: #e9ecef; color:#495057; border:1px solid rgba(0,0,0,.06);
}
.avatar img{ width:100%; height:100%; object-fit:cover; }

/* Stat cards */
.stat-card{
  position:relative; display:grid; grid-template-columns:48px 1fr; gap:10px;
  padding:14px; border-radius:14px; box-shadow:0 8px 22px rgba(0,0,0,.08);
}
.stat-card .stat-icon{ width:48px; height:48px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,.22); }
.stat-card .stat-content{ display:grid; align-content:center; }
.stat-card .stat-label{ font-size:.875rem; opacity:.95; }
.stat-card .stat-number{ font-weight:800; font-size:1.25rem; letter-spacing:.2px; }

/* Tabla */
.table thead th{ font-weight:700; }
.table td .small{ opacity:.8; }

/* Modal */
.modal-backdrop.fade.show{ position:fixed; inset:0; background:rgba(17,24,39,.55); backdrop-filter:blur(1px); z-index:1040; }
.modal.d-block{ position:fixed; inset:0; z-index:1050; display:grid; place-items:center; }
.modal-dialog{ max-width:520px; width:min(520px, calc(100% - 2rem)); }
.fade-enter-active,.fade-leave-active{ transition:opacity .18s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }

/* Responsive */
@media (max-width: 575.98px){
  .stat-card{ grid-template-columns:40px 1fr; padding:12px; gap:8px; }
  .stat-card .stat-icon{ width:40px; height:40px; }
}
</style>
