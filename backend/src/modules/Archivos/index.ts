/**
 * Índice del Módulo de Archivos
 * 
 * Punto de entrada unificado para el sistema de archivos polimórfico.
 * Exporta todos los componentes principales del módulo para facilitar
 * su importación y uso en otras partes del sistema.
 * 
 * @fileoverview Exportaciones principales del módulo de archivos
 * @module ArchivoIndex
 */

// Exportar el módulo principal
export { ArchivoModule } from './archivo.module';

// Exportar el servicio para uso en otros módulos
export { ArchivoService } from './archivo.service';

// Exportar el controlador para referencia
export { ArchivoController } from './archivo.controller';

// Exportar todos los DTOs para validación
export * from './DTO';

// Exportar todas las interfaces para tipado
export * from './Interface';

/**
 * Resumen de exportaciones del módulo de archivos:
 * 
 * Módulo principal:
 * - ArchivoModule: Configuración completa del módulo
 * 
 * Servicios:
 * - ArchivoService: Lógica de negocio para archivos polimórficos
 * 
 * Controladores:
 * - ArchivoController: Endpoints REST para gestión de archivos
 * 
 * DTOs (Data Transfer Objects):
 * - CrearArchivoDto: Validación para crear archivos
 * - ActualizarArchivoDto: Validación para actualizar archivos
 * - FiltrosArchivosDto: Validación para consultas con filtros
 * - CrearRelacionArchivoDto: Validación para relaciones
 * - SubirArchivoConRelacionDto: Validación para subida con relación
 * - RespuestaPaginadaArchivosDto: Estructura de respuestas paginadas
 * - EstadisticasArchivosDto: Estructura para estadísticas
 * - OperacionMasivaArchivosDto: Validación para operaciones masivas
 * - TipoEntidadArchivo: Enum de tipos de entidad
 * - CategoriaArchivo: Enum de categorías
 * - RolArchivoUsuario: Enum de roles de acceso
 * 
 * Interfaces:
 * - IArchivo: Estructura básica de archivo
 * - IArchivoCompleto: Archivo con todas las relaciones
 * - IArchivoRelacion: Relación archivo-entidad
 * - IRespuestaPaginadaArchivos: Respuesta paginada tipada
 * - IResultadoOperacionArchivo: Resultado de operaciones
 * - IResultadoOperacionMasiva: Resultado de operaciones masivas
 * - IPermisosArchivo: Estructura de permisos
 * - IArchivosEntidad: Archivos de una entidad específica
 * - IValidacionArchivo: Validación de archivos
 * - IEstadisticasArchivos: Estadísticas del sistema
 * 
 * Uso típico:
 * 
 * ```typescript
 * // Importar el módulo completo
 * import { ArchivoModule } from '@modules/Archivos';
 * 
 * // Importar componentes específicos
 * import { 
 *   ArchivoService, 
 *   CrearArchivoDto, 
 *   IArchivo 
 * } from '@modules/Archivos';
 * 
 * // Usar en otros módulos
 * @Module({
 *   imports: [ArchivoModule],
 *   // ...
 * })
 * export class OtroModule {}
 * ```
 */
