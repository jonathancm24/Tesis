<!-- src/views/student/OdontogramView.vue -->

<template>
<div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white rounded-lg shadow-xl overflow-hidden">        
 <div class="p-6">
          <!-- Patient Info -->
          <div class="patient-info-card">
            <div class="card-header">
              <h2 class="card-title">
                <svg class="w-1 h-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Información del Paciente
              </h2>
            </div>
            <div class="patient-form">
              <div class="form-group">
                <label for="name" class="form-label">Nombre</label>
                <input
                  id="name"
                  v-model="patientInfo.name"
                  type="text"
                  placeholder="Nombre completo"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="age" class="form-label">Edad</label>
                <input
                  id="age"
                  v-model="patientInfo.age"
                  type="number"
                  placeholder="Edad"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="date" class="form-label">Fecha</label>
                <input
                  id="date"
                  v-model="patientInfo.date"
                  type="date"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="dentist" class="form-label">Odontólogo</label>
                <input
                  id="dentist"
                  v-model="patientInfo.dentist"
                  type="text"
                  placeholder="Dr./Dra."
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="controls-card">
            <div class="condition-buttons">
              <button
                v-for="(label, condition) in conditionLabels"
                :key="condition"
                @click="selectedCondition = condition"
                :class="['condition-btn', { 'condition-btn-active': selectedCondition === condition }]"
                :style="getConditionButtonStyle(condition)"
              >
                {{ label }}
              </button>
            </div>

            <div class="action-buttons">
              <button @click="clearAll" class="btn btn-outline">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Limpiar Todo
              </button>
              <button @click="showNotesDialog = true" class="btn btn-outline">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Ver Notas
              </button>
              <button @click="exportData" class="btn btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Exportar Datos
              </button>
            </div>
          </div>

          <!-- Dental Chart -->
          <div class="dental-chart">
            <!-- Upper permanent teeth -->
            <div class="teeth-section">
              <div class="section-header">
                <h3 class="section-title">Dientes Permanentes Superiores</h3>
              </div>
              <div class="teeth-grid">
                <div
                  v-for="toothNumber in upperTeeth"
                  :key="toothNumber"
                  class="tooth-container"
                >
                  <div class="tooth-number">{{ toothNumber }}</div>
                  <div 
                    :class="getToothClasses(toothNumber)" 
                    @click="selectTooth(toothNumber)"
                  >
                    <!-- Surfaces -->
                    <div
                      class="tooth-surface tooth-occlusal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.occlusal] }"
                      @click.stop="updateToothSurface(toothNumber, 'occlusal')"
                      :title="'Oclusal - ' + conditionLabels[teeth[toothNumber].surfaces.occlusal]"
                    />
                    <div
                      class="tooth-surface tooth-mesial"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.mesial] }"
                      @click.stop="updateToothSurface(toothNumber, 'mesial')"
                      :title="'Mesial - ' + conditionLabels[teeth[toothNumber].surfaces.mesial]"
                    />
                    <div
                      class="tooth-surface tooth-distal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.distal] }"
                      @click.stop="updateToothSurface(toothNumber, 'distal')"
                      :title="'Distal - ' + conditionLabels[teeth[toothNumber].surfaces.distal]"
                    />
                    <div
                      class="tooth-surface tooth-buccal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.buccal] }"
                      @click.stop="updateToothSurface(toothNumber, 'buccal')"
                      :title="'Vestibular - ' + conditionLabels[teeth[toothNumber].surfaces.buccal]"
                    />
                    <div
                      class="tooth-surface tooth-lingual"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.lingual] }"
                      @click.stop="updateToothSurface(toothNumber, 'lingual')"
                      :title="'Lingual - ' + conditionLabels[teeth[toothNumber].surfaces.lingual]"
                    />
                    <div v-if="teeth[toothNumber].notes" class="tooth-notes-indicator">!</div>
                  </div>
                  <div class="tooth-tooltip">
                    Diente {{ toothNumber }}
                    <div v-if="hasConditions(toothNumber)" class="tooltip-conditions">Tiene condiciones</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upper deciduous teeth -->
            <div class="teeth-section">
              <div class="section-header">
                <h3 class="section-title">Dientes Temporales Superiores</h3>
              </div>
              <div class="teeth-grid">
                <div
                  v-for="toothNumber in upperDeciduousTeeth"
                  :key="toothNumber"
                  class="tooth-container"
                >
                  <div class="tooth-number">{{ toothNumber }}</div>
                  <div 
                    :class="getToothClasses(toothNumber)" 
                    @click="selectTooth(toothNumber)"
                  >
                    <div
                      class="tooth-surface tooth-occlusal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.occlusal] }"
                      @click.stop="updateToothSurface(toothNumber, 'occlusal')"
                      :title="'Oclusal - ' + conditionLabels[teeth[toothNumber].surfaces.occlusal]"
                    />
                    <div
                      class="tooth-surface tooth-mesial"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.mesial] }"
                      @click.stop="updateToothSurface(toothNumber, 'mesial')"
                      :title="'Mesial - ' + conditionLabels[teeth[toothNumber].surfaces.mesial]"
                    />
                    <div
                      class="tooth-surface tooth-distal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.distal] }"
                      @click.stop="updateToothSurface(toothNumber, 'distal')"
                      :title="'Distal - ' + conditionLabels[teeth[toothNumber].surfaces.distal]"
                    />
                    <div
                      class="tooth-surface tooth-buccal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.buccal] }"
                      @click.stop="updateToothSurface(toothNumber, 'buccal')"
                      :title="'Vestibular - ' + conditionLabels[teeth[toothNumber].surfaces.buccal]"
                    />
                    <div
                      class="tooth-surface tooth-lingual"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.lingual] }"
                      @click.stop="updateToothSurface(toothNumber, 'lingual')"
                      :title="'Lingual - ' + conditionLabels[teeth[toothNumber].surfaces.lingual]"
                    />
                    <div v-if="teeth[toothNumber].notes" class="tooth-notes-indicator">!</div>
                  </div>
                  <div class="tooth-tooltip">
                    Diente {{ toothNumber }}
                    <div v-if="hasConditions(toothNumber)" class="tooltip-conditions">Tiene condiciones</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lower deciduous teeth -->
            <div class="teeth-section">
              <div class="section-header">
                <h3 class="section-title">Dientes Temporales Inferiores</h3>
              </div>
              <div class="teeth-grid">
                <div
                  v-for="toothNumber in lowerDeciduousTeeth"
                  :key="toothNumber"
                  class="tooth-container"
                >
                  <div class="tooth-number">{{ toothNumber }}</div>
                  <div 
                    :class="getToothClasses(toothNumber)" 
                    @click="selectTooth(toothNumber)"
                  >
                    <div
                      class="tooth-surface tooth-occlusal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.occlusal] }"
                      @click.stop="updateToothSurface(toothNumber, 'occlusal')"
                      :title="'Oclusal - ' + conditionLabels[teeth[toothNumber].surfaces.occlusal]"
                    />
                    <div
                      class="tooth-surface tooth-mesial"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.mesial] }"
                      @click.stop="updateToothSurface(toothNumber, 'mesial')"
                      :title="'Mesial - ' + conditionLabels[teeth[toothNumber].surfaces.mesial]"
                    />
                    <div
                      class="tooth-surface tooth-distal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.distal] }"
                      @click.stop="updateToothSurface(toothNumber, 'distal')"
                      :title="'Distal - ' + conditionLabels[teeth[toothNumber].surfaces.distal]"
                    />
                    <div
                      class="tooth-surface tooth-buccal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.buccal] }"
                      @click.stop="updateToothSurface(toothNumber, 'buccal')"
                      :title="'Vestibular - ' + conditionLabels[teeth[toothNumber].surfaces.buccal]"
                    />
                    <div
                      class="tooth-surface tooth-lingual"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.lingual] }"
                      @click.stop="updateToothSurface(toothNumber, 'lingual')"
                      :title="'Lingual - ' + conditionLabels[teeth[toothNumber].surfaces.lingual]"
                    />
                    <div v-if="teeth[toothNumber].notes" class="tooth-notes-indicator">!</div>
                  </div>
                  <div class="tooth-tooltip">
                    Diente {{ toothNumber }}
                    <div v-if="hasConditions(toothNumber)" class="tooltip-conditions">Tiene condiciones</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lower permanent teeth -->
            <div class="teeth-section">
              <div class="section-header">
                <h3 class="section-title">Dientes Permanentes Inferiores</h3>
              </div>
              <div class="teeth-grid">
                <div
                  v-for="toothNumber in lowerTeeth"
                  :key="toothNumber"
                  class="tooth-container"
                >
                  <div class="tooth-number">{{ toothNumber }}</div>
                  <div 
                    :class="getToothClasses(toothNumber)" 
                    @click="selectTooth(toothNumber)"
                  >
                    <div
                      class="tooth-surface tooth-occlusal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.occlusal] }"
                      @click.stop="updateToothSurface(toothNumber, 'occlusal')"
                      :title="'Oclusal - ' + conditionLabels[teeth[toothNumber].surfaces.occlusal]"
                    />
                    <div
                      class="tooth-surface tooth-mesial"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.mesial] }"
                      @click.stop="updateToothSurface(toothNumber, 'mesial')"
                      :title="'Mesial - ' + conditionLabels[teeth[toothNumber].surfaces.mesial]"
                    />
                    <div
                      class="tooth-surface tooth-distal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.distal] }"
                      @click.stop="updateToothSurface(toothNumber, 'distal')"
                      :title="'Distal - ' + conditionLabels[teeth[toothNumber].surfaces.distal]"
                    />
                    <div
                      class="tooth-surface tooth-buccal"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.buccal] }"
                      @click.stop="updateToothSurface(toothNumber, 'buccal')"
                      :title="'Vestibular - ' + conditionLabels[teeth[toothNumber].surfaces.buccal]"
                    />
                    <div
                      class="tooth-surface tooth-lingual"
                      :style="{ backgroundColor: conditionColors[teeth[toothNumber].surfaces.lingual] }"
                      @click.stop="updateToothSurface(toothNumber, 'lingual')"
                      :title="'Lingual - ' + conditionLabels[teeth[toothNumber].surfaces.lingual]"
                    />
                    <div v-if="teeth[toothNumber].notes" class="tooth-notes-indicator">!</div>
                  </div>
                  <div class="tooth-tooltip">
                    Diente {{ toothNumber }}
                    <div v-if="hasConditions(toothNumber)" class="tooltip-conditions">Tiene condiciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Tooth Notes -->
          <div v-if="selectedTooth" class="notes-section">
            <div class="card-header">
              <h3 class="card-title">Notas para Diente {{ selectedTooth }}</h3>
            </div>
            <div class="notes-content">
              <textarea
                v-model="teeth[selectedTooth].notes"
                :placeholder="`Agregar notas específicas para el diente ${selectedTooth}...`"
                rows="3"
                class="notes-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Legend -->
          <div class="legend-section">
            <div class="card-header">
              <h3 class="card-title">Leyenda de Condiciones</h3>
            </div>
            <div class="legend-content">
              <div class="legend-grid">
                <div
                  v-for="(label, condition) in conditionLabels"
                  :key="condition"
                  class="legend-item"
                >
                  <div
                    class="legend-color"
                    :style="{ backgroundColor: conditionColors[condition] }"
                  ></div>
                  <span class="legend-label">{{ label }}</span>
                </div>
              </div>
              <div class="instructions">
                <p class="instructions-text">
                  <strong>Instrucciones:</strong> Selecciona una condición y haz clic en las diferentes áreas de cada
                  diente. Haz clic en un diente para seleccionarlo y agregar notas específicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes Dialog -->
    <div
      v-if="showNotesDialog"
      class="modal-overlay"
      @click="showNotesDialog = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Resumen Completo del Paciente
          </h2>
          <button @click="showNotesDialog = false" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Patient Info Summary -->
          <div class="summary-section">
            <div class="summary-header">
              <h3 class="summary-title">Información del Paciente</h3>
            </div>
            <div class="summary-content">
              <div class="patient-summary-grid">
                <div><strong>Nombre:</strong> {{ patientInfo.name || 'No especificado' }}</div>
                <div><strong>Edad:</strong> {{ patientInfo.age || 'No especificada' }}</div>
                <div><strong>Fecha:</strong> {{ patientInfo.date }}</div>
                <div><strong>Odontólogo:</strong> {{ patientInfo.dentist || 'No especificado' }}</div>
              </div>
            </div>
          </div>

          <!-- Conditions Summary -->
          <div class="summary-section">
            <div class="summary-header">
              <h3 class="summary-title">Resumen de Condiciones Dentales</h3>
            </div>
            <div class="summary-content">
              <div v-if="patientSummary.length > 0" class="conditions-list">
                <div
                  v-for="{ toothNumber, conditions, notes } in patientSummary"
                  :key="toothNumber"
                  class="condition-item"
                >
                  <div class="condition-header">
                    <h4 class="condition-tooth">Diente {{ toothNumber }}</h4>
                    <span class="condition-count">
                      {{ conditions.length }} condición(es)
                    </span>
                  </div>

                  <div v-if="conditions.length > 0" class="condition-details">
                    <h5 class="condition-subtitle">Condiciones:</h5>
                    <div class="condition-tags">
                      <span
                        v-for="(condition, index) in conditions"
                        :key="index"
                        class="condition-tag"
                      >
                        {{ condition }}
                      </span>
                    </div>
                  </div>

                  <div v-if="notes" class="condition-notes">
                    <h5 class="condition-subtitle">Notas:</h5>
                    <p class="condition-notes-text">{{ notes }}</p>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="empty-text">No hay condiciones registradas para este paciente</p>
              </div>
            </div>
          </div>

          <!-- Export Date -->
          <div class="export-info">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11m-6 0h6"/>
            </svg>
            Generado el {{ currentDate }} a las {{ currentTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// Tipos y constantes
const conditionColors = {
  healthy: "#ffffff",
  caries: "#dc3545",
  filling: "#6c757d",
  crown: "#ffc107",
  missing: "#000000",
  "root-canal": "#e83e8c",
  implant: "#17a2b8",
  bridge: "#fd7e14",
  extraction: "#6f42c1",
}

const conditionLabels = {
  healthy: "Sano",
  caries: "Caries",
  filling: "Obturación",
  crown: "Corona",
  missing: "Ausente",
  "root-canal": "Endodoncia",
  implant: "Implante",
  bridge: "Puente",
  extraction: "Extracción",
}

const surfaceLabels = {
  occlusal: "Oclusal",
  mesial: "Mesial",
  distal: "Distal",
  buccal: "Vestibular",
  lingual: "Lingual",
}

// Arrays de dientes
const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"]
const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"]
const upperDeciduousTeeth = ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"]
const lowerDeciduousTeeth = ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"]

// Estado reactivo
const selectedCondition = ref('caries')
const selectedTooth = ref(null)
const showNotesDialog = ref(false)

const patientInfo = reactive({
  name: '',
  age: '',
  date: new Date().toISOString().split('T')[0],
  dentist: ''
})

// Inicializar dientes
const initializeTeeth = (numbers) => {
  const teeth = {}
  numbers.forEach(num => {
    teeth[num] = {
      number: num,
      surfaces: {
        occlusal: 'healthy',
        mesial: 'healthy',
        distal: 'healthy',
        buccal: 'healthy',
        lingual: 'healthy'
      },
      notes: ''
    }
  })
  return teeth
}

const teeth = reactive(initializeTeeth([
  ...upperTeeth, 
  ...lowerTeeth, 
  ...upperDeciduousTeeth, 
  ...lowerDeciduousTeeth
]))

// Computed: resumen paciente
const patientSummary = computed(() => {
  return Object.entries(teeth)
    .filter(([_, tooth]) => 
      Object.values(tooth.surfaces).some(surface => surface !== 'healthy') || 
      tooth.notes.trim() !== ''
    )
    .map(([toothNumber, tooth]) => {
      const conditions = Object.entries(tooth.surfaces)
        .filter(([_, condition]) => condition !== 'healthy')
        .map(([surface, condition]) => 
          `${surfaceLabels[surface]}: ${conditionLabels[condition]}`
        )
      
      return {
        toothNumber,
        conditions,
        notes: tooth.notes
      }
    })
})

const currentDate = computed(() => new Date().toLocaleDateString('es-ES'))
const currentTime = computed(() => new Date().toLocaleTimeString('es-ES'))

// Métodos
const selectTooth = (toothNumber) => {
  selectedTooth.value = selectedTooth.value === toothNumber ? null : toothNumber
}

const updateToothSurface = (toothNumber, surface) => {
  teeth[toothNumber].surfaces[surface] = selectedCondition.value
}

const clearAll = () => {
  Object.assign(teeth, initializeTeeth([
    ...upperTeeth, 
    ...lowerTeeth, 
    ...upperDeciduousTeeth, 
    ...lowerDeciduousTeeth
  ]))
  selectedTooth.value = null
}

const exportData = () => {
  const data = {
    patient: patientInfo,
    teeth: teeth,
    exportDate: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `odontograma_${(patientInfo.name || 'paciente').replace(/\s+/g, '_')}_${patientInfo.date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const getConditionButtonStyle = (condition) => {
  const isActive = selectedCondition.value === condition
  return {
    backgroundColor: isActive ? conditionColors[condition] : 'transparent',
    color: isActive 
      ? (condition === 'missing' || condition === 'extraction' ? 'white' : 'black')
      : 'inherit',
    borderColor: conditionColors[condition]
  }
}

const hasConditions = (toothNumber) => {
  return Object.values(teeth[toothNumber].surfaces).some(surface => surface !== 'healthy')
}

const getToothClasses = (toothNumber) => {
  return [
    'tooth-element',
    {
      'tooth-selected': selectedTooth.value === toothNumber,
      'tooth-has-conditions': hasConditions(toothNumber)
    }
  ]
}
</script>
<style src="@/assets/css/pages/student/OdontogramView.css" scoped></style>