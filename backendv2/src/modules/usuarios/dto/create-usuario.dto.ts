import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsInt, 
  IsBoolean, 
  IsEnum,
  MinLength,
  MaxLength,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoDocumento } from '@prisma/client';

/**
 * DTO para crear un nuevo usuario
 * Contiene todos los campos obligatorios y opcionales para la creación
 */
export class CreateUsuarioDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  apellido: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)' })
  fechaNacimiento: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'Las notas adicionales deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las notas adicionales no pueden exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  NotasAdicionales?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de parroquia debe ser un número entero' })
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  parroquiaId?: number;

  @IsInt({ message: 'El ID de rol debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  roleId: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  activo?: boolean = true;

  @IsEnum(TipoDocumento, { message: 'El tipo de documento debe ser válido' })
  tipoDocumento: TipoDocumento;

  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @MinLength(8, { message: 'El número de documento debe tener al menos 8 caracteres' })
  @MaxLength(20, { message: 'El número de documento no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroDocumento: string;

  @IsOptional()
  @IsArray({ message: 'Las especialidades deben ser un arreglo' })
  @IsInt({ each: true, message: 'Cada especialidad debe ser un número entero' })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(id => parseInt(id));
    }
    return value;
  })
  especialidadIds?: number[];
}