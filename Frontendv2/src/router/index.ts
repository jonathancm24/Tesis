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
