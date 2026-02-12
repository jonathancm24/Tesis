// Configuracion de roles y permisos basicos para el frontend

export type RoleName = 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE' | 'SECRETARIO'

export const PERMISSIONS = {
  VER_USUARIOS: 'VER_USUARIOS',
  VER_ESTUDIANTES: 'VER_ESTUDIANTES',
  VER_ESPECIALIDADES: 'VER_ESPECIALIDADES'
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const ROLE_ALIASES: Record<string, RoleName> = {
  ADMIN: 'ADMIN',
  ADMINISTRADOR: 'ADMIN',
  PROFESOR: 'PROFESOR',
  DOCENTE: 'PROFESOR',
  ESTUDIANTE: 'ESTUDIANTE',
  SECRETARIO: 'SECRETARIO'
}

export const rolePermissions: Record<RoleName, Permission[]> = {
  ADMIN: [PERMISSIONS.VER_USUARIOS, PERMISSIONS.VER_ESTUDIANTES, PERMISSIONS.VER_ESPECIALIDADES],
  PROFESOR: [PERMISSIONS.VER_ESTUDIANTES],
  ESTUDIANTE: [],
  SECRETARIO: []
}

export const normalizeRoleName = (role?: string | null): RoleName | null => {
  if (!role) return null
  const normalized = role.trim().toUpperCase()
  return ROLE_ALIASES[normalized] ?? null
}
