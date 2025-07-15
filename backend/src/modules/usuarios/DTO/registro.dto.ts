import { IsEmail, IsString, MinLength, IsArray, ArrayNotEmpty, IsInt, IsDate, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  cedula: string;

  @IsDate()
  fechaNacimiento: Date;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  NotasAdicionales: string;

  @IsInt()
  roleId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  especialidadIds: number[];
}