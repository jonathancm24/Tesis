<template>
  <div class="topografia-compacta">
    <!-- Tabs para vista superior/inferior -->
    <div class="vista-tabs mb-3">
      <div class="btn-group w-100" role="group">
        <input type="radio" id="vista-superior" value="superior" v-model="vistaActual" class="btn-check">
        <label for="vista-superior" class="btn btn-outline-info btn-sm">Vista Superior</label>
        
        <input type="radio" id="vista-inferior" value="inferior" v-model="vistaActual" class="btn-check">
        <label for="vista-inferior" class="btn btn-outline-info btn-sm">Vista Inferior</label>
      </div>
    </div>

    <div class="contenido-topografia">
      <!-- Imagen de la vista actual -->
      <div class="imagen-container mb-3">
        <img
          :src="imagenActual"
          :alt="`Mucosa oral ${vistaActual}`"
          class="imagen-mucosa"
        />
        <div class="vista-label">{{ vistaActual.charAt(0).toUpperCase() + vistaActual.slice(1) }}</div>
      </div>

      <!-- Lista de localizaciones -->
      <div class="localizaciones-container">
        <div class="localizaciones-header">
          <h6 class="mb-2">
            <i class="fas fa-map-marker-alt me-2"></i>
            Seleccionar localizaciones
          </h6>
          <small class="text-muted">
            Marque las áreas donde se observen hallazgos
          </small>
        </div>
        
        <div class="localizaciones-grid">
          <div 
            v-for="item in localizacionesActuales" 
            :key="item.numero"
            class="localizacion-item"
          >
            <label class="localizacion-label">
              <input 
                type="checkbox" 
                v-model="item.marcado" 
                @change="onSeleccionChange"
                class="form-check-input me-2"
              />
              <span class="numero">{{ item.numero }}.</span>
              <span class="nombre">{{ item.nombre }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Contador de seleccionadas -->
    <div v-if="totalSeleccionadas > 0" class="contador-selecciones mt-3">
      <div class="alert alert-info py-2 px-3 mb-0">
        <i class="fas fa-check-circle me-2"></i>
        <small>
          {{ totalSeleccionadas }} {{ totalSeleccionadas === 1 ? 'área seleccionada' : 'áreas seleccionadas' }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import mucosaSuperior from '@/assets/img/mucosa-superior.png';
import mucosaInferior from '@/assets/img/mucosa-inferior.png';

interface LocalizacionMucosa {
  numero: number;
  nombre: string;
  marcado: boolean;
  descripcion?: string;
}

interface TopografiaData {
  superior: LocalizacionMucosa[];
  inferior: LocalizacionMucosa[];
}

// Props
interface Props {
  modelValue?: TopografiaData;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    superior: [],
    inferior: []
  })
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: TopografiaData];
  change: [value: TopografiaData];
}>();

// Estado local
const vistaActual = ref<'superior' | 'inferior'>('superior');

// Datos de localizaciones originales
const localizacionesOriginales = {
  superior: [
    { numero: 13, nombre: 'borde bermellón', marcado: false },
    { numero: 15, nombre: 'comisura labial der.', marcado: false },
    { numero: 16, nombre: 'comisura labial izq.', marcado: false },
    { numero: 17, nombre: 'mucosa labial', marcado: false },
    { numero: 19, nombre: 'mucosa mejilla bucal der.', marcado: false },
    { numero: 20, nombre: 'mucosa mejilla bucal izq.', marcado: false },
    { numero: 21, nombre: 'surco labial', marcado: false },
    { numero: 23, nombre: 'surco bucal der.', marcado: false },
    { numero: 25, nombre: 'surco bucal izq.', marcado: false },
    { numero: 27, nombre: 'encía o reborde residual bucal der.', marcado: false },
    { numero: 28, nombre: 'encía o reborde residual bucal izq.', marcado: false },
    { numero: 31, nombre: 'encía o reborde residual labial', marcado: false },
    { numero: 33, nombre: 'encía o reborde residual palatina post. der.', marcado: false },
    { numero: 34, nombre: 'encía o reborde residual palatina post. izq.', marcado: false },
    { numero: 37, nombre: 'encía o reborde residual palatina ant.', marcado: false },
    { numero: 39, nombre: 'dorso de la lengua der.', marcado: false },
    { numero: 40, nombre: 'dorso de la lengua izq.', marcado: false },
    { numero: 41, nombre: 'base de la lengua der.', marcado: false },
    { numero: 42, nombre: 'base de la lengua izq.', marcado: false },
    { numero: 51, nombre: 'paladar duro der.', marcado: false },
    { numero: 52, nombre: 'paladar duro izq.', marcado: false },
    { numero: 53, nombre: 'paladar blando der.', marcado: false },
    { numero: 54, nombre: 'paladar blando izq.', marcado: false },
    { numero: 55, nombre: 'pilar amigdalino ant. Der.', marcado: false },
    { numero: 56, nombre: 'pilar amigdalino ant. Izq.', marcado: false }
  ],
  inferior: [
    { numero: 14, nombre: 'borde bermellón', marcado: false },
    { numero: 18, nombre: 'mucosa labial', marcado: false },
    { numero: 22, nombre: 'surco labial', marcado: false },
    { numero: 24, nombre: 'surco bucal der.', marcado: false },
    { numero: 26, nombre: 'surco bucal izq.', marcado: false },
    { numero: 29, nombre: 'encía o reborde residual bucal der.', marcado: false },
    { numero: 30, nombre: 'encía o reborde residual bucal izq.', marcado: false },
    { numero: 32, nombre: 'encía o reborde residual labial', marcado: false },
    { numero: 35, nombre: 'encía o reborde residual lingual posterior der.', marcado: false },
    { numero: 36, nombre: 'encía o reborde residual lingual posterior izq.', marcado: false },
    { numero: 38, nombre: 'encía o reborde residual lingual anterior', marcado: false },
    { numero: 43, nombre: 'punta de la lengua', marcado: false },
    { numero: 44, nombre: 'margen de la lengua der.', marcado: false },
    { numero: 45, nombre: 'margen de la lengua izq.', marcado: false },
    { numero: 46, nombre: 'vientre lengua der.', marcado: false },
    { numero: 47, nombre: 'vientre lengua izq.', marcado: false },
    { numero: 48, nombre: 'piso de la boca frontal', marcado: false },
    { numero: 49, nombre: 'piso de la boca lateral der.', marcado: false },
    { numero: 50, nombre: 'piso de la boca lateral izq.', marcado: false }
  ]
};

// Estado de todas las localizaciones
const localizaciones = ref<TopografiaData>({
  superior: [...localizacionesOriginales.superior],
  inferior: [...localizacionesOriginales.inferior]
});

// Computed properties
const localizacionesActuales = computed(() => {
  return localizaciones.value[vistaActual.value];
});

const imagenActual = computed(() => {
  return vistaActual.value === 'superior' 
    ? mucosaSuperior
    : mucosaInferior;
});

const totalSeleccionadas = computed(() => {
  return localizaciones.value.superior.filter(l => l.marcado).length +
         localizaciones.value.inferior.filter(l => l.marcado).length;
});

// Métodos
const onSeleccionChange = () => {
  // Debounce la emisión para evitar demasiadas actualizaciones
  emit('update:modelValue', localizaciones.value);
  emit('change', localizaciones.value);
};

const inicializarDatos = () => {
  if (!props.modelValue) return;
  
  // Aplicar datos del modelo si existen
  if (props.modelValue.superior && props.modelValue.superior.length > 0) {
    props.modelValue.superior.forEach(item => {
      const localItem = localizaciones.value.superior.find(l => l.numero === item.numero);
      if (localItem) {
        localItem.marcado = item.marcado;
        localItem.descripcion = item.descripcion;
      }
    });
  }
  
  if (props.modelValue.inferior && props.modelValue.inferior.length > 0) {
    props.modelValue.inferior.forEach(item => {
      const localItem = localizaciones.value.inferior.find(l => l.numero === item.numero);
      if (localItem) {
        localItem.marcado = item.marcado;
        localItem.descripcion = item.descripcion;
      }
    });
  }
};

// Watchers optimizados
watch(() => props.modelValue, (newValue, oldValue) => {
  // Solo actualizar si realmente cambió
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    inicializarDatos();
  }
}, { deep: false }); // Shallow watching para mejor performance

// Inicialización
inicializarDatos();
</script>

<style scoped>
.topografia-compacta {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.vista-tabs .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.contenido-topografia {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.imagen-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.imagen-mucosa {
  max-width: 100%;
  height: auto;
  max-height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vista-label {
  margin-top: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-align: center;
}

.localizaciones-container {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 250px;
  overflow-y: auto;
}

.localizaciones-header h6 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.localizaciones-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.localizacion-item {
  padding: 0.25rem 0;
}

.localizacion-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
  margin-bottom: 0;
  transition: color 0.2s ease;
}

.localizacion-label:hover {
  color: #2563eb;
}

.numero {
  font-weight: 600;
  color: #2563eb;
  min-width: 25px;
  display: inline-block;
}

.nombre {
  flex: 1;
}

.form-check-input {
  margin-top: 0;
  cursor: pointer;
}

.contador-selecciones .alert {
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

/* Scrollbar personalizado */
.localizaciones-container::-webkit-scrollbar {
  width: 6px;
}

.localizaciones-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.localizaciones-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.localizaciones-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .contenido-topografia {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .imagen-mucosa {
    max-height: 150px;
  }
  
  .localizaciones-container {
    max-height: 200px;
  }
}

@media (max-width: 480px) {
  .topografia-compacta {
    padding: 0.75rem;
  }
  
  .imagen-mucosa {
    max-height: 120px;
  }
  
  .localizaciones-container {
    padding: 0.75rem;
    max-height: 180px;
  }
  
  .localizacion-label {
    font-size: 0.8rem;
  }
}
</style>
