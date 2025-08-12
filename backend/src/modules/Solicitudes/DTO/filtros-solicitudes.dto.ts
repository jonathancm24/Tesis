import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsInt, 
  IsEnum, 
  IsDateString, 
  IsArray,
  Min,
  Max,
  IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoSolicitud } from '@prisma/client';

/**
 * DTO para filtros básicos de solicitudes
 * Permite filtrar solicitudes por criterios comunes
 */
export class FiltrosSolicitudesDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Estado de la solicitud',
    enum: EstadoSolicitud,
    example: 'PENDIENTE'
  })
  @IsOptional()
  @IsEnum(EstadoSolicitud)
  estado?: EstadoSolicitud;

  @ApiPropertyOptional({
    description: 'ID de la especialidad',
    example: 5,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  especialidadId?: number;

  @ApiPropertyOptional({
    description: 'ID del estudiante',
    example: 123,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'ID del docente',
    example: 456,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango de búsqueda',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango de búsqueda',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Término de búsqueda en observaciones',
    example: 'ortodoncia'
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['fecha', 'estado', 'especialidad', 'estudiante', 'docente'],
    example: 'fecha'
  })
  @IsOptional()
  @IsEnum(['fecha', 'estado', 'especialidad', 'estudiante', 'docente'])
  ordenarPor?: 'fecha' | 'estado' | 'especialidad' | 'estudiante' | 'docente';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direccion?: 'asc' | 'desc';
}

/**
 * DTO para respuesta paginada de solicitudes
 */
export class RespuestaPaginadaSolicitudesDto {
  solicitudes: any[];
  total: number;
  totalPaginas: number;
  paginaActual: number;
  elementosPorPagina: number;
  tieneAnterior: boolean;
  tieneSiguiente: boolean;
}

/**
 * DTO para estadísticas de solicitudes
 * Permite filtrar el período para generar estadísticas
 */
export class EstadisticasSolicitudesDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del período',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del período',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'IDs de especialidades específicas',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'IDs de docentes específicos',
    example: [456, 789],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  docenteIds?: number[];

  @ApiPropertyOptional({
    description: 'Incluir tendencias mensuales',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirTendencias?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir análisis de tiempos de respuesta',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirTiemposRespuesta?: boolean;
}

/**
 * DTO para búsqueda avanzada de solicitudes
 */
export class BusquedaAvanzadaSolicitudesDto extends FiltrosSolicitudesDto {
  @ApiPropertyOptional({
    description: 'Estados múltiples para filtrar',
    enum: EstadoSolicitud,
    isArray: true,
    example: ['PENDIENTE', 'APROBADA']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EstadoSolicitud, { each: true })
  estados?: EstadoSolicitud[];

  @ApiPropertyOptional({
    description: 'Múltiples especialidades',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'Búsqueda en nombre del estudiante',
    example: 'Juan Pérez'
  })
  @IsOptional()
  @IsString()
  nombreEstudiante?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda en nombre del docente',
    example: 'Dr. García'
  })
  @IsOptional()
  @IsString()
  nombreDocente?: string;

  @ApiPropertyOptional({
    description: 'Solicitudes con más de X días pendientes',
    example: 7,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  diasPendientesMayorA?: number;

  @ApiPropertyOptional({
    description: 'Solo solicitudes prioritarias',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  soloPrioritarias?: boolean;

  @ApiPropertyOptional({
    description: 'Solo solicitudes sin docente asignado',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  sinDocenteAsignado?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir solicitudes canceladas',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  incluirCanceladas?: boolean;
}

/**
 * DTO para generar reportes de solicitudes
 */
export class GenerarReporteSolicitudesDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del reporte',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Tipo de reporte a generar',
    enum: ['EJECUTIVO', 'DETALLADO', 'ESTADISTICO', 'COMPARATIVO'],
    example: 'EJECUTIVO'
  })
  @IsOptional()
  @IsEnum(['EJECUTIVO', 'DETALLADO', 'ESTADISTICO', 'COMPARATIVO'])
  tipoReporte?: 'EJECUTIVO' | 'DETALLADO' | 'ESTADISTICO' | 'COMPARATIVO';

  @ApiPropertyOptional({
    description: 'Especialidades a incluir en el reporte',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'Docentes a incluir en el reporte',
    example: [456, 789],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  docenteIds?: number[];

  @ApiPropertyOptional({
    description: 'Incluir gráficos en el reporte',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirGraficos?: boolean;

  @ApiPropertyOptional({
    description: 'Formato de salida del reporte',
    enum: ['JSON', 'PDF', 'EXCEL', 'CSV'],
    example: 'JSON'
  })
  @IsOptional()
  @IsEnum(['JSON', 'PDF', 'EXCEL', 'CSV'])
  formato?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';

  @ApiPropertyOptional({
    description: 'Incluir detalles individuales de solicitudes',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  incluirDetallesIndividuales?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir recomendaciones automáticas',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirRecomendaciones?: boolean;
}

/**
 * DTO para dashboard de solicitudes
 */
export class DashboardSolicitudesDto {
  @ApiPropertyOptional({
    description: 'Período para el dashboard en días',
    example: 30,
    minimum: 7,
    maximum: 365
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(7)
  @Max(365)
  periodoEnDias?: number = 30;

  @ApiPropertyOptional({
    description: 'Incluir alertas en el dashboard',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirAlertas?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir tendencias en el dashboard',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirTendencias?: boolean = true;

  @ApiPropertyOptional({
    description: 'Filtrar por especialidades específicas',
    example: [1, 2],
    type: [Number]
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.map((v: string) => parseInt(v)))
  @IsInt({ each: true })
  especialidadIds?: number[];

  @ApiPropertyOptional({
    description: 'Solo mostrar datos del docente específico (para vista de docente)',
    example: 456,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  docenteId?: number;
}

/**
 * DTO para validar creación de solicitud
 */
export class ValidarCreacionSolicitudDto {
  @ApiPropertyOptional({
    description: 'ID del estudiante',
    example: 123,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'ID de la especialidad',
    example: 5,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  especialidadId?: number;

  @ApiPropertyOptional({
    description: 'Validar solo reglas básicas',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  validacionBasica?: boolean = false;

  @ApiPropertyOptional({
    description: 'Incluir recomendaciones en la validación',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  incluirRecomendaciones?: boolean = true;
}

/**
 * DTO para notificaciones de solicitudes
 */
export class FiltrosNotificacionesSolicitudesDto {
  @ApiPropertyOptional({
    description: 'ID del usuario para filtrar notificaciones',
    example: 123,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Solo notificaciones no leídas',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  soloNoLeidas?: boolean;

  @ApiPropertyOptional({
    description: 'Tipo de notificación',
    enum: ['NUEVA_SOLICITUD', 'SOLICITUD_APROBADA', 'SOLICITUD_RECHAZADA', 'SOLICITUD_CANCELADA', 'RECORDATORIO_PENDIENTE'],
    example: 'NUEVA_SOLICITUD'
  })
  @IsOptional()
  @IsEnum(['NUEVA_SOLICITUD', 'SOLICITUD_APROBADA', 'SOLICITUD_RECHAZADA', 'SOLICITUD_CANCELADA', 'RECORDATORIO_PENDIENTE'])
  tipo?: 'NUEVA_SOLICITUD' | 'SOLICITUD_APROBADA' | 'SOLICITUD_RECHAZADA' | 'SOLICITUD_CANCELADA' | 'RECORDATORIO_PENDIENTE';

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Límite de notificaciones a retornar',
    example: 50,
    minimum: 1,
    maximum: 200
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(200)
  limite?: number = 50;
}
