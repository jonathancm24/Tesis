/**
 * Data Transfer Objects para el módulo de Hallazgos Clínicos
 * 
 * Este archivo contiene todas las clases DTO utilizadas para validar
 * y estructurar los datos relacionados con hallazgos clínicos en el sistema.
 * 
 * @fileoverview DTOs para validación de hallazgos clínicos
 * @module HallazgoClinicoDTO
 * @requires class-validator, class-transformer, swagger
 */

import { 
  IsInt, 
  IsString, 
  IsOptional, 
  IsNotEmpty,
  IsArray,
  IsDateString,
  Min,
  Max,
  Length,
  ArrayNotEmpty,
  IsIn 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo hallazgo clínico
 * 
 * Valida todos los campos necesarios para registrar un hallazgo
 * clínico encontrado durante el examen del paciente.
 * 
 * @example
 * {
 *   "casoClinicoId": 1,
 *   "tipo": "Caries",
 *   "codigoZona": "D-16",
 *   "descripcion": "Caries profunda en cara oclusal",
 *   "archivoId": 5
 * }
 */
export class CrearHallazgoClinicoDto {
  @ApiProperty({
    description: 'ID del caso clínico al que pertenece el hallazgo',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El ID del caso clínico es obligatorio' })
  casoClinicoId: number;

  @ApiProperty({
    description: 'Tipo de hallazgo clínico encontrado',
    example: 'Caries',
    enum: [
      'Caries',
      'Gingivitis',
      'Periodontitis',
      'Absceso',
      'Fractura',
      'Desgaste',
      'Maloclusión',
      'Lesión de tejidos blandos',
      'Anomalía dental',
      'Patología pulpar',
      'Otro'
    ]
  })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de hallazgo es obligatorio' })
  @Length(2, 50, { message: 'El tipo debe tener entre 2 y 50 caracteres' })
  @IsIn([
    'Caries',
    'Gingivitis', 
    'Periodontitis',
    'Absceso',
    'Fractura',
    'Desgaste',
    'Maloclusión',
    'Lesión de tejidos blandos',
    'Anomalía dental',
    'Patología pulpar',
    'Otro'
  ], { message: 'Tipo de hallazgo no válido' })
  tipo: string;

  @ApiProperty({
    description: 'Código de la zona anatómica donde se encontró el hallazgo (ej: D-16, D-21, etc.)',
    example: 'D-16',
    pattern: '^[A-Z]-[0-9]{1,2}$'
  })
  @IsString({ message: 'El código de zona debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código de zona es obligatorio' })
  @Length(3, 10, { message: 'El código de zona debe tener entre 3 y 10 caracteres' })
  codigoZona: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del hallazgo clínico',
    example: 'Caries profunda en cara oclusal del primer molar superior derecho, requiere tratamiento endodóntico',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID del archivo asociado al hallazgo (imagen, radiografía, etc.)',
    example: 5,
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID del archivo debe ser un número entero' })
  @Min(1, { message: 'El ID del archivo debe ser mayor a 0' })
  archivoId?: number;
}

/**
 * DTO para actualizar un hallazgo clínico existente
 * 
 * Permite modificar campos específicos de un hallazgo clínico
 * sin requerir todos los campos obligatorios.
 */
export class ActualizarHallazgoClinicoDto extends PartialType(CrearHallazgoClinicoDto) {
  @ApiPropertyOptional({
    description: 'Tipo de hallazgo clínico encontrado (actualización)',
    example: 'Caries'
  })
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Código de la zona anatómica (actualización)',
    example: 'D-17'
  })
  codigoZona?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del hallazgo (actualización)',
    example: 'Descripción actualizada del hallazgo'
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID del archivo asociado (actualización)',
    example: 6
  })
  archivoId?: number;
}

/**
 * DTO para filtros de búsqueda de hallazgos clínicos
 * 
 * Permite filtrar hallazgos por diversos criterios y
 * configurar la paginación de resultados.
 */
export class FiltrosHallazgosClinicosDto {
  @ApiPropertyOptional({
    description: 'ID del caso clínico para filtrar hallazgos',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del caso clínico debe ser un número entero' })
  @Min(1, { message: 'El ID del caso clínico debe ser mayor a 0' })
  casoClinicoId?: number;

  @ApiPropertyOptional({
    description: 'Tipo de hallazgo para filtrar',
    example: 'Caries',
    enum: [
      'Caries',
      'Gingivitis',
      'Periodontitis',
      'Absceso',
      'Fractura',
      'Desgaste',
      'Maloclusión',
      'Lesión de tejidos blandos',
      'Anomalía dental',
      'Patología pulpar',
      'Otro'
    ]
  })
  @IsOptional()
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Código de zona para filtrar',
    example: 'D-16'
  })
  @IsOptional()
  @IsString({ message: 'El código de zona debe ser una cadena de texto' })
  codigoZona?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo hallazgos con archivos adjuntos',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  conArchivos?: boolean;

  @ApiPropertyOptional({
    description: 'Búsqueda en descripción del hallazgo',
    example: 'caries profunda'
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El término de búsqueda debe tener entre 2 y 100 caracteres' })
  busqueda?: string;

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
  página?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  límite?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    example: 'tipo',
    enum: ['id', 'tipo', 'codigoZona', 'casoClinicoId'],
    default: 'id'
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  @IsIn(['id', 'tipo', 'codigoZona', 'casoClinicoId'], { 
    message: 'Campo de ordenamiento no válido' 
  })
  ordenarPor?: string = 'id';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsIn(['asc', 'desc'], { message: 'Dirección de ordenamiento no válida' })
  dirección?: string = 'desc';
}

/**
 * DTO para respuesta paginada de hallazgos clínicos
 * 
 * Estructura la respuesta de consultas que incluyen paginación
 * y metadatos de la consulta.
 */
export class RespuestaPaginadaHallazgosDto {
  @ApiProperty({
    description: 'Lista de hallazgos clínicos',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        tipo: { type: 'string', example: 'Caries' },
        codigoZona: { type: 'string', example: 'D-16' },
        descripcion: { type: 'string', example: 'Descripción del hallazgo' },
        casoClinicoId: { type: 'number', example: 1 },
        archivoId: { type: 'number', example: 5 }
      }
    }
  })
  hallazgos: any[];

  @ApiProperty({
    description: 'Información de paginación',
    type: 'object',
    properties: {
      total: { type: 'number', example: 25 },
      página: { type: 'number', example: 1 },
      límite: { type: 'number', example: 10 },
      totalPáginas: { type: 'number', example: 3 }
    }
  })
  paginación: {
    total: number;
    página: number;
    límite: number;
    totalPáginas: number;
  };
}

/**
 * DTO para estadísticas de hallazgos clínicos
 * 
 * Estructura los datos estadísticos del módulo de hallazgos.
 */
export class EstadisticasHallazgosDto {
  @ApiProperty({
    description: 'Total de hallazgos registrados',
    example: 150
  })
  totalHallazgos: number;

  @ApiProperty({
    description: 'Distribución por tipo de hallazgo',
    example: {
      'Caries': 45,
      'Gingivitis': 30,
      'Periodontitis': 20,
      'Fractura': 15,
      'Otros': 40
    }
  })
  porTipo: Record<string, number>;

  @ApiProperty({
    description: 'Hallazgos con archivos adjuntos',
    example: 85
  })
  conArchivos: number;

  @ApiProperty({
    description: 'Hallazgos sin archivos adjuntos',
    example: 65
  })
  sinArchivos: number;

  @ApiProperty({
    description: 'Promedio de hallazgos por caso clínico',
    example: 2.5
  })
  promedioPorCaso: number;
}
