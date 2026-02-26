<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Agendar Cita</h2>
        <button class="btn-close" @click="handleClose" aria-label="Cerrar">&times;</button>
      </div>

      <div class="modal-body">
        <div class="paciente-info">
          <h3>Paciente</h3>
          <p><strong>Nombre:</strong> {{ paciente.nombre }} {{ paciente.apellido }}</p>
          <p><strong>Documento:</strong> {{ paciente.numeroDocumento }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="cita-form">
          <div class="form-group">
            <label for="fecha">Fecha *</label>
            <input
              id="fecha"
              type="date"
              v-model="formData.fecha"
              :min="minDate"
              required
              class="form-control"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="horainicio">Hora Inicio *</label>
              <input
                id="horainicio"
                type="time"
                v-model="formData.horainicio"
                required
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="horafin">Hora Fin *</label>
              <input
                id="horafin"
                type="time"
                v-model="formData.horafin"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="especialidad">Especialidad *</label>
            <select
              id="especialidad"
              v-model="formData.especialidadId"
              required
              class="form-control"
            >
              <option value="" disabled>Seleccione una especialidad</option>
              <option
                v-for="especialidad in especialidades"
                :key="especialidad.id"
                :value="especialidad.id"
              >
                {{ especialidad.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="docente">Docente (Opcional)</label>
            <select
              id="docente"
              v-model="formData.docenteId"
              class="form-control"
            >
              <option :value="null">Sin asignar</option>
              <option
                v-for="docente in docentes"
                :key="docente.id"
                :value="docente.id"
              >
                {{ docente.nombre }} {{ docente.apellido }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              v-model="formData.observaciones"
              rows="3"
              class="form-control"
              placeholder="Ingrese observaciones adicionales..."
            ></textarea>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="handleClose" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Agendar Cita' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from '@/composables/useToast';
import citasService from '@/services/estudiantes/Citas/citas.service';
import { especialidadesService } from '@/services/Admin/especialidades.service';
import { usuariosService } from '@/services/Admin/usuarios.service';
import { useAuthStore } from '@/stores/auth';
import type { Paciente } from '@/types/pacientes.types';
import type { Especialidad } from '@/types/especialidades.types';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
}

const props = defineProps<{
  isOpen: boolean;
  paciente: Paciente;
}>();

const emit = defineEmits<{
  close: [];
  citaCreada: [];
}>();

const toast = useToast();
const authStore = useAuthStore();

const formData = ref({
  fecha: '',
  horainicio: '',
  horafin: '',
  especialidadId: '' as number | '',
  docenteId: null as number | null,
  observaciones: '',
});

const especialidades = ref<Especialidad[]>([]);
const docentes = ref<Usuario[]>([]);
const isSubmitting = ref(false);
const error = ref('');

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

const cargarEspecialidades = async () => {
  try {
    especialidades.value = await especialidadesService.getAll();
  } catch (err) {
    console.error('Error al cargar especialidades:', err);
    toast.error('Error al cargar especialidades');
  }
};

const cargarDocentes = async () => {
  try {
    const response = await usuariosService.getAll({ limit: 200 });
    docentes.value = response.data.filter((u: any) => u.role?.nombre === 'PROFESOR');
  } catch (err) {
    console.error('Error al cargar docentes:', err);
    toast.error('Error al cargar docentes');
  }
};

const validarFormulario = (): boolean => {
  error.value = '';

  if (!formData.value.fecha) {
    error.value = 'La fecha es requerida';
    return false;
  }

  if (!formData.value.horainicio || !formData.value.horafin) {
    error.value = 'Las horas de inicio y fin son requeridas';
    return false;
  }

  if (formData.value.horainicio >= formData.value.horafin) {
    error.value = 'La hora de fin debe ser posterior a la hora de inicio';
    return false;
  }

  if (!formData.value.especialidadId) {
    error.value = 'La especialidad es requerida';
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validarFormulario()) return;

  if (!authStore.user?.id) {
    toast.error('No se pudo obtener el ID del estudiante');
    return;
  }

  isSubmitting.value = true;
  error.value = '';

  try {
    await citasService.crearCita({
      fecha: formData.value.fecha,
      horainicio: formData.value.horainicio,
      horafin: formData.value.horafin,
      pacienteId: props.paciente.id,
      especialidadId: Number(formData.value.especialidadId),
      estudianteId: authStore.user.id,
      docenteId: formData.value.docenteId || undefined,
      observaciones: formData.value.observaciones || undefined,
    });

    toast.success('Cita agendada exitosamente');
    emit('citaCreada');
    handleClose();
  } catch (err: any) {
    console.error('Error al crear cita:', err);
    error.value = err.response?.data?.message || 'Error al agendar la cita';
    toast.error(error.value);
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  formData.value = {
    fecha: '',
    horainicio: '',
    horafin: '',
    especialidadId: '',
    docenteId: null,
    observaciones: '',
  };
  error.value = '';
  emit('close');
};

const handleOverlayClick = () => {
  if (!isSubmitting.value) {
    handleClose();
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    cargarEspecialidades();
    cargarDocentes();
  }
});

onMounted(() => {
  if (props.isOpen) {
    cargarEspecialidades();
    cargarDocentes();
  }
});
</script>

<style scoped src="@/assets/styles/Estudiantes/components/citas.css"></style>
