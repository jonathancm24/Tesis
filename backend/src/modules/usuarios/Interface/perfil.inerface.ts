// 📁 backend/src/modules/usuarios/Interface/perfil.interface.ts
export interface IPerfilResponse {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    cedula: string;
    fechaNacimiento: Date;
    telefono?: string;
    direccion?: string;
    NotasAdicionales?: string;
    fechaRegistro: Date;
    parroquiaId?: number;
    roleId: number;
    activo: boolean;
    
    // Información relacionada
    parroquia?: {
        id: number;
        nombre: string;
        canton: {
            id: number;
            nombre: string;
            provincia: {
                id: number;
                nombre: string;
                pais: {
                    id: number;
                    nombre: string;
                };
            };
        };
    };
    
    role?: {
        id: number;
        nombre: string;
        description?: string;
    };
    
    especialidades?: {
        id: number;
        especialidad: {
            id: number;
            nombre: string;
            descripcion?: string;
        };
    }[];
}

export interface IUsuarioBasico {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
}

export interface IPerfilUpdate {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    NotasAdicionales?: string;
    parroquiaId?: number;
}