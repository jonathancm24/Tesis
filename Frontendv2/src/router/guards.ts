import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import type { RoleName } from '@/Config/permissions'

/**
 * Configurar guards de autenticacion y permisos
 */
export const setupRouterGuards = (router: Router) => {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const { hasAnyRole } = usePermissions()

    // Inicializar autenticacion si no se ha hecho
    if (!authStore.token && !authStore.user) {
      authStore.initializeAuth()
    }

    // Establecer titulo de la pagina
    if (to.meta.title) {
      document.title = `${to.meta.title} - Sistema Odontologico`
    }

    // Verificar si la ruta requiere autenticacion
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }

      const roles = to.meta.roles as RoleName[] | undefined
      if (roles && !hasAnyRole(roles)) {
        next({ name: 'dashboard' })
        return
      }
    }

    // Verificar si la ruta requiere ser invitado
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      next({ name: 'dashboard' })
      return
    }

    next()
  })

  router.afterEach((to) => {
    if (to.name !== 'login') {
      const authStore = useAuthStore()
      authStore.clearError()
    }
  })
}
