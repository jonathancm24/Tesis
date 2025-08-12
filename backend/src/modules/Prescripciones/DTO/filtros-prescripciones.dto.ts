import { 
  IsOptional, 
  IsInt, 
  IsString, 
  IsEnum, 
  IsDateString, 
  Min, 
  Max, 
  Length,
  IsBoolean,
  IsIn 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoPrescripcion } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IPrescripcionResumen, 
  IEstadisticasPrescripciones, 
  IValidacionInteracciones,
  IValidacionDosificacion,
  IValidacionFinalizacionPrescripcion,
  IReportePrescripciones 
} from '../Interface/prescripcion.interface';

/**
 * DTO para filtros de búsqueda de prescripciones
 * Integra con el sistema de paginación y búsqueda existente
 * Aprovecha el GlobalValidationPipe para validaciones automáticas
 */
export class FiltrosPrescripcionesDto {
  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  limite?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    example: 'fechaCreacion',
    enum: ['fechaCreacion', 'fechaActualizacion', 'medicamento', 'estado']
  })
  @IsOptional()
  @IsString()
  @IsIn(['fechaCreacion', 'fechaActualizacion', 'medicamento', 'estado'], {
    message: 'Campo de ordenamiento inválido'
  })
  ordenarPor?: 'fechaCreacion' | 'fechaActualizacion' | 'medicamento' | 'estado' = 'fechaCreacion';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Dirección de ordenamiento inválida' })
  direccion?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por ID del caso clínico',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del estudiante',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de la prescripción',
    example: EstadoPrescripcion.APROBADO,
    enum: EstadoPrescripcion
  })
  @IsOptional()
  @IsEnum(EstadoPrescripcion, { message: 'Estado de prescripción inválido' })
  estado?: EstadoPrescripcion;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre del medicamento (búsqueda parcial)',
    example: 'Amoxicilina',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'El medicamento debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El medicamento debe tener entre 2 y 100 caracteres' })
  medicamento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango de búsqueda (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de inicio inválida (formato: YYYY-MM-DD)' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango de búsqueda (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida (formato: YYYY-MM-DD)' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda general por medicamento, dosis o concentración',
    example: 'amoxicilina 500mg',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  @Length(2, 100, { message: 'La búsqueda debe tener entre 2 y 100 caracteres' })
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo prescripciones con observaciones',
    example: true,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  conObservaciones?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por vía de administración',
    example: 'Oral',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'La vía de administración debe ser una cadena de texto' })
  @Length(2, 50, { message: 'La vía de administración debe tener entre 2 y 50 caracteres' })
  viaAdministracion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por presentación del medicamento',
    example: 'Cápsulas',
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'La presentación debe ser una cadena de texto' })
  @Length(2, 50, { message: 'La presentación debe tener entre 2 y 50 caracteres' })
  presentacion?: string;
}

/**
 * DTO para respuesta paginada de prescripciones
 * Sigue el patrón estándar de paginación del sistema
 */
export class RespuestaPaginadaPrescripcionesDto {
  @ApiPropertyOptional({
    description: 'Lista de prescripciones en la página actual',
    type: [Object], // IPrescripcionResumen
    isArray: true
  })
  data: IPrescripcionResumen[];

  @ApiPropertyOptional({
    description: 'Total de prescripciones que cumplen los filtros',
    example: 45
  })
  total: number;

  @ApiPropertyOptional({
    description: 'Página actual',
    example: 1
  })
  pagina: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
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
 * DTO para filtros de estadísticas de prescripciones
 * Permite generar reportes filtrados por diferentes criterios
 */
export class EstadisticasPrescripcionesDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del estudiante',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del período (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de inicio inválida (formato: YYYY-MM-DD)' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del período (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin inválida (formato: YYYY-MM-DD)' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Incluir solo prescripciones aprobadas en las estadísticas',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  soloAprobadas?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir estadísticas detalladas por medicamento',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirDetalleMedicamentos?: boolean;
}

/**
 * DTO para validación de finalización de prescripción
 * Verifica si una prescripción puede ser marcada como completada
 */
export class ValidarFinalizacionPrescripcionDto {
  @ApiPropertyOptional({
    description: 'ID de la prescripción a validar',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID de la prescripción debe ser un número entero' })
  @Min(1, { message: 'El ID de la prescripción debe ser mayor a 0' })
  prescripcionId: number;

  @ApiPropertyOptional({
    description: 'Forzar validación aunque falten datos opcionales',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  forzarValidacion?: boolean;

  @ApiPropertyOptional({
    description: 'Verificar interacciones con otras prescripciones activas',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  verificarInteracciones?: boolean;
}

/**
 * DTO para generar reportes de prescripciones
 * Permite crear reportes personalizados para análisis
 */
export class GenerarReportePrescripcionesDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del reporte (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsDateString({}, { message: 'Fecha de inicio inválida (formato: YYYY-MM-DD)' })
  fechaInicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del reporte (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsDateString({}, { message: 'Fecha de fin inválida (formato: YYYY-MM-DD)' })
  fechaFin: string;

  @ApiPropertyOptional({
    description: 'Incluir detalles de estudiantes en el reporte',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirEstudiantes?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir detalles de docentes en el reporte',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirDocentes?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir análisis de medicamentos más prescritos',
    example: true,
    default: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirAnalisisMedicamentos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por especialidad específica',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de formato del reporte',
    example: 'JSON',
    enum: ['JSON', 'CSV', 'PDF']
  })
  @IsOptional()
  @IsString()
  @IsIn(['JSON', 'CSV', 'PDF'], { message: 'Formato de reporte inválido' })
  formato?: 'JSON' | 'CSV' | 'PDF' = 'JSON';
}

/**
 * DTO para búsqueda avanzada de prescripciones
 * Combina múltiples criterios de búsqueda para consultas complejas
 */
export class BusquedaAvanzadaPrescripcionesDto extends FiltrosPrescripcionesDto {
  @ApiPropertyOptional({
    description: 'Rango de dosis (ej: "500-1000mg")',
    example: '500-1000mg',
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'El rango de dosis debe ser una cadena de texto' })
  @Length(1, 50, { message: 'El rango de dosis debe tener entre 1 y 50 caracteres' })
  rangoDosis?: string;

  @ApiPropertyOptional({
    description: 'Múltiples estados de prescripción',
    example: ['PENDIENTE', 'APROBADO'],
    isArray: true,
    enum: EstadoPrescripcion
  })
  @IsOptional()
  @IsEnum(EstadoPrescripcion, { each: true, message: 'Estado de prescripción inválido' })
  estados?: EstadoPrescripcion[];

  @ApiPropertyOptional({
    description: 'Múltiples medicamentos a buscar',
    example: ['Amoxicilina', 'Ibuprofeno'],
    isArray: true,
    maxLength: 10
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada medicamento debe ser una cadena de texto' })
  @Length(2, 100, { each: true, message: 'Cada medicamento debe tener entre 2 y 100 caracteres' })
  medicamentos?: string[];

  @ApiPropertyOptional({
    description: 'Múltiples vías de administración',
    example: ['Oral', 'Intramuscular'],
    isArray: true,
    maxLength: 5
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada vía debe ser una cadena de texto' })
  @Length(2, 50, { each: true, message: 'Cada vía debe tener entre 2 y 50 caracteres' })
  viasAdministracion?: string[];

  @ApiPropertyOptional({
    description: 'Incluir prescripciones con posibles interacciones',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluyeInteracciones?: boolean;

  @ApiPropertyOptional({
    description: 'Duración mínima del tratamiento en días',
    example: 7,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La duración mínima debe ser un número entero' })
  @Min(1, { message: 'La duración mínima debe ser mayor a 0' })
  @Max(365, { message: 'La duración mínima no puede exceder 365 días' })
  duracionMinimaDias?: number;

  @ApiPropertyOptional({
    description: 'Duración máxima del tratamiento en días',
    example: 30,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La duración máxima debe ser un número entero' })
  @Min(1, { message: 'La duración máxima debe ser mayor a 0' })
  @Max(365, { message: 'La duración máxima no puede exceder 365 días' })
  duracionMaximaDias?: number;
}
