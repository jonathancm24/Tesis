import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  MaxLength,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { TipoDocumento, TipoDocumentoRepresentante } from '@prisma/client';

export class UpdatePacienteDto {
  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  nombre?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  apellido?: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  @IsOptional()
  fechaNacimiento?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20, { message: 'El número de teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  direccion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El género no puede exceder 50 caracteres' })
  genero?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'La nacionalidad no puede exceder 50 caracteres' })
  Nacionalidad?: string;

  @IsInt({ message: 'La parroquiaId debe ser un número entero' })
  @IsOptional()
  @Min(1, { message: 'La parroquiaId debe ser mayor a 0' })
  parroquiaId?: number;

  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  @IsOptional()
  tipoDocumento?: TipoDocumento;

  @IsString()
  @IsOptional()
  @Length(8, 20, { message: 'El número de documento debe tener entre 8 y 20 caracteres' })
  numeroDocumento?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La empresa laboral no puede exceder 100 caracteres' })
  EmpresaLaboral?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El estado civil no puede exceder 50 caracteres' })
  estadoCivil?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'La ocupación no puede exceder 50 caracteres' })
  ocupacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'La relación con el representante no puede exceder 50 caracteres' })
  relacionRep?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50, { message: 'El nombre del representante debe tener entre 2 y 50 caracteres' })
  representante?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20, { message: 'El teléfono del representante no puede exceder 20 caracteres' })
  telefonoRep?: string;

  @IsString()
  @IsOptional()
  @Length(0, 20, { message: 'El número de documento del representante no puede exceder 20 caracteres' })
  numero_documento_rep?: string;

  @IsEnum(TipoDocumentoRepresentante, { message: 'El tipo de documento del representante no es válido' })
  @IsOptional()
  tipoDocumentoRep?: TipoDocumentoRepresentante;

  @IsOptional()
  activo?: boolean;
}
