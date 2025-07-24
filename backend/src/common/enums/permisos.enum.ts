/**
 * Enum que define todos los permisos disponibles en el sistema
 * Cada permiso representa una acción específica que un usuario puede realizar
 * Se organizan por módulos para mejor comprensión y mantenimiento
 */
export enum PermisoEnum {
  // === GESTIÓN DE USUARIOS ===
  VER_USUARIOS = 'VER_USUARIOS',                     // Puede ver la lista de usuarios
  CREAR_USUARIOS = 'CREAR_USUARIOS',                 // Puede registrar nuevos usuarios
  EDITAR_USUARIOS = 'EDITAR_USUARIOS',               // Puede modificar datos de usuarios
  ELIMINAR_USUARIOS = 'ELIMINAR_USUARIOS',           // Puede eliminar usuarios del sistema
  ASIGNAR_ROLES = 'ASIGNAR_ROLES',                   // Puede cambiar roles de usuarios
  
  // === GESTIÓN DE ROLES Y PERMISOS ===
  GESTIONAR_ROLES = 'GESTIONAR_ROLES',               // Puede crear/editar/eliminar roles
  VER_ROLES = 'VER_ROLES',                           // Puede ver la lista de roles
  ASIGNAR_PERMISOS_INDIVIDUALES = 'ASIGNAR_PERMISOS_INDIVIDUALES', // Puede dar permisos extra a usuarios
  REVOCAR_PERMISOS_INDIVIDUALES = 'REVOCAR_PERMISOS_INDIVIDUALES', // Puede quitar permisos extra
  
  // === GESTIÓN DE CITAS ===
  VER_CITAS = 'VER_CITAS',                           // Puede ver citas del sistema
  CREAR_CITAS = 'CREAR_CITAS',                       // Puede agendar nuevas citas
  EDITAR_CITAS = 'EDITAR_CITAS',                     // Puede modificar citas existentes
  CANCELAR_CITAS = 'CANCELAR_CITAS',                 // Puede cancelar citas
  VER_TODAS_LAS_CITAS = 'VER_TODAS_LAS_CITAS',       // Puede ver citas de todos los usuarios
  
  // === GESTIÓN DE TRATAMIENTOS ===
  VER_TRATAMIENTOS = 'VER_TRATAMIENTOS',             // Puede ver tratamientos
  CREAR_TRATAMIENTOS = 'CREAR_TRATAMIENTOS',         // Puede crear nuevos tratamientos
  EDITAR_TRATAMIENTOS = 'EDITAR_TRATAMIENTOS',       // Puede modificar tratamientos
  APROBAR_TRATAMIENTOS = 'APROBAR_TRATAMIENTOS',     // Puede aprobar tratamientos de estudiantes
  VER_TODOS_TRATAMIENTOS = 'VER_TODOS_TRATAMIENTOS', // Puede ver tratamientos de todos
  
  // === GESTIÓN DE PACIENTES ===
  VER_PACIENTES = 'VER_PACIENTES',                   // Puede ver información de pacientes
  CREAR_PACIENTES = 'CREAR_PACIENTES',               // Puede registrar nuevos pacientes
  EDITAR_PACIENTES = 'EDITAR_PACIENTES',             // Puede modificar datos de pacientes
  
  // === GESTIÓN DE SOLICITUDES ===
  CREAR_SOLICITUDES = 'CREAR_SOLICITUDES',           // Puede crear solicitudes de permisos
  VER_SOLICITUDES = 'VER_SOLICITUDES',               // Puede ver solicitudes pendientes
  APROBAR_SOLICITUDES = 'APROBAR_SOLICITUDES',       // Puede aprobar/rechazar solicitudes
  
  // === GESTIÓN DE ESPECIALIDADES ===
  VER_ESPECIALIDADES = 'VER_ESPECIALIDADES',         // Puede ver especialidades disponibles
  GESTIONAR_ESPECIALIDADES = 'GESTIONAR_ESPECIALIDADES', // Puede crear/editar especialidades
}

/**
 * Agrupa los permisos por módulos para facilitar su gestión
 * Útil para mostrar permisos organizados en el frontend de administración
 */
export const PERMISOS_POR_MODULO = {
  USUARIOS: [
    PermisoEnum.VER_USUARIOS,
    PermisoEnum.CREAR_USUARIOS,
    PermisoEnum.EDITAR_USUARIOS,
    PermisoEnum.ELIMINAR_USUARIOS,
    PermisoEnum.ASIGNAR_ROLES,
  ],
  ROLES: [
    PermisoEnum.GESTIONAR_ROLES,
    PermisoEnum.VER_ROLES,
    PermisoEnum.ASIGNAR_PERMISOS_INDIVIDUALES,
    PermisoEnum.REVOCAR_PERMISOS_INDIVIDUALES,
  ],
  CITAS: [
    PermisoEnum.VER_CITAS,
    PermisoEnum.CREAR_CITAS,
    PermisoEnum.EDITAR_CITAS,
    PermisoEnum.CANCELAR_CITAS,
    PermisoEnum.VER_TODAS_LAS_CITAS,
  ],
  TRATAMIENTOS: [
    PermisoEnum.VER_TRATAMIENTOS,
    PermisoEnum.CREAR_TRATAMIENTOS,
    PermisoEnum.EDITAR_TRATAMIENTOS,
    PermisoEnum.APROBAR_TRATAMIENTOS,
    PermisoEnum.VER_TODOS_TRATAMIENTOS,
  ],
  PACIENTES: [
    PermisoEnum.VER_PACIENTES,
    PermisoEnum.CREAR_PACIENTES,
    PermisoEnum.EDITAR_PACIENTES,
  ],
  SOLICITUDES: [
    PermisoEnum.CREAR_SOLICITUDES,
    PermisoEnum.VER_SOLICITUDES,
    PermisoEnum.APROBAR_SOLICITUDES,
  ],
  ESPECIALIDADES: [
    PermisoEnum.VER_ESPECIALIDADES,
    PermisoEnum.GESTIONAR_ESPECIALIDADES,
  ],
};