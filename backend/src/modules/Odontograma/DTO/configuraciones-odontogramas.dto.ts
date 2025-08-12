/**
 * DTOs para configuraciones específicas de consultas de odontogramas
 * 
 * Define estructuras de configuración para consultas complejas,
 * análisis comparativos y configuraciones de visualización
 * específicas del módulo de odontogramas.
 * 
 * @fileoverview DTOs de configuración y consultas especializadas
 * @module OdontogramaConfiguracionesDTOs
 * @requires class-validator, swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para configuración de análisis comparativo
 * Configuración para comparar odontogramas entre períodos o grupos
 */
export class ConfiguracionAnalisisComparativoDto {
  @ApiProperty({
    description: 'Tipo de comparación a realizar',
    example: 'temporal',
    enum: ['temporal', 'entre_estudiantes', 'entre_docentes', 'entre_especialidades', 'casos_similares']
  })
  @IsString()
  @IsEnum(['temporal', 'entre_estudiantes', 'entre_docentes', 'entre_especialidades', 'casos_similares'])
  tipoComparacion: string;

  @ApiPropertyOptional({
    description: 'Configuración específica del primer grupo de comparación',
    example: { "fechaInicio": "2025-01-01", "fechaFin": "2025-03-31" }
  })
  @IsOptional()
  @IsObject()
  grupoA?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Configuración específica del segundo grupo de comparación',
    example: { "fechaInicio": "2025-04-01", "fechaFin": "2025-06-30" }
  })
  @IsOptional()
  @IsObject()
  grupoB?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Métricas específicas a comparar',
    example: ['cantidad_odontogramas', 'condiciones_frecuentes', 'tiempo_promedio'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricasComparar?: string[];

  @ApiPropertyOptional({
    description: 'Incluir análisis estadístico (t-test, chi-cuadrado)',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirAnalisisEstadistico?: boolean;

  @ApiPropertyOptional({
    description: 'Nivel de significancia para pruebas estadísticas',
    example: 0.05,
    minimum: 0.01,
    maximum: 0.1
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(0.1)
  nivelSignificancia?: number;
}

/**
 * DTO para configuración de alertas y notificaciones
 * Define criterios para generar alertas automáticas
 */
export class ConfiguracionAlertasOdontogramasDto {
  @ApiProperty({
    description: 'Tipos de alertas a configurar',
    example: ['revision_pendiente', 'severidad_alta'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  tiposAlertas: string[];

  @ApiPropertyOptional({
    description: 'Umbral de días para alerta de revisión pendiente',
    example: 3,
    minimum: 1,
    maximum: 30
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  umbralDiasRevisionPendiente?: number;

  @ApiPropertyOptional({
    description: 'Severidad mínima para generar alerta',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severidadMinimaAlerta?: number;

  @ApiPropertyOptional({
    description: 'Enviar alertas por email',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  enviarEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Enviar notificaciones en la aplicación',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  notificacionesApp?: boolean;

  @ApiPropertyOptional({
    description: 'Horarios permitidos para envío de alertas',
    example: { "inicio": "08:00", "fin": "18:00" }
  })
  @IsOptional()
  @IsObject()
  horariosEnvio?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Frecuencia de verificación de alertas (en minutos)',
    example: 60,
    minimum: 5,
    maximum: 1440
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(1440)
  frecuenciaVerificacion?: number;
}

/**
 * DTO para configuración de exportación de datos
 * Configuraciones específicas para exportar datos de odontogramas
 */
export class ConfiguracionExportacionOdontogramasDto {
  @ApiProperty({
    description: 'Formato de exportación',
    example: 'EXCEL',
    enum: ['EXCEL', 'CSV', 'PDF', 'JSON', 'XML']
  })
  @IsString()
  @IsEnum(['EXCEL', 'CSV', 'PDF', 'JSON', 'XML'])
  formato: string;

  @ApiPropertyOptional({
    description: 'Campos específicos a incluir en la exportación',
    example: ['diente', 'condicion', 'conclusion', 'fechaCreacion'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  camposIncluir?: string[];

  @ApiPropertyOptional({
    description: 'Incluir metadatos del odontograma',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirMetadatos?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir información del estudiante y docente',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirInformacionUsuarios?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir observaciones relacionadas',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  incluirObservaciones?: boolean;

  @ApiPropertyOptional({
    description: 'Aplicar filtros antes de exportar',
    example: { "severidadMinima": 2, "fechaInicio": "2025-01-01" }
  })
  @IsOptional()
  @IsObject()
  filtrosAplicar?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Máximo número de registros a exportar',
    example: 1000,
    minimum: 1,
    maximum: 10000
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  limiteRegistros?: number;

  @ApiPropertyOptional({
    description: 'Incluir resumen estadístico',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirResumenEstadistico?: boolean;
}

/**
 * DTO para configuración de plantillas de visualización
 * Define configuraciones para diferentes vistas de odontogramas
 */
export class ConfiguracionPlantillaVisualizacionDto {
  @ApiProperty({
    description: 'Tipo de plantilla de visualización',
    example: 'tabla_completa',
    enum: ['tabla_completa', 'resumen_ejecutivo', 'vista_dental', 'timeline', 'dashboard_docente']
  })
  @IsString()
  @IsEnum(['tabla_completa', 'resumen_ejecutivo', 'vista_dental', 'timeline', 'dashboard_docente'])
  tipoPlantilla: string;

  @ApiPropertyOptional({
    description: 'Configuración de columnas visibles',
    example: ['diente', 'condicion', 'severidad', 'fechaCreacion'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columnasVisibles?: string[];

  @ApiPropertyOptional({
    description: 'Configuración de agrupamiento',
    example: { "campo": "estudiante", "orden": "asc" }
  })
  @IsOptional()
  @IsObject()
  agrupamiento?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Configuración de colores para condiciones',
    example: { "caries": "#ff4444", "normal": "#44ff44", "obturación": "#4444ff" }
  })
  @IsOptional()
  @IsObject()
  esquemaColores?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Mostrar indicadores visuales',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  mostrarIndicadores?: boolean;

  @ApiPropertyOptional({
    description: 'Configuración de filtros rápidos disponibles',
    example: ['severidad_alta', 'pendientes_revision', 'completados_hoy'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filtrosRapidosDisponibles?: string[];

  @ApiPropertyOptional({
    description: 'Configuración de paginación por defecto',
    example: { "elementosPorPagina": 25, "mostrarTotales": true }
  })
  @IsOptional()
  @IsObject()
  configuracionPaginacion?: Record<string, any>;
}

/**
 * DTO para configuración de análisis predictivo
 * Configuraciones para análisis de tendencias y predicciones
 */
export class ConfiguracionAnalisisPredictivoDto {
  @ApiProperty({
    description: 'Tipo de análisis predictivo',
    example: 'tendencia_condiciones',
    enum: ['tendencia_condiciones', 'prediccion_tratamientos', 'analisis_patron_estudiante', 'forecast_carga_trabajo']
  })
  @IsString()
  @IsEnum(['tendencia_condiciones', 'prediccion_tratamientos', 'analisis_patron_estudiante', 'forecast_carga_trabajo'])
  tipoAnalisis: string;

  @ApiPropertyOptional({
    description: 'Período histórico en meses para el análisis',
    example: 6,
    minimum: 1,
    maximum: 24
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  periodoHistoricoMeses?: number;

  @ApiPropertyOptional({
    description: 'Período de predicción en meses',
    example: 3,
    minimum: 1,
    maximum: 12
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  periodoPrediccionMeses?: number;

  @ApiPropertyOptional({
    description: 'Variables a incluir en el análisis',
    example: ['severidad', 'tipo_condicion', 'tiempo_resolucion'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variablesAnalisis?: string[];

  @ApiPropertyOptional({
    description: 'Nivel de confianza para las predicciones',
    example: 95,
    minimum: 80,
    maximum: 99
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(80)
  @Max(99)
  nivelConfianza?: number;

  @ApiPropertyOptional({
    description: 'Incluir intervalos de confianza en resultados',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirIntervalosConfianza?: boolean;
}

/**
 * DTO para configuración de integración con sistemas externos
 * Configuración para integraciones con sistemas de la universidad
 */
export class ConfiguracionIntegracionExternaDto {
  @ApiProperty({
    description: 'Sistema externo a integrar',
    example: 'sistema_academico',
    enum: ['sistema_academico', 'sistema_calificaciones', 'historia_clinica', 'agenda_citas']
  })
  @IsString()
  @IsEnum(['sistema_academico', 'sistema_calificaciones', 'historia_clinica', 'agenda_citas'])
  sistemaExterno: string;

  @ApiPropertyOptional({
    description: 'Tipo de sincronización',
    example: 'bidireccional',
    enum: ['solo_lectura', 'solo_escritura', 'bidireccional']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['solo_lectura', 'solo_escritura', 'bidireccional'])
  tipoSincronizacion?: string;

  @ApiPropertyOptional({
    description: 'Frecuencia de sincronización',
    example: 'tiempo_real',
    enum: ['tiempo_real', 'cada_hora', 'diario', 'manual']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['tiempo_real', 'cada_hora', 'diario', 'manual'])
  frecuenciaSincronizacion?: string;

  @ApiPropertyOptional({
    description: 'Campos a sincronizar',
    example: ['calificacion', 'observaciones', 'fecha_completado'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  camposSincronizar?: string[];

  @ApiPropertyOptional({
    description: 'Configuración específica del sistema externo',
    example: { "url_api": "https://academico.universidad.edu", "version": "v2" }
  })
  @IsOptional()
  @IsObject()
  configuracionSistema?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Habilitar log de sincronización',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  habilitarLog?: boolean;
}

/**
 * DTO para configuración de backup y archivado
 * Configuraciones para gestión de datos históricos
 */
export class ConfiguracionBackupOdontogramasDto {
  @ApiProperty({
    description: 'Tipo de backup',
    example: 'incremental',
    enum: ['completo', 'incremental', 'diferencial']
  })
  @IsString()
  @IsEnum(['completo', 'incremental', 'diferencial'])
  tipoBackup: string;

  @ApiPropertyOptional({
    description: 'Frecuencia de backup automático',
    example: 'semanal',
    enum: ['diario', 'semanal', 'mensual', 'manual']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['diario', 'semanal', 'mensual', 'manual'])
  frecuenciaBackup?: string;

  @ApiPropertyOptional({
    description: 'Criterios para archivado automático',
    example: { "diasInactividad": 365, "semestresCompletos": 2 }
  })
  @IsOptional()
  @IsObject()
  criteriosArchivado?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Incluir archivos adjuntos en backup',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirArchivosAdjuntos?: boolean;

  @ApiPropertyOptional({
    description: 'Comprimir datos en backup',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  comprimirDatos?: boolean;

  @ApiPropertyOptional({
    description: 'Ubicación de almacenamiento',
    example: 'almacenamiento_nube',
    enum: ['local', 'almacenamiento_nube', 'servidor_backup']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['local', 'almacenamiento_nube', 'servidor_backup'])
  ubicacionAlmacenamiento?: string;

  @ApiPropertyOptional({
    description: 'Retención de backups (en meses)',
    example: 24,
    minimum: 1,
    maximum: 120
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  retencionMeses?: number;
}

/**
 * DTO para configuración de métricas de calidad
 * Define métricas para evaluar la calidad de los odontogramas
 */
export class ConfiguracionMetricasCalidadDto {
  @ApiPropertyOptional({
    description: 'Métricas a calcular',
    example: ['completitud', 'precision', 'consistencia', 'tiempo_respuesta'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricasCalcular?: string[];

  @ApiPropertyOptional({
    description: 'Umbrales de calidad mínimos',
    example: { "completitud": 90, "precision": 85, "consistencia": 80 }
  })
  @IsOptional()
  @IsObject()
  umbralesMinimos?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Frecuencia de cálculo de métricas',
    example: 'diario',
    enum: ['tiempo_real', 'diario', 'semanal', 'mensual']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['tiempo_real', 'diario', 'semanal', 'mensual'])
  frecuenciaCalculo?: string;

  @ApiPropertyOptional({
    description: 'Generar alertas por baja calidad',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  generarAlertasBajaCalidad?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir métricas por estudiante',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirMetricasPorEstudiante?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir métricas por docente',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirMetricasPorDocente?: boolean;
}
