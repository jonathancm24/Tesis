// Este archivo define la estructura de datos que el controlador devolverá.
// Ayuda a mantener la consistencia entre el backend y el frontend.

interface PaisResponse {
  id: number;
  nombre: string;
}

interface ProvinciaResponse {
  id: number;
  nombre: string;
  pais?: PaisResponse;
}

interface CantonResponse {
  id: number;
  nombre: string;
  provincia?: ProvinciaResponse;
}

export interface ParroquiaResponse {
  id: number;
  nombre: string;
  canton?: CantonResponse;
}

