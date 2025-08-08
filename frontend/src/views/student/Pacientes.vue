<!-- Gestión de Pacientes -->
<template>
  <div class="container-fluid py-4 bg-light min-vh-100">
    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h1 class="fw-bold">Gestión de Pacientes</h1>
        <p class="text-muted">Registra, consulta y gestiona la información de tus pacientes</p>
      </div>
      <button 
        class="btn btn-primary btn-lg"
        @click="abrirFormularioRegistro"
      >
        <i class="fas fa-plus me-2"></i>
        Registrar Paciente
      </button>
    </div>

    <!-- BARRA DE BÚSQUEDA Y FILTROS -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="input-group">
          <input
            v-model="searchTerm"
            @input="onSearch"
            type="text"
            class="form-control"
            placeholder="Buscar paciente por nombre, apellido o cédula..."
          />
          <button 
            class="btn btn-outline-secondary"
            @click="limpiarBusqueda"
            v-if="searchTerm"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex gap-2">
          <select v-model="filtroEstado" class="form-select">
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando pacientes...</span>
      </div>
      <p class="mt-3 text-muted">Cargando pacientes...</p>
    </div>

    <!-- NO HAY RESULTADOS -->
    <div v-else-if="!filteredPatients.length" class="text-center py-5">
      <div class="mb-3">
        <i class="fas fa-user-slash fa-3x text-muted"></i>
      </div>
      <h5 class="text-muted">No se encontraron pacientes</h5>
      <p class="text-muted">
        {{ searchTerm ? 'Intenta modificar tu búsqueda' : 'Registra tu primer paciente para comenzar' }}
      </p>
      <button 
        class="btn btn-primary"
        @click="abrirFormularioRegistro"
        v-if="!searchTerm"
      >
        <i class="fas fa-plus me-2"></i>
        Registrar Primer Paciente
      </button>
    </div>

    <!-- LISTA DE PACIENTES -->
    <div v-else class="row gy-4">
      <div
        v-for="paciente in filteredPatients"
        :key="paciente.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <div class="card h-100 shadow-sm patient-card">
          <div class="card-body">
            <!-- Avatar y nombre -->
            <div class="d-flex align-items-start mb-3">
              <div class="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3">
                {{ obtenerIniciales(paciente.nombre, paciente.apellido) }}
              </div>
              <div class="flex-grow-1">
                <h5 class="card-title mb-1">{{ paciente.nombre }} {{ paciente.apellido }}</h5>
                <small class="text-muted">{{ paciente.edad }} años</small>
                <span class="badge bg-success ms-2" v-if="paciente.activo">Activo</span>
                <span class="badge bg-secondary ms-2" v-else>Inactivo</span>
              </div>
            </div>

            <!-- Información básica -->
            <div class="patient-info">
              <div class="info-item">
                <i class="fas fa-id-card text-muted me-2"></i>
                <span>{{ paciente.cedula }}</span>
              </div>
              <div class="info-item" v-if="paciente.telefono">
                <i class="fas fa-phone text-muted me-2"></i>
                <span>{{ paciente.telefono }}</span>
              </div>
              <div class="info-item" v-if="paciente.email">
                <i class="fas fa-envelope text-muted me-2"></i>
                <span>{{ paciente.email }}</span>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="card-footer bg-white border-0">
            <div class="d-flex flex-column gap-2">
              <!-- Primera fila de botones -->
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-outline-primary btn-sm flex-fill"
                  @click="verHistorial(paciente)"
                >
                  <i class="fas fa-eye me-1"></i>
                  Ver Historial
                </button>
                <button 
                  class="btn btn-outline-warning btn-sm flex-fill"
                  @click="abrirEncuestaTamizaje(paciente)"
                  title="Encuesta de Tamizaje"
                >
                  <i class="fas fa-clipboard-list me-1"></i>
                  Encuesta
                </button>
              </div>
              <!-- Segunda fila -->
              <button 
                class="btn btn-outline-success btn-sm"
                @click="iniciarCasoClinico(paciente)"
                :disabled="!pacienteTieneEncuestaCompleta(paciente)"
                :title="pacienteTieneEncuestaCompleta(paciente) ? 'Iniciar Caso Clínico' : 'Debe completar la encuesta de tamizaje primero'"
              >
                <i class="fas fa-plus me-1"></i>
                Iniciar Caso Clínico
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE REGISTRO DE PACIENTE -->
    <div v-if="mostrarFormularioRegistro" class="modal-backdrop show" @click.self="cerrarFormularioRegistro">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-content">
              <div class="icon-container">
                <i class="fas fa-user-plus"></i>
              </div>
              <div class="title-container">
                <h4 class="modal-title">Registrar Nuevo Paciente</h4>
                <p class="modal-subtitle">Complete la información del paciente</p>
              </div>
            </div>
            <button type="button" class="btn-close" @click="cerrarFormularioRegistro">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="registrarPaciente" class="patient-form">
              
              <!-- Formulario simplificado con diseño bonito -->
              <div class="row g-3">
                <!-- Información Personal -->
                <div class="col-12">
                  <h6 class="section-divider">
                    <i class="fas fa-user text-primary me-2"></i>
                    Información Personal
                  </h6>
                </div>
                
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="nombre"
                      v-model="formularioRegistro.nombre"
                      placeholder="Nombre"
                      required
                    />
                    <label for="nombre">Nombre *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="apellido"
                      v-model="formularioRegistro.apellido"
                      placeholder="Apellido"
                      required
                    />
                    <label for="apellido">Apellido *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="cedula"
                      v-model="formularioRegistro.cedula"
                      placeholder="Cédula"
                      maxlength="10"
                      required
                    />
                    <label for="cedula">Cédula *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="date"
                      class="form-control"
                      id="fechaNacimiento"
                      v-model="formularioRegistro.fechaNacimiento"
                      required
                    />
                    <label for="fechaNacimiento">Fecha de Nacimiento *</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="genero" v-model="formularioRegistro.genero">
                      <option value="">Seleccionar género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <label for="genero">Género</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="estadoCivil" v-model="formularioRegistro.estadoCivil">
                      <option value="">Seleccionar estado civil</option>
                      <option value="Soltero">Soltero/a</option>
                      <option value="Casado">Casado/a</option>
                      <option value="Divorciado">Divorciado/a</option>
                      <option value="Viudo">Viudo/a</option>
                      <option value="Unión Libre">Unión Libre</option>
                    </select>
                    <label for="estadoCivil">Estado Civil</label>
                  </div>
                </div>

                <!-- Información de Contacto -->
                <div class="col-12 mt-4">
                  <h6 class="section-divider">
                    <i class="fas fa-address-book text-success me-2"></i>
                    Información de Contacto
                  </h6>
                </div>
                
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="tel"
                      class="form-control"
                      id="telefono"
                      v-model="formularioRegistro.telefono"
                      placeholder="Teléfono"
                      maxlength="10"
                    />
                    <label for="telefono">Teléfono</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="formularioRegistro.email"
                      placeholder="Email"
                    />
                    <label for="email">Correo Electrónico</label>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-floating">
                    <textarea
                      class="form-control"
                      id="direccion"
                      v-model="formularioRegistro.direccion"
                      placeholder="Dirección"
                      style="height: 80px"
                    ></textarea>
                    <label for="direccion">Dirección</label>
                  </div>
                </div>
                <div class="col-12">
                  <AutocompleteParroquia
                    v-model="formularioRegistro.parroquiaId"
                    label="Parroquia"
                    placeholder="Buscar por nombre de parroquia o ciudad (ej: Manta, Quito, Guayaquil...)"
                    required
                    input-id="parroquia"
                    @change="onParroquiaChange"
                  />
                </div>

                <!-- Información Adicional -->
                <div class="col-12 mt-4">
                  <h6 class="section-divider">
                    <i class="fas fa-briefcase text-warning me-2"></i>
                    Información Adicional
                  </h6>
                </div>
                
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="ocupacion"
                      v-model="formularioRegistro.ocupacion"
                      placeholder="Ocupación"
                    />
                    <label for="ocupacion">Ocupación</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="empresaLaboral"
                      v-model="formularioRegistro.EmpresaLaboral"
                      placeholder="Empresa"
                    />
                    <label for="empresaLaboral">Empresa</label>
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="nacionalidad"
                      v-model="formularioRegistro.Nacionalidad"
                      placeholder="Nacionalidad"
                    />
                    <label for="nacionalidad">Nacionalidad</label>
                  </div>
                </div>

                <!-- Representante Legal -->
                <div class="col-12 mt-4" v-if="esMenorDeEdad || necesitaRepresentante">
                  <h6 class="section-divider">
                    <i class="fas fa-user-shield text-danger me-2"></i>
                    Representante Legal
                  </h6>
                </div>
                
                <div class="col-12" v-if="esMenorDeEdad || necesitaRepresentante">
                  <div class="alert alert-info d-flex align-items-center mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="necesitaRepresentante"
                        v-model="necesitaRepresentante"
                      >
                      <label class="form-check-label" for="necesitaRepresentante">
                        El paciente necesita representante legal
                      </label>
                    </div>
                  </div>
                </div>
                
                <div v-if="necesitaRepresentante || esMenorDeEdad" class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="representante"
                      v-model="formularioRegistro.representante"
                      placeholder="Nombre del Representante"
                    />
                    <label for="representante">Nombre del Representante</label>
                  </div>
                </div>
                <div v-if="necesitaRepresentante || esMenorDeEdad" class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      id="cedulaRep"
                      v-model="formularioRegistro.cedulaRep"
                      placeholder="Cédula del Representante"
                      maxlength="10"
                    />
                    <label for="cedulaRep">Cédula del Representante</label>
                  </div>
                </div>
                <div v-if="necesitaRepresentante || esMenorDeEdad" class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="relacionRep" v-model="formularioRegistro.relacionRep">
                      <option value="">Seleccionar relación</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Tío/a">Tío/a</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Cuidador">Cuidador</option>
                      <option value="Representante Legal">Representante Legal</option>
                      <option value="Otro">Otro</option>
                    </select>
                    <label for="relacionRep">Relación</label>
                  </div>
                </div>
                <div v-if="necesitaRepresentante || esMenorDeEdad" class="col-md-6">
                  <div class="form-floating">
                    <input
                      type="tel"
                      class="form-control"
                      id="telefonoRep"
                      v-model="formularioRegistro.telefonoRep"
                      placeholder="Teléfono del Representante"
                      maxlength="10"
                    />
                    <label for="telefonoRep">Teléfono del Representante</label>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <div class="footer-actions">
              <button 
                type="button" 
                class="btn btn-secondary btn-lg" 
                @click="cerrarFormularioRegistro"
                :disabled="guardandoPaciente"
              >
                <i class="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button 
                type="button" 
                class="btn btn-primary btn-lg"
                @click="registrarPaciente"
                :disabled="guardandoPaciente || !formularioValido"
              >
                <span v-if="guardandoPaciente" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ guardandoPaciente ? 'Registrando...' : 'Registrar Paciente' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE HISTORIAL COMPLETO -->
    <div v-if="mostrarHistorial" class="modal-backdrop show" @click.self="cerrarHistorial">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-content">
              <div class="icon-container">
                <i class="fas fa-file-medical"></i>
              </div>
              <div class="title-container">
                <h4 class="modal-title">Historial Médico Completo</h4>
                <p class="modal-subtitle" v-if="pacienteSeleccionado">
                  {{ pacienteSeleccionado.paciente.nombre }} {{ pacienteSeleccionado.paciente.apellido }}
                </p>
              </div>
            </div>
            <button type="button" class="btn-close" @click="cerrarHistorial">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body" v-if="pacienteSeleccionado">
            <!-- Información del Paciente -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="section-divider">
                  <i class="fas fa-user text-primary me-2"></i>
                  Información del Paciente
                </h6>
                <div class="patient-details">
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Nombre:</strong> {{ pacienteSeleccionado.paciente.nombre }} {{ pacienteSeleccionado.paciente.apellido }}</p>
                      <p><strong>Cédula:</strong> {{ pacienteSeleccionado.paciente.cedula }}</p>
                      <p><strong>Teléfono:</strong> {{ pacienteSeleccionado.paciente.telefono || 'No especificado' }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Email:</strong> {{ pacienteSeleccionado.paciente.email || 'No especificado' }}</p>
                      <p><strong>Fecha de Nacimiento:</strong> {{ new Date(pacienteSeleccionado.paciente.fechaNacimiento).toLocaleDateString() }}</p>
                      <p><strong>Estado:</strong> 
                        <span :class="pacienteSeleccionado.paciente.activo ? 'badge bg-success' : 'badge bg-secondary'">
                          {{ pacienteSeleccionado.paciente.activo ? 'Activo' : 'Inactivo' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen Estadístico -->
            <div class="row mb-4">
              <div class="col-12">
                <h6 class="section-divider">
                  <i class="fas fa-chart-bar text-info me-2"></i>
                  Resumen Estadístico
                </h6>
                <div class="row">
                  <div class="col-md-3">
                    <div class="stat-card">
                      <div class="stat-number">{{ pacienteSeleccionado.resumen.totalCasosClinicos }}</div>
                      <div class="stat-label">Casos Clínicos</div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card">
                      <div class="stat-number">{{ pacienteSeleccionado.resumen.totalCitas }}</div>
                      <div class="stat-label">Citas Total</div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card">
                      <div class="stat-number">{{ pacienteSeleccionado.resumen.totalEncuestas }}</div>
                      <div class="stat-label">Encuestas</div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="stat-card">
                      <div class="stat-number">{{ pacienteSeleccionado.tratamientos.length }}</div>
                      <div class="stat-label">Tratamientos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Encuestas de Tamizaje -->
            <div class="row mb-4" v-if="pacienteSeleccionado.encuestasTamizaje.length > 0">
              <div class="col-12">
                <h6 class="section-divider">
                  <i class="fas fa-clipboard-list text-warning me-2"></i>
                  Encuestas de Tamizaje
                </h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Respuestas</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="encuesta in pacienteSeleccionado.encuestasTamizaje" :key="encuesta.id">
                        <td>{{ new Date(encuesta.fecha).toLocaleDateString() }}</td>
                        <td>
                          <span :class="encuesta.completada ? 'badge bg-success' : 'badge bg-warning'">
                            {{ encuesta.completada ? 'Completada' : 'Pendiente' }}
                          </span>
                        </td>
                        <td>{{ encuesta.totalRespuestas }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Casos Clínicos -->
            <div class="row mb-4" v-if="pacienteSeleccionado.casosClinicos.length > 0">
              <div class="col-12">
                <h6 class="section-divider">
                  <i class="fas fa-stethoscope text-success me-2"></i>
                  Casos Clínicos
                </h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Motivo</th>
                        <th>Estudiante</th>
                        <th>Profesor</th>
                        <th>Especialidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="caso in pacienteSeleccionado.casosClinicos" :key="caso.id">
                        <td>{{ new Date(caso.fechaCreacion).toLocaleDateString() }}</td>
                        <td>
                          <span class="badge bg-primary">{{ caso.estado }}</span>
                        </td>
                        <td>{{ caso.motivoConsulta }}</td>
                        <td>{{ caso.estudiante.nombre }} {{ caso.estudiante.apellido }}</td>
                        <td>{{ caso.profesor.nombre }} {{ caso.profesor.apellido }}</td>
                        <td>{{ caso.especialidad.nombre }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="cerrarHistorial"
            >
              <i class="fas fa-times me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE ENCUESTA DE TAMIZAJE -->
    <EncuestaTamizajeForm 
      :mostrarEncuesta="mostrarEncuestaTamizaje"
      :paciente="pacienteParaEncuesta"
      @cerrar="cerrarEncuestaTamizaje"
      @guardado="onEncuestaGuardada"
      @ver-antecedentes="onVerAntecedentes"
    />

    <!-- MODAL DE ANTECEDENTES MÉDICOS -->
    <AntecedentesMedicosViewer 
      :mostrarAntecedentes="mostrarAntecedentes"
      :pacienteId="pacienteParaAntecedentes"
      @cerrar="cerrarAntecedentes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { pacienteService } from '@/services/pacienteService';
import AutocompleteParroquia from '@/components/common/AutocompleteParroquia.vue';
import EncuestaTamizajeForm from '@/components/student/EncuestaTamizajeForm.vue';
import AntecedentesMedicosViewer from '@/components/student/AntecedentesMedicosViewer.vue';
import type { 
  PacienteLista, 
  RegistroPaciente, 
  HistorialCompleto 
} from '@/types/patient';
import type { Parroquia } from '@/types/user';

// Estados reactivo
const loading = ref(false);
const searchTerm = ref('');
const filtroEstado = ref('');
const pacientes = ref<PacienteLista[]>([]);
const pacienteSeleccionado = ref<HistorialCompleto | null>(null);

// Estados para modales
const mostrarHistorial = ref(false);
const mostrarEncuestaTamizaje = ref(false);
const mostrarAntecedentes = ref(false);
const pacienteParaEncuesta = ref<PacienteLista | null>(null);
const pacienteParaAntecedentes = ref<number | null>(null);

// Estados del formulario de registro
const mostrarFormularioRegistro = ref(false);
const guardandoPaciente = ref(false);
const necesitaRepresentante = ref(false);
const formularioRegistro = ref<RegistroPaciente>({
  nombre: '',
  apellido: '',
  cedula: '',
  fechaNacimiento: '',
  genero: '',
  estadoCivil: '',
  telefono: '',
  email: '',
  direccion: '',
  parroquiaId: 0,
  ocupacion: '',
  EmpresaLaboral: '',
  Nacionalidad: '',
  representante: '',
  cedulaRep: '',
  relacionRep: '',
  telefonoRep: ''
});

// Computed properties
const filteredPatients = computed(() => {
  let resultado = [...pacientes.value];
  
  // Filtro por búsqueda
  if (searchTerm.value) {
    const termino = searchTerm.value.toLowerCase();
    resultado = resultado.filter(p => 
      p.nombre.toLowerCase().includes(termino) ||
      p.apellido.toLowerCase().includes(termino) ||
      p.cedula.includes(termino)
    );
  }
  
  // Filtro por estado
  if (filtroEstado.value) {
    const estado = filtroEstado.value === 'activo';
    resultado = resultado.filter(p => p.activo === estado);
  }
  
  return resultado;
});

const esMenorDeEdad = computed(() => {
  if (!formularioRegistro.value.fechaNacimiento) return false;
  const hoy = new Date();
  const fechaNac = new Date(formularioRegistro.value.fechaNacimiento);
  const edad = hoy.getFullYear() - fechaNac.getFullYear();
  return edad < 18;
});

const formularioValido = computed(() => {
  return formularioRegistro.value.nombre &&
         formularioRegistro.value.apellido &&
         formularioRegistro.value.cedula &&
         formularioRegistro.value.fechaNacimiento &&
         formularioRegistro.value.parroquiaId > 0;
});

// Métodos de búsqueda y filtros
const onSearch = async () => {
  if (searchTerm.value.length >= 3) {
    await buscarPacientes(searchTerm.value);
  } else if (searchTerm.value.length === 0) {
    await cargarPacientes();
  }
};

const limpiarBusqueda = () => {
  searchTerm.value = '';
  cargarPacientes();
};

// Métodos de carga de datos
const cargarPacientes = async () => {
  try {
    loading.value = true;
    const response = await pacienteService.obtenerPacientes();
    pacientes.value = response;
  } catch (error) {
    console.error('Error al cargar pacientes:', error);
  } finally {
    loading.value = false;
  }
};

const buscarPacientes = async (termino: string) => {
  try {
    loading.value = true;
    const response = await pacienteService.buscarPacientes(termino);
    pacientes.value = response;
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
  } finally {
    loading.value = false;
  }
};

// Métodos del formulario de registro
const abrirFormularioRegistro = () => {
  mostrarFormularioRegistro.value = true;
  resetearFormulario();
  // El componente AutocompleteParroquia carga las parroquias automáticamente cuando es necesario
};

const cerrarFormularioRegistro = () => {
  mostrarFormularioRegistro.value = false;
  resetearFormulario();
};

const resetearFormulario = () => {
  necesitaRepresentante.value = false;
  formularioRegistro.value = {
    nombre: '',
    apellido: '',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    estadoCivil: '',
    telefono: '',
    email: '',
    direccion: '',
    parroquiaId: 0,
    ocupacion: '',
    EmpresaLaboral: '',
    Nacionalidad: '',
    representante: '',
    cedulaRep: '',
    relacionRep: '',
    telefonoRep: ''
  };
};

const registrarPaciente = async () => {
  if (!formularioValido.value) return;
  
  try {
    guardandoPaciente.value = true;
    
    const pacienteCreado = await pacienteService.crearPaciente(formularioRegistro.value);
    
    // Convertir PacienteBasico a PacienteLista para la lista
    const nuevoPaciente: PacienteLista = {
      id: pacienteCreado.id,
      nombre: pacienteCreado.nombre,
      apellido: pacienteCreado.apellido,
      cedula: pacienteCreado.cedula,
      telefono: pacienteCreado.telefono,
      email: pacienteCreado.email,
      fechaNacimiento: pacienteCreado.fechaNacimiento,
      edad: calcularEdad(pacienteCreado.fechaNacimiento),
      activo: pacienteCreado.activo,
      fechaRegistro: pacienteCreado.fechaRegistro,
      totalCasosClinicos: 0,
      ultimaVisita: undefined,
      proximaCita: undefined,
      parroquia: {
        nombre: pacienteCreado.parroquia.nombre,
        canton: {
          nombre: pacienteCreado.parroquia.canton.nombre
        }
      }
    };
    
    // Agregar el nuevo paciente a la lista
    pacientes.value.unshift(nuevoPaciente);
    
    // Cerrar el formulario
    cerrarFormularioRegistro();
    
    console.log('Paciente registrado exitosamente:', nuevoPaciente);
    
  } catch (error) {
    console.error('Error al registrar paciente:', error);
  } finally {
    guardandoPaciente.value = false;
  }
};

// Método para manejar el cambio de parroquia
const onParroquiaChange = (parroquia: Parroquia | null) => {
  console.log('Parroquia seleccionada:', parroquia);
  // Aquí puedes hacer validaciones adicionales si es necesario
};

// Métodos del historial
const verHistorial = async (paciente: PacienteLista) => {
  try {
    loading.value = true;
    const historial = await pacienteService.obtenerHistorialCompleto(paciente.id);
    pacienteSeleccionado.value = historial;
    mostrarHistorial.value = true;
  } catch (error) {
    console.error('Error al cargar historial:', error);
    // Aquí podrías mostrar un toast de error
  } finally {
    loading.value = false;
  }
};

const cerrarHistorial = () => {
  mostrarHistorial.value = false;
  pacienteSeleccionado.value = null;
};

// Métodos de encuesta de tamizaje
const abrirEncuestaTamizaje = (paciente: PacienteLista) => {
  pacienteParaEncuesta.value = paciente;
  mostrarEncuestaTamizaje.value = true;
};

const cerrarEncuestaTamizaje = () => {
  mostrarEncuestaTamizaje.value = false;
  pacienteParaEncuesta.value = null;
};

// Método para manejar cuando se guarda una encuesta exitosamente
const onEncuestaGuardada = async (encuestaId: number) => {
  console.log('Encuesta guardada con ID:', encuestaId);
  
  // Mostrar mensaje de éxito
  // aquí podrías usar un toast o notification
  
  // Recargar la lista de pacientes para actualizar el estado
  await cargarPacientes();
};

// Método para abrir el visor de antecedentes
const onVerAntecedentes = (pacienteId: number) => {
  pacienteParaAntecedentes.value = pacienteId;
  mostrarAntecedentes.value = true;
  // Cerrar el modal de encuesta si está abierto
  mostrarEncuestaTamizaje.value = false;
};

// Método para cerrar el visor de antecedentes
const cerrarAntecedentes = () => {
  mostrarAntecedentes.value = false;
  pacienteParaAntecedentes.value = null;
};


// Método para verificar si el paciente tiene encuesta completa
const pacienteTieneEncuestaCompleta = (paciente: PacienteLista): boolean => {
  // Verificar si el paciente tiene la propiedad tieneEncuestaCompleta
  return paciente.tieneEncuestaCompleta === true;
};

// Métodos de acciones
const iniciarCasoClinico = (paciente: PacienteLista | { id: number; nombre: string; apellido: string }) => {
  console.log('Iniciando caso clínico para:', paciente.nombre, paciente.apellido);
};

// Métodos de utilidad
const obtenerIniciales = (nombre: string, apellido: string): string => {
  return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
};

const calcularEdad = (fechaNacimiento: Date | string): number => {
  const hoy = new Date();
  const fechaNac = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const diferenciaMes = hoy.getMonth() - fechaNac.getMonth();
  
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  
  return edad;
};

// Watchers
watch(searchTerm, (newValue) => {
  if (newValue.length === 0) {
    cargarPacientes();
  }
});

// Ciclo de vida
onMounted(() => {
  cargarPacientes();
});
</script>

<style scoped>
/* Estilos personalizados para la gestión de pacientes */
.patient-card {
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.patient-card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.avatar {
  width: 50px;
  height: 50px;
  font-size: 1.2rem;
  font-weight: bold;
}

.patient-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Estilos para el historial médico */
.patient-details p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #0d6efd;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

/* Modal XL para historial */
.modal-dialog.modal-xl {
  max-width: 1200px !important;
}

/* Modal backdrop personalizado */
.modal-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(2px) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 1 !important;
}

.modal-backdrop.show {
  display: flex !important;
  opacity: 1 !important;
}

.modal-dialog {
  background: #ffffff !important;
  border-radius: 1rem !important;
  box-shadow: 0 2rem 4rem rgba(0, 0, 0, 0.2) !important;
  margin: 1rem !important;
  max-height: 90vh !important;
  width: 100% !important;
  max-width: 700px !important;
  z-index: 10000 !important;
  position: relative !important;
  border: none !important;
  display: flex !important;
  flex-direction: column !important;
}

.modal-dialog.modal-lg {
  max-width: 700px !important;
}

.modal-content {
  background: #ffffff !important;
  border: none !important;
  border-radius: 1rem !important;
  overflow: hidden !important;
  opacity: 1 !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: none !important;
  max-height: 90vh !important;
}

/* Modal body con scroll */
.modal-body {
  max-height: calc(90vh - 200px) !important;
  overflow-y: auto !important;
  padding: 1.5rem !important;
  flex: 1 !important;
}

/* Divisores de sección simples */
.section-divider {
  color: #495057 !important;
  font-weight: 600 !important;
  margin-bottom: 1rem !important;
  padding-bottom: 0.5rem !important;
  border-bottom: 2px solid #e9ecef !important;
  display: flex !important;
  align-items: center !important;
}

/* Header del modal mejorado */
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-bottom: none !important;
  padding: 1.5rem !important;
  border-radius: 1rem 1rem 0 0 !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
}

.header-content {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  flex: 1 !important;
}

.icon-container {
  width: 50px !important;
  height: 50px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 1.2rem !important;
  color: white !important;
}

.title-container h4 {
  margin: 0 !important;
  font-size: 1.3rem !important;
  font-weight: 700 !important;
  color: white !important;
}

.modal-subtitle {
  margin: 0 !important;
  font-size: 0.85rem !important;
  opacity: 0.9 !important;
  color: white !important;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  border-radius: 50% !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  opacity: 1 !important;
  font-size: 1rem !important;
  transition: all 0.2s ease !important;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1) !important;
}

/* Formularios flotantes */
.form-floating {
  position: relative !important;
}

.form-floating > .form-control,
.form-floating > .form-select {
  height: calc(3rem + 2px) !important;
  padding: 0.75rem !important;
  border: 2px solid #e9ecef !important;
  border-radius: 0.5rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
}

.form-floating > .form-control:focus,
.form-floating > .form-select:focus {
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.1) !important;
}

.form-floating > label {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  height: 100% !important;
  padding: 0.75rem !important;
  pointer-events: none !important;
  border: 1px solid transparent !important;
  transform-origin: 0 0 !important;
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out !important;
  color: #6c757d !important;
  font-weight: 500 !important;
}

.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label,
.form-floating > .form-select ~ label {
  opacity: 0.65 !important;
  transform: scale(0.8) translateY(-0.5rem) translateX(0.15rem) !important;
  color: #0d6efd !important;
}

/* Alert mejorado */
.alert {
  border-radius: 0.5rem !important;
  border: 1px solid rgba(13, 110, 253, 0.2) !important;
  background: rgba(13, 110, 253, 0.05) !important;
  color: #0d6efd !important;
  padding: 0.75rem !important;
}

/* Footer del modal */
.modal-footer {
  background: #f8f9fa !important;
  border-top: 1px solid #e9ecef !important;
  padding: 1.25rem !important;
  border-radius: 0 0 1rem 1rem !important;
  flex-shrink: 0 !important;
}

.footer-actions {
  display: flex !important;
  gap: 1rem !important;
  justify-content: flex-end !important;
  width: 100% !important;
}

.footer-actions .btn {
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
  border-radius: 0.5rem !important;
  font-size: 0.95rem !important;
  transition: all 0.2s ease !important;
}

.footer-actions .btn-secondary {
  background: #6c757d !important;
  border-color: #6c757d !important;
  color: white !important;
}

.footer-actions .btn-secondary:hover {
  background: #5c636a !important;
  border-color: #565e64 !important;
  transform: translateY(-2px) !important;
}

.footer-actions .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  color: white !important;
}

.footer-actions .btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.3) !important;
}

.footer-actions .btn:disabled {
  opacity: 0.6 !important;
  transform: none !important;
  cursor: not-allowed !important;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem !important;
    max-width: calc(100% - 1rem) !important;
    max-height: 95vh !important;
  }
  
  .modal-header {
    padding: 1rem !important;
  }
  
  .header-content {
    gap: 0.75rem !important;
  }
  
  .icon-container {
    width: 40px !important;
    height: 40px !important;
    font-size: 1rem !important;
  }
  
  .title-container h4 {
    font-size: 1.1rem !important;
  }
  
  .modal-body {
    padding: 1rem !important;
    max-height: calc(95vh - 150px) !important;
  }
  
  .section-divider {
    font-size: 0.9rem !important;
  }
  
  .footer-actions {
    flex-direction: column !important;
  }
  
  .footer-actions .btn {
    width: 100% !important;
  }
}
</style>
