import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsEmail,
  IsOptional,
  Matches,
  IsInt,
  Length,
  IsEnum
} from 'class-validator';

/**
 * Enum para tipos de documento
 */
export enum TipoDocumento {
  CEDULA = 'CEDULA',
  PASAPORTE = 'PASAPORTE', 
  RUC = 'RUC',
  OTRO = 'OTRO'
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres' })
  apellido: string;

  @IsEmail()
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsEnum(TipoDocumento, { message: 'Tipo de documento inválido' })
  tipoDocumento: TipoDocumento;

  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  @Length(5, 20, { message: 'El número de documento debe tener entre 5 y 20 caracteres' })
  numeroDocumento: string;

  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' })
  fechaNacimiento: string;

  @Length(6, 50, { message: 'La contraseña debe tener entre 6 y 50 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  NotasAdicionales: string;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  especialidadIds: number[];

  @IsOptional()
  @IsInt({ each: true })
  parroquiaId: number;
}