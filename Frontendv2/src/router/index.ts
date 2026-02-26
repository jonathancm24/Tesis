import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setupRouterGuards } from './guards'

/**
 * Definición de rutas de la aplicación
 * Incluye rutas públicas y protegidas con lazy loading
 */
const routes: RouteRecordRaw[] = [
  // Ruta raíz - redirige según autenticación
  {
    path: '/',
    name: 'root',
    redirect: () => {
      // Esta lógica se ejecuta en tiempo de navegación
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? '/dashboard' : '/login'
    }
  },

  // Ruta de Login - Solo accesible si NO está autenticado
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      requiresGuest: true, // Solo para usuarios no autenticados
      title: 'Iniciar Sesión'
    }
  },

  // ========== RUTAS AUTENTICADAS CON LAYOUT ==========
  // Todas estas rutas usan el AppLayout (header + sidebar + contenido)
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard - Página principal
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('../views/Perfil.vue'),
        meta: {
          title: 'Mi perfil',
          roles: ['ESTUDIANTE', 'ADMIN', 'PROFESOR']
        }
      },

      // ========== MÓDULO DE ADMINISTRACIÓN ==========
      {
        path: 'admin/usuarios',
        name: 'admin-usuarios',
        component: () => import('../views/Admin/UsuariosView.vue'),
        meta: {
          title: 'Gestión de usuarios',
          roles: ['ADMIN']
        }
      },
      {
        path: 'admin/especialidades',
        name: 'admin-especialidades',
        component: () => import('../views/Admin/EspecialidadesView.vue'),
        meta: {
          title: 'Gestión de especialidades',
          roles: ['ADMIN']
        }
      },
      // ========== MÓDULO DE PROFESOR ==========
      {
        path: 'profesor/estudiantes',
        name: 'profesor-estudiantes',
        component: () => import('../views/Profesor/EstudiantesView.vue'),
        meta: {
          title: 'Seguimiento de estudiantes',
          roles: ['PROFESOR', 'ADMIN']
        }
      },
      {
        path: 'profesor/casos-pendientes',
        name: 'profesor-casos-pendientes',
        component: () => import('../views/Profesor/CasosPendientesView.vue'),
        meta: {
          title: 'Buzón de casos clínicos',
          roles: ['PROFESOR', 'ADMIN']
        }
      },
      {
        path: 'profesor/preguntas-clinicas',
        name: 'profesor-preguntas-clinicas',
        component: () => import('../views/Profesor/PreguntasClinicasView.vue'),
        meta: {
          title: 'Preguntas clínicas',
          roles: ['PROFESOR', 'ADMIN']
        }
      },

      // ========== MÓDULO DE ESTUDIANTES ==========
      {
        path: 'estudiantes/pacientes',
        name: 'estudiantes-pacientes',
        component: () => import('../views/Estudiantes/PacientesView.vue'),
        meta: {
          title: 'Gestión de pacientes',
          roles: ['ESTUDIANTE', 'ADMIN', 'PROFESOR']
        }
      },
      {
        path: 'estudiantes/agenda',
        name: 'estudiantes-agenda',
        component: () => import('../views/Estudiantes/Agenda.vue'),
        meta: {
          title: 'Agenda de citas',
          roles: ['ESTUDIANTE', 'ADMIN', 'PROFESOR']
        }
      },
      {
        path: 'estudiantes/casos-clinicos/nuevo',
        name: 'estudiantes-casos-clinicos-nuevo',
        component: () => import('../views/Estudiantes/CasoClinico.vue'),
        meta: {
          title: 'Nuevo caso clinico',
          roles: ['ESTUDIANTE', 'ADMIN']
        }
      }

      // ========== RUTAS FUTURAS (comentadas) ==========
      /*
      {
        path: 'admin/roles',
        name: 'admin-roles',
        component: () => import('../views/Admin/RolesView.vue'),
        meta: {
          title: 'Gestión de roles',
          roles: ['administrador']
        }
      },
      {
        path: 'profesor/pacientes',
        name: 'profesor-pacientes',
        component: () => import('../views/Profesor/PacientesView.vue'),
        meta: {
          title: 'Mis pacientes',
          roles: ['profesor', 'administrador']
        }
      }
      */
    ]
  },

  // Ruta About - Temporal para desarrollo
  /*{
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'Acerca de'
    }
  },
*/
  // Ruta 404 - Catch all
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: 'Página no encontrada'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

setupRouterGuards(router)

export default router
