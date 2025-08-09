// src/router/index.ts

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { Role } from '../mocks/api'

// Layouts por rol
import AdminLayout     from '@/components/layouts/AdminLayout.vue'
import ProfessorLayout from '@/components/layouts/ProfessorLayout.vue'
import SecretaryLayout from '@/components/layouts/SecretaryLayout.vue'
import StudentLayout   from '@/components/layouts/StudentLayout.vue'

// Login público
const Login = () => import('@/views/Login.vue')

// -------------------------
// Vistas por rol (lazy load)
// -------------------------

// 👑 Admin
const HomeAdmin         = () => import('@/views/admin/HomeAdmin.vue')
const AdminUsers        = () => import('@/views/admin/AdminUsers.vue')
const AdminSettings     = () => import('@/views/admin/AdminSettings.vue')
const BaseDataManagement = () => import('@/views/admin/BaseDataManagement.vue')
const AdminProfile      = () => import('@/views/admin/AdminProfile.vue')

// 👨‍🏫 Profesor
const ProfessorDashboard    = () => import('@/views/professor/ProfessorDashboardView.vue')
const AssignmentsManagement = () => import('@/views/professor/AssignmentsManagementView.vue')
const ProfessorProfile      = () => import('@/views/professor/ProfileView.vue')
const StudentProgress       = () => import('@/views/professor/StudentProgressView.vue')

// ✍️ Secretaría
const AffiliationView       = () => import('@/views/secretary/AffiliationView.vue')
const SecretaryDashboard   = () => import('@/views/secretary/SecretaryDashboardView.vue')
const PatientAssignment    = () => import('@/views/secretary/PatientAssignmentView.vue')
const WeeklySchedule       = () => import('@/views/secretary/WeeklyScheduleView.vue')
const PatientManagement    = () => import('@/views/secretary/PatientManagementView.vue')
const MedicalScreening     = () => import('@/views/secretary/MedicalScreeningView.vue') // ✅ CORREGIDO
const SecretaryProfile     = () => import('@/views/secretary/ProfileView.vue')

// 👨‍🎓 Estudiante
const StudentDashboard  = () => import('@/views/student/DashboardView.vue')
const Pacientes         = () => import('@/views/student/Pacientes.vue')
const ClinicalCases     = () => import('@/views/student/ClinicalCasesView.vue')
const StudentCalendar   = () => import('@/views/student/CalendarView.vue')
const StudentTreatments = () => import('@/views/student/TreatmentsView.vue')
const StudentResources  = () => import('@/views/student/ResourcesView.vue')
const StudentTasks      = () => import('@/views/student/TasksView.vue')
const StudentRequests   = () => import('@/views/student/RequestsView.vue')
const StudentMessages   = () => import('@/views/student/MessagesView.vue')
const AssignmentsView   = () => import('@/views/student/AssignmentsView.vue')
const CommunicationView = () => import('@/views/student/CommunicationView.vue')
const TopografiaMucosaOralView = () => import('@/views/student/TopografiaMucosaOralView.vue')
const OdontogramView    = () => import('@/views/student/OdontogramView.vue')
const StudentProfile    = () => import('@/views/student/ProfileView.vue')

// -------------------------
// Definición de rutas
// -------------------------

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },

  // Público
  { path: '/login', name: 'Login', component: Login },

  // Admin
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] as Role[] },
    children: [
      { path: '', name: 'HomeAdmin', component: HomeAdmin },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'settings', name: 'AdminSettings', component: AdminSettings },
      { path: 'base-data', name: 'BaseDataManagement', component: BaseDataManagement },
      { path: 'profile', name: 'AdminProfile', component: AdminProfile }
    ]
  },

  // Profesor
  {
    path: '/professor',
    component: ProfessorLayout,
    meta: { requiresAuth: true, roles: ['profesor'] as Role[] },
    children: [
      { path: '', name: 'ProfessorDashboard', component: ProfessorDashboard },
      { path: 'assignments', name: 'ProfessorAssignments', component: AssignmentsManagement },
      { path: 'profile', name: 'ProfessorProfile', component: ProfessorProfile },
      { path: 'progress', name: 'StudentProgress', component: StudentProgress }
    ]
  },

  // Secretaría
  {
    path: '/secretary',
    component: SecretaryLayout,
    meta: { requiresAuth: true, roles: ['secretario'] as Role[] },
    children: [
      { path: '', name: 'SecretaryDashboard', component: SecretaryDashboard },
      { path: 'patients', name: 'PatientAssignment', component: PatientAssignment },
      { path: 'schedule', name: 'WeeklySchedule', component: WeeklySchedule },
      { path: 'management', name: 'PatientManagement', component: PatientManagement },
      { path: 'screening', name: 'MedicalScreening', component: MedicalScreening }, // ✅ Vista correcta
      { path: 'affiliations', name: 'Affiliation', component: AffiliationView },
      { path: 'profile', name: 'SecretaryProfile', component: SecretaryProfile }
    ]
  },

  // Estudiante
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, roles: ['estudiante'] as Role[] },
    children: [
      { path: '', name: 'StudentDashboard', component: StudentDashboard },
      { path: 'patients', name: 'Pacientes', component: Pacientes },
      { path: 'cases', name: 'ClinicalCases', component: ClinicalCases },
      { path: 'calendar', name: 'StudentCalendar', component: StudentCalendar },
      { path: 'treatments', name: 'StudentTreatments', component: StudentTreatments },
      { path: 'resources', name: 'StudentResources', component: StudentResources },
      { path: 'tasks', name: 'StudentTasks', component: StudentTasks },
      { path: 'requests', name: 'StudentRequests', component: StudentRequests },
      { path: 'messages', name: 'StudentMessages', component: StudentMessages },
      { path: 'assignments', name: 'Assignments', component: AssignmentsView },
      { path: 'communication', name: 'Communication', component: CommunicationView },
      { path: 'odontogram', name: 'Odontogram', component: OdontogramView },
      { path: 'profile', name: 'StudentProfile', component: StudentProfile },
      { path: 'topografia-mucosa-oral', name: 'TopografiaMucosaOral', component: TopografiaMucosaOralView }
    ]
  },

  // Ruta desconocida
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

// -------------------------
// Instancia del router
// -------------------------

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// -------------------------
// Protección por autenticación y rol
// -------------------------

router.beforeEach((to, _from, next) => {
  const raw = localStorage.getItem('user')
  const user: { role: Role } | null = raw ? JSON.parse(raw) : null

  if (to.meta.requiresAuth) {
    if (!user) return next({ name: 'Login' })
    const allowed = (to.meta.roles as Role[]) || []
    if (!allowed.includes(user.role)) return next({ name: 'Login' })
  }

  next()
})

export default router
