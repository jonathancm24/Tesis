import { IsString, IsOptional, IsEmail, IsDateString, IsInt, IsBoolean, Length, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Enum para tipos de documento
 */
export enum TipoDocumento {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE', 
  RUC = 'RUC',
  OTRO = 'OTRO'
}

/**
 * Enum para tipos de documento del representante
 */
export enum TipoDocumentoRepresentante {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE',
  RUC = 'RUC',
  OTRO = 'OTRO'
}

/**
 * DTO para el registro de nuevos pacientes
 * Basado en el modelo Paciente del esquema Prisma
 */
export class RegistroPacienteDto {
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  nombre: string;

  @IsString()
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  apellido: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento: string;

  @IsEnum(TipoDocumento, { message: 'Tipo de documento inválido' })
  tipoDocumento: TipoDocumento;

  @IsString()
  @Length(5, 20, { message: 'El número de documento debe tener entre 5 y 20 caracteres' })
  numeroDocumento: string;

  @IsInt({ message: 'Debe seleccionar una parroquia válida' })
  parroquiaId: number;

  // Campos opcionales
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/, { message: 'El teléfono debe tener 9 o 10 dígitos' })
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200, { message: 'La dirección debe tener entre 5 y 200 caracteres' })
  direccion?: string;

  @IsOptional()
  @IsString()
  genero?: string; // 'Masculino', 'Femenino', 'Otro'

  @IsOptional()
  @IsString()
  Nacionalidad?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string; // 'Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión libre'

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  EmpresaLaboral?: string;

  // Datos del representante (opcional, para menores de edad)
  @IsOptional()
  @IsString()
  representante?: string;

  @IsOptional()
  @IsEnum(TipoDocumentoRepresentante, { message: 'Tipo de documento del representante inválido' })
  tipoDocumentoRep?: TipoDocumentoRepresentante;

  @IsOptional()
  @IsString()
  @Length(5, 20, { message: 'El número de documento del representante debe tener entre 5 y 20 caracteres' })
  numeroDocumentoRep?: string;

  @IsOptional()
  @IsString()
  relacionRep?: string; // 'Padre', 'Madre', 'Tutor', 'Otro'

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/, { message: 'El teléfono del representante debe tener 9 o 10 dígitos' })
  telefonoRep?: string;
}

/**
 * DTO para actualizar datos de un paciente existente
 */
export class ActualizarPacienteDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  apellido?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/)
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  direccion?: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  Nacionalidad?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  EmpresaLaboral?: string;

  @IsOptional()
  @IsString()
  representante?: string;

  @IsOptional()
  @IsEnum(TipoDocumentoRepresentante, { message: 'Tipo de documento del representante inválido' })
  tipoDocumentoRep?: TipoDocumentoRepresentante;

  @IsOptional()
  @IsString()
  @Length(5, 20, { message: 'El número de documento del representante debe tener entre 5 y 20 caracteres' })
  numeroDocumentoRep?: string;

  @IsOptional()
  @IsString()
  relacionRep?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/)
  telefonoRep?: string;

  @IsOptional()
  @IsInt()
  parroquiaId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
