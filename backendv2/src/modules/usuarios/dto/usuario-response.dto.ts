import { Transform, Exclude } from 'class-transformer';
import { TipoDocumento } from '@prisma/client';

/**
 * DTO para la respuesta de usuarios
 * Excluye información sensible como contraseñas
 * Incluye información de relaciones necesarias
 */
export class UsuarioResponseDto {
  id: number;
  
  nombre: string;
  
  apellido: string;
  
  email: string;
  
  fechaNacimiento: Date;
  
  telefono?: string;
  
  direccion?: string;
  
  NotasAdicionales?: string;
  
  activo: boolean;
  
  tipoDocumento: TipoDocumento;
  
  numeroDocumento: string;
  
  fechaRegistro: Date;
  
  // Información de relaciones
  parroquiaId?: number;
  
  roleId: number;
  
  // Información expandida (opcional)
  parroquia?: {
    id: number;
    nombre: string;
    canton?: {
      id: number;
      nombre: string;
      provincia?: {
        id: number;
        nombre: string;
      };
    };
  };
  
  role?: {
    id: number;
    nombre: string;
    description?: string;
  };
  
  especialidades?: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
  }>;
  
  // Campos excluidos por seguridad
  @Exclude()
  password: string;
  
  constructor(partial: Partial<UsuarioResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para respuesta paginada de usuarios
 */
export class UsuariosPaginatedResponseDto {
  data: UsuarioResponseDto[];
  
  total: number;
  
  page: number;
  
  limit: number;
  
  totalPages: number;
  
  hasNextPage: boolean;
  
  hasPrevPage: boolean;
  
  constructor(
    data: UsuarioResponseDto[],
    total: number,
    page: number,
    limit: number
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPrevPage = page > 1;
  }
}

/**
 * DTO para filtros de búsqueda de usuarios
 */
export class UsuarioFiltersDto {
  nombre?: string;
  
  apellido?: string;
  
  email?: string;
  
  activo?: boolean;
  
  roleId?: number;
  
  parroquiaId?: number;
  
  tipoDocumento?: TipoDocumento;
  
  // Filtros de fecha
  fechaNacimientoDesde?: string;
  
  fechaNacimientoHasta?: string;
  
  fechaCreacionDesde?: string;
  
  fechaCreacionHasta?: string;
  
  // Paginación
  page?: number = 1;
  
  limit?: number = 10;
  
  // Ordenamiento
  orderBy?: 'nombre' | 'apellido' | 'email' | 'fechaRegistro' = 'fechaRegistro';
  
  orderDirection?: 'asc' | 'desc' = 'desc';
  
  constructor(filters: Partial<UsuarioFiltersDto>) {
    Object.assign(this, filters);
    
    // Valores por defecto
    this.page = this.page || 1;
    this.limit = this.limit || 10;
    this.orderBy = this.orderBy || 'fechaRegistro';
    this.orderDirection = this.orderDirection || 'desc';
  }
}