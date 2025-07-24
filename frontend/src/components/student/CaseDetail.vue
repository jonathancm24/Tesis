<!-- src/components/student/CaseDetail.vue -->
<template>
  <div class="case-detail">
    <!-- Header -->
    <div class="cd-header">
      <h3>{{ caseData.title }} — {{ caseData.patientName }}</h3>
      <span class="badge" :class="statusClass(caseData.status)">
        {{ statusLabel(caseData.status) }}
      </span>
    </div>

    <!-- Información Básica -->
    <div class="cd-section">
      <h4>Información general</h4>
      <p><strong>Motivo:</strong> {{ caseData.reason }}</p>
      <p><strong>Síntomas:</strong> {{ caseData.symptoms }}</p>
      <p v-if="caseData.notes"><strong>Notas:</strong> {{ caseData.notes }}</p>
    </div>

    <!-- Preguntas Generales -->
    <div class="cd-section">
      <h4>Preguntas generales</h4>
      <ul>
        <li v-for="q in caseData.generalQuestions" :key="q.id">
          <strong>{{ q.label }}:</strong>
          <span v-if="q.answer">
            {{ q.answer }}
            <em :class="q.approved ? 'approved' : 'pending'">
              ({{ q.approved ? 'Aprobada' : 'Pendiente' }})
            </em>
          </span>
          <span v-else class="text-muted">— sin responder</span>
        </li>
      </ul>
    </div>

    <!-- Preguntas de Especialidad -->
    <div v-if="caseData.specialistQuestions.length" class="cd-section">
      <h4>Preguntas de {{ caseData.specialist }}</h4>
      <ul>
        <li v-for="q in caseData.specialistQuestions" :key="q.id">
          <strong>{{ q.label }}:</strong>
          <span v-if="q.answer">
            {{ q.answer }}
            <em :class="q.approved ? 'approved' : 'pending'">
              ({{ q.approved ? 'Aprobada' : 'Pendiente' }})
            </em>
          </span>
          <span v-else class="text-muted">— sin responder</span>
        </li>
      </ul>
    </div>

    <!-- Procedimientos -->
    <div class="cd-section">
      <h4>Procedimientos</h4>
      <ul>
        <li v-for="p in caseData.procedures" :key="p.code">
          <strong>{{ p.code }}</strong>
          <span v-if="p.teeth">— Diente(s): {{ p.teeth }}</span>
          : {{ p.description }}
        </li>
      </ul>
    </div>

    <!-- Prescripciones -->
    <div class="cd-section">
      <h4>Prescripciones</h4>
      <ul>
        <li v-for="r in caseData.prescriptions" :key="r.id">
          {{ r.drug }} — {{ r.dose }}
        </li>
      </ul>
    </div>

    <!-- Citas -->
    <div class="cd-section">
      <h4>Citas</h4>
      <ul>
        <li v-for="a in caseData.appointments" :key="a.id">
          {{ formatDate(a.date) }} — {{ a.status }}
          <span v-if="a.notes">({{ a.notes }})</span>
        </li>
      </ul>
    </div>

    <!-- Comentarios -->
    <div class="cd-section">
      <h4>Comentarios</h4>
      <ul>
        <li v-for="c in caseData.comments" :key="c.at + c.by">
          <small>{{ c.by }} ({{ formatDate(c.at) }}):</small> {{ c.text }}
        </li>
      </ul>
    </div>

    <!-- Odontograma -->
    <div class="cd-section">
      <h4>Odontograma</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Diente</th>
            <th>Estado</th>
            <th>Anotaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in caseData.odontogram" :key="o.tooth">
            <td>{{ o.tooth }}</td>
            <td>{{ o.status }}</td>
            <td>{{ o.annotations || '—' }}</td>
          </tr>
          <tr v-if="!caseData.odontogram.length">
            <td colspan="3" class="text-center text-muted">No hay datos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Periodontograma -->
    <div class="cd-section">
      <h4>Periodontograma</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Diente</th>
            <th>Profundidad (mm)</th>
            <th>Nivel inserción (mm)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in caseData.periodontogram" :key="p.tooth">
            <td>{{ p.tooth }}</td>
            <td>{{ p.probingDepth }}</td>
            <td>{{ p.attachmentLevel }}</td>
          </tr>
          <tr v-if="!caseData.periodontogram.length">
            <td colspan="3" class="text-center text-muted">No hay datos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClinicalCase } from '@/mocks/student/clinicalCases'

// Extraemos directamente la prop que vamos a usar
const { caseData } = defineProps<{ caseData: ClinicalCase }>()

/** Helper para formato legible */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function statusLabel(s: ClinicalCase['status']) {
  return {
    pendiente_general: 'Pendiente (General)',
    pendiente_especialidad: 'Pendiente (Especialidad)',
    aprobado: 'Aprobado',
    completado: 'Completado'
  }[s]
}

function statusClass(s: ClinicalCase['status']) {
  return {
    pendiente_general: 'badge-warning',
    pendiente_especialidad: 'badge-info',
    aprobado: 'badge-success',
    completado: 'badge-primary'
  }[s]
}
</script>

<style scoped>
.case-detail {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  background: #fff;
}
.cd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}
.cd-section {
  margin-bottom: 1.5rem;
}
.approved {
  color: #198754;
  font-style: italic;
}
.pending {
  color: #ffc107;
  font-style: italic;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
}
.badge-warning {
  background-color: #ffc107;
  color: #212529;
  padding: 0.25em 0.5em;
  border-radius: 0.25rem;
}
.badge-info {
  background-color: #0dcaf0;
  color: #212529;
  padding: 0.25em 0.5em;
  border-radius: 0.25rem;
}
.badge-success {
  background-color: #198754;
  color: #fff;
  padding: 0.25em 0.5em;
  border-radius: 0.25rem;
}
.badge-primary {
  background-color: #0d6efd;
  color: #fff;
  padding: 0.25em 0.5em;
  border-radius: 0.25rem;
}
.text-muted {
  color: #6c757d;
}
</style>
