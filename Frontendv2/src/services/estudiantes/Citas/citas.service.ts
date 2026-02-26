import { apiClient } from '@/Config/api';

export interface CreateCitaDto {
  fecha: string; // YYYY-MM-DD
  horainicio: string; // HH:mm
  horafin: string; // HH:mm
  pacienteId: number;
  especialidadId: number;
  estudianteId: number;
  docenteId?: number;
  observaciones?: string;
}

export interface UpdateCitaDto {
  fecha?: string;
  horainicio?: string;
  horafin?: string;
  estado?: 'DISPONIBLE' | 'RESERVADA' | 'CANCELADA' | 'FINALIZADA' | 'NO_ASISTIO';
  observaciones?: string;
}

export interface Cita {
  id: number;
  fecha: string;
  horainicio: string;
  horafin: string;
  estado: 'DISPONIBLE' | 'RESERVADA' | 'CANCELADA' | 'FINALIZADA' | 'NO_ASISTIO';
  observaciones: string | null;
  pacienteId: number;
  especialidadId: number;
  estudianteId: number;
  docenteId: number | null;
  paciente: {
    id: number;
    nombre: string;
    apellido: string;
    numeroDocumento: string | null;
    telefono?: string;
    email?: string;
  };
  especialidad: {
    id: number;
    nombre: string;
  };
  estudiante: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  };
  docente: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  } | null;
}

class CitasService {
  async crearCita(data: CreateCitaDto): Promise<Cita> {
    const response = await apiClient.post('/citas', data);
    return response.data;
  }

  async obtenerCitasPorEstudiante(estudianteId: number): Promise<Cita[]> {
    return this.obtenerCitas(undefined, estudianteId);
  }

  async obtenerCitas(pacienteId?: number, estudianteId?: number): Promise<Cita[]> {
    const params: any = {};
    if (pacienteId) params.pacienteId = pacienteId;
    if (estudianteId) params.estudianteId = estudianteId;

    const response = await apiClient.get('/citas', { params });
    return response.data;
  }

  async obtenerCitaPorId(id: number): Promise<Cita> {
    const response = await apiClient.get(`/citas/${id}`);
    return response.data;
  }

  async actualizarCita(id: number, data: UpdateCitaDto): Promise<Cita> {
    const response = await apiClient.patch(`/citas/${id}`, data);
    return response.data;
  }

  async reagendarCita(
    id: number,
    data: Pick<UpdateCitaDto, 'fecha' | 'horainicio' | 'horafin' | 'observaciones'>,
  ): Promise<Cita> {
    return this.actualizarCita(id, data);
  }

  async cancelarCita(id: number): Promise<Cita> {
    const response = await apiClient.patch(`/citas/${id}/cancelar`, {});
    return response.data;
  }
}

export default new CitasService();
