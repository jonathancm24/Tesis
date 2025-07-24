// src/mocks/admin/api.ts

// --------------------------------------------------
// Simulación de latencia en las llamadas
// --------------------------------------------------
export function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------------------------------------
// Tipos centralizados
// --------------------------------------------------
export type Role = 'admin' | 'estudiante' | 'profesor' | 'secretario' | 'paciente';

export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  role: Role;
  especialidad?: string; // estudiante / profesor
  historial?: string;    // solo para paciente
}

// --------------------------------------------------
// Datos iniciales (base de usuarios)
// --------------------------------------------------
const users: User[] = [
  { id: 1, nombre: 'Admin Uno', email: 'admin@uleam.com', password: 'admin123', role: 'admin' },
  { id: 2, nombre: 'Estudiante Pérez', email: 'estudiante@uleam.com', password: 'est123', role: 'estudiante', especialidad: 'Ortodoncia' },
  { id: 3, nombre: 'Profesor López', email: 'profesor@uleam.com', password: 'prof123', role: 'profesor', especialidad: 'Endodoncia' },
  { id: 4, nombre: 'Secretario Cruz', email: 'secretario@uleam.com', password: 'sec123', role: 'secretario' },
  { id: 5, nombre: 'Paciente Ruiz', email: 'paciente@uleam.com', password: 'pac123', role: 'paciente', historial: 'Sin antecedentes relevantes' }
];

// --------------------------------------------------
// API Mock: Usuarios
// --------------------------------------------------

/** Login simulado */
export async function loginMock(email: string, password: string): Promise<User> {
  await delay();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Credenciales inválidas');
  return { ...user }; // se mantiene la contraseña interna
}

/** Devuelve todos los usuarios sin contraseña */
export async function fetchUsersMock(): Promise<User[]> {
  await delay();
  return users.map(u => ({ ...u, password: '' }));
}

/** Crea o actualiza un usuario */
export async function saveUserMock(user: User): Promise<User> {
  await delay();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = { ...user };
  } else {
    const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    user.id = nextId;
    users.push({ ...user });
  }
  return { ...user, password: '' };
}

/** Elimina un usuario por ID */
export async function deleteUserMock(id: number): Promise<void> {
  await delay();
  const index = users.findIndex(u => u.id === id);
  if (index >= 0) users.splice(index, 1);
}

// --------------------------------------------------
// API Mock: Estadísticas
// --------------------------------------------------

export interface Stats {
  users: number;
  appointments: number;
  patients: number;
  messages: number;
}

export async function fetchStatsMock(): Promise<Stats> {
  await delay();
  return {
    users: users.length,
    appointments: 58,
    patients: users.filter(u => u.role === 'paciente').length,
    messages: 37
  };
}
