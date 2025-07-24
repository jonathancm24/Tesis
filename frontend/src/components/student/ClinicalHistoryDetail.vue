<!-- src/components/student/ClinicalHistoryDetail.vue --><template>
  <div class="history-detail card shadow-sm p-3">
    <h5 class="card-title mb-3">Historia Clínica</h5>
    <dl class="row">
      <dt class="col-sm-4">Datos Generales</dt>
      <dd class="col-sm-8">{{ history.generalData }}</dd>
      <dt class="col-sm-4">Antecedentes Dentales</dt>
      <dd class="col-sm-8">{{ history.dentalHistory }}</dd>
      <dt class="col-sm-4">Hallazgos Intraorales</dt>
      <dd class="col-sm-8">{{ history.intraoralFindings }}</dd>
      <dt class="col-sm-4">Alergias</dt>
      <dd class="col-sm-8">{{ history.allergies.join(', ') }}</dd>
      <dt class="col-sm-4">Medicamentos</dt>
      <dd class="col-sm-8">{{ history.medications.join(', ') }}</dd>
      <dt class="col-sm-4">Antecedentes Sistémicos</dt>
      <dd class="col-sm-8">{{ history.systemicHistory }}</dd>
    </dl>
  </div>
</template>

<script setup lang="ts">
import type { ClinicalHistory } from '../../mocks/student/clinicalHistories';

// Desestructuramos la prop directamente
const { history } = defineProps<{ history: ClinicalHistory }>();
</script>

<style scoped>
.history-detail dt {
  font-weight: 600;
}
.history-detail dd {
  margin-bottom: var(--spacer);
}
</style>
