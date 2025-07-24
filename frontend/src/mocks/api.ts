// src/mocks/api.ts

// --------------------------------------------------
// Utility: simulación de latencia en las llamadas
// --------------------------------------------------
export function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------------------------------------
// Tipos compartidos
// --------------------------------------------------
export type Role = 'admin' | 'estudiante' | 'profesor' | 'secretario' | 'paciente';

export interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  role: Role;
  especialidad?: string;   // solo para profes y estudiantes
  historial?: string;      // solo para pacientes, si se modelan
  activo: boolean;         // indica si la cuenta está activa
}

// --------------------------------------------------
// Datos iniciales: usuarios
// --------------------------------------------------
export const initialUsers: User[] = [
  { id: 1, nombre: 'Admin Uno',         email: 'admin@uleam.com',      password: 'admin123',     role: 'admin',     activo: true },
  { id: 2, nombre: 'Estudiante Pérez',  email: 'estudiante@uleam.com', password: 'est123',       role: 'estudiante', especialidad: 'Ortodoncia', activo: true },
  { id: 3, nombre: 'Profesor López',    email: 'profesor@uleam.com',   password: 'prof123',      role: 'profesor',  especialidad: 'Endodoncia', activo: true },
  { id: 4, nombre: 'Secretario Cruz',   email: 'secretario@uleam.com', password: 'sec123',       role: 'secretario', activo: true },
  { id: 5, nombre: 'Paciente Ruiz',     email: 'paciente@uleam.com',   password: 'pac123',       role: 'paciente',  historial: 'Sin antecedentes relevantes', activo: true }
];

// --------------------------------------------------
// 1) Login & gestión básica de usuarios (Admin)
// --------------------------------------------------

/**
 * Simula un login: busca usuario por email + password.
 * Lanza error si no existe coincidencia.
 */
export async function loginMock(email: string, password: string): Promise<User> {
  await delay();
  const user = initialUsers.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Usuario o contraseña inválidos');
  return { ...user };
}

/** Devuelve la lista de usuarios (sin la contraseña) */
export async function fetchUsersMock(): Promise<User[]> {
  await delay();
  return initialUsers.map(u => ({ ...u, password: '' }));
}

/**
 * Crea o actualiza un usuario.
 * Si user.id existe, lo actualiza; si no, lo inserta con nuevo id.
 */
export async function saveUserMock(user: User): Promise<User> {
  await delay();
  const idx = initialUsers.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    initialUsers[idx] = { ...user };
  } else {
    const newId = initialUsers.length ? Math.max(...initialUsers.map(u => u.id)) + 1 : 1;
    user.id = newId;
    initialUsers.push({ ...user });
  }
  return { ...user, password: '' };
}

/** Elimina un usuario por su ID */
export async function deleteUserMock(id: number): Promise<void> {
  await delay();
  const idx = initialUsers.findIndex(u => u.id === id);
  if (idx >= 0) initialUsers.splice(idx, 1);
}

// --------------------------------------------------
// 2) Estudiante: Historias Clínicas
// --------------------------------------------------
export interface ClinicalHistory {
  id: number;
  patientId: number;
  generalData: string;
  dentalHistory: string;
  intraoralFindings: string;
  allergies: string[];
  medications: string[];
  systemicHistory: string;
  createdAt: string;
  updatedAt: string;
}

let histories: ClinicalHistory[] = [];

/** Recupera todas las historias clínicas */
export async function fetchHistoriesMock(): Promise<ClinicalHistory[]> {
  await delay();
  return histories.map(h => ({ ...h }));
}

/** Crea o actualiza una historia clínica */
export async function saveHistoryMock(h: ClinicalHistory): Promise<ClinicalHistory> {
  await delay();
  const now = new Date().toISOString();
  if (h.id) {
    const idx = histories.findIndex(x => x.id === h.id);
    if (idx >= 0) {
      histories[idx] = { ...h, updatedAt: now };
      return { ...histories[idx] };
    }
  }
  const newEntry = { ...h, id: histories.length + 1, createdAt: now, updatedAt: now };
  histories.push(newEntry);
  return { ...newEntry };
}

/** Elimina una historia clínica */
export async function deleteHistoryMock(id: number): Promise<void> {
  await delay();
  histories = histories.filter(h => h.id !== id);
}

// --------------------------------------------------
// 3) Estudiante: Casos Clínicos
// --------------------------------------------------
export interface ClinicalCase {
  id: number;
  patientId: number;
  title: string;
  description?: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
}

let cases: ClinicalCase[] = [];

/** Recupera todos los casos clínicos */
export async function fetchCasesMock(): Promise<ClinicalCase[]> {
  await delay();
  return cases.map(c => ({ ...c }));
}

/** Crea o actualiza un caso clínico */
export async function saveCaseMock(c: ClinicalCase): Promise<ClinicalCase> {
  await delay();
  const now = new Date().toISOString();
  if (c.id) {
    const idx = cases.findIndex(x => x.id === c.id);
    if (idx >= 0) {
      cases[idx] = { ...c, updatedAt: now };
      return { ...cases[idx] };
    }
  }
  const newCase = { ...c, id: cases.length + 1, createdAt: now, updatedAt: now };
  cases.push(newCase);
  return { ...newCase };
}

/** Elimina un caso clínico */
export async function deleteCaseMock(id: number): Promise<void> {
  await delay();
  cases = cases.filter(c => c.id !== id);
}

// --------------------------------------------------
// 4) Estudiante: Tareas Académicas
// --------------------------------------------------
export interface Assignment {
  id: number;
  studentId: number;
  title: string;
  dueDate: string;
  status: 'pendiente' | 'entregado' | 'corregido';
}

let assignments: Assignment[] = [];

/** Recupera todas las tareas */
export async function fetchAssignmentsMock(): Promise<Assignment[]> {
  await delay();
  return assignments.map(a => ({ ...a }));
}

/** Crea o actualiza una tarea académica */
export async function saveAssignmentMock(a: Assignment): Promise<Assignment> {
  await delay();
  if (a.id) {
    const idx = assignments.findIndex(x => x.id === a.id);
    if (idx >= 0) assignments[idx] = { ...a };
    return { ...a };
  }
  const newA = { ...a, id: assignments.length + 1 };
  assignments.push(newA);
  return { ...newA };
}

/** Elimina una tarea */
export async function deleteAssignmentMock(id: number): Promise<void> {
  await delay();
  assignments = assignments.filter(a => a.id !== id);
}

// --------------------------------------------------
// 5) Estudiante: Mensajería
// --------------------------------------------------
export interface Message {
  id: number;
  from: string;
 	to: string;
 	content: string;
 	timestamp: string;
}

let messages: Message[] = [];

/** Recupera mensajes entre dos usuarios */
export async function fetchMessagesMock(withUser: string): Promise<Message[]> {
  await delay();
  return messages.filter(m => m.from === withUser || m.to === withUser);
}

/** Envía un mensaje nuevo */
export async function sendMessageMock(msg: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
  await delay();
  messages.push({ ...msg, id: messages.length + 1, timestamp: new Date().toISOString() });
}
// --------------------------------------------------
// 6) Estudiante: Odontograma
// --------------------------------------------------
export type ToothStatus = 'sano' | 'caries' | 'restaurado' | 'extraido';

export interface OdontogramEntry {
  id: string;
  patientId: number;
  tooth: string;
  status: ToothStatus;
  annotations?: string;
  createdAt: string;
  updatedAt: string;
}

const odontograms: Record<number, OdontogramEntry[]> = {};

function genId(patientId: number, tooth: string): string {
  return `${patientId}-${tooth}-${Date.now()}`;
}

/** Recupera odontograma completo */
export async function fetchOdontogramMock(patientId: number): Promise<OdontogramEntry[]> {
  await delay();
  return (odontograms[patientId] ?? []).map(e => ({ ...e }));
}

/** Crea/actualiza una entrada */
export async function saveOdontogramEntryMock(
  patientId: number,
  entry: Partial<OdontogramEntry> & { tooth: string; status: ToothStatus }
): Promise<OdontogramEntry> {
  await delay();
  const now = new Date().toISOString();
  odontograms[patientId] = odontograms[patientId] ?? [];

  if (entry.id) {
    const list = odontograms[patientId];
    const idx = list.findIndex(e => e.id === entry.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...entry, updatedAt: now };
      return { ...list[idx] };
    }
  }

  const newE: OdontogramEntry = {
    id: genId(patientId, entry.tooth),
    patientId,
    tooth: entry.tooth,
    status: entry.status,
    annotations: entry.annotations,
    createdAt: now,
    updatedAt: now,
  };
  odontograms[patientId].push(newE);
  return { ...newE };
}

/** Elimina una entrada del odontograma */
export async function deleteOdontogramEntryMock(patientId: number, id: string): Promise<void> {
  await delay();
  odontograms[patientId] = (odontograms[patientId] ?? []).filter(e => e.id !== id);
}

/** Reemplaza todo el odontograma de un paciente */
export async function saveFullOdontogramMock(
  patientId: number,
  entries: Array<Partial<OdontogramEntry> & { tooth: string; status: ToothStatus }>
): Promise<void> {
  await delay();
  const now = new Date().toISOString();
  odontograms[patientId] = entries.map(e => ({
    id: genId(patientId, e.tooth),
    patientId,
    tooth: e.tooth,
    status: e.status,
    annotations: e.annotations,
    createdAt: now,
    updatedAt: now,
  }));
}

// --------------------------------------------------
// 7) Profesor: Gestión de Asignaciones
// --------------------------------------------------
export interface ProfessorAssignment {
  id: number;
  professorId: number;
  title: string;
  description: string;
}

let profAssignments: ProfessorAssignment[] = [];

/** Recupera todas las asignaciones de profesor */
export async function fetchProfessorAssignmentsMock(): Promise<ProfessorAssignment[]> {
  await delay();
  return profAssignments.map(a => ({ ...a }));
}

/** Crea/actualiza una asignación del profesor */
export async function saveProfessorAssignmentMock(a: ProfessorAssignment): Promise<ProfessorAssignment> {
  await delay();
  if (a.id) {
    const idx = profAssignments.findIndex(x => x.id === a.id);
    if (idx >= 0) profAssignments[idx] = { ...a };
    return { ...a };
  }
  const newA = { ...a, id: profAssignments.length + 1 };
  profAssignments.push(newA);
  return { ...newA };
}

/** Elimina una asignación de profesor */
export async function deleteProfessorAssignmentMock(id: number): Promise<void> {
  await delay();
  profAssignments = profAssignments.filter(a => a.id !== id);
}

// --------------------------------------------------
// 8) Profesor: Progreso de Estudiantes
// --------------------------------------------------
export interface StudentProgress {
  id: number;
  studentId: number;
  professorId: number;
  progress: string;
}

let progressRecords: StudentProgress[] = [];

/** Recupera todos los registros de progreso */
export async function fetchProgressMock(): Promise<StudentProgress[]> {
  await delay();
  return progressRecords.map(r => ({ ...r }));
}

/** Crea/actualiza un registro de progreso */
export async function saveProgressMock(r: StudentProgress): Promise<StudentProgress> {
  await delay();
  if (r.id) {
    const idx = progressRecords.findIndex(x => x.id === r.id);
    if (idx >= 0) progressRecords[idx] = { ...r };
    return { ...r };
  }
  const newR = { ...r, id: progressRecords.length + 1 };
  progressRecords.push(newR);
  return { ...newR };
}

/** Elimina un registro de progreso */
export async function deleteProgressMock(id: number): Promise<void> {
  await delay();
  progressRecords = progressRecords.filter(r => r.id !== id);
}

// --------------------------------------------------
// 9) Profesor: Estudiantes por Curso
// --------------------------------------------------
export interface StudentInfo {
  id: number;
  name: string;
  course: string;
}

let studentsByCourse: StudentInfo[] = [];

/** Recupera la lista de estudiantes de un curso */
export async function fetchStudentsByCourseMock(course: string): Promise<StudentInfo[]> {
  await delay();
  return studentsByCourse.filter(s => s.course === course);
}

/** Añade un estudiante a un curso */
export async function addStudentToCourseMock(info: Omit<StudentInfo, 'id'>): Promise<void> {
  await delay();
  studentsByCourse.push({ ...info, id: studentsByCourse.length + 1 });
}

/** Elimina un estudiante de un curso */
export async function removeStudentFromCourseMock(studentId: number, course: string): Promise<void> {
  await delay();
  studentsByCourse = studentsByCourse.filter(s => !(s.id === studentId && s.course === course));
}

// --------------------------------------------------
// 10) Secretario: Asignación de Pacientes
// --------------------------------------------------
export interface PatientAssignment {
  id: number;
  studentId: number;
  patientId: number;
  assignedAt: string;
  notes?: string;
}

let patientAssignments: PatientAssignment[] = [];

/** Recupera todas las asignaciones de pacientes */
export async function fetchPatientAssignmentsMock(): Promise<PatientAssignment[]> {
  await delay();
  return patientAssignments.map(pa => ({ ...pa }));
}

/** Crea/actualiza una asignación de paciente */
export async function savePatientAssignmentMock(a: PatientAssignment): Promise<PatientAssignment> {
  await delay();
  const now = new Date().toISOString();
  if (a.id) {
    const idx = patientAssignments.findIndex(x => x.id === a.id);
    if (idx >= 0) {
      patientAssignments[idx] = { ...a, assignedAt: a.assignedAt || now };
      return { ...patientAssignments[idx] };
    }
  }
  const newA = { ...a, id: patientAssignments.length + 1, assignedAt: now };
  patientAssignments.push(newA);
  return { ...newA };
}

/** Elimina una asignación de paciente */
export async function deletePatientAssignmentMock(id: number): Promise<void> {
  await delay();
  patientAssignments = patientAssignments.filter(pa => pa.id !== id);
}

// --------------------------------------------------
// 11) Secretario: Citas
// --------------------------------------------------
export type AppointmentStatus = 'confirmada' | 'pendiente' | 'cancelada';

export interface Appointment {
  id: number;
  studentId: number;
  patientId: number;
  datetime: string; // ISO
  status: AppointmentStatus;
  notes?: string;
}

let appointments: Appointment[] = [];

/** Recupera todas las citas */
export async function fetchAppointmentsMock(): Promise<Appointment[]> {
  await delay();
  return appointments.map(a => ({ ...a }));
}

/** Crea/actualiza una cita */
export async function saveAppointmentMock(a: Appointment): Promise<Appointment> {
  await delay();
  if (a.id) {
    const idx = appointments.findIndex(x => x.id === a.id);
    if (idx >= 0) appointments[idx] = { ...a };
    return { ...a };
  }
  const newA = { ...a, id: appointments.length + 1 };
  appointments.push(newA);
  return { ...newA };
}

/** Elimina una cita */
export async function deleteAppointmentMock(id: number): Promise<void> {
  await delay();
  appointments = appointments.filter(a => a.id !== id);
}

// --------------------------------------------------
// 12) Secretario: Gestión de Pacientes
// --------------------------------------------------

export interface Patient {
  id: number;
  nombre: string;
  cedula: string;
  canton: string;
  contacto: string;
  enfermedades?: string[];
  medicamentos?: string[];
  alergias?: string[];
  tipoSangre?: string;
  condiciones?: string[];
  createdAt: string;
  updatedAt: string;
}

let patients: Patient[] = [];

/** Recupera todos los pacientes */
export async function fetchPatientsMock(): Promise<Patient[]> {
  await delay();
  return patients.map(p => ({ ...p }));
}

/** Crea o actualiza un paciente */
export async function savePatientMock(p: Patient): Promise<Patient> {
  await delay();
  const now = new Date().toISOString();
  if (p.id) {
    const idx = patients.findIndex(x => x.id === p.id);
    if (idx >= 0) {
      patients[idx] = { ...p, updatedAt: now };
      return { ...patients[idx] };
    }
  }
  const newId = patients.length ? Math.max(...patients.map(x => x.id)) + 1 : 1;
  const newPatient: Patient = {
    ...p,
    id: newId,
    createdAt: now,
    updatedAt: now
  };
  patients.push(newPatient);
  return { ...newPatient };
}

/** Elimina un paciente */
export async function deletePatientMock(id: number): Promise<void> {
  await delay();
  patients = patients.filter(p => p.id !== id);
}
