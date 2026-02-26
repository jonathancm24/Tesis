import { IsInt, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class PacienteResponseDto {
  @IsInt()
  id: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  email?: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  Nacionalidad?: string;

  @IsInt()
  parroquiaId?: number;

  @IsString()
  tipoDocumento: TipoDocumento;

  @IsString()
  numeroDocumento: string;

  @IsBoolean()
  activo: boolean;

  @IsDateString()
  fechaRegistro: string;

  @IsOptional()
  @IsString()
  EmpresaLaboral?: string;

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  relacionRep?: string;

  @IsOptional()
  @IsString()
  representante?: string;

  @IsOptional()
  @IsString()
  telefonoRep?: string;

  @IsOptional()
  @IsString()
  numero_documento_rep?: string;

  // Parroquia relacionada
  @IsOptional()
  parroquia?: {
    id: number;
    nombre: string;
  };
}

export class PacientesPaginatedResponseDto {
  data: PacienteResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(
    data: PacienteResponseDto[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = data;
    const totalPages = Math.ceil(total / limit);
    this.pagination = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
