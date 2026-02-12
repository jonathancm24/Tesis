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
      }
    ]
  }
]
