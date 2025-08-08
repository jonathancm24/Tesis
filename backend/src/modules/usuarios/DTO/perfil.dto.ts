import { IsString, IsInt, IsOptional, IsEmail, IsDateString } from "class-validator";
import { Transform } from "class-transformer";

export class PerfilDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    apellido?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
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