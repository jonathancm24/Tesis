import { 
  IsOptional, 
  IsInt, 
  IsEnum, 
  IsBoolean, 
  IsDateString, 
  IsString, 
  Min,
  Max,
  Length
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { EstadoObservacion } from '@prisma/client';
import { 
  IObservacionResumen, 
  IObservacionCompleta, 
  IEstadisticasObservaciones,
  IDashboardObservaciones,
  IObservacionesPorEntidad,
  IReporteObservaciones
} from '../Interface/observacion.interface';

/**
 * DTO para filtrar observaciones
 * Soporta múltiples criterios de búsqueda y filtrado
 */
export class FiltrosObservacionesDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación (base 1)',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    enum: ['fecha', 'titulo', 'estado', 'estudiante', 'docente'],
    example: 'fecha'
  })
  @IsOptional()
  @IsEnum(['fecha', 'titulo', 'estado', 'estudiante', 'docente'])
  ordenarPor?: 'fecha' | 'titulo' | 'estado' | 'estudiante' | 'docente' = 'fecha';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direccion?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por ID del estudiante',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la observación',
    enum: EstadoObservacion,
    example: 'PENDIENTE'
  })
  @IsOptional()
  @IsEnum(EstadoObservacion)
  estado?: EstadoObservacion;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de entidad relacionada',
    enum: ['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'],
    example: 'TRATAMIENTO'
  })
  @IsOptional()
  @IsEnum(['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'])
  tipoEntidad?: 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA';

  @ApiPropertyOptional({
    description: 'Filtrar por ID específico de la entidad',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entidadId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango de búsqueda',
    example: '2025-08-01'
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango de búsqueda',
    example: '2025-08-31'
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda en título y descripción',
    example: 'endodoncia'
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Solo mostrar observaciones del usuario autenticado (para estudiantes)',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloMisObservaciones?: boolean;

  @ApiPropertyOptional({
    description: 'Solo observaciones pendientes de respuesta (para docentes)',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  pendientesDeRespuesta?: boolean;

  @ApiPropertyOptional({
    description: 'Solo observaciones con calificación',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  conCalificacion?: boolean;

  @ApiPropertyOptional({
    description: 'Solo observaciones que requieren revisión',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  requiereRevision?: boolean;
}

/**
 * DTO para respuesta paginada de observaciones
 */
export class RespuestaPaginadaObservacionesDto {
  @ApiPropertyOptional({
    description: 'Lista de observaciones',
    type: [Object]
  })
  data: IObservacionResumen[];

  @ApiPropertyOptional({
    description: 'Total de registros encontrados',
    example: 50
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1
  })
  pagina: number;

  @ApiPropertyOptional({
    description: 'Registros por página',
    example: 10
  })
  limite: number;

  @ApiPropertyOptional({
    description: 'Total de páginas disponibles',
    example: 5
  })
  totalPaginas: number;

  @ApiPropertyOptional({
    description: 'Indica si hay página siguiente',
    example: true
  })
  hayPaginaSiguiente: boolean;

  @ApiPropertyOptional({
    description: 'Indica si hay página anterior',
    example: false
  })
  hayPaginaAnterior: boolean;
}

/**
 * DTO para estadísticas de observaciones
 */
export class EstadisticasObservacionesDto {
  @ApiPropertyOptional({
    description: 'Filtrar estadísticas por estudiante específico',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar estadísticas por docente específico',
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para el análisis estadístico',
    example: '2025-08-01'
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para el análisis estadístico',
    example: '2025-08-31'
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Incluir análisis por tipo de entidad',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirPorTipoEntidad?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir estadísticas por estudiante',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirPorEstudiante?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir estadísticas por docente',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirPorDocente?: boolean;
}

/**
 * DTO para búsqueda avanzada de observaciones
 */
export class BusquedaAvanzadaObservacionesDto extends FiltrosObservacionesDto {
  @ApiPropertyOptional({
    description: 'Buscar en contenido específico (título, descripción, etc.)',
    example: 'tratamiento endodoncia'
  })
  @IsOptional()
  @IsString()
  @Length(3, 200)
  contenido?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por múltiples estados',
    enum: EstadoObservacion,
    isArray: true,
    example: ['PENDIENTE', 'EN_PROCESO']
  })
  @IsOptional()
  @IsEnum(EstadoObservacion, { each: true })
  estados?: EstadoObservacion[];

  @ApiPropertyOptional({
    description: 'Filtrar por múltiples tipos de entidad',
    enum: ['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'],
    isArray: true,
    example: ['TRATAMIENTO', 'PRESCRIPCION']
  })
  @IsOptional()
  @IsEnum(['CASO_CLINICO', 'TRATAMIENTO', 'PRESCRIPCION', 'ODONTOGRAMA'], { each: true })
  tiposEntidad?: Array<'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA'>;

  @ApiPropertyOptional({
    description: 'Filtrar por rango de calificaciones (mínimo)',
    example: 7.0,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  calificacionMinima?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por rango de calificaciones (máximo)',
    example: 10.0,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  calificacionMaxima?: number;

  @ApiPropertyOptional({
    description: 'Incluir observaciones archivadas',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirArchivadas?: boolean;
}

/**
 * DTO para generar reportes de observaciones
 */
export class GenerarReporteObservacionesDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte',
    example: '2025-08-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del reporte',
    example: '2025-08-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Tipo de reporte a generar',
    enum: ['GENERAL', 'POR_ESTUDIANTE', 'POR_DOCENTE', 'POR_ENTIDAD'],
    example: 'GENERAL'
  })
  @IsOptional()
  @IsEnum(['GENERAL', 'POR_ESTUDIANTE', 'POR_DOCENTE', 'POR_ENTIDAD'])
  tipoReporte?: 'GENERAL' | 'POR_ESTUDIANTE' | 'POR_DOCENTE' | 'POR_ENTIDAD';

  @ApiPropertyOptional({
    description: 'Formato del reporte',
    enum: ['JSON', 'PDF', 'EXCEL'],
    example: 'JSON'
  })
  @IsOptional()
  @IsEnum(['JSON', 'PDF', 'EXCEL'])
  formato?: 'JSON' | 'PDF' | 'EXCEL';

  @ApiPropertyOptional({
    description: 'Incluir gráficos en el reporte',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirGraficos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtros adicionales para el reporte',
    type: FiltrosObservacionesDto
  })
  @IsOptional()
  filtrosAdicionales?: FiltrosObservacionesDto;
}

/**
 * DTO para validar finalización de observaciones
 */
export class ValidarFinalizacionObservacionDto {
  @ApiPropertyOptional({
    description: 'ID de la observación a validar',
    example: 1
  })
  @Type(() => Number)
  @IsInt()
  observacionId: number;

  @ApiPropertyOptional({
    description: 'Verificar si requiere calificación obligatoria',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verificarCalificacion?: boolean;

  @ApiPropertyOptional({
    description: 'Verificar dependencias con otras observaciones',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verificarDependencias?: boolean;

  @ApiPropertyOptional({
    description: 'Forzar finalización aunque falten validaciones',
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  forzarValidacion?: boolean;
}

/**
 * DTO para respuesta de dashboard de observaciones
 */
export class DashboardObservacionesDto {
  @ApiPropertyOptional({
    description: 'Mostrar solo datos del usuario autenticado',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloMisDatos?: boolean;

  @ApiPropertyOptional({
    description: 'Número de observaciones recientes a mostrar',
    example: 5,
    minimum: 1,
    maximum: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limiteRecientes?: number = 5;

  @ApiPropertyOptional({
    description: 'Incluir alertas y notificaciones',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  incluirAlertas?: boolean = true;
}
