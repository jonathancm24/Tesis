<template>
  <div class="odontograma-compacto">
    <!-- Fila superior: Condición activa y Leyenda -->
    <div class="controles-leyenda-fila mb-2">
      <!-- Selector de condición activa -->
      <div class="controles-section">
        <label class="form-label fw-bold">Condición a aplicar:</label>
        <select v-model="condicionActiva" class="form-select form-select-sm">
          <option value="healthy">Sano</option>
          <option value="caries">Caries</option>
          <option value="filling">Obturación</option>
          <option value="crown">Corona</option>
          <option value="missing">Ausente</option>
          <option value="root-canal">Endodoncia</option>
          <option value="implant">Implante</option>
          <option value="bridge">Puente</option>
          <option value="extraction">Extracción</option>
        </select>
      </div>

      <!-- Leyenda compacta -->
      <div class="leyenda-compacta">
        <small class="text-muted fw-bold mb-1">Leyenda:</small>
        <div class="leyenda-items-horizontal">
          <div class="leyenda-item" v-for="(color, condicion) in conditionColors" :key="condicion">
            <span class="estado-box" :style="{ backgroundColor: color, border: '1px solid #666' }"></span>
            <span>{{ conditionLabels[condicion] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Guía visual compacta -->
    <div class="guia-superficies-compacta mb-2">
      <div class="guia-content">
        <div class="diente-ejemplo">
          <div class="superficie-demo oclusal-demo" title="Oclusal - Superficie de masticación">O</div>
          <div class="fila-demo">
            <div class="superficie-demo mesial-demo" title="Mesial - Hacia línea media">M</div>
            <div class="superficie-demo centro-demo">##</div>
            <div class="superficie-demo distal-demo" title="Distal - Alejándose línea media">D</div>
          </div>
          <div class="superficie-demo vestibular-demo" title="Vestibular - Hacia labios/mejillas">V</div>
          <div class="superficie-demo lingual-demo" title="Lingual - Hacia lengua/paladar">L</div>
        </div>
        <small class="text-muted ms-3">
          <strong>5 Superficies:</strong> O: Oclusal, M: Mesial, D: Distal, V: Vestibular, L: Lingual
        </small>
      </div>
    </div>

    <!-- Grilla del odontograma mixto optimizada -->
    <div class="odontograma-grid-completa">
      
      <!-- Maxilar Superior Permanente -->
      <div class="maxilar-section">
        <div class="etiqueta-maxilar superior">Maxilar Superior - Dentición Permanente</div>
        <div class="dientes-fila">
          <div 
            v-for="diente in dientesSuperioresPermanentes" 
            :key="diente.id"
            class="diente-container-tradicional"
          >
            <div class="diente-visual-tradicional">
              <!-- Superficie Oclusal (arriba) -->
              <div 
                class="superficie-trad oclusal-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'oclusal') }"
                @click="clickSuperficie(diente, 'oclusal')"
                :title="`${diente.label} - Oclusal: ${getCondicionTexto(diente.superficies.oclusal)}`"
              ></div>
              
              <!-- Fila central: Mesial | Centro | Distal -->
              <div class="fila-central-trad">
                <div 
                  class="superficie-trad mesial-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'mesial') }"
                  @click="clickSuperficie(diente, 'mesial')"
                  :title="`${diente.label} - Mesial: ${getCondicionTexto(diente.superficies.mesial)}`"
                ></div>
                <div class="centro-trad">{{ diente.label }}</div>
                <div 
                  class="superficie-trad distal-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'distal') }"
                  @click="clickSuperficie(diente, 'distal')"
                  :title="`${diente.label} - Distal: ${getCondicionTexto(diente.superficies.distal)}`"
                ></div>
              </div>
              
              <!-- Superficie Vestibular (abajo) -->
              <div 
                class="superficie-trad vestibular-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'vestibular') }"
                @click="clickSuperficie(diente, 'vestibular')"
                :title="`${diente.label} - Vestibular: ${getCondicionTexto(diente.superficies.vestibular)}`"
              ></div>
              
              <!-- Superficie Lingual (separada abajo) -->
              <div 
                class="superficie-trad lingual-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'lingual') }"
                @click="clickSuperficie(diente, 'lingual')"
                :title="`${diente.label} - Lingual: ${getCondicionTexto(diente.superficies.lingual)}`"
              >L</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Maxilar Superior Temporal -->
      <div class="maxilar-section temporal">
        <div class="etiqueta-maxilar superior temporal">Superior - Dentición Temporal</div>
        <div class="dientes-fila temporal">
          <div 
            v-for="diente in dientesSuperioresTemporales" 
            :key="diente.id"
            class="diente-container-tradicional temporal"
          >
            <div class="diente-visual-tradicional temporal">
              <div 
                class="superficie-trad oclusal-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'oclusal') }"
                @click="clickSuperficie(diente, 'oclusal')"
                :title="`${diente.label} - Oclusal: ${getCondicionTexto(diente.superficies.oclusal)}`"
              ></div>
              <div class="fila-central-trad">
                <div 
                  class="superficie-trad mesial-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'mesial') }"
                  @click="clickSuperficie(diente, 'mesial')"
                  :title="`${diente.label} - Mesial: ${getCondicionTexto(diente.superficies.mesial)}`"
                ></div>
                <div class="centro-trad">{{ diente.label }}</div>
                <div 
                  class="superficie-trad distal-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'distal') }"
                  @click="clickSuperficie(diente, 'distal')"
                  :title="`${diente.label} - Distal: ${getCondicionTexto(diente.superficies.distal)}`"
                ></div>
              </div>
              <div 
                class="superficie-trad vestibular-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'vestibular') }"
                @click="clickSuperficie(diente, 'vestibular')"
                :title="`${diente.label} - Vestibular: ${getCondicionTexto(diente.superficies.vestibular)}`"
              ></div>
              <div 
                class="superficie-trad lingual-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'lingual') }"
                @click="clickSuperficie(diente, 'lingual')"
                :title="`${diente.label} - Lingual: ${getCondicionTexto(diente.superficies.lingual)}`"
              >L</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Separador central elegante -->
      <div class="separador-central">
        <div class="linea-separadora-completa"></div>
      </div>

      <!-- Maxilar Inferior Temporal -->
      <div class="maxilar-section temporal">
        <div class="etiqueta-maxilar inferior temporal">Inferior - Dentición Temporal</div>
        <div class="dientes-fila temporal">
          <div 
            v-for="diente in dientesInferioresTemporales" 
            :key="diente.id"
            class="diente-container-tradicional temporal"
          >
            <div class="diente-visual-tradicional temporal">
              <div 
                class="superficie-trad lingual-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'lingual') }"
                @click="clickSuperficie(diente, 'lingual')"
                :title="`${diente.label} - Lingual: ${getCondicionTexto(diente.superficies.lingual)}`"
              >L</div>
              <div 
                class="superficie-trad vestibular-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'vestibular') }"
                @click="clickSuperficie(diente, 'vestibular')"
                :title="`${diente.label} - Vestibular: ${getCondicionTexto(diente.superficies.vestibular)}`"
              ></div>
              <div class="fila-central-trad">
                <div 
                  class="superficie-trad mesial-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'mesial') }"
                  @click="clickSuperficie(diente, 'mesial')"
                  :title="`${diente.label} - Mesial: ${getCondicionTexto(diente.superficies.mesial)}`"
                ></div>
                <div class="centro-trad">{{ diente.label }}</div>
                <div 
                  class="superficie-trad distal-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'distal') }"
                  @click="clickSuperficie(diente, 'distal')"
                  :title="`${diente.label} - Distal: ${getCondicionTexto(diente.superficies.distal)}`"
                ></div>
              </div>
              <div 
                class="superficie-trad oclusal-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'oclusal') }"
                @click="clickSuperficie(diente, 'oclusal')"
                :title="`${diente.label} - Oclusal: ${getCondicionTexto(diente.superficies.oclusal)}`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Maxilar Inferior Permanente -->
      <div class="maxilar-section">
        <div class="etiqueta-maxilar inferior">Maxilar Inferior - Dentición Permanente</div>
        <div class="dientes-fila">
          <div 
            v-for="diente in dientesInferioresPermanentes" 
            :key="diente.id"
            class="diente-container-tradicional"
          >
            <div class="diente-visual-tradicional">
              <div 
                class="superficie-trad lingual-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'lingual') }"
                @click="clickSuperficie(diente, 'lingual')"
                :title="`${diente.label} - Lingual: ${getCondicionTexto(diente.superficies.lingual)}`"
              >L</div>
              <div 
                class="superficie-trad vestibular-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'vestibular') }"
                @click="clickSuperficie(diente, 'vestibular')"
                :title="`${diente.label} - Vestibular: ${getCondicionTexto(diente.superficies.vestibular)}`"
              ></div>
              <div class="fila-central-trad">
                <div 
                  class="superficie-trad mesial-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'mesial') }"
                  @click="clickSuperficie(diente, 'mesial')"
                  :title="`${diente.label} - Mesial: ${getCondicionTexto(diente.superficies.mesial)}`"
                ></div>
                <div class="centro-trad">{{ diente.label }}</div>
                <div 
                  class="superficie-trad distal-trad"
                  :style="{ backgroundColor: getColorSuperficie(diente, 'distal') }"
                  @click="clickSuperficie(diente, 'distal')"
                  :title="`${diente.label} - Distal: ${getCondicionTexto(diente.superficies.distal)}`"
                ></div>
              </div>
              <div 
                class="superficie-trad oclusal-trad"
                :style="{ backgroundColor: getColorSuperficie(diente, 'oclusal') }"
                @click="clickSuperficie(diente, 'oclusal')"
                :title="`${diente.label} - Oclusal: ${getCondicionTexto(diente.superficies.oclusal)}`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instrucciones compactas -->
    <div class="instrucciones-compactas mb-2">
      <small class="text-primary">
        <i class="fas fa-info-circle me-1"></i>
        <strong>Instrucciones:</strong> Selecciona condición → Clic en superficie del diente
      </small>
    </div>

    <!-- Resumen de hallazgos compacto -->
    <div v-if="hallazgosEncontrados.length > 0" class="resumen-hallazgos-compacto">
      <div class="resumen-header">
        <h6 class="fw-bold text-primary mb-0">
          <i class="fas fa-clipboard-list me-1"></i>
          Hallazgos ({{ hallazgosEncontrados.length }})
        </h6>
      </div>
      <div class="table-responsive">
        <table class="table table-sm table-striped mb-0">
          <thead class="table-primary">
            <tr>
              <th>Diente</th>
              <th>Superficie</th>
              <th>Condición</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hallazgo, index) in hallazgosEncontrados" :key="index">
              <td class="fw-bold">{{ hallazgo.diente }}</td>
              <td>{{ hallazgo.superficie }}</td>
              <td>
                <span 
                  class="badge"
                  :style="{ 
                    backgroundColor: conditionColors[hallazgo.condicion],
                    color: hallazgo.condicion === 'missing' || hallazgo.condicion === 'extraction' ? 'white' : 'black'
                  }"
                >
                  {{ conditionLabels[hallazgo.condicion] }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-outline-danger btn-sm"
                  @click="limpiarHallazgo(hallazgo)"
                  title="Eliminar hallazgo"
                >
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

type EstadoDiente = 'healthy' | 'caries' | 'filling' | 'crown' | 'missing' | 'root-canal' | 'implant' | 'bridge' | 'extraction';
type SuperficieDiente = 'oclusal' | 'mesial' | 'distal' | 'vestibular' | 'lingual';

interface SuperficiesDiente {
  oclusal: EstadoDiente;
  mesial: EstadoDiente;
  distal: EstadoDiente;
  vestibular: EstadoDiente;
  lingual: EstadoDiente;
}

interface DienteDetallado {
  id: string;
  label: string;
  superficies: SuperficiesDiente;
  observacion?: string;
}

interface HallazgoOdontologico {
  diente: string;
  superficie: string;
  condicion: EstadoDiente;
}

// Props
interface Props {
  modelValue?: DienteDetallado[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: DienteDetallado[]];
  'update:hallazgos': [value: HallazgoOdontologico[]];
  change: [value: DienteDetallado[]];
}>();

// Estado local - solo condición activa
const condicionActiva = ref<EstadoDiente>('caries');

// Constantes de colores y etiquetas
const conditionColors: Record<EstadoDiente, string> = {
  healthy: "#ffffff",
  caries: "#dc3545",
  filling: "#6c757d", 
  crown: "#ffc107",
  missing: "#000000",
  "root-canal": "#e83e8c",
  implant: "#17a2b8",
  bridge: "#fd7e14",
  extraction: "#6f42c1",
};

const conditionLabels: Record<EstadoDiente, string> = {
  healthy: "Sano",
  caries: "Caries",
  filling: "Obturación",
  crown: "Corona", 
  missing: "Ausente",
  "root-canal": "Endodoncia",
  implant: "Implante",
  bridge: "Puente",
  extraction: "Extracción",
};

const surfaceLabels: Record<SuperficieDiente, string> = {
  oclusal: "Oclusal",
  mesial: "Mesial",
  distal: "Distal",
  vestibular: "Vestibular",
  lingual: "Lingual",
};

// Arrays de dientes
const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
const upperDeciduousTeeth = ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"];
const lowerDeciduousTeeth = ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"];

// Crear superficies iniciales
const createInitialSurfaces = (): SuperficiesDiente => ({
  oclusal: 'healthy',
  mesial: 'healthy',
  distal: 'healthy',
  vestibular: 'healthy',
  lingual: 'healthy'
});

// Estado de todos los dientes - usar Map para mejor performance
const allTeethMap = new Map<string, DienteDetallado>();

// Inicializar Map
const initializeTeethMap = () => {
  const allNumbers = [...upperTeeth, ...lowerTeeth, ...upperDeciduousTeeth, ...lowerDeciduousTeeth];
  allNumbers.forEach(num => {
    allTeethMap.set(num, {
      id: num,
      label: num,
      superficies: createInitialSurfaces(),
      observacion: ''
    });
  });
};

// Computed para dientes separados por tipo
const dientesSuperioresPermanentes = computed(() => {
  return upperTeeth.map(num => allTeethMap.get(num)!).filter(Boolean);
});

const dientesSuperioresTemporales = computed(() => {
  return upperDeciduousTeeth.map(num => allTeethMap.get(num)!).filter(Boolean);
});

const dientesInferioresPermanentes = computed(() => {
  return lowerTeeth.map(num => allTeethMap.get(num)!).filter(Boolean);
});

const dientesInferioresTemporales = computed(() => {
  return lowerDeciduousTeeth.map(num => allTeethMap.get(num)!).filter(Boolean);
});

// Computed para hallazgos - optimizado con reactividad mejorada
const hallazgosEncontrados = computed(() => {
  const hallazgos: HallazgoOdontologico[] = [];
  
  // Forzar reactividad accediendo a todos los dientes
  const allDientes = [
    ...dientesSuperioresPermanentes.value,
    ...dientesSuperioresTemporales.value,
    ...dientesInferioresPermanentes.value,
    ...dientesInferioresTemporales.value
  ];
  
  for (const diente of allDientes) {
    for (const [superficie, condicion] of Object.entries(diente.superficies)) {
      if (condicion !== 'healthy') {
        hallazgos.push({
          diente: diente.label,
          superficie: surfaceLabels[superficie as SuperficieDiente],
          condicion: condicion as EstadoDiente
        });
      }
    }
  }
  
  return hallazgos;
});

// Métodos optimizados
const clickSuperficie = (diente: DienteDetallado, superficie: SuperficieDiente) => {
  // Obtener el diente del Map para asegurar referencia correcta
  const toothRef = allTeethMap.get(diente.id);
  if (toothRef) {
    toothRef.superficies[superficie] = condicionActiva.value;
    emitirCambios();
  }
};

const getColorSuperficie = (diente: DienteDetallado, superficie: SuperficieDiente): string => {
  return conditionColors[diente.superficies[superficie]];
};

const getCondicionTexto = (condicion: EstadoDiente): string => {
  return conditionLabels[condicion];
};

const limpiarHallazgo = (hallazgo: HallazgoOdontologico) => {
  // Encontrar el diente en el Map
  for (const [_, diente] of allTeethMap) {
    if (diente.label === hallazgo.diente) {
      const superficie = Object.keys(surfaceLabels).find(
        key => surfaceLabels[key as SuperficieDiente] === hallazgo.superficie
      ) as SuperficieDiente;
      
      if (superficie) {
        diente.superficies[superficie] = 'healthy';
        emitirCambios();
        break;
      }
    }
  }
};

const emitirCambios = () => {
  // Solo emitir dientes que tienen al menos una superficie no sana
  const dientesConHallazgos: DienteDetallado[] = [];
  
  for (const [_, diente] of allTeethMap) {
    const hasConditions = Object.values(diente.superficies).some(superficie => superficie !== 'healthy');
    if (hasConditions) {
      dientesConHallazgos.push({
        id: diente.id,
        label: diente.label,
        superficies: { ...diente.superficies }, // Crear copia
        observacion: diente.observacion
      });
    }
  }
  
  // Emitir los hallazgos individuales para la tabla
  const hallazgos = hallazgosEncontrados.value;
  console.log('📊 Emitiendo hallazgos encontrados:', hallazgos);
  
  emit('update:modelValue', dientesConHallazgos);
  emit('update:hallazgos', [...hallazgos]); // Emitir hallazgos también
  emit('change', dientesConHallazgos);
};

const inicializarDatos = () => {
  if (!props.modelValue) return;
  
  // Reinicializar todos los dientes a sano
  for (const [_, diente] of allTeethMap) {
    diente.superficies = createInitialSurfaces();
    diente.observacion = '';
  }
  
  // Aplicar datos del modelo si existen
  if (props.modelValue.length > 0) {
    props.modelValue.forEach(dienteExterno => {
      const dienteLocal = allTeethMap.get(dienteExterno.id);
      if (dienteLocal) {
        dienteLocal.superficies = { ...dienteExterno.superficies };
        dienteLocal.observacion = dienteExterno.observacion || '';
      }
    });
  }
};

// Watchers optimizados
watch(() => props.modelValue, (newValue, oldValue) => {
  // Solo actualizar si realmente cambió externamente
  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    inicializarDatos();
  }
}, { deep: true });

// Watch para forzar reactividad cuando cambia la condición activa
watch(condicionActiva, () => {
  // Forzar rerender de los computed
});

// Inicialización
initializeTeethMap();
inicializarDatos();
</script>

<style scoped>
/* Estilos del odontograma optimizado */
.odontograma-compacto {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  width: 100%;
  overflow: hidden;
}

.controles .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Layout horizontal para condición y leyenda - sin overlap */
.controles-leyenda-fila {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: start;
  margin-bottom: 1rem;
}

.controles-section {
  min-width: 0;
}

.leyenda-compacta {
  min-width: max-content;
}
.leyenda-items-horizontal {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
}

.estado-box {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
}

/* Guía de superficies más compacta */
.guia-superficies-compacta {
  background: #fef7ff;
  border-radius: 0.375rem;
  padding: 0.5rem;
  border: 1px solid #e879f9;
  margin-bottom: 1rem;
}

.guia-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.diente-ejemplo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  border: 2px solid #8b5cf6;
  border-radius: 4px;
  padding: 2px;
  background: #ffffff;
}

.fila-demo {
  display: flex;
  gap: 1px;
}

.superficie-demo {
  width: 18px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  border: 1px solid #8b5cf6;
  cursor: help;
}

.oclusal-demo { background: #fbbf24; color: #000; }
.mesial-demo { background: #10b981; color: #fff; }
.distal-demo { background: #3b82f6; color: #fff; }
.vestibular-demo { background: #ef4444; color: #fff; }
.lingual-demo { background: #8b5cf6; color: #fff; }
.centro-demo { background: #f3f4f6; color: #374151; cursor: default; }

/* Grid completo del odontograma mixto */
.odontograma-grid-completa {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 100%;
}

.maxilar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 0.5rem;
}

.maxilar-section.temporal {
  margin-bottom: 0.25rem;
}

/* Etiquetas de maxilares */
.etiqueta-maxilar {
  font-weight: 600;
  color: #4f46e5;
  font-size: 0.85rem;
  background: linear-gradient(90deg, #e0e7ff, #c7d2fe);
  padding: 0.2rem 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #a5b4fc;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.5rem;
}

.etiqueta-maxilar.temporal {
  background: linear-gradient(90deg, #fef3e2, #fde8c7);
  border-color: #f59e0b;
  color: #92400e;
  font-size: 0.8rem;
}

/* Separador central simplificado */
.separador-central {
  margin: 1rem 0;
}

.linea-separadora-completa {
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #4f46e5, transparent);
  border-radius: 1.5px;
}

/* Filas de dientes optimizadas para múltiples tipos */
.dientes-fila {
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  padding: 0.25rem;
}

.dientes-fila.temporal {
  gap: 4px;
  padding: 0.25rem 2rem;
}

/* Contenedor de diente tradicional */
.diente-container-tradicional {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin: 1px;
}

.diente-container-tradicional.temporal {
  margin: 2px;
}

/* Visual del diente tradicional - como diagrama clásico */
.diente-visual-tradicional {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  border: 2px solid #4a5568;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.diente-visual-tradicional.temporal {
  border-color: #d69e2e;
  border-width: 1.5px;
  border-radius: 4px;
}

/* Fila central del diente */
.fila-central-trad {
  display: flex;
  gap: 1px;
  align-items: center;
}

/* Superficies tradicionales - más compactas */
.superficie-trad {
  width: 24px;
  height: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  user-select: none;
  position: relative;
}

.superficie-trad:hover {
  transform: scale(1.08);
  border-color: #2563eb;
  box-shadow: 0 3px 12px rgba(37, 99, 235, 0.4);
  z-index: 10;
}

/* Centro del diente - número visible más pequeño */
.centro-trad {
  width: 24px;
  height: 18px;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border: 2px solid #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #2d3748;
  font-weight: 700;
  cursor: default;
}

/* Superficie lingual tradicional más pequeña */
.superficie-trad.lingual-trad {
  width: 26px;
  height: 14px;
  border-radius: 3px;
  font-size: 0.6rem;
  margin: 1px 0;
  border: 2px solid #4a5568;
  background: rgba(255, 255, 255, 0.95);
}

.superficie-trad.lingual-trad:hover {
  transform: scale(1.12);
}

/* Superficies temporales aún más pequeñas */
.diente-visual-tradicional.temporal .superficie-trad {
  width: 20px;
  height: 16px;
  font-size: 0.6rem;
}

.diente-visual-tradicional.temporal .centro-trad {
  width: 20px;
  height: 16px;
  font-size: 0.7rem;
  border-width: 1.5px;
}

.diente-visual-tradicional.temporal .superficie-trad.lingual-trad {
  width: 22px;
  height: 12px;
  font-size: 0.55rem;
}

.instrucciones-compactas {
  text-align: center;
  padding: 0.5rem;
  background: #e0f2fe;
  border-radius: 0.375rem;
  border: 1px solid #b3e5fc;
  margin-bottom: 1rem;
}

.resumen-hallazgos-compacto {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
}

.resumen-header {
  margin-bottom: 0.75rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  font-size: 0.85rem;
  font-weight: 600;
  background: #e0e7ff !important;
  border-color: #c7d2fe;
  padding: 0.5rem;
}

.table td {
  font-size: 0.85rem;
  vertical-align: middle;
  padding: 0.5rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Responsive mejorado para diseño tradicional */
@media (max-width: 1200px) {
  .superficie-trad {
    width: 22px;
    height: 16px;
    font-size: 0.6rem;
  }
  
  .centro-trad {
    width: 22px;
    height: 16px;
    font-size: 0.7rem;
  }
  
  .superficie-trad.lingual-trad {
    width: 24px;
    height: 12px;
  }
}

@media (max-width: 768px) {
  .odontograma-compacto {
    padding: 0.75rem;
  }
  
  .controles-leyenda-fila {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .leyenda-items-horizontal {
    gap: 0.5rem;
    justify-content: center;
  }
  
  .leyenda-item {
    font-size: 0.7rem;
  }
  
  .dientes-fila {
    gap: 2px;
    padding: 0.2rem;
  }
  
  .dientes-fila.temporal {
    padding: 0.2rem 1rem;
  }
  
  .superficie-trad {
    width: 20px;
    height: 16px;
    font-size: 0.6rem;
  }
  
  .centro-trad {
    width: 20px;
    height: 16px;
    font-size: 0.7rem;
  }
  
  .superficie-trad.lingual-trad {
    width: 22px;
    height: 12px;
  }
  
  .etiqueta-maxilar {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .odontograma-compacto {
    padding: 0.5rem;
  }
  
  .controles-leyenda-fila {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .leyenda-items-horizontal {
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
  }
  
  .dientes-fila {
    gap: 1px;
    padding: 0.15rem;
  }
  
  .dientes-fila.temporal {
    padding: 0.15rem 0.5rem;
  }
  
  .superficie-trad {
    width: 18px;
    height: 14px;
    font-size: 0.55rem;
  }
  
  .centro-trad {
    width: 18px;
    height: 14px;
    font-size: 0.65rem;
  }
  
  .superficie-trad.lingual-trad {
    width: 20px;
    height: 10px;
  }
  
  .etiqueta-maxilar {
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
  }
}
</style>
