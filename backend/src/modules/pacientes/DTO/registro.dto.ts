import { IsString, IsOptional, IsEmail, IsDateString, IsInt, IsBoolean, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'La cédula debe tener 10 dígitos' })
  cedula: string;

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
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'La cédula del representante debe tener 10 dígitos' })
  cedulaRep?: string;

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
  @IsString()
  @Matches(/^[0-9]{10}$/)
  cedulaRep?: string;

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
