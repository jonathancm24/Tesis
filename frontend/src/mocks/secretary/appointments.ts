// src/mocks/secretary/appointments.ts

import { delay } from '../utils';

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada';

export interface Appointment {
  id: number;
  pacienteId: number;
  estudianteId: number;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

const appointments: Appointment[] = [
  {
    id: 1,
    pacienteId: 101,
    estudianteId: 201,
    fecha: '2025-07-21',
    hora: '09:00',
    estado: 'pendiente',
    createdAt: '2025-07-18T12:00:00Z',
    updatedAt: '2025-07-18T12:00:00Z',
  },
  {
    id: 2,
    pacienteId: 102,
    estudianteId: 202,
    fecha: '2025-07-22',
    hora: '10:30',
    estado: 'confirmada',
    createdAt: '2025-07-18T12:00:00Z',
    updatedAt: '2025-07-18T12:00:00Z',
  },
];

export const fetchAppointmentsMock = async (): Promise<Appointment[]> => {
  await delay();
  return appointments;
};
// 👉 Agrega esto al final del archivo appointments.ts

export async function saveAppointmentMock(appointment: Appointment): Promise<Appointment> {
  await delay();
  const index = appointments.findIndex(a => a.id === appointment.id);
  const now = new Date().toISOString();

  if (index >= 0) {
    appointments[index] = { ...appointment, updatedAt: now };
  } else {
    const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
    appointment.id = newId;
    appointments.push({ ...appointment, createdAt: now, updatedAt: now });
  }

  return appointment;
}

export async function deleteAppointmentMock(id: number): Promise<void> {
  await delay();
  const index = appointments.findIndex(a => a.id === id);
  if (index !== -1) {
    appointments.splice(index, 1);
  }
}
