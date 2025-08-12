import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsString } from 'class-validator';
import { EstadoTratamiento, TipoDiagnostico } from '@prisma/client';

/**
 * DTO para filtrar tratamientos con paginación
 * Permite búsquedas complejas y filtrado por múltiples criterios
 */
export class FiltrosTratamientosDto {
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;

  @IsOptional()
  @IsEnum(EstadoTratamiento, { 
    message: `Estado debe ser uno de: ${Object.values(EstadoTratamiento).join(', ')}` 
  })
  estado?: EstadoTratamiento;

  @IsOptional()
  @IsEnum(TipoDiagnostico, { 
    message: `Tipo de diagnóstico debe ser uno de: ${Object.values(TipoDiagnostico).join(', ')}` 
  })
  tipoDiagnostico?: TipoDiagnostico;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha desde debe ser una fecha válida (YYYY-MM-DD)' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha hasta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaHasta?: string;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena' })
  busqueda?: string;

  // Parámetros de paginación
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

  // Parámetros de ordenamiento
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena' })
  ordenarPor?: string = 'fechaCreacion';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'La dirección debe ser "asc" o "desc"' })
  direccion?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para respuesta paginada de tratamientos
 * Estructura estándar para todas las consultas con paginación
 */
export class RespuestaPaginadaTratamientosDto {
  data: any[]; // Tratamientos o resúmenes de tratamientos
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  hayPaginaSiguiente: boolean;
  hayPaginaAnterior: boolean;
}

/**
 * DTO para estadísticas de tratamientos por período
 * Útil para generar reportes y métricas
 */
export class EstadisticasTratamientosDto {
  @IsOptional()
  @IsDateString({}, { message: 'Fecha desde debe ser una fecha válida (YYYY-MM-DD)' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha hasta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaHasta?: string;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  @Min(1, { message: 'El ID del estudiante debe ser mayor a 0' })
  estudianteId?: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  @IsInt({ message: 'El ID del docente debe ser un número entero' })
  @Min(1, { message: 'El ID del docente debe ser mayor a 0' })
  docenteId?: number;
}
