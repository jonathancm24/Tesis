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
// API Mock: Estadísticas Mejoradas
// --------------------------------------------------

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  recentPatients: number;
  totalReports: number;
  pendingReports: number;
}

export interface SystemOverview {
  clinicas: {
    activas: number;
    inactivas: number;
    enMantenimiento: number;
    enRuta: number;
  };
  casosClinicosHoy: {
    nuevos: number;
    enRevision: number;
    aprobados: number;
    enTratamiento: number;
  };
  citasHoy: {
    programadas: number;
    completadas: number;
    canceladas: number;
    noAsistio: number;
  };
  actividad: {
    usuariosConectados: number;
    sesionesHoy: number;
    ultimaActividad: string;
  };
}

export interface ErrorReport {
  id: number;
  title: string;
  description: string;
  user: string;
  userRole: Role;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  createdAt: string;
  updatedAt: string;
  category: 'sistema' | 'interfaz' | 'datos' | 'rendimiento' | 'seguridad';
}

export interface Request {
  id: number;
  title: string;
  description: string;
  user: string;
  userRole: Role;
  type: 'acceso' | 'modificacion' | 'consulta' | 'soporte' | 'otros';
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso';
  createdAt: string;
  updatedAt: string;
}

// Datos mock para reportes de errores
const errorReports: ErrorReport[] = [
  {
    id: 1,
    title: 'Error al cargar lista de pacientes',
    description: 'La página se queda en blanco al intentar acceder a la lista de pacientes desde el módulo de secretaría.',
    user: 'Secretario Cruz',
    userRole: 'secretario',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    category: 'sistema'
  },
  {
    id: 2,
    title: 'Botón de perfil no responde',
    description: 'En la vista de estudiante, el botón de perfil no redirige a la página correspondiente.',
    user: 'Estudiante Pérez',
    userRole: 'estudiante',
    priority: 'media',
    status: 'resuelto',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-15T09:20:00Z',
    category: 'interfaz'
  },
  {
    id: 3,
    title: 'Lentitud en el sistema',
    description: 'El sistema tarda mucho en cargar las páginas, especialmente en horas pico.',
    user: 'Profesor López',
    userRole: 'profesor',
    priority: 'media',
    status: 'en_proceso',
    createdAt: '2024-01-13T08:15:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
    category: 'rendimiento'
  },
  {
    id: 4,
    title: 'Error 500 al cambiar contraseña',
    description: 'Cuando intento cambiar la contraseña desde el perfil, aparece un error 500.',
    user: 'Paciente Ruiz',
    userRole: 'paciente',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    category: 'seguridad'
  }
];

// Datos mock para solicitudes
const requests: Request[] = [
  {
    id: 1,
    title: 'Acceso a módulo de reportes',
    description: 'Solicito acceso al módulo de reportes avanzados para generar estadísticas de mis pacientes.',
    user: 'Profesor López',
    userRole: 'profesor',
    type: 'acceso',
    status: 'pendiente',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 2,
    title: 'Modificación de datos de paciente',
    description: 'Necesito modificar los datos personales del paciente ID 123 debido a un error en el registro.',
    user: 'Secretario Cruz',
    userRole: 'secretario',
    type: 'modificacion',
    status: 'aprobado',
    createdAt: '2024-01-14T09:30:00Z',
    updatedAt: '2024-01-15T08:45:00Z'
  },
  {
    id: 3,
    title: 'Consulta sobre casos clínicos',
    description: 'Consulta sobre los criterios para la asignación de casos clínicos complejos.',
    user: 'Estudiante Pérez',
    userRole: 'estudiante',
    type: 'consulta',
    status: 'en_proceso',
    createdAt: '2024-01-13T16:20:00Z',
    updatedAt: '2024-01-14T10:15:00Z'
  }
];

export async function fetchStatsMock(): Promise<Stats> {
  await delay();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.role !== 'paciente').length;
  const patients = users.filter(u => u.role === 'paciente');
  
  return {
    totalUsers,
    activeUsers,
    totalAppointments: 142,
    pendingAppointments: 23,
    totalPatients: patients.length,
    recentPatients: Math.floor(patients.length / 2),
    totalReports: errorReports.length,
    pendingReports: errorReports.filter(r => r.status === 'pendiente').length
  };
}

export async function fetchSystemOverviewMock(): Promise<SystemOverview> {
  await delay();
  return {
    clinicas: {
      activas: 8,
      inactivas: 2,
      enMantenimiento: 1,
      enRuta: 3
    },
    casosClinicosHoy: {
      nuevos: 5,
      enRevision: 12,
      aprobados: 8,
      enTratamiento: 15
    },
    citasHoy: {
      programadas: 24,
      completadas: 18,
      canceladas: 3,
      noAsistio: 1
    },
    actividad: {
      usuariosConectados: 12,
      sesionesHoy: 47,
      ultimaActividad: new Date(Date.now() - 1000 * 60 * 15).toISOString() // Hace 15 minutos
    }
  };
}

export async function fetchErrorReportsMock(): Promise<ErrorReport[]> {
  await delay();
  return [...errorReports];
}

export async function fetchRequestsMock(): Promise<Request[]> {
  await delay();
  return [...requests];
}

export async function updateErrorReportStatusMock(id: number, status: ErrorReport['status']): Promise<void> {
  await delay();
  const report = errorReports.find(r => r.id === id);
  if (report) {
    report.status = status;
    report.updatedAt = new Date().toISOString();
  }
}

export async function updateRequestStatusMock(id: number, status: Request['status']): Promise<void> {
  await delay();
  const request = requests.find(r => r.id === id);
  if (request) {
    request.status = status;
    request.updatedAt = new Date().toISOString();
  }
}
