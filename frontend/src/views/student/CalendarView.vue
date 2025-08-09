<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Calendario</h2>
        <p class="text-muted">Gestiona tus citas y disponibilidad de profesores</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalCita">
        <i class="fas fa-plus me-2"></i>Nueva Cita
      </button>
    </div>

    <!-- Filtros y vista -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Vista</label>
            <select v-model="tipoVista" class="form-select">
              <option value="month">Mes</option>
              <option value="week">Semana</option>
              <option value="day">Día</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Especialidad</label>
            <select v-model="filtroEspecialidad" class="form-select">
              <option value="">Todas</option>
              <option value="operatoria">Operatoria</option>
              <option value="endodoncia">Endodoncia</option>
              <option value="periodoncia">Periodoncia</option>
              <option value="cirugia">Cirugía</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Profesor</label>
            <select v-model="filtroProfesor" class="form-select">
              <option value="">Todos</option>
              <option value="dr-martinez">Dr. Martínez</option>
              <option value="dra-lopez">Dra. López</option>
              <option value="dr-garcia">Dr. García</option>
            </select>
          </div>
          <div class="col-md-3">
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary" @click="irMesAnterior">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="btn btn-outline-secondary" @click="hoy">Hoy</button>
              <button class="btn btn-outline-secondary" @click="irMesSiguiente">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendario -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="card-title mb-0">{{ tituloCalendario }}</h5>
      </div>
      <div class="card-body p-0">
        <!-- Vista mensual -->
        <div v-if="tipoVista === 'month'" class="calendar-grid">
          <div class="calendar-header">
            <div v-for="dia in diasSemana" :key="dia" class="calendar-day-name">
              {{ dia }}
            </div>
          </div>
          <div class="calendar-body">
            <div 
              v-for="(dia, index) in diasDelMes" 
              :key="index"
              class="calendar-day"
              :class="{ 
                'other-month': !dia.esMesActual,
                'today': dia.esHoy,
                'has-appointments': dia.citas.length > 0
              }"
            >
              <div class="day-number">{{ dia.numero }}</div>
              <div class="day-appointments">
                <div 
                  v-for="cita in dia.citas.slice(0, 2)" 
                  :key="cita.id"
                  class="appointment"
                  :class="getClaseCita(cita.estado)"
                  @click="verCita(cita)"
                >
                  <small>{{ cita.hora }} - {{ cita.profesor }}</small>
                </div>
                <div v-if="dia.citas.length > 2" class="more-appointments">
                  +{{ dia.citas.length - 2 }} más
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de citas (vista semanal/diaria) -->
        <div v-else class="p-3">
          <div v-for="cita in citasFiltradas" :key="cita.id" class="cita-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">{{ cita.especialidad }}</h6>
                <p class="text-muted small mb-1">
                  <i class="fas fa-user me-1"></i>{{ cita.profesor }}
                </p>
                <p class="text-muted small mb-1">
                  <i class="fas fa-clock me-1"></i>{{ formatearFechaHora(cita.fecha) }}
                </p>
                <p class="text-muted small mb-0">
                  <i class="fas fa-map-marker-alt me-1"></i>{{ cita.ubicacion }}
                </p>
              </div>
              <div class="text-end">
                <span class="badge" :class="getBadgeEstado(cita.estado)">
                  {{ cita.estado }}
                </span>
                <div class="mt-2">
                  <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="editarCita(cita.id)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="cancelarCita(cita.id)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Disponibilidad de profesores -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Disponibilidad de Profesores</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div v-for="profesor in profesores" :key="profesor.id" class="col-md-4 mb-3">
            <div class="card border">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                  <img :src="profesor.avatar" class="rounded-circle me-2" width="40" height="40">
                  <div>
                    <h6 class="mb-0">{{ profesor.nombre }}</h6>
                    <small class="text-muted">{{ profesor.especialidad }}</small>
                  </div>
                </div>
                <div class="mb-2">
                  <strong>Próximas disponibilidades:</strong>
                </div>
                <div v-for="slot in profesor.disponibilidad" :key="slot.id" class="mb-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small">{{ slot.fecha }} {{ slot.hora }}</span>
                    <button 
                      class="btn btn-sm btn-outline-success"
                      @click="agendarCita(profesor.id, slot)"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para nueva cita -->
  <div class="modal fade" id="modalCita" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ editandoCita ? 'Editar Cita' : 'Nueva Cita' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardarCita">
            <div class="mb-3">
              <label class="form-label">Especialidad</label>
              <select v-model="formularioCita.especialidad" class="form-select" required>
                <option value="">Seleccionar especialidad</option>
                <option value="operatoria">Operatoria Dental</option>
                <option value="endodoncia">Endodoncia</option>
                <option value="periodoncia">Periodoncia</option>
                <option value="cirugia">Cirugía Oral</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Profesor</label>
              <select v-model="formularioCita.profesorId" class="form-select" required>
                <option value="">Seleccionar profesor</option>
                <option v-for="prof in profesores" :key="prof.id" :value="prof.id">
                  {{ prof.nombre }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Fecha</label>
              <input v-model="formularioCita.fecha" type="date" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Hora</label>
              <input v-model="formularioCita.hora" type="time" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Motivo</label>
              <textarea v-model="formularioCita.motivo" class="form-control" rows="3" required></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarCita">
            {{ editandoCita ? 'Actualizar' : 'Agendar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Cita {
  id: number;
  especialidad: string;
  profesor: string;
  fecha: Date;
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada';
  ubicacion: string;
  motivo: string;
}

interface Profesor {
  id: number;
  nombre: string;
  especialidad: string;
  avatar: string;
  disponibilidad: {
    id: number;
    fecha: string;
    hora: string;
  }[];
}

interface DiaCalendario {
  numero: number;
  esMesActual: boolean;
  esHoy: boolean;
  citas: Cita[];
}

// Estados reactivos
const tipoVista = ref<'month' | 'week' | 'day'>('month');
const filtroEspecialidad = ref('');
const filtroProfesor = ref('');
const fechaActual = ref(new Date());
const editandoCita = ref(false);

const formularioCita = ref({
  especialidad: '',
  profesorId: '',
  fecha: '',
  hora: '',
  motivo: ''
});

// Datos de ejemplo
const citas = ref<Cita[]>([
  {
    id: 1,
    especialidad: 'Operatoria Dental',
    profesor: 'Dr. Martínez',
    fecha: new Date('2025-02-15T10:00:00'),
    hora: '10:00',
    estado: 'confirmada',
    ubicacion: 'Clínica 1',
    motivo: 'Revisión de caso clínico'
  },
  {
    id: 2,
    especialidad: 'Endodoncia',
    profesor: 'Dra. López',
    fecha: new Date('2025-02-18T14:30:00'),
    hora: '14:30',
    estado: 'pendiente',
    ubicacion: 'Clínica 2',
    motivo: 'Tratamiento de conducto'
  }
]);

const profesores = ref<Profesor[]>([
  {
    id: 1,
    nombre: 'Dr. Martínez',
    especialidad: 'Operatoria Dental',
    avatar: 'https://via.placeholder.com/40',
    disponibilidad: [
      { id: 1, fecha: '15 Feb', hora: '09:00' },
      { id: 2, fecha: '16 Feb', hora: '11:00' },
      { id: 3, fecha: '17 Feb', hora: '15:00' }
    ]
  },
  {
    id: 2,
    nombre: 'Dra. López',
    especialidad: 'Endodoncia',
    avatar: 'https://via.placeholder.com/40',
    disponibilidad: [
      { id: 4, fecha: '18 Feb', hora: '10:00' },
      { id: 5, fecha: '19 Feb', hora: '14:00' }
    ]
  }
]);

// Constantes
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Computed
const tituloCalendario = computed(() => {
  return fechaActual.value.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });
});

const diasDelMes = computed(() => {
  const año = fechaActual.value.getFullYear();
  const mes = fechaActual.value.getMonth();
  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);
  const diasPrevios = primerDia.getDay();
  const diasMes = ultimoDia.getDate();
  
  const dias: DiaCalendario[] = [];
  
  // Días del mes anterior
  for (let i = diasPrevios - 1; i >= 0; i--) {
    const fecha = new Date(año, mes, -i);
    dias.push({
      numero: fecha.getDate(),
      esMesActual: false,
      esHoy: false,
      citas: []
    });
  }
  
  // Días del mes actual
  for (let i = 1; i <= diasMes; i++) {
    const fecha = new Date(año, mes, i);
    const esHoy = fecha.toDateString() === new Date().toDateString();
    const citasDelDia = citas.value.filter(cita => 
      cita.fecha.toDateString() === fecha.toDateString()
    );
    
    dias.push({
      numero: i,
      esMesActual: true,
      esHoy,
      citas: citasDelDia
    });
  }
  
  // Completar la grilla
  const totalDias = dias.length;
  const diasFaltantes = 42 - totalDias; // 6 semanas x 7 días
  
  for (let i = 1; i <= diasFaltantes; i++) {
    dias.push({
      numero: i,
      esMesActual: false,
      esHoy: false,
      citas: []
    });
  }
  
  return dias;
});

const citasFiltradas = computed(() => {
  return citas.value.filter(cita => {
    const cumpleEspecialidad = !filtroEspecialidad.value || 
      cita.especialidad.toLowerCase().includes(filtroEspecialidad.value.toLowerCase());
    const cumpleProfesor = !filtroProfesor.value || 
      cita.profesor.toLowerCase().includes(filtroProfesor.value.toLowerCase());
    
    return cumpleEspecialidad && cumpleProfesor;
  });
});

// Métodos
const getClaseCita = (estado: string) => {
  const clases = {
    'confirmada': 'appointment-confirmed',
    'pendiente': 'appointment-pending',
    'cancelada': 'appointment-cancelled'
  };
  return clases[estado as keyof typeof clases] || '';
};

const getBadgeEstado = (estado: string) => {
  const clases = {
    'confirmada': 'bg-success',
    'pendiente': 'bg-warning',
    'cancelada': 'bg-danger'
  };
  return clases[estado as keyof typeof clases] || 'bg-secondary';
};

const formatearFechaHora = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const irMesAnterior = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() - 1, 1);
};

const irMesSiguiente = () => {
  fechaActual.value = new Date(fechaActual.value.getFullYear(), fechaActual.value.getMonth() + 1, 1);
};

const hoy = () => {
  fechaActual.value = new Date();
};

const abrirModalCita = () => {
  editandoCita.value = false;
  formularioCita.value = {
    especialidad: '',
    profesorId: '',
    fecha: '',
    hora: '',
    motivo: ''
  };
};

const verCita = (cita: Cita) => {
  console.log('Ver cita:', cita);
};

const editarCita = (id: number) => {
  console.log('Editar cita:', id);
  editandoCita.value = true;
};

const cancelarCita = (id: number) => {
  if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    const cita = citas.value.find(c => c.id === id);
    if (cita) {
      cita.estado = 'cancelada';
    }
  }
};

const agendarCita = (profesorId: number, slot: any) => {
  console.log('Agendar cita con profesor:', profesorId, 'en slot:', slot);
  abrirModalCita();
  formularioCita.value.profesorId = profesorId.toString();
};

const guardarCita = () => {
  console.log('Guardando cita:', formularioCita.value);
  // Aquí se guardaría la cita
};

onMounted(() => {
  console.log('Vista de calendario cargada');
});
</script>

<style scoped>
.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.calendar-day-name {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day.other-month {
  color: #adb5bd;
  background-color: #f8f9fa;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.calendar-day.has-appointments {
  background-color: #fff3cd;
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.day-appointments {
  font-size: 0.75rem;
}

.appointment {
  padding: 0.125rem 0.25rem;
  margin-bottom: 0.125rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.appointment-confirmed {
  background-color: #d4edda;
  color: #155724;
}

.appointment-pending {
  background-color: #fff3cd;
  color: #856404;
}

.appointment-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.more-appointments {
  color: #6c757d;
  font-style: italic;
}

.cita-item {
  transition: transform 0.2s ease-in-out;
}

.cita-item:hover {
  transform: translateY(-2px);
}
</style>
