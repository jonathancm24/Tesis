// src/store/professor.ts
import { defineStore } from 'pinia';
import type { ProfessorAssignment, StudentProgress, StudentInfo } from '../mocks/api';
import type { 
  CasoClinicoResumen, 
  EstadisticasCasosClinico, 
  ActividadReciente, 
  EstadisticaCurso 
} from '../types/clinicalCase';
import {
  fetchProfessorAssignmentsMock,
  saveProfessorAssignmentMock,
  deleteProfessorAssignmentMock,
  fetchProgressMock,
  saveProgressMock,
  fetchStudentsByCourseMock,
  addStudentToCourseMock,
  removeStudentFromCourseMock
} from '../mocks/api';
import {
  fetchPendingCases,
  fetchDashboardStats,
  fetchRecentActivities,
  fetchCourseStats
} from '../services/professorDashboardService';

export const useProfessorStore = defineStore('professor', {
  state: () => ({
    // Datos existentes
    assignments: [] as ProfessorAssignment[],
    progress:    [] as StudentProgress[],
    students:    [] as StudentInfo[],
    
    // Nuevos datos para el dashboard
    pendingCases: [] as CasoClinicoResumen[],
    dashboardStats: null as EstadisticasCasosClinico | null,
    recentActivities: [] as ActividadReciente[],
    courseStats: [] as EstadisticaCurso[],
    
    // Estados de carga
    loading: false,
    loadingCases: false,
    loadingStats: false,
    error: '' as string
  }),
  
  getters: {
    pendingCasesCount: (state) => state.pendingCases.length,
    totalStudents: (state) => state.courseStats.reduce((total, course) => total + course.totalEstudiantes, 0),
    averageGrade: (state) => state.dashboardStats?.promedioCalificacion || 0,
    casesReviewedToday: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.recentActivities.filter(activity => 
        activity.timestamp.startsWith(today) && activity.tipo === 'approval'
      ).length;
    },
    activeCoursesCount: (state) => state.courseStats.length
  },
  
  actions: {
    // Acciones existentes para assignments
    async loadAssignments() {
      this.loading = true;
      try {
        this.assignments = await fetchProfessorAssignmentsMock();
      } catch (error) {
        this.error = 'Error al cargar asignaciones';
        console.error('Error loading assignments:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async saveAssignment(a: ProfessorAssignment) {
      this.loading = true;
      try {
        await saveProfessorAssignmentMock(a);
        await this.loadAssignments();
      } catch (error) {
        this.error = 'Error al guardar asignación';
        console.error('Error saving assignment:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async deleteAssignment(id: number) {
      this.loading = true;
      try {
        await deleteProfessorAssignmentMock(id);
        await this.loadAssignments();
      } catch (error) {
        this.error = 'Error al eliminar asignación';
        console.error('Error deleting assignment:', error);
      } finally {
        this.loading = false;
      }
    },

    // Acciones existentes para progress
    async loadProgress() {
      this.loading = true;
      try {
        this.progress = await fetchProgressMock();
      } catch (error) {
        this.error = 'Error al cargar progreso';
        console.error('Error loading progress:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async saveProgress(r: StudentProgress) {
      this.loading = true;
      try {
        await saveProgressMock(r);
        await this.loadProgress();
      } catch (error) {
        this.error = 'Error al guardar progreso';
        console.error('Error saving progress:', error);
      } finally {
        this.loading = false;
      }
    },

    // Acciones existentes para students
    async loadStudents(course: string) {
      this.loading = true;
      try {
        this.students = await fetchStudentsByCourseMock(course);
      } catch (error) {
        this.error = 'Error al cargar estudiantes';
        console.error('Error loading students:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async addStudent(info: StudentInfo) {
      this.loading = true;
      try {
        await addStudentToCourseMock(info);
        await this.loadStudents(info.course);
      } catch (error) {
        this.error = 'Error al agregar estudiante';
        console.error('Error adding student:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async removeStudent(studentId: number, course: string) {
      this.loading = true;
      try {
        await removeStudentFromCourseMock(studentId, course);
        await this.loadStudents(course);
      } catch (error) {
        this.error = 'Error al remover estudiante';
        console.error('Error removing student:', error);
      } finally {
        this.loading = false;
      }
    },

    // Nuevas acciones para el dashboard
    async loadDashboardData() {
      await Promise.all([
        this.loadPendingCases(),
        this.loadDashboardStats(),
        this.loadRecentActivities(),
        this.loadCourseStats()
      ]);
    },

    async loadPendingCases() {
      this.loadingCases = true;
      try {
        const response = await fetchPendingCases();
        this.pendingCases = response.data;
      } catch (error) {
        this.error = 'Error al cargar casos pendientes';
        console.error('Error loading pending cases:', error);
      } finally {
        this.loadingCases = false;
      }
    },

    async loadDashboardStats() {
      this.loadingStats = true;
      try {
        this.dashboardStats = await fetchDashboardStats();
      } catch (error) {
        this.error = 'Error al cargar estadísticas';
        console.error('Error loading dashboard stats:', error);
      } finally {
        this.loadingStats = false;
      }
    },

    async loadRecentActivities() {
      try {
        this.recentActivities = await fetchRecentActivities();
      } catch (error) {
        this.error = 'Error al cargar actividades recientes';
        console.error('Error loading recent activities:', error);
      }
    },

    async loadCourseStats() {
      try {
        this.courseStats = await fetchCourseStats();
      } catch (error) {
        this.error = 'Error al cargar estadísticas de cursos';
        console.error('Error loading course stats:', error);
      }
    },

    // Acción para refrescar datos del dashboard
    async refreshDashboard() {
      await this.loadDashboardData();
    },

    // Acción para limpiar errores
    clearError() {
      this.error = '';
    }
  }
});
