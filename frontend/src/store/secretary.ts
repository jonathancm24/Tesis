// odontologia-admin/src/store/secretary.ts
import { defineStore } from 'pinia';

// Mocks y tipos
import {
  fetchPatientsMock,
  savePatientMock,
  deletePatientMock,
  type Patient,
} from '@/mocks/secretary/patients';

import {
  fetchAppointmentsMock,
  type Appointment,
} from '@/mocks/secretary/appointments';

import {
  fetchPatientAssignmentsMock,
  addPatientAssignmentMock,
  updatePatientAssignmentMock,
  deletePatientAssignmentMock,
  type PatientAssignment,
} from '@/mocks/secretary/patientAssignments';

import {
  medicalHistories as historiesData,
  type MedicalHistory,
} from '@/mocks/secretary/medicalHistories';

export const useSecretaryStore = defineStore('secretary', {
  state: () => ({
    patients: [] as Patient[],
    appointments: [] as Appointment[],
    assignments: [] as PatientAssignment[],
    histories: [] as MedicalHistory[],
  }),

  actions: {
    // ------------------------------------------
    // PACIENTES
    // ------------------------------------------
    async loadPatients() {
      this.patients = await fetchPatientsMock();
    },

    async addOrUpdatePatient(p: Patient) {
      await savePatientMock(p);
      const idx = this.patients.findIndex(x => x.id === p.id);
      if (idx >= 0) this.patients[idx] = p;
      else this.patients.push(p);
    },

    async removePatient(id: number) {
      await deletePatientMock(id);
      this.patients = this.patients.filter(p => p.id !== id);
    },

    // ------------------------------------------
    // CITAS
    // ------------------------------------------
    async loadAppointments() {
      this.appointments = await fetchAppointmentsMock();
    },

    // ------------------------------------------
    // ASIGNACIÓN DE PACIENTES A ESTUDIANTES
    // ------------------------------------------
    async loadAssignments() {
      this.assignments = await fetchPatientAssignmentsMock();
    },

    async addOrUpdateAssignment(a: PatientAssignment) {
      const idx = this.assignments.findIndex(x => x.id === a.id);
      if (idx >= 0) {
        await updatePatientAssignmentMock(a);
        this.assignments[idx] = a;
      } else {
        await addPatientAssignmentMock(a);
        this.assignments.push(a);
      }
    },

    async removeAssignment(id: number) {
      await deletePatientAssignmentMock(id);
      this.assignments = this.assignments.filter(a => a.id !== id);
    },

    // ------------------------------------------
    // HISTORIAS CLÍNICAS (Cuestionario de Tamizaje)
    // ------------------------------------------
    async loadHistories() {
      this.histories = historiesData;
    },

    async addOrUpdateHistory(h: MedicalHistory) {
      const idx = this.histories.findIndex(x => x.id === h.id);
      if (idx >= 0) {
        this.histories[idx] = h;
      } else {
        this.histories.push(h);
      }
    },

    // ------------------------------------------
    // CARGA GENERAL PARA DASHBOARD
    // ------------------------------------------
    async loadAllData() {
      await Promise.all([
        this.loadPatients(),
        this.loadAppointments(),
        this.loadAssignments(),
        this.loadHistories(),
      ]);
    }
  }
});
