import type { RoleName } from './permissions'

export interface MenuItem {
  label: string
  to: string
  icon: string
  roles?: RoleName[]
}

export interface MenuSection {
  title: string
  items: MenuItem[]
}

export const menuSections: MenuSection[] = [
  {
    title: 'General',
    items: [
      {
        label: 'Inicio',
        to: '/dashboard',
        icon: 'fas fa-home'
      }
    ]
  },
  {
    title: 'Administracion',
    items: [
      {
        label: 'Usuarios',
        to: '/admin/usuarios',
        icon: 'fas fa-users',
        roles: ['ADMIN']
      },
      {
        label: 'Especialidades',
        to: '/admin/especialidades',
        icon: 'fas fa-stethoscope',
        roles: ['ADMIN']
      },
      {
        label: 'CIE10 y Procedimientos',
        to: '/admin/cie10',
        icon: 'fas fa-notes-medical',
        roles: ['ADMIN']
      }
    ]
  },
  {
    title: 'Profesor',
    items: [
      {
        label: 'Estudiantes',
        to: '/profesor/estudiantes',
        icon: 'fas fa-user-graduate',
        roles: ['PROFESOR', 'ADMIN']
      },
      {
        label: 'Buzón de casos',
        to: '/profesor/casos-pendientes',
        icon: 'fas fa-inbox',
        roles: ['PROFESOR', 'ADMIN']
      },
      {
        label: 'Preguntas clínicas',
        to: '/profesor/preguntas-clinicas',
        icon: 'fas fa-question-circle',
        roles: ['PROFESOR', 'ADMIN']
      },
      {
        label: 'Gestión de archivos',
        to: '/profesor/archivos',
        icon: 'fas fa-folder-open',
        roles: ['PROFESOR', 'ADMIN']
      }
    ]
  },
  {
    title: 'Clínica',
    items: [
      {
        label: 'Pacientes',
        to: '/estudiantes/pacientes',
        icon: 'fas fa-stethoscope',
        roles: ['ESTUDIANTE', 'PROFESOR', 'ADMIN']
      },
      {
        label: 'Agenda',
        to: '/estudiantes/agenda',
        icon: 'fas fa-calendar-alt',
        roles: ['ESTUDIANTE', 'PROFESOR', 'ADMIN']
      },
      {
        label: 'Biblioteca de archivos',
        to: '/estudiantes/archivos',
        icon: 'fas fa-folder-open',
        roles: ['ESTUDIANTE']
      },
      {
        label: 'Casos clínicos',
        to: '/estudiantes/casos-clinicos/nuevo',
        icon: 'fas fa-file-medical',
        roles: ['ESTUDIANTE', 'ADMIN']
      },
      {
        label: 'Tratamientos',
        to: '/estudiantes/tratamientos-prescripciones',
        icon: 'fas fa-notes-medical',
        roles: ['ESTUDIANTE', 'ADMIN']
      }
    ]
  }
]
