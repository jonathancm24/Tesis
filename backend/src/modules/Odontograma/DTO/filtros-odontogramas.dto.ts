/**
 * DTOs para filtros y consultas de odontogramas
 * 
 * Define las estructuras de validación para consultas, búsquedas y filtros
 * del módulo de odontogramas. Incluye paginación, ordenamiento y filtros
 * especializados para el análisis de datos odontológicos.
 * 
 * @fileoverview DTOs de consulta y filtros para odontogramas
 * @module OdontogramaConsultaDTOs
 * @requires class-validator, swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsNumber
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO base para filtros de odontogramas
 * Contiene filtros comunes para consultas de odontogramas
 */
export class FiltrosOdontogramasDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    example: 'fechaCreacion',
    enum: ['fechaCreacion', 'diente', 'estudiante', 'docente', 'conclusion']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['fechaCreacion', 'diente', 'estudiante', 'docente', 'conclusion'])
  ordenarPor?: string;

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  direccion?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por ID del estudiante',
    example: 123,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente supervisor',
    example: 456,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del caso clínico',
    example: 789,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  casoClinicoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por número específico de diente',
    example: '11'
  })
  @IsOptional()
  @IsString()
  diente?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtro de rango',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtro de rango',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda de texto en conclusiones',
    example: 'caries',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de condición específica',
    example: 'caries',
    enum: ['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción', 'fractura']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción', 'fractura'])
  tipoCondicion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cara del diente',
    example: 'distal',
    enum: ['distal', 'mesial', 'vestibular', 'lingual', 'oclusal', 'incisal']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['distal', 'mesial', 'vestibular', 'lingual', 'oclusal', 'incisal'])
  caraDiente?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo odontogramas que requieren tratamiento',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  requiereTratamiento?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel de severidad mínimo',
    example: 3,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severidadMinima?: number;

  @ApiPropertyOptional({
    description: 'Incluir solo odontogramas con observaciones pendientes',
    example: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloConObservacionesPendientes?: boolean;
}

/**
 * DTO para respuesta paginada de odontogramas
 * Estructura estándar para respuestas con paginación
 */
export class RespuestaPaginadaOdontogramasDto {
  @ApiProperty({
    description: 'Lista de odontogramas',
    type: 'array',
    items: { type: 'object' }
  })
  odontogramas: any[];

  @ApiProperty({
    description: 'Total de registros encontrados',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas disponibles',
    example: 15
  })
  totalPaginas: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1
  })
  paginaActual: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10
  })
  elementosPorPagina: number;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false
  })
  tieneAnterior: boolean;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true
  })
  tieneSiguiente: boolean;
}

/**
 * DTO para estadísticas de odontogramas
 * Configuración para generar métricas y análisis
 */
export class EstadisticasOdontogramasDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio para el análisis estadístico',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para el análisis estadístico',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'IDs de especialidades a incluir en el análisis',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'IDs de estudiantes a incluir en el análisis',
    example: [123, 124, 125],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  estudianteIds?: number[];

  @ApiPropertyOptional({
    description: 'IDs de docentes a incluir en el análisis',
    example: [456, 457, 458],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  docenteIds?: number[];

  @ApiPropertyOptional({
    description: 'Incluir tendencias mensuales en las estadísticas',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirTendencias?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir análisis de condiciones frecuentes',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirCondicionesFrecuentes?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir métricas de tiempo de evaluación',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  incluirMetricasTiempo?: boolean;
}

/**
 * DTO para búsqueda avanzada de odontogramas
 * Permite búsquedas complejas con múltiples criterios
 */
export class BusquedaAvanzadaOdontogramasDto extends FiltrosOdontogramasDto {
  @ApiPropertyOptional({
    description: 'Búsqueda de texto libre en múltiples campos',
    example: 'caries corona',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  textoLibre?: string;

  @ApiPropertyOptional({
    description: 'Tipos de condiciones a incluir (OR)',
    example: ['caries', 'obturación'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tiposCondicion?: string[];

  @ApiPropertyOptional({
    description: 'Caras dentales a incluir en la búsqueda',
    example: ['distal', 'mesial'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carasDentales?: string[];

  @ApiPropertyOptional({
    description: 'Rango de severidad (mínimo)',
    example: 2,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severidadMin?: number;

  @ApiPropertyOptional({
    description: 'Rango de severidad (máximo)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  severidadMax?: number;

  @ApiPropertyOptional({
    description: 'Dientes específicos a incluir',
    example: ['11', '12', '21', '22'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dientesEspecificos?: string[];

  @ApiPropertyOptional({
    description: 'Excluir odontogramas ya revisados',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  excluirRevisados?: boolean;

  @ApiPropertyOptional({
    description: 'Solo odontogramas con calificación mínima',
    example: 7,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10)
  calificacionMinima?: number;

  @ApiPropertyOptional({
    description: 'Agrupar resultados por campo específico',
    example: 'estudiante',
    enum: ['estudiante', 'docente', 'diente', 'tipoCondicion', 'casoClinico']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['estudiante', 'docente', 'diente', 'tipoCondicion', 'casoClinico'])
  agruparPor?: string;
}

/**
 * DTO para generar reportes de odontogramas
 * Configuración específica para la generación de reportes
 */
export class GenerarReporteOdontogramasDto {
  @ApiProperty({
    description: 'Tipo de reporte a generar',
    example: 'por_estudiante',
    enum: ['individual', 'por_estudiante', 'por_docente', 'por_caso_clinico', 'estadistico', 'comparativo']
  })
  @IsString()
  @IsEnum(['individual', 'por_estudiante', 'por_docente', 'por_caso_clinico', 'estadistico', 'comparativo'])
  tipoReporte: string;

  @ApiProperty({
    description: 'Formato del reporte',
    example: 'PDF',
    enum: ['PDF', 'EXCEL', 'JSON', 'CSV']
  })
  @IsString()
  @IsEnum(['PDF', 'EXCEL', 'JSON', 'CSV'])
  formato: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para el reporte',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para el reporte',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'IDs específicos a incluir (según tipo de reporte)',
    example: [123, 124, 125],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  idsEspecificos?: number[];

  @ApiPropertyOptional({
    description: 'Incluir gráficos estadísticos',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirGraficos?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir imágenes de odontogramas',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  incluirImagenes?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir análisis comparativo',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirAnalisisComparativo?: boolean;

  @ApiPropertyOptional({
    description: 'Configuración adicional del reporte en JSON',
    example: { "mostrarTendencias": true, "incluirDetalles": false }
  })
  @IsOptional()
  configuracionAdicional?: Record<string, any>;
}

/**
 * DTO para dashboard de odontogramas
 * Configuración para vistas de dashboard personalizadas
 */
export class DashboardOdontogramasDto {
  @ApiPropertyOptional({
    description: 'Período en días para el dashboard',
    example: 30,
    minimum: 1,
    maximum: 365,
    default: 30
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  periodoEnDias?: number = 30;

  @ApiPropertyOptional({
    description: 'Incluir alertas en el dashboard',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirAlertas?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir tendencias en el dashboard',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirTendencias?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por especialidades específicas',
    example: [1, 2],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'Incluir métricas de calidad',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirMetricasCalidad?: boolean;
}

/**
 * DTO para validar creación de odontograma
 * Validaciones previas antes de crear un odontograma
 */
export class ValidarCreacionOdontogramaDto {
  @ApiProperty({
    description: 'Número del diente a evaluar',
    example: '11'
  })
  @IsString()
  diente: string;

  @ApiProperty({
    description: 'ID del caso clínico',
    example: 123
  })
  @IsInt()
  @Min(1)
  casoClinicoId: number;

  @ApiProperty({
    description: 'ID del estudiante',
    example: 456
  })
  @IsInt()
  @Min(1)
  estudianteId: number;

  @ApiPropertyOptional({
    description: 'Verificar duplicados para el mismo diente',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  verificarDuplicados?: boolean;

  @ApiPropertyOptional({
    description: 'Validar permisos del estudiante',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  validarPermisos?: boolean;
}

/**
 * DTO para filtros de notificaciones de odontogramas
 * Configuración para consultar notificaciones relacionadas
 */
export class FiltrosNotificacionesOdontogramasDto {
  @ApiPropertyOptional({
    description: 'Solo notificaciones no leídas',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  soloNoLeidas?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de notificación específica',
    example: 'NUEVO_ODONTOGRAMA',
    enum: ['NUEVO_ODONTOGRAMA', 'OBSERVACION_AGREGADA', 'REVISION_COMPLETADA', 'RECORDATORIO']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['NUEVO_ODONTOGRAMA', 'OBSERVACION_AGREGADA', 'REVISION_COMPLETADA', 'RECORDATORIO'])
  tipoNotificacion?: string;

  @ApiPropertyOptional({
    description: 'Prioridad mínima de las notificaciones',
    example: 'MEDIA',
    enum: ['BAJA', 'MEDIA', 'ALTA']
  })
  @IsOptional()
  @IsString()
  @IsEnum(['BAJA', 'MEDIA', 'ALTA'])
  prioridadMinima?: string;

  @ApiPropertyOptional({
    description: 'Número de días hacia atrás para buscar',
    example: 7,
    minimum: 1,
    maximum: 90
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  diasAtras?: number;

  @ApiPropertyOptional({
    description: 'Límite de notificaciones a retornar',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 20;
}

/**
 * DTO para configuración de filtros rápidos
 * Filtros predefinidos comunes en la interfaz
 */
export class FiltrosRapidosOdontogramasDto {
  @ApiProperty({
    description: 'Tipo de filtro rápido',
    example: 'mis_odontogramas',
    enum: [
      'mis_odontogramas',
      'pendientes_revision',
      'con_observaciones',
      'urgentes',
      'completados_hoy',
      'sin_docente',
      'alta_severidad'
    ]
  })
  @IsString()
  @IsEnum([
    'mis_odontogramas',
    'pendientes_revision',
    'con_observaciones',
    'urgentes',
    'completados_hoy',
    'sin_docente',
    'alta_severidad'
  ])
  tipoFiltro: string;

  @ApiPropertyOptional({
    description: 'Parámetros adicionales para el filtro',
    example: { "severidadMinima": 3 }
  })
  @IsOptional()
  parametrosAdicionales?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 50,
    minimum: 1,
    maximum: 200,
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limite?: number = 50;
}
