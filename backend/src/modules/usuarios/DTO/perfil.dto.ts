import { IsString, IsInt, IsOptional } from "class-validator";

export class PerfilDto {

    @IsOptional()
    @IsString()
    nombre?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    @IsOptional()
    @IsString()
    direccion: string;

    @IsOptional()
    @IsString()
    NotasAdicionales: string;

    @IsOptional()
    @IsInt()
    parroquiaId: number;
}