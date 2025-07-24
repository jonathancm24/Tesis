/**
 * Enum que define los roles base del sistema
 * Estos son los roles principales que siempre existirán en el sistema
 * Los administradores pueden crear roles adicionales mediante la API
 */
export enum RoleEnum {
  ADMIN = 'ADMIN',           // Administrador con acceso completo
  PROFESOR = 'PROFESOR',     // Docente de la facultad
  ESTUDIANTE = 'ESTUDIANTE', // Estudiante de odontología
  SECRETARIO = 'SECRETARIO'  // Personal administrativo
}