/**
 * Exportación centralizada de todos los DTOs del módulo Odontograma
 * 
 * Este archivo centraliza todas las exportaciones de DTOs para facilitar
 * la importación en otros módulos y mantener una estructura organizada.
 * 
 * @fileoverview Exportaciones centralizadas DTOs Odontograma
 * @module OdontogramaDTOsIndex
 */

// DTOs de creación y actualización
export * from './crear-actualizar-odontograma.dto';

// DTOs de filtros y consultas
export * from './filtros-odontogramas.dto';

// DTOs de configuraciones especializadas
export * from './configuraciones-odontogramas.dto';

/**
 * Resumen de DTOs disponibles:
 * 
 * === DTOs de Creación y Actualización ===
 * - CondicionDentalDto: Estructura para condiciones dentales específicas
 * - CrearOdontogramaDto: DTO principal para crear odontogramas
 * - ActualizarOdontogramaDto: DTO para actualizar odontogramas existentes
 * - AsignarDocenteOdontogramaDto: DTO para asignación de docente supervisor
 * - AgregarObservacionOdontogramaDto: DTO para agregar observaciones
 * - CalificarOdontogramaDto: DTO para calificación por docente
 * - GenerarPlantillaOdontogramaDto: DTO para generar plantillas
 * - RevisionOdontogramaDto: DTO para revisión y retroalimentación
 * - NotificacionOdontogramaDto: DTO para notificaciones del sistema
 * - ConfiguracionSistemaOdontogramaDto: DTO para configuración del sistema
 * - EstadisticasOdontogramaDto: DTO para generar estadísticas
 * 
 * === DTOs de Filtros y Consultas ===
 * - FiltrosOdontogramasDto: Filtros base con paginación y ordenamiento
 * - RespuestaPaginadaOdontogramasDto: Estructura de respuesta paginada
 * - EstadisticasOdontogramasDto: Configuración para análisis estadístico
 * - BusquedaAvanzadaOdontogramasDto: Búsquedas complejas con múltiples criterios
 * - GenerarReporteOdontogramasDto: Configuración para generación de reportes
 * - DashboardOdontogramasDto: Configuración para vistas de dashboard
 * - ValidarCreacionOdontogramaDto: Validaciones previas a creación
 * - FiltrosNotificacionesOdontogramasDto: Filtros para notificaciones
 * - FiltrosRapidosOdontogramasDto: Filtros predefinidos comunes
 * 
 * === DTOs de Configuraciones Especializadas ===
 * - ConfiguracionAnalisisComparativoDto: Análisis comparativo entre grupos
 * - ConfiguracionAlertasOdontogramasDto: Configuración de alertas automáticas
 * - ConfiguracionExportacionOdontogramasDto: Configuración de exportación
 * - ConfiguracionPlantillaVisualizacionDto: Plantillas de visualización
 * - ConfiguracionAnalisisPredictivoDto: Análisis predictivo y tendencias
 * - ConfiguracionIntegracionExternaDto: Integración con sistemas externos
 * - ConfiguracionBackupOdontogramasDto: Backup y archivado de datos
 * - ConfiguracionMetricasCalidadDto: Métricas de calidad y evaluación
 * 
 * === Características Principales ===
 * ✅ Validación completa con class-validator
 * ✅ Documentación Swagger integrada
 * ✅ Tipado fuerte con TypeScript
 * ✅ Paginación y ordenamiento estándar
 * ✅ Filtros especializados para odontología
 * ✅ Configuraciones avanzadas para análisis
 * ✅ Soporte para exportación múltiple formato
 * ✅ Integración con sistema académico
 * ✅ Alertas y notificaciones automáticas
 * ✅ Métricas de calidad y rendimiento
 * 
 * === Patrón de Nomenclatura ===
 * - Crear[Entidad]Dto: Para crear nuevos registros
 * - Actualizar[Entidad]Dto: Para actualizar registros existentes
 * - Filtros[Entidad]Dto: Para filtrar y consultar registros
 * - Configuracion[Aspecto]Dto: Para configuraciones específicas
 * - [Accion][Entidad]Dto: Para acciones específicas
 * 
 * === Uso Recomendado ===
 * ```typescript
 * import { 
 *   CrearOdontogramaDto, 
 *   FiltrosOdontogramasDto,
 *   ConfiguracionAnalisisComparativoDto 
 * } from '@modules/Odontograma/DTO';
 * ```
 */
