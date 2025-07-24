// src/mocks/admin/users.ts
import type { User } from './user'

export const users: User[] = [
  { id: 1, nombre: 'Administrador Principal', email: 'admin@odontologia.com', role: 'admin',     password: 'admin123' },
  { id: 2, nombre: 'María López',           email: 'maria.lopez@odontologia.com',  role: 'estudiante', password: 'estudiante123' },
  { id: 3, nombre: 'Carlos Pérez',          email: 'carlos.perez@odontologia.com', role: 'secretario', password: 'secretario123' },
  { id: 4, nombre: 'Ana Gómez',             email: 'ana.gomez@odontologia.com',    role: 'paciente',    password: 'paciente123' },
  { id: 5, nombre: 'José Martínez',         email: 'jose.martinez@odontologia.com',role: 'profesor',    password: 'profesor123' }
]

export async function fetchUsersMock(): Promise<User[]> {
  return users.map(u => ({ ...u }))
}

export async function saveUserMock(user: User): Promise<User> {
  const idx = users.findIndex(u => u.id === user.id)
  if (idx >= 0) users[idx] = { ...user }
  else {
    const nextId = Math.max(0, ...users.map(u => u.id)) + 1
    users.push({ ...user, id: nextId })
    user.id = nextId
  }
  return { ...user }
}

export async function deleteUserMock(id: number): Promise<void> {
  const idx = users.findIndex(u => u.id === id)
  if (idx >= 0) users.splice(idx, 1)
}
