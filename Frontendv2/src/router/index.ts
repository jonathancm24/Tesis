import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Definición de rutas de la aplicación
 * Incluye rutas públicas y protegidas con lazy loading
 */
const routes: RouteRecordRaw[] = [
  // Ruta raíz - redirige según autenticación
  {
    path: '/',
    name: 'root',
    redirect: (to) => {
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

  // Dashboard - Ruta protegida principal
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      requiresAuth: true, // Requiere autenticación
      title: 'Dashboard'
    }
  },

  // Ruta About - Temporal para desarrollo
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'Acerca de'
    }
  },

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

/**
 * Guard de navegación global
 * Maneja la autenticación y autorización antes de cada ruta
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Inicializar autenticación si no se ha hecho
  if (!authStore.token && !authStore.user) {
    authStore.initializeAuth()
  }

  // Establecer título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} - Sistema Odontológico`
  }

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // No autenticado, redirigir a login
      next({
        name: 'login',
        query: { redirect: to.fullPath } // Guardar ruta de destino
      })
      return
    }
  }

  // Verificar si la ruta requiere ser invitado (no autenticado)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Ya autenticado, redirigir a dashboard
      next({ name: 'dashboard' })
      return
    }
  }

  // Continuar con la navegación
  next()
})

/**
 * Guard posterior a la navegación
 * Maneja acciones después de completar la navegación
 */
router.afterEach((to, from) => {
  // Limpiar cualquier mensaje de error del store de auth en rutas que no sean login
  if (to.name !== 'login') {
    const authStore = useAuthStore()
    authStore.clearError()
  }
})

export default router
