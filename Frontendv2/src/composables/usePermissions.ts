import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { normalizeRoleName, type Permission, type RoleName } from '@/Config/permissions'

/**
 * Helpers para validar roles y permisos
 */
export const usePermissions = () => {
  const authStore = useAuthStore()

  const role = computed<RoleName | null>(() => normalizeRoleName(authStore.userRole))

  const hasRole = (roleName: RoleName) => {
    return role.value === roleName
  }

  const hasAnyRole = (roles: RoleName[] = []) => {
    if (!roles.length) return true
    return roles.includes(role.value ?? 'ESTUDIANTE')
  }

  const hasPermission = (permission: Permission) => {
    return authStore.permissions.includes(permission)
  }

  return {
    role,
    hasRole,
    hasAnyRole,
    hasPermission
  }
}
