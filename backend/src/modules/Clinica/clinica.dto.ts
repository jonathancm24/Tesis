/**
 * DTOs para el módulo de Clínicas
 * 
 * Define los objetos de transferencia de datos para gestionar
 * las clínicas móviles y consultorios de la universidad.
 * Incluye validaciones para crear, actualizar y consultar clínicas.
 * 
 * @fileoverview DTOs del módulo de clínicas
 * @module ClinicaDTO
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  Length,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Enum para los tipos de clínica
 */
export enum TipoClinica {
  FIJA = 'FIJA',           // Consultorio fijo en la universidad
  MOVIL = 'MOVIL',         // Clínica móvil que se desplaza
  TEMPORAL = 'TEMPORAL'    // Clínica temporal para eventos
}

/**
 * Enum para los estados de clínica
 */
export enum EstadoClinica {
  ACTIVA = 'ACTIVA',                     // Clínica operativa
  INACTIVA = 'INACTIVA',                 // Clínica temporalmente cerrada
  MANTENIMIENTO = 'MANTENIMIENTO',       // En mantenimiento preventivo/correctivo
  EN_RUTA = 'EN_RUTA',                   // Clínica móvil en desplazamiento
  FUERA_SERVICIO = 'FUERA_SERVICIO'      // Clínica fuera de servicio
}

/**
 * DTO para crear una nueva clínica
 * 
 * Valida todos los datos necesarios para registrar
 * una clínica en el sistema universitario.
 */
export class CrearClinicaDto {
  @ApiProperty({
    description: 'Nombre identificativo de la clínica',
    example: 'Clínica Móvil Norte',
    minLength: 3,
    maxLength: 100
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Código único de identificación de la clínica',
    example: 'CM-001',
    minLength: 3,
    maxLength: 20
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Length(3, 20, { message: 'El código debe tener entre 3 y 20 caracteres' })
  @Matches(/^[A-Z0-9-_]+$/, { 
    message: 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos' 
  })
  codigo: string;

  @ApiProperty({
    description: 'Tipo de clínica según su naturaleza operativa',
    enum: TipoClinica,
    example: TipoClinica.MOVIL
  })
  @IsEnum(TipoClinica, { message: 'Debe seleccionar un tipo de clínica válido' })
  tipo: TipoClinica;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la clínica y sus servicios',
    example: 'Clínica móvil equipada para atención odontológica en comunidades rurales',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de contacto de la clínica',
    example: '+593987654321'
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'El teléfono debe tener un formato válido' 
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto de la clínica',
    example: 'clinica.movil@universidad.edu.ec'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Capacidad máxima de pacientes que puede atender simultáneamente',
    example: 8,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es 1 paciente' })
  @Max(100, { message: 'La capacidad máxima es 100 pacientes' })
  @Transform(({ value }) => parseInt(value))
  capacidadPacientes?: number;

  @ApiPropertyOptional({
    description: 'Dirección base donde se ubica la clínica (para clínicas fijas)',
    example: 'Campus Universitario, Edificio de Odontología, Piso 2'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @Length(0, 200, { message: 'La dirección no puede exceder 200 caracteres' })
  direccionBase?: string;

  @ApiPropertyOptional({
    description: 'ID de la parroquia donde se ubica la clínica base',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de parroquia debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  parroquiaBaseId?: number;

  // Campos específicos para clínicas móviles
  @ApiPropertyOptional({
    description: 'Placa del vehículo (solo para clínicas móviles)',
    example: 'UNI-001'
  })
  @IsOptional()
  @IsString({ message: 'La placa debe ser una cadena de texto' })
  @Length(0, 15, { message: 'La placa no puede exceder 15 caracteres' })
  placaVehiculo?: string;

  @ApiPropertyOptional({
    description: 'Modelo del vehículo (solo para clínicas móviles)',
    example: 'Mercedes Sprinter'
  })
  @IsOptional()
  @IsString({ message: 'El modelo debe ser una cadena de texto' })
  @Length(0, 50, { message: 'El modelo no puede exceder 50 caracteres' })
  modeloVehiculo?: string;

  @ApiPropertyOptional({
    description: 'Año del vehículo (solo para clínicas móviles)',
    example: 2022,
    minimum: 1990,
    maximum: 2030
  })
  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1990, { message: 'El año mínimo es 1990' })
  @Max(2030, { message: 'El año máximo es 2030' })
  @Transform(({ value }) => parseInt(value))
  anoVehiculo?: number;
}

/**
 * DTO para actualizar una clínica existente
 * 
 * Permite modificación parcial de los datos de la clínica.
 * Todos los campos son opcionales para flexibilidad en las actualizaciones.
 */
export class ActualizarClinicaDto extends PartialType(CrearClinicaDto) {
  @ApiPropertyOptional({
    description: 'Estado operativo actual de la clínica',
    enum: EstadoClinica,
    example: EstadoClinica.ACTIVA
  })
  @IsOptional()
  @IsEnum(EstadoClinica, { message: 'Debe seleccionar un estado de clínica válido' })
  estado?: EstadoClinica;
}

/**
 * DTO para filtros de búsqueda de clínicas
 * 
 * Permite consultar clínicas aplicando diversos filtros
 * para facilitar la gestión y búsqueda.
 */
export class FiltrosClinicaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de clínica',
    enum: TipoClinica
  })
  @IsOptional()
  @IsEnum(TipoClinica)
  tipo?: TipoClinica;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de clínica',
    enum: EstadoClinica
  })
  @IsOptional()
  @IsEnum(EstadoClinica)
  estado?: EstadoClinica;

  @ApiPropertyOptional({
    description: 'Filtrar por parroquia base',
    example: 1
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  parroquiaBaseId?: number;

  @ApiPropertyOptional({
    description: 'Búsqueda por nombre o código',
    example: 'móvil'
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Incluir información de horarios en la respuesta',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirHorarios?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir información de personal asignado en la respuesta',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluirPersonal?: boolean;
}

/**
 * DTO para respuesta de clínica con información completa
 * 
 * Estructura de datos que se retorna al consultar clínicas,
 * incluyendo relaciones opcionales según los filtros aplicados.
 */
export class ClinicaRespuestaDto {
  @ApiProperty({ description: 'ID único de la clínica', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre de la clínica', example: 'Clínica Móvil Norte' })
  nombre: string;

  @ApiProperty({ description: 'Código único', example: 'CM-001' })
  codigo: string;

  @ApiProperty({ description: 'Tipo de clínica', enum: TipoClinica })
  tipo: TipoClinica;

  @ApiProperty({ description: 'Estado actual', enum: EstadoClinica })
  estado: EstadoClinica;

  @ApiPropertyOptional({ description: 'Descripción de la clínica' })
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  telefono?: string;

  @ApiPropertyOptional({ description: 'Email de contacto' })
  email?: string;

  @ApiPropertyOptional({ description: 'Capacidad de pacientes' })
  capacidadPacientes?: number;

  @ApiProperty({ description: 'Fecha de creación' })
  fechaCreacion: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  fechaActualizacion: Date;

  @ApiPropertyOptional({ description: 'Dirección base' })
  direccionBase?: string;

  @ApiPropertyOptional({ description: 'Información de parroquia base' })
  parroquiaBase?: {
    id: number;
    nombre: string;
    canton: {
      id: number;
      nombre: string;
      provincia: {
        id: number;
        nombre: string;
      };
    };
  };

  // Información del vehículo (solo para clínicas móviles)
  @ApiPropertyOptional({ description: 'Placa del vehículo' })
  placaVehiculo?: string;

  @ApiPropertyOptional({ description: 'Modelo del vehículo' })
  modeloVehiculo?: string;

  @ApiPropertyOptional({ description: 'Año del vehículo' })
  anoVehiculo?: number;

  // Relaciones opcionales
  @ApiPropertyOptional({ description: 'Horarios de atención' })
  horarios?: any[];

  @ApiPropertyOptional({ description: 'Personal asignado' })
  personalAsignado?: any[];

  @ApiPropertyOptional({ description: 'Estadísticas básicas' })
  estadisticas?: {
    totalPersonal: number;
    personalActivo: number;
    totalHorarios: number;
    horariosActivos: number;
  };
}
