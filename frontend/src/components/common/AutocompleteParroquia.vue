<!-- Componente Autocomplete que permite buscar y seleccionar parroquias -->
<template>
  <div class="autocomplete-container position-relative">
    <label v-if="label" :for="inputId" class="form-label">
      <i class="fas fa-map-marker-alt me-1"></i> {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="searchQuery"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      :required="required"
      @input="onInput"
      @focus="showDropdown = true"
      @blur="onBlur"
      autocomplete="off"
    />
    
    <!-- Dropdown de resultados -->
    <div 
      v-show="showDropdown && (resultados.length > 0 || loading || searchQuery.length >= 2)"
      class="dropdown-menu show w-100 mt-1"
      style="max-height: 200px; overflow-y: auto;"
    >
      <!-- Loading -->
      <div v-if="loading" class="dropdown-item-text text-center">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Buscando...
      </div>
      
      <!-- Sin resultados -->
      <div v-else-if="searchQuery.length >= 2 && resultados.length === 0" class="dropdown-item-text">
        No se encontraron parroquias
      </div>
      
      <!-- Resultados -->
      <button
        v-for="parroquia in resultados"
        :key="parroquia.id"
        type="button"
        class="dropdown-item"
        @click="selectParroquia(parroquia)"
      >
        <div>
          <strong>{{ parroquia.nombre }}</strong>
          <br>
          <small class="text-muted">
            {{ parroquia.canton?.nombre }}, {{ parroquia.canton?.provincia?.nombre }}
            <span v-if="parroquia.canton?.provincia?.pais">
              - {{ parroquia.canton.provincia.pais.nombre }}
            </span>
          </small>
        </div>
      </button>
      
      <!-- Instrucción de búsqueda -->
      <div v-if="searchQuery.length < 2" class="dropdown-item-text">
        Escribe al menos 2 caracteres para buscar
      </div>
    </div>
    
    <!-- Selección actual -->
    <div v-if="selectedParroquia" class="mt-2 p-2 bg-light rounded">
      <small class="text-muted">Seleccionado:</small>
      <div>
        <strong>{{ selectedParroquia.nombre }}</strong>
        <br>
        <small>
          {{ selectedParroquia.canton?.nombre }}, {{ selectedParroquia.canton?.provincia?.nombre }}
        </small>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger ms-2"
          @click="clearSelection"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div v-if="required" class="invalid-feedback">
      Debes seleccionar una parroquia.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { userService } from '@/services/userService'
import type { Parroquia } from '@/types/user'
// Props y Emits definidos
interface Props {
  modelValue?: number | null
  label?: string
  placeholder?: string
  required?: boolean
  inputId?: string
}

interface Emits {
  (e: 'update:modelValue', value: number | null): void // Emitir el ID de la parroquia seleccionada o null
  (e: 'change', parroquia: Parroquia | null): void // Emitir la parroquia seleccionada o null
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Parroquia',
  placeholder: 'Buscar parroquia por nombre o ciudad...',
  required: false,
  inputId: 'parroquia-autocomplete'
})

const emit = defineEmits<Emits>()

// Estados
const searchQuery = ref('')
const resultados = ref<Parroquia[]>([])
const loading = ref(false)
const showDropdown = ref(false)
const selectedParroquia = ref<Parroquia | null>(null)
let timeoutId: number | null = null

// Debounced search
async function onInput() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(async () => {
    await buscarParroquias()
  }, 300) // 300ms de delay
}

async function buscarParroquias() {
  if (searchQuery.value.length < 2) {
    resultados.value = []
    return
  }
  
  loading.value = true
  try {
    resultados.value = await userService.buscarParroquias(searchQuery.value)
  } catch (error) {
    console.error('Error al buscar parroquias:', error)
    resultados.value = []
  } finally {
    loading.value = false
  }
}

function selectParroquia(parroquia: Parroquia) {
  selectedParroquia.value = parroquia
  searchQuery.value = parroquia.nombre
  showDropdown.value = false
  
  emit('update:modelValue', parroquia.id)
  emit('change', parroquia)
}

function clearSelection() {
  selectedParroquia.value = null
  searchQuery.value = ''
  emit('update:modelValue', null)
  emit('change', null)
}

function onBlur() {
  // Delay para permitir que se haga clic en las opciones
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Watch para cambios externos
watch(() => props.modelValue, async (newValue) => {
  if (newValue && !selectedParroquia.value) {
    // Cargar la parroquia si se proporciona un ID pero no tenemos la data
    try {
      const parroquias = await userService.getParroquias()
      const found = parroquias.find(p => p.id === newValue)
      if (found) {
        selectedParroquia.value = found
        searchQuery.value = found.nombre
      }
    } catch (error) {
      console.error('Error al cargar parroquia:', error)
    }
  } else if (!newValue) {
    clearSelection()
  }
})
</script>

<style scoped>
.autocomplete-container {
  position: relative;
}

.dropdown-menu {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item:focus {
  background-color: #e9ecef;
}
</style>