<!-- Ejemplo de uso del PatientForm con tipo de documento del representante -->
<template>
  <div class="patient-registration-page">
    <div class="header">
      <h2>Registro de Pacientes</h2>
      <p>Complete todos los campos para registrar un nuevo paciente en el sistema</p>
    </div>

    <PatientForm 
      :edit-mode="editMode"
      :initial-data="selectedPatient"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- Lista de pacientes registrados -->
    <div v-if="patients.length > 0" class="patients-list">
      <h3>Pacientes Registrados</h3>
      <div class="patient-card" v-for="patient in patients" :key="patient.id">
        <div class="patient-info">
          <h4>{{ patient.nombre }} {{ patient.apellido }}</h4>
          <p><strong>Documento:</strong> {{ getTipoDocumentoLabel(patient.tipoDocumento) }} - {{ patient.numeroDocumento }}</p>
          <p v-if="patient.representante"><strong>Representante:</strong> {{ patient.representante }}</p>
          <p v-if="patient.tipoDocumentoRep && patient.numeroDocumentoRep">
            <strong>Documento Rep.:</strong> {{ getTipoDocumentoRepLabel(patient.tipoDocumentoRep) }} - {{ patient.numeroDocumentoRep }}
          </p>
          <p v-if="patient.telefono"><strong>Teléfono:</strong> {{ patient.telefono }}</p>
          <p v-if="patient.email"><strong>Email:</strong> {{ patient.email }}</p>
        </div>
        <div class="patient-actions">
          <button @click="editPatient(patient)" class="btn-edit">Editar</button>
          <button @click="viewDetails(patient)" class="btn-view">Ver Detalles</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PatientForm from '@/components/secretary/PatientForm.vue'
import type { RegistroPaciente } from '@/types/patient'
import { 
  TipoDocumentoLabels, 
  TipoDocumentoRepresentanteLabels,
  type TipoDocumentoType,
  type TipoDocumentoRepresentanteType
} from '@/types/patient'

// Estado local para el ejemplo
const patients = ref<Array<RegistroPaciente & { id: number }>>([])
const editMode = ref(false)
const selectedPatient = ref<Partial<RegistroPaciente>>({})

// Métodos
const handleSubmit = async (patientData: RegistroPaciente) => {
  try {
    console.log('Datos del paciente:', patientData)
    
    // Simular llamada a la API
    const newPatient = {
      ...patientData,
      id: Date.now()
    }
    
    if (editMode.value) {
      // Actualizar paciente existente
      const index = patients.value.findIndex(p => p.id === (selectedPatient.value as any).id)
      if (index !== -1) {
        patients.value[index] = { ...newPatient, id: (selectedPatient.value as any).id }
      }
      editMode.value = false
      selectedPatient.value = {}
    } else {
      // Agregar nuevo paciente
      patients.value.push(newPatient)
    }
    
    alert('Paciente guardado exitosamente!')
    
    // En una aplicación real, aquí harías:
    // await pacienteService.crearPaciente(patientData)
    
  } catch (error) {
    console.error('Error al guardar paciente:', error)
    alert('Error al guardar el paciente. Intente nuevamente.')
  }
}

const handleCancel = () => {
  editMode.value = false
  selectedPatient.value = {}
}

const editPatient = (patient: RegistroPaciente & { id: number }) => {
  editMode.value = true
  selectedPatient.value = { ...patient }
}

const viewDetails = (patient: RegistroPaciente & { id: number }) => {
  alert(`Ver detalles del paciente: ${patient.nombre} ${patient.apellido}`)
  // En una aplicación real, aquí navegarías a la página de detalles
}

const getTipoDocumentoLabel = (tipo: TipoDocumentoType): string => {
  return TipoDocumentoLabels[tipo] || tipo
}

const getTipoDocumentoRepLabel = (tipo: TipoDocumentoRepresentanteType): string => {
  return TipoDocumentoRepresentanteLabels[tipo] || tipo
}

// Datos de ejemplo para pruebas
const addSampleData = () => {
  patients.value.push({
    id: 1,
    nombre: 'Juan Carlos',
    apellido: 'Pérez García',
    fechaNacimiento: '1990-05-15',
    tipoDocumento: 'CEDULA',
    numeroDocumento: '1234567890',
    parroquiaId: 1,
    telefono: '0999123456',
    email: 'juan.perez@email.com',
    Nacionalidad: 'Ecuatoriana',
    genero: 'Masculino',
    estadoCivil: 'Casado'
  })

  patients.value.push({
    id: 2,
    nombre: 'María Fernanda',
    apellido: 'López Ruiz',
    fechaNacimiento: '2010-08-22',
    tipoDocumento: 'CEDULA',
    numeroDocumento: '1234567891',
    parroquiaId: 1,
    telefono: '0987654321',
    representante: 'Ana Ruiz López',
    tipoDocumentoRep: 'CEDULA',
    numeroDocumentoRep: '1234567892',
    relacionRep: 'Madre',
    telefonoRep: '0998765432',
    Nacionalidad: 'Ecuatoriana',
    genero: 'Femenino'
  })

  patients.value.push({
    id: 3,
    nombre: 'Roberto',
    apellido: 'Smith Johnson',
    fechaNacimiento: '1985-12-03',
    tipoDocumento: 'PASAPORTE',
    numeroDocumento: 'ABC123456',
    parroquiaId: 1,
    telefono: '0987123456',
    email: 'roberto.smith@email.com',
    Nacionalidad: 'Estadounidense',
    genero: 'Masculino',
    estadoCivil: 'Soltero',
    ocupacion: 'Ingeniero'
  })
}

// Agregar datos de ejemplo al cargar
addSampleData()
</script>

<style scoped>
.patient-registration-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #2e7d32;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
  font-size: 1.1rem;
}

.patients-list {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.patients-list h3 {
  color: #2e7d32;
  margin-bottom: 1.5rem;
  text-align: center;
}

.patient-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.patient-info h4 {
  color: #2e7d32;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.patient-info p {
  margin: 0.25rem 0;
  color: #555;
}

.patient-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.btn-edit,
.btn-view {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #1976d2;
  color: white;
}

.btn-edit:hover {
  background: #1565c0;
}

.btn-view {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-view:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .patient-registration-page {
    padding: 1rem;
  }
  
  .patient-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .patient-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
