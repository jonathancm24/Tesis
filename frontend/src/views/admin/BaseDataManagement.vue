<!-- 
  Página de Gestión de Datos Base - Administrador
  Permite gestionar especialidades y ubicaciones geográficas (países, provincias, cantones, parroquias)
  Archivo: src/views/admin/BaseDataManagement.vue
-->
<template>
  <div class="base-data-management">
    <!-- Encabezado de la página -->
    <div class="page-header mb-4">
      <h2 class="page-title">
        <i class="fas fa-database me-2"></i>
        Gestión de Datos Base
      </h2>
      <p class="page-description text-muted">
        Administra especialidades médicas y ubicaciones geográficas del sistema
      </p>
    </div>

    <!-- Pestañas de navegación -->
    <ul class="nav nav-tabs mb-4" id="baseDataTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link active" 
          id="especialidades-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#especialidades" 
          type="button" 
          role="tab"
          @click="activeTab = 'especialidades'"
        >
          <i class="fas fa-stethoscope me-2"></i>
          Especialidades
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button 
          class="nav-link" 
          id="ubicaciones-tab" 
          data-bs-toggle="tab" 
          data-bs-target="#ubicaciones" 
          type="button" 
          role="tab"
          @click="activeTab = 'ubicaciones'"
        >
          <i class="fas fa-map-marker-alt me-2"></i>
          Ubicaciones Geográficas
        </button>
      </li>
    </ul>

    <!-- Contenido de las pestañas -->
    <div class="tab-content" id="baseDataTabContent">
      
      <!-- Pestaña de Especialidades -->
      <div 
        class="tab-pane fade show active" 
        id="especialidades" 
        role="tabpanel" 
        v-show="activeTab === 'especialidades'"
      >
        <EspecialidadesSection 
          :especialidades="especialidades"
          :loading="loadingEspecialidades"
          @create="handleCreateEspecialidad"
          @refresh="loadEspecialidades"
        />
      </div>

      <!-- Pestaña de Ubicaciones Geográficas -->
      <div 
        class="tab-pane fade" 
        id="ubicaciones" 
        role="tabpanel" 
        v-show="activeTab === 'ubicaciones'"
      >
        <UbicacionesSection 
          :paises="paises"
          :provincias="provincias" 
          :cantones="cantones"
          :parroquias="parroquias"
          :loading="loadingUbicaciones"
          @create-pais="handleCreatePais"
          @create-provincia="handleCreateProvincia"
          @create-canton="handleCreateCanton"
          @create-parroquia="handleCreateParroquia"
          @refresh="loadUbicaciones"
        />
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EspecialidadesSection from '@/components/admin/EspecialidadesSection.vue'
import UbicacionesSection from '@/components/admin/UbicacionesSection.vue'
import type { 
  Especialidad, 
  Pais, 
  Provincia, 
  Canton, 
  Parroquia,
  CreateEspecialidadDTO,
  CreatePaisDTO,
  CreateProvinciaDTO,
  CreateCantonDTO,
  CreateParroquiaDTO
} from '@//types/baseData'
import { baseDataService } from '@//services/baseDataService'
import { toast } from '@//utils/toast'

// Estado reactivo
const activeTab = ref<'especialidades' | 'ubicaciones'>('especialidades')
const loading = ref(false)
const loadingEspecialidades = ref(false)
const loadingUbicaciones = ref(false)

// Datos de especialidades
const especialidades = ref<Especialidad[]>([])

// Datos de ubicaciones geográficas
const paises = ref<Pais[]>([])
const provincias = ref<Provincia[]>([])
const cantones = ref<Canton[]>([])
const parroquias = ref<Parroquia[]>([])

/**
 * Carga todas las especialidades desde la API
 */
async function loadEspecialidades(): Promise<void> {
  try {
    loadingEspecialidades.value = true
    especialidades.value = await baseDataService.getEspecialidades()
  } catch (error) {
    console.error('Error cargando especialidades:', error)
    toast.error('Error al cargar las especialidades')
  } finally {
    loadingEspecialidades.value = false
  }
}

/**
 * Carga todas las ubicaciones geográficas desde la API
 */
async function loadUbicaciones(): Promise<void> {
  try {
    loadingUbicaciones.value = true
    
    // Cargar en paralelo todas las ubicaciones
    const [paisesData, provinciasData, cantonesData, parroquiasData] = await Promise.all([
      baseDataService.getPaises(),
      baseDataService.getProvincias(),
      baseDataService.getCantones(),
      baseDataService.getParroquias()
    ])
    
    paises.value = paisesData
    provincias.value = provinciasData
    cantones.value = cantonesData
    parroquias.value = parroquiasData
  } catch (error) {
    console.error('Error cargando ubicaciones:', error)
    toast.error('Error al cargar las ubicaciones geográficas')
  } finally {
    loadingUbicaciones.value = false
  }
}

/**
 * Maneja la creación de una nueva especialidad
 */
async function handleCreateEspecialidad(data: CreateEspecialidadDTO): Promise<void> {
  try {
    loading.value = true
    await baseDataService.createEspecialidad(data)
    toast.success('Especialidad creada exitosamente')
    await loadEspecialidades()
  } catch (error) {
    console.error('Error creando especialidad:', error)
    toast.error('Error al crear la especialidad')
  } finally {
    loading.value = false
  }
}

/**
 * Maneja la creación de un nuevo país
 */
async function handleCreatePais(data: CreatePaisDTO): Promise<void> {
  try {
    loading.value = true
    await baseDataService.createPais(data)
    toast.success('País creado exitosamente')
    await loadUbicaciones()
  } catch (error) {
    console.error('Error creando país:', error)
    toast.error('Error al crear el país')
  } finally {
    loading.value = false
  }
}

/**
 * Maneja la creación de una nueva provincia
 */
async function handleCreateProvincia(data: CreateProvinciaDTO): Promise<void> {
  try {
    loading.value = true
    await baseDataService.createProvincia(data)
    toast.success('Provincia creada exitosamente')
    await loadUbicaciones()
  } catch (error) {
    console.error('Error creando provincia:', error)
    toast.error('Error al crear la provincia')
  } finally {
    loading.value = false
  }
}

/**
 * Maneja la creación de un nuevo cantón
 */
async function handleCreateCanton(data: CreateCantonDTO): Promise<void> {
  try {
    loading.value = true
    await baseDataService.createCanton(data)
    toast.success('Cantón creado exitosamente')
    await loadUbicaciones()
  } catch (error) {
    console.error('Error creando cantón:', error)
    toast.error('Error al crear el cantón')
  } finally {
    loading.value = false
  }
}

/**
 * Maneja la creación de una nueva parroquia
 */
async function handleCreateParroquia(data: CreateParroquiaDTO): Promise<void> {
  try {
    loading.value = true
    await baseDataService.createParroquia(data)
    toast.success('Parroquia creada exitosamente')
    await loadUbicaciones()
  } catch (error) {
    console.error('Error creando parroquia:', error)
    toast.error('Error al crear la parroquia')
  } finally {
    loading.value = false
  }
}

/**
 * Inicializa los datos al montar el componente
 */
onMounted(async () => {
  await Promise.all([
    loadEspecialidades(),
    loadUbicaciones()
  ])
})
</script>

<style src="@/assets/css/pages/admin/BaseDataManagement.css" scoped></style>
