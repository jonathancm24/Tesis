<!-- Ruta: /admin/roles  - Archivo: src/views/admin/AdminRoles.vue -->
<template>
  <section class="admin-roles container-xxl py-4">
    <!-- Encabezado -->
    <div class="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 class="mb-1 text-primary fw-bold d-flex align-items-center gap-2">
          <i class="fas fa-user-shield"></i> Gestión de Roles y Permisos
        </h1>
        <p class="text-muted mb-0">Administra roles del sistema y sus permisos asociados.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="cargarDatos" :disabled="loading">
          <i :class="['me-1', loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt']"></i>
          {{ loading ? 'Cargando...' : 'Actualizar' }}
        </button>
        <button type="button" class="btn btn-success" @click="abrirModalCrearRol" :disabled="loading">
          <i class="fas fa-plus me-1"></i> Nuevo Rol
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-primary text-white">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Total Roles</h6>
                <h4 class="mb-0">{{ resumen.totalRoles }}</h4>
              </div>
              <i class="fas fa-users fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-success text-white">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Roles Activos</h6>
                <h4 class="mb-0">{{ resumen.rolesActivos }}</h4>
              </div>
              <i class="fas fa-check-circle fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-warning text-white">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Total Permisos</h6>
                <h4 class="mb-0">{{ resumen.totalPermisos }}</h4>
              </div>
              <i class="fas fa-key fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-info text-white">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h6 class="mb-1">Módulos</h6>
                <h4 class="mb-0">{{ Object.keys(permisosOrganizados).length }}</h4>
              </div>
              <i class="fas fa-layer-group fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Columna principal: Lista de roles -->
      <div class="col-12 col-lg-8">
        <!-- Filtros -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-12 col-md-6">
                <label class="form-label">Buscar roles</label>
                <input
                  v-model="filtros.busqueda"
                  type="text"
                  class="form-control"
                  placeholder="Nombre o descripción del rol..."
                />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Estado</label>
                <select v-model="filtros.activo" class="form-select">
                  <option :value="undefined">Todos</option>
                  <option :value="true">Activos</option>
                  <option :value="false">Inactivos</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <button type="button" class="btn btn-outline-primary w-100" @click="aplicarFiltros">
                  <i class="fas fa-filter me-1"></i> Filtrar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de roles -->
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">
              <i class="fas fa-list me-2"></i>Roles del Sistema
            </h5>
            <span class="badge bg-secondary">{{ rolesFiltrados.length }}</span>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
              <p class="text-muted">Cargando roles...</p>
            </div>
            <div v-else-if="rolesFiltrados.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-user-shield fa-3x mb-3"></i>
              <p class="mb-2">No se encontraron roles</p>
              <small>Ajusta los filtros o crea un nuevo rol</small>
            </div>
            <div v-else class="row g-3">
              <div v-for="rol in rolesFiltrados" :key="rol.id" class="col-12">
                <div class="card border" :class="{ 'border-success': rol.activo, 'border-secondary': !rol.activo }">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                      <div class="d-flex align-items-center gap-2">
                        <h6 class="mb-0 fw-bold">{{ rol.nombre }}</h6>
                        <span 
                          :class="['badge', rol.activo ? 'bg-success' : 'bg-secondary']"
                        >
                          {{ rol.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </div>
                      <div class="dropdown dropdown-roles-actions">
                        <button 
                          class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                          type="button" 
                          :id="`dropdown-${rol.id}`"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" :aria-labelledby="`dropdown-${rol.id}`">
                          <li>
                            <button class="dropdown-item" @click="verDetallesRol(rol)">
                              <i class="fas fa-eye me-2"></i>Ver Detalles
                            </button>
                          </li>
                          <li>
                            <button class="dropdown-item" @click="editarPermisos(rol)">
                              <i class="fas fa-key me-2"></i>Editar Permisos
                            </button>
                          </li>
                          <li><hr class="dropdown-divider"></li>
                          <li>
                            <button 
                              class="dropdown-item text-danger" 
                              @click="confirmarEliminarRol(rol)"
                              :disabled="['ADMIN', 'ESTUDIANTE', 'PROFESOR', 'SECRETARIO'].includes(rol.nombre)"
                            >
                              <i class="fas fa-trash me-2"></i>Eliminar
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <p v-if="rol.descripcion" class="text-muted small mb-2">
                      {{ rol.descripcion }}
                    </p>
                    
                    <div class="row g-2 small">
                      <div class="col-6">
                        <i class="fas fa-users text-primary me-1"></i>
                        <strong>{{ rol._count?.usuarios || 0 }}</strong> usuarios
                      </div>
                      <div class="col-6">
                        <i class="fas fa-key text-success me-1"></i>
                        <strong>{{ rol._count?.permisos || 0 }}</strong> permisos
                      </div>
                      <div class="col-12">
                        <i class="fas fa-clock text-muted me-1"></i>
                        Creado: {{ new Date(rol.fechaCreacion).toLocaleDateString() }}
                      </div>
                    </div>

                    <!-- Preview de permisos -->
                    <div v-if="rol.permisos && rol.permisos.length > 0" class="mt-3">
                      <div class="d-flex flex-wrap gap-1">
                        <span 
                          v-for="permiso in rol.permisos.slice(0, 3)" 
                          :key="permiso.id"
                          class="badge bg-light text-dark"
                        >
                          {{ permiso.nombre }}
                        </span>
                        <span v-if="rol.permisos.length > 3" class="badge bg-secondary">
                          +{{ rol.permisos.length - 3 }} más
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna lateral: Información de permisos -->
      <div class="col-12 col-lg-4">
        <!-- Resumen de permisos por módulo -->
        <div class="card shadow-sm sticky-lg-top">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="fas fa-layer-group me-2"></i>Permisos por Módulo
            </h6>
          </div>
          <div class="card-body">
            <div v-if="Object.keys(permisosOrganizados).length === 0" class="text-center py-3 text-muted">
              <i class="fas fa-key fa-2x mb-2"></i>
              <p class="mb-0">Cargando permisos...</p>
            </div>
            <div v-else class="accordion accordion-flush" id="acordeonPermisos">
              <div 
                v-for="(permisos, modulo) in permisosOrganizados" 
                :key="modulo"
                class="accordion-item"
              >
                <h2 class="accordion-header" :id="`heading-${modulo}`">
                  <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="`#collapse-${modulo}`"
                  >
                    <strong>{{ modulo }}</strong>
                    <span class="badge bg-primary ms-2">{{ permisos.length }}</span>
                  </button>
                </h2>
                <div 
                  :id="`collapse-${modulo}`" 
                  class="accordion-collapse collapse"
                  :data-bs-parent="`#acordeonPermisos`"
                >
                  <div class="accordion-body p-2">
                    <div class="d-flex flex-column gap-1">
                      <div 
                        v-for="permiso in permisos" 
                        :key="permiso.id"
                        class="p-2 bg-light rounded"
                      >
                        <div class="fw-bold small">{{ permiso.nombre }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">
                          {{ permiso.descripcion }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear nuevo rol -->
    <div class="modal fade" id="modalCrearRol" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus me-2"></i>Crear Nuevo Rol
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="crearRol">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Nombre del Rol <span class="text-danger">*</span></label>
                  <input
                    v-model="formularioRol.nombre"
                    type="text"
                    class="form-control"
                    :class="{'is-invalid': touched.nombre && !formularioRol.nombre}"
                    placeholder="Ej: BECARIO, ASISTENTE, etc."
                    required
                  />
                  <div class="invalid-feedback">El nombre es obligatorio</div>
                </div>
                <div class="col-12">
                  <label class="form-label">Descripción</label>
                  <textarea
                    v-model="formularioRol.descripcion"
                    class="form-control"
                    rows="3"
                    placeholder="Describe las responsabilidades de este rol..."
                  ></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label">Permisos Iniciales</label>
                  <div class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                    <div v-for="(permisos, modulo) in permisosOrganizados" :key="modulo" class="mb-3">
                      <h6 class="text-primary mb-2">{{ modulo }}</h6>
                      <div class="row g-2">
                        <div v-for="permiso in permisos" :key="permiso.id" class="col-12">
                          <div class="form-check">
                            <input
                              :id="`permiso-${permiso.id}`"
                              v-model="formularioRol.permisosSeleccionados"
                              :value="permiso.id"
                              type="checkbox"
                              class="form-check-input"
                            />
                            <label :for="`permiso-${permiso.id}`" class="form-check-label">
                              <div class="fw-bold">{{ permiso.nombre }}</div>
                              <small class="text-muted">{{ permiso.descripcion }}</small>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-success" 
              @click="crearRol"
              :disabled="creandoRol || !formularioRol.nombre"
            >
              <i :class="['me-1', creandoRol ? 'fas fa-spinner fa-spin' : 'fas fa-save']"></i>
              {{ creandoRol ? 'Creando...' : 'Crear Rol' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar permisos -->
    <div class="modal fade" id="modalEditarPermisos" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>Editar Permisos: {{ rolSeleccionado?.nombre }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="rolSeleccionado" class="border rounded p-3" style="max-height: 400px; overflow-y: auto;">
              <div v-for="(permisos, modulo) in permisosOrganizados" :key="modulo" class="mb-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <h6 class="text-primary mb-0">{{ modulo }}</h6>
                  <div>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-success me-1"
                      @click="seleccionarTodosDelModulo(modulo, true)"
                    >
                      Todo
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-danger"
                      @click="seleccionarTodosDelModulo(modulo, false)"
                    >
                      Nada
                    </button>
                  </div>
                </div>
                <div class="row g-2">
                  <div v-for="permiso in permisos" :key="permiso.id" class="col-12">
                    <div class="form-check">
                      <input
                        :id="`editar-permiso-${permiso.id}`"
                        v-model="permisosSeleccionadosEdicion"
                        :value="permiso.id"
                        type="checkbox"
                        class="form-check-input"
                      />
                      <label :for="`editar-permiso-${permiso.id}`" class="form-check-label">
                        <div class="fw-bold">{{ permiso.nombre }}</div>
                        <small class="text-muted">{{ permiso.descripcion }}</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="guardarPermisos"
              :disabled="guardandoPermisos"
            >
              <i :class="['me-1', guardandoPermisos ? 'fas fa-spinner fa-spin' : 'fas fa-save']"></i>
              {{ guardandoPermisos ? 'Guardando...' : 'Guardar Permisos' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver detalles del rol -->
    <div class="modal fade" id="modalDetallesRol" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>Detalles del Rol: {{ rolDetalles?.nombre }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="rolDetalles">
              <!-- Información básica -->
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-primary">
                        <i class="fas fa-user-tag me-2"></i>Información Básica
                      </h6>
                      <div class="mb-2">
                        <strong>Nombre:</strong> {{ rolDetalles.nombre }}
                      </div>
                      <div class="mb-2">
                        <strong>Estado:</strong>
                        <span :class="['badge ms-1', rolDetalles.activo ? 'bg-success' : 'bg-secondary']">
                          {{ rolDetalles.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </div>
                      <div v-if="rolDetalles.descripcion" class="mb-2">
                        <strong>Descripción:</strong><br>
                        <span class="text-muted">{{ rolDetalles.descripcion }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title text-success">
                        <i class="fas fa-chart-bar me-2"></i>Estadísticas
                      </h6>
                      <div class="mb-2">
                        <i class="fas fa-users text-primary me-2"></i>
                        <strong>{{ rolDetalles._count?.usuarios || 0 }}</strong> usuarios asignados
                      </div>
                      <div class="mb-2">
                        <i class="fas fa-key text-warning me-2"></i>
                        <strong>{{ rolDetalles._count?.permisos || 0 }}</strong> permisos otorgados
                      </div>
                      <div class="mb-2">
                        <i class="fas fa-calendar text-info me-2"></i>
                        Creado: {{ new Date(rolDetalles.fechaCreacion).toLocaleDateString() }}
                      </div>
                      <div>
                        <i class="fas fa-edit text-secondary me-2"></i>
                        Actualizado: {{ new Date(rolDetalles.fechaActualizacion).toLocaleDateString() }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista de permisos -->
              <div v-if="rolDetalles.permisos && rolDetalles.permisos.length > 0">
                <h6 class="text-primary mb-3">
                  <i class="fas fa-key me-2"></i>Permisos Asignados ({{ rolDetalles.permisos.length }})
                </h6>
                <div class="row g-2">
                  <div v-for="permiso in rolDetalles.permisos" :key="permiso.id" class="col-12 col-md-6">
                    <div class="card border-start border-3 border-primary">
                      <div class="card-body p-2">
                        <div class="fw-bold small">{{ permiso.nombre }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">
                          {{ permiso.descripcion }}
                        </div>
                        <span class="badge bg-light text-dark small">{{ permiso.modulo }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-3 text-muted">
                <i class="fas fa-key fa-2x mb-2"></i>
                <p class="mb-0">Este rol no tiene permisos asignados</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="editarPermisos(rolDetalles!)"
              data-bs-dismiss="modal"
            >
              <i class="fas fa-edit me-1"></i>Editar Permisos
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { rolesService } from '@/services/rolesService'
import { useToast } from '@/composables/useToast'
import type { 
  Rol, 
  PermisosOrganizados, 
  ResumenRoles,
  FiltrosRoles,
  FormularioRol
} from '@/types/roles'

// Composable para notificaciones
const { showSuccess, showError, showWarning, showInfo } = useToast()

// Estados reactivos
const loading = ref(false)
const creandoRol = ref(false)
const guardandoPermisos = ref(false)

const roles = ref<Rol[]>([])
const permisosOrganizados = ref<PermisosOrganizados>({})
const resumen = ref<ResumenRoles>({
  totalRoles: 0,
  rolesActivos: 0,
  rolesInactivos: 0,
  totalPermisos: 0,
  rolesRecientes: [],
  distribucionPermisos: []
})

// Formularios y selecciones
const formularioRol = reactive<FormularioRol>({
  nombre: '',
  descripcion: '',
  permisosSeleccionados: []
})

const touched = reactive<Record<string, boolean>>({
  nombre: false
})

const filtros = reactive<FiltrosRoles>({
  busqueda: '',
  activo: undefined
})

const rolSeleccionado = ref<Rol | null>(null)
const permisosSeleccionadosEdicion = ref<number[]>([])
const rolDetalles = ref<Rol | null>(null)

// Computed
const rolesFiltrados = computed(() => {
  let resultado = [...roles.value]

  // Filtrar por búsqueda
  if (filtros.busqueda) {
    const termino = filtros.busqueda.toLowerCase()
    resultado = resultado.filter(rol => 
      rol.nombre.toLowerCase().includes(termino) ||
      (rol.descripcion && rol.descripcion.toLowerCase().includes(termino))
    )
  }

  // Filtrar por estado
  if (filtros.activo !== undefined) {
    resultado = resultado.filter(rol => rol.activo === filtros.activo)
  }

  return resultado
})

// Simple toast notification helper
const showToast = (title: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', message?: string) => {
  const fullMessage = message ? `${title}: ${message}` : title
  if (type === 'success') {
    showSuccess(fullMessage)
  } else if (type === 'error') {
    showError(fullMessage)
  } else if (type === 'warning') {
    showWarning(fullMessage)
  } else {
    showInfo(fullMessage)
  }
}

/**
 * Carga todos los datos necesarios para la vista
 */
async function cargarDatos() {
  loading.value = true
  try {
    const [rolesData, permisosData, resumenData] = await Promise.all([
      rolesService.obtenerRolesCompletos(),
      rolesService.obtenerPermisosOrganizados(),
      rolesService.obtenerResumenRoles()
    ])

    roles.value = rolesData
    permisosOrganizados.value = permisosData
    resumen.value = resumenData

    showToast('Datos cargados correctamente', 'success')
  } catch (error) {
    console.error('Error al cargar datos:', error)
    showToast('Error al cargar datos', 'warning', 'Usando información local de respaldo')
  } finally {
    loading.value = false
  }
}

/**
 * Aplica los filtros a la lista de roles
 */
function aplicarFiltros() {
  // Los filtros se aplican automáticamente por el computed rolesFiltrados
  showToast('Filtros aplicados', 'info', `Mostrando ${rolesFiltrados.value.length} roles`)
}

/**
 * Abre el modal para crear un nuevo rol
 */
function abrirModalCrearRol() {
  // Resetear formulario
  formularioRol.nombre = ''
  formularioRol.descripcion = ''
  formularioRol.permisosSeleccionados = []
  Object.keys(touched).forEach(k => (touched[k] = false))
  
  // Abrir modal usando Bootstrap
  const modalElement = document.getElementById('modalCrearRol')
  if (modalElement && (window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(modalElement)
    modal.show()
  } else {
    showToast('Error de configuración', 'error', 'Bootstrap no está disponible')
  }
}

/**
 * Crea un nuevo rol
 */
async function crearRol() {
  touched.nombre = true
  
  if (!formularioRol.nombre) {
    showToast('Nombre requerido', 'error', 'El nombre del rol es obligatorio')
    return
  }

  creandoRol.value = true
  try {
    const nuevoRol = await rolesService.crearRol({
      nombre: formularioRol.nombre.toUpperCase(),
      descripcion: formularioRol.descripcion || undefined,
      permisos: formularioRol.permisosSeleccionados.length > 0 ? formularioRol.permisosSeleccionados : undefined
    })

    roles.value.push(nuevoRol)
    
    // Cerrar modal
    const modalElement = document.getElementById('modalCrearRol')
    if (modalElement && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }

    showToast('Rol creado exitosamente', 'success', `El rol "${nuevoRol.nombre}" ha sido creado`)
    
    // Recargar estadísticas
    await cargarDatos()
  } catch (error) {
    console.error('Error al crear rol:', error)
    showToast('Error al crear rol', 'error', 'Verifica que el nombre no esté duplicado')
  } finally {
    creandoRol.value = false
  }
}

/**
 * Ver detalles completos de un rol
 */
function verDetallesRol(rol: Rol) {
  rolDetalles.value = rol
  
  // Abrir modal de detalles
  const modalElement = document.getElementById('modalDetallesRol')
  if (modalElement && (window as any).bootstrap) {
    const modal = new (window as any).bootstrap.Modal(modalElement)
    modal.show()
  } else {
    showToast('Error de configuración', 'error', 'Bootstrap no está disponible')
  }
}

/**
 * Abre modal para editar permisos de un rol
 */
async function editarPermisos(rol: Rol) {
  rolSeleccionado.value = rol
  
  try {
    // Obtener detalles completos del rol con permisos
    const rolCompleto = await rolesService.obtenerRolPorId(rol.id)
    permisosSeleccionadosEdicion.value = rolCompleto.permisos?.map(p => p.id) || []
    
    // Abrir modal
    const modalElement = document.getElementById('modalEditarPermisos')
    if (modalElement && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement)
      modal.show()
    } else {
      showToast('Error de configuración', 'error', 'Bootstrap no está disponible')
    }
  } catch (error) {
    console.error('Error al cargar permisos del rol:', error)
    showToast('Error al cargar permisos', 'error', 'No se pudieron obtener los permisos del rol')
  }
}

/**
 * Selecciona/deselecciona todos los permisos de un módulo
 */
function seleccionarTodosDelModulo(modulo: string | number, seleccionar: boolean) {
  const moduloStr = String(modulo)
  const permisosDelModulo = permisosOrganizados.value[moduloStr] || []
  const idsPermisosModulo = permisosDelModulo.map(p => p.id)
  
  if (seleccionar) {
    // Agregar permisos del módulo que no estén seleccionados
    idsPermisosModulo.forEach(id => {
      if (!permisosSeleccionadosEdicion.value.includes(id)) {
        permisosSeleccionadosEdicion.value.push(id)
      }
    })
  } else {
    // Remover permisos del módulo
    permisosSeleccionadosEdicion.value = permisosSeleccionadosEdicion.value.filter(
      id => !idsPermisosModulo.includes(id)
    )
  }
}

/**
 * Guarda los permisos editados para el rol seleccionado
 */
async function guardarPermisos() {
  if (!rolSeleccionado.value) return

  guardandoPermisos.value = true
  try {
    const rolActualizado = await rolesService.asignarPermisos(
      rolSeleccionado.value.id,
      { permisos: permisosSeleccionadosEdicion.value }
    )

    // Actualizar rol en la lista
    const index = roles.value.findIndex(r => r.id === rolSeleccionado.value!.id)
    if (index !== -1) {
      roles.value[index] = rolActualizado
    }

    // Cerrar modal
    const modalElement = document.getElementById('modalEditarPermisos')
    if (modalElement && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
      if (modal) modal.hide()
    }

    showToast('Permisos actualizados', 'success', `Permisos del rol "${rolSeleccionado.value.nombre}" actualizados correctamente`)
    
    // Recargar estadísticas
    await cargarDatos()
  } catch (error) {
    console.error('Error al guardar permisos:', error)
    showToast('Error al guardar permisos', 'error', 'No se pudieron actualizar los permisos')
  } finally {
    guardandoPermisos.value = false
  }
}

/**
 * Confirma la eliminación de un rol
 */
function confirmarEliminarRol(rol: Rol) {
  const rolesProtegidos = ['ADMIN', 'ESTUDIANTE', 'PROFESOR', 'SECRETARIO']
  
  if (rolesProtegidos.includes(rol.nombre)) {
    showToast('Rol protegido', 'warning', 'No se pueden eliminar los roles del sistema base')
    return
  }

  const confirmacion = confirm(
    `¿Estás seguro de que deseas eliminar el rol "${rol.nombre}"?\n\n` +
    `Esto afectará a ${rol._count?.usuarios || 0} usuarios.\n` +
    `Esta acción no se puede deshacer.`
  )

  if (confirmacion) {
    eliminarRol(rol)
  }
}

/**
 * Elimina un rol del sistema
 */
async function eliminarRol(_rol: Rol) {
  try {
    // Como no hay endpoint DELETE en el controlador, mostrar mensaje
    showToast('Funcionalidad pendiente', 'warning', 'Eliminación de roles pendiente de implementación en el backend')
    
    // Código que se ejecutaría cuando el backend soporte DELETE:
    // await rolesService.eliminarRol(rol.id)
    // roles.value = roles.value.filter(r => r.id !== rol.id)
    // showToast('Rol eliminado', 'success', `El rol "${rol.nombre}" ha sido eliminado`)
    // await cargarDatos()
  } catch (error) {
    console.error('Error al eliminar rol:', error)
    showToast('Error al eliminar rol', 'error', 'No se pudo completar la operación')
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  await cargarDatos()
})
</script>

<style scoped>
.admin-roles {
  min-height: 100vh;
}

.card {
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.accordion-button {
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
}

.accordion-body {
  background-color: #f8f9fa;
}

.form-check-label {
  cursor: pointer;
  width: 100%;
}

.badge {
  font-size: 0.75rem;
}

.sticky-lg-top {
  position: sticky;
  top: 1rem;
  z-index: 1020;
}

/* Arreglar z-index de dropdowns para que aparezcan sobre la columna lateral */
.dropdown-menu {
  z-index: 1051 !important;
}

.dropdown {
  position: relative;
  z-index: 1031 !important;
}

/* Asegurar que los dropdowns tengan mayor prioridad que sticky elements */
.card .dropdown {
  z-index: 1032 !important;
}

.card .dropdown-menu {
  z-index: 1052 !important;
}

/* Estilos específicos para dropdowns de acciones de roles */
.dropdown-roles-actions {
  position: relative !important;
  z-index: 1055 !important;
}

.dropdown-roles-actions .dropdown-menu {
  z-index: 1056 !important;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  min-width: 150px;
}

.dropdown-roles-actions .dropdown-toggle {
  border: none;
  background: transparent;
  color: #6c757d;
}

.dropdown-roles-actions .dropdown-toggle:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Asegurar que los modales estén por encima de todo */
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
}

@media (max-width: 991.98px) {
  .sticky-lg-top {
    position: static;
  }
}

/* Mejorar apariencia en móviles */
@media (max-width: 768px) {
  .page-header {
    text-align: center;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .dropdown-menu {
    min-width: 200px;
  }
}
</style>
