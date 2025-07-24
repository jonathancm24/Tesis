// src/store/student.ts
import { defineStore } from 'pinia'
import { useAdminStore } from './admin'

// Historias clínicas
import type { ClinicalHistory } from '@/mocks/student/clinicalHistories'
import {
  fetchHistoriesMock,
  saveHistoryMock,
  deleteHistoryMock
} from '@/mocks/student/clinicalHistories'

// Casos clínicos
import type { ClinicalCase } from '@/mocks/student/clinicalCases'
import {
  fetchCasesMock,
  saveCaseMock,
  deleteCaseMock
} from '@/mocks/student/clinicalCases'

// Tareas académicas (assignments)
import type { Assignment } from '@/mocks/student/assignments'
import { assignmentsMock } from '@/mocks/student/assignments'

// Odontograma
import type { PatientOdontogram } from '@/mocks/student/odontogram'
import { odontogramsMock } from '@/mocks/student/odontogram'

// Mensajería
import type { Message } from '@/mocks/student/messaging'
import {
  fetchMessagesMock,
  sendMessageMock
} from '@/mocks/student/messaging'

export const useStudentStore = defineStore('student', {
  state: () => ({
    histories: [] as ClinicalHistory[],
    cases: [] as ClinicalCase[],
    assignments: [] as Assignment[],
    // Para odontograma guardamos únicamente el array de dientes del paciente activo
    odontogram: [] as PatientOdontogram['teeth'],
    messages: [] as Message[],
    loading: false,
    error: '' as string
  }),

  getters: {
    currentUserName(): string {
      const admin = useAdminStore()
      return admin.currentUser?.nombre || 'Estudiante'
    }
  },

  actions: {
    // --- Historias clínicas ---
    async loadHistories() {
      this.loading = true
      this.histories = await fetchHistoriesMock()
      this.loading = false
    },
    async saveHistory(h: ClinicalHistory) {
      this.loading = true
      await saveHistoryMock(h)
      await this.loadHistories()
      this.loading = false
    },
    async deleteHistory(id: number) {
      this.loading = true
      await deleteHistoryMock(id)
      await this.loadHistories()
      this.loading = false
    },

    // --- Casos clínicos ---
    async loadCases() {
      this.loading = true
      this.cases = await fetchCasesMock()
      this.loading = false
    },
    async saveCase(c: ClinicalCase) {
      this.loading = true
      await saveCaseMock(c)
      await this.loadCases()
      this.loading = false
    },
    async deleteCase(id: number) {
      this.loading = true
      await deleteCaseMock(id)
      await this.loadCases()
      this.loading = false
    },

    // --- Tareas académicas ---
    loadAssignments() {
      // Las tareas vienen del mock estático
      this.assignments = [...assignmentsMock]
    },
    addOrUpdateAssignment(a: Assignment) {
      const idx = this.assignments.findIndex(x => x.id === a.id)
      if (idx >= 0) this.assignments[idx] = a
      else this.assignments.push(a)
    },
    removeAssignment(id: number) {
      this.assignments = this.assignments.filter(a => a.id !== id)
    },

    // --- Odontograma ---
    loadOdontogram(patientId: number) {
      this.loading = true
      const entry = odontogramsMock.find(o => o.patientId === patientId)
      this.odontogram = entry ? [...entry.teeth] : []
      this.loading = false
    },
    saveOdontogramEntry(/* patientId and entry */) {
      // En un mock real actualizarías aquí; luego recargas:
      // await saveOdontogramEntryMock(patientId, entry)
      // this.loadOdontogram(patientId)
    },

    // --- Mensajería ---
    async loadMessages(withUser: string) {
      this.loading = true
      this.messages = await fetchMessagesMock(withUser)
      this.loading = false
    },
    async sendMessage(to: string, content: string) {
      this.loading = true
      await sendMessageMock({ from: this.currentUserName, to, content })
      await this.loadMessages(to)
      this.loading = false
    }
  }
})
