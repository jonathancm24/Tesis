import { IsString, IsInt, IsOptional, IsEmail, IsDateString, Length, Matches } from "class-validator";
import { Transform } from "class-transformer";

export class PerfilDto {
    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
    nombre?: string;

    @IsOptional()
    @IsString()
    @Length(2, 100, { message: 'El apellido debe tener entre 2 y 100 caracteres' })
    apellido?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'Formato de teléfono inválido' })
    telefono?: string;

    @IsOptional()
    @IsString()
    cedula?: string;
     
    @IsOptional()
    @IsDateString()
    fechaNacimiento?: string;

    @IsOptional()
    @IsString()
    direccion?: string;

    @IsOptional()
    @IsString()
    NotasAdicionales?: string;

    @IsOptional()
    @IsInt()
    @Transform(({ value }) => value ? parseInt(value) : undefined)
    parroquiaId?: number;
}