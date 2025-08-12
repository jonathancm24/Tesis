import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsString, IsBoolean } from 'class-validator';
import { EstadoCasoClinico } from '@prisma/client';

/**
 * DTO para filtrar casos clínicos con paginación
 * Permite búsquedas complejas y filtrado por múltiples criterios
 * Integra con el GlobalValidationPipe existente
 */
export class FiltrosCasosClinicoDto {
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del paciente debe ser un número entero' })
  @Min(1, { message: 'El ID del paciente debe ser mayor a 0' })
  pacienteId?: number;

  @IsOptional()
  @IsEnum(EstadoCasoClinico, { 
    message: `Estado debe ser uno de: ${Object.values(EstadoCasoClinico).join(', ')}` 
  })
  estado?: EstadoCasoClinico;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha desde debe ser una fecha válida (YYYY-MM-DD)' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha hasta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaHasta?: string;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena' })
  busqueda?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'conTratamientos debe ser un valor booleano' })
  conTratamientos?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value) || 1)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  pagina?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value) || 10)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limite?: number = 10;

  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena' })
  ordenarPor?: string = 'fechaCreacion';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'La dirección debe ser "asc" o "desc"' })
  direccion?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para respuesta paginada de casos clínicos
 * Estructura estándar aprovechando el patrón de respuestas existente
 */
export class RespuestaPaginadaCasosClinicoDto {
  data: any[]; // Array de casos clínicos o resúmenes
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  hayPaginaSiguiente: boolean;
  hayPaginaAnterior: boolean;
}

/**
 * DTO para estadísticas de casos clínicos por período
 * Útil para generar reportes y métricas académicas
 */
export class EstadisticasCasosClinicoDto {
  @IsOptional()
  @IsDateString({}, { message: 'Fecha desde debe ser una fecha válida (YYYY-MM-DD)' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha hasta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaHasta?: string;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID de la especialidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la especialidad debe ser mayor a 0' })
  especialidadId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  @Min(1, { message: 'El ID del profesor debe ser mayor a 0' })
  profesorId?: number;
}

/**
 * DTO para validar finalizacion de caso clínico
 * Verifica que todos los tratamientos estén completos
 */
export class ValidarFinalizacionDto {
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId: number;

  @IsOptional()
  @IsBoolean({ message: 'forzarValidacion debe ser un valor booleano' })
  forzarValidacion?: boolean; // Para casos especiales (solo admin/profesor)
}
