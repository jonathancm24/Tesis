/**
 * DTOs para crear y actualizar odontogramas
 * 
 * Define las estructuras de validación para las operaciones CRUD del módulo
 * de odontogramas. Incluye validaciones específicas para el manejo de condiciones
 * dentales y la integridad de los datos clínicos.
 * 
 * @fileoverview DTOs de creación y actualización para odontogramas
 * @module OdontogramaCRUDDTOs
 * @requires class-validator, swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  Length,
  IsBoolean,
  IsNumber,
  ArrayMinSize,
  IsJSON
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO para definir una condición dental específica
 * Representa el estado de una cara/sección particular del diente
 */
export class CondicionDentalDto {
  @ApiProperty({
    description: 'Cara del diente afectada',
    example: 'distal',
    enum: ['distal', 'mesial', 'vestibular', 'lingual', 'oclusal', 'incisal', 'cervical']
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['distal', 'mesial', 'vestibular', 'lingual', 'oclusal', 'incisal', 'cervical'])
  cara: string;

  @ApiProperty({
    description: 'Tipo de condición encontrada',
    example: 'caries',
    enum: ['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción', 'fractura', 'desgaste', 'manchas']
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción', 'fractura', 'desgaste', 'manchas'])
  tipoCondicion: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la condición',
    example: 'Caries profunda en cara distal, requiere tratamiento endodóntico',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(5, 500)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Código de color para representación visual (formato hex)',
    example: '#FF5733',
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsOptional()
  @IsString()
  codigoColor?: string;

  @ApiPropertyOptional({
    description: 'Nivel de severidad de la condición (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  severidad?: number;

  @ApiPropertyOptional({
    description: 'Indica si la condición requiere tratamiento inmediato',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  requiereTratamiento?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones específicas de esta condición',
    example: 'Paciente refiere dolor al masticar',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  observacionesCondicion?: string;
}

/**
 * DTO para crear un nuevo odontograma
 * Contiene toda la información necesaria para registrar un odontograma dental
 */
export class CrearOdontogramaDto {
  @ApiProperty({
    description: 'Número/código del diente evaluado',
    example: '11',
    minLength: 1,
    maxLength: 3
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 3)
  diente: string;

  @ApiProperty({
    description: 'Condiciones dentales encontradas por cara del diente',
    type: [CondicionDentalDto],
    example: [
      {
        cara: 'distal',
        tipoCondicion: 'caries',
        descripcion: 'Caries superficial',
        severidad: 2,
        requiereTratamiento: true
      }
    ]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CondicionDentalDto)
  condiciones: CondicionDentalDto[];

  @ApiPropertyOptional({
    description: 'Conclusiones generales del odontograma',
    example: 'Diente con caries leve en cara distal, buen estado general',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  conclusion?: string;

  @ApiProperty({
    description: 'ID del estudiante que realiza el odontograma',
    example: 123,
    minimum: 1
  })
  @IsInt()
  @Min(1)
  estudianteId: number;

  @ApiPropertyOptional({
    description: 'ID del docente supervisor (asignado automáticamente en algunos casos)',
    example: 456,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  docenteId?: number;

  @ApiPropertyOptional({
    description: 'ID del caso clínico asociado',
    example: 789,
    minimum: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  casoClinicoId?: number;
}

/**
 * DTO para crear odontograma rápido (versión simplificada)
 * Para casos donde se requiere registro básico sin muchos detalles
 */
export class CrearOdontogramaRapidoDto {
  @ApiProperty({
    description: 'Número del diente',
    example: '21'
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 3)
  diente: string;

  @ApiProperty({
    description: 'Condición principal del diente',
    example: 'normal',
    enum: ['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción']
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['normal', 'caries', 'obturación', 'corona', 'puente', 'implante', 'extracción'])
  condicionPrincipal: string;

  @ApiPropertyOptional({
    description: 'Observaciones generales',
    example: 'Diente en buen estado general',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'ID del caso clínico',
    example: 123
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  casoClinicoId?: number;
}

/**
 * DTO para actualizar información básica del odontograma
 * Permite modificar conclusiones y observaciones sin alterar las condiciones
 */
export class ActualizarOdontogramaBasicoDto {
  @ApiPropertyOptional({
    description: 'Nuevas conclusiones del odontograma',
    example: 'Actualización: tratamiento completado exitosamente',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  conclusion?: string;
}

/**
 * DTO para actualizar condiciones dentales
 * Permite modificar las condiciones específicas del diente
 */
export class ActualizarCondicionesDto {
  @ApiProperty({
    description: 'Nuevas condiciones dentales',
    type: [CondicionDentalDto]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CondicionDentalDto)
  condiciones: CondicionDentalDto[];

  @ApiPropertyOptional({
    description: 'Motivo de la actualización',
    example: 'Corrección por observación del docente',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  motivoActualizacion?: string;
}

/**
 * DTO para agregar condición adicional a un diente existente
 * Útil para hallazgos posteriores sin rehacer todo el odontograma
 */
export class AgregarCondicionDto {
  @ApiProperty({
    description: 'Nueva condición dental a agregar',
    type: CondicionDentalDto
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CondicionDentalDto)
  nuevaCondicion: CondicionDentalDto;

  @ApiProperty({
    description: 'Justificación para agregar la condición',
    example: 'Hallazgo durante revisión posterior',
    maxLength: 300
  })
  @IsNotEmpty()
  @IsString()
  @Length(5, 300)
  justificacion: string;
}

/**
 * DTO para crear odontograma completo de paciente
 * Para registro completo de toda la boca del paciente
 */
export class CrearOdontogramaCompletoDto {
  @ApiProperty({
    description: 'Lista de odontogramas por diente',
    type: [CrearOdontogramaDto],
    minItems: 1,
    maxItems: 32
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearOdontogramaDto)
  odontogramasPorDiente: CrearOdontogramaDto[];

  @ApiProperty({
    description: 'Conclusiones generales de toda la evaluación',
    example: 'Evaluación dental completa, estado general bueno con algunas caries menores',
    maxLength: 2000
  })
  @IsNotEmpty()
  @IsString()
  @Length(20, 2000)
  conclusionesGenerales: string;

  @ApiProperty({
    description: 'ID del caso clínico asociado',
    example: 123
  })
  @IsInt()
  @Min(1)
  casoClinicoId: number;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del estudiante',
    example: 'Paciente colaborativo durante la evaluación',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  observacionesAdicionales?: string;
}

/**
 * DTO para supervisión docente del odontograma
 * Permite al docente revisar y comentar el trabajo del estudiante
 */
export class SupervisionDocenteDto {
  @ApiProperty({
    description: 'ID del odontograma a supervisar',
    example: 123
  })
  @IsInt()
  @Min(1)
  odontogramaId: number;

  @ApiProperty({
    description: 'Aprobación del odontograma',
    example: true
  })
  @IsBoolean()
  aprobado: boolean;

  @ApiProperty({
    description: 'Comentarios de supervisión',
    example: 'Excelente trabajo, diagnóstico preciso. Continuar con el tratamiento propuesto.',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 1000)
  comentariosSupervision: string;

  @ApiPropertyOptional({
    description: 'Calificación numérica (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  calificacion?: number;

  @ApiPropertyOptional({
    description: 'Recomendaciones específicas',
    example: 'Revisar técnica de identificación de caries incipientes',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  recomendaciones?: string;

  @ApiPropertyOptional({
    description: 'Requiere corrección',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  requiereCorreccion?: boolean;
}

/**
 * DTO para corrección de odontograma
 * Cuando el docente solicita modificaciones
 */
export class CorregirOdontogramaDto {
  @ApiProperty({
    description: 'Condiciones corregidas',
    type: [CondicionDentalDto]
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CondicionDentalDto)
  condicionesCorregidas: CondicionDentalDto[];

  @ApiProperty({
    description: 'Nuevas conclusiones tras la corrección',
    example: 'Conclusiones actualizadas según observaciones del docente',
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 1000)
  nuevasConclusiones: string;

  @ApiProperty({
    description: 'Explicación de los cambios realizados',
    example: 'Se corrigió la identificación de caries en cara mesial según indicaciones',
    maxLength: 500
  })
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  explicacionCambios: string;
}

/**
 * DTO para duplicar odontograma (como plantilla)
 * Útil para casos similares o seguimiento de tratamientos
 */
export class DuplicarOdontogramaDto {
  @ApiProperty({
    description: 'ID del odontograma a duplicar',
    example: 123
  })
  @IsInt()
  @Min(1)
  odontogramaOrigenId: number;

  @ApiProperty({
    description: 'Número del nuevo diente',
    example: '12'
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 3)
  nuevoDiente: string;

  @ApiPropertyOptional({
    description: 'ID del nuevo caso clínico',
    example: 456
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  nuevoCasoClinicoId?: number;

  @ApiPropertyOptional({
    description: 'Modificaciones a aplicar en la duplicación',
    example: 'Adaptado para seguimiento post-tratamiento',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  observacionesDuplicacion?: string;
}

/**
 * DTO para generar odontograma desde plantilla
 * Crea odontogramas basados en patrones predefinidos
 */
export class GenerarDesdeePlantillaDto {
  @ApiProperty({
    description: 'Tipo de plantilla a utilizar',
    example: 'evaluacion_inicial',
    enum: ['evaluacion_inicial', 'control_postoperatorio', 'revision_semestral', 'emergencia']
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(['evaluacion_inicial', 'control_postoperatorio', 'revision_semestral', 'emergencia'])
  tipoPlantilla: string;

  @ApiProperty({
    description: 'Dientes a incluir en la evaluación',
    example: ['11', '12', '21', '22'],
    minItems: 1,
    maxItems: 32
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  dientes: string[];

  @ApiProperty({
    description: 'ID del caso clínico',
    example: 123
  })
  @IsInt()
  @Min(1)
  casoClinicoId: number;

  @ApiPropertyOptional({
    description: 'Observaciones específicas para esta plantilla',
    example: 'Evaluación de rutina semestral',
    maxLength: 300
  })
  @IsOptional()
  @IsString()
  @Length(5, 300)
  observacionesPlantilla?: string;
}

/**
 * DTO para validar condiciones dentales
 * Verifica que las condiciones sean coherentes y válidas
 */
export class ValidarCondicionesDto {
  @ApiProperty({
    description: 'Condiciones a validar',
    type: [CondicionDentalDto]
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CondicionDentalDto)
  condiciones: CondicionDentalDto[];

  @ApiProperty({
    description: 'Número del diente',
    example: '11'
  })
  @IsNotEmpty()
  @IsString()
  diente: string;

  @ApiPropertyOptional({
    description: 'Edad del paciente (para validaciones específicas)',
    example: 25
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  edadPaciente?: number;
}
