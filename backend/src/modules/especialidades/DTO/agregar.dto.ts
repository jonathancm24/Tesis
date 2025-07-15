import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AgregarEspecialidadDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @IsString()
    @IsOptional()
    descripcion: string;
    
    }