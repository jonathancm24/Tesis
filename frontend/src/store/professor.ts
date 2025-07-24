// src/store/professor.ts
import { defineStore } from 'pinia';
import type { ProfessorAssignment } from '../mocks/professor/assignments';
import type { StudentProgress }     from '../mocks/professor/progress';
import type { StudentInfo }         from '../mocks/professor/studentsByCourse';
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

export const useProfessorStore = defineStore('professor', {
  state: () => ({
    assignments: [] as ProfessorAssignment[],
    progress:    [] as StudentProgress[],
    students:    [] as StudentInfo[],
    loading: false,
    error:   '' as string
  }),
  actions: {
    // Assignments
    async loadAssignments() {
      this.loading = true;
      this.assignments = await fetchProfessorAssignmentsMock();
      this.loading = false;
    },
    async saveAssignment(a: ProfessorAssignment) {
      this.loading = true;
      await saveProfessorAssignmentMock(a);
      await this.loadAssignments();
      this.loading = false;
    },
    async deleteAssignment(id: number) {
      this.loading = true;
      await deleteProfessorAssignmentMock(id);
      await this.loadAssignments();
      this.loading = false;
    },

    // Progress
    async loadProgress() {
      this.loading = true;
      this.progress = await fetchProgressMock();
      this.loading = false;
    },
    async saveProgress(r: StudentProgress) {
      this.loading = true;
      await saveProgressMock(r);
      await this.loadProgress();
      this.loading = false;
    },

    // Students by course
    async loadStudents(course: string) {
      this.loading = true;
      this.students = await fetchStudentsByCourseMock(course);
      this.loading = false;
    },
    async addStudent(info: StudentInfo) {
      this.loading = true;
      await addStudentToCourseMock(info);
      await this.loadStudents(info.course);
      this.loading = false;
    },
    async removeStudent(studentId: number, course: string) {
      this.loading = true;
      await removeStudentFromCourseMock(studentId, course);
      await this.loadStudents(course);
      this.loading = false;
    }
  }
});
