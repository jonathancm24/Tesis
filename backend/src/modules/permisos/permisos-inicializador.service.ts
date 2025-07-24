import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { PermisoEnum, PERMISOS_POR_MODULO } from '../../common/enums/permisos.enum';

/**
 * Servicio que inicializa los datos base del sistema de permisos
 * 
 * Se ejecuta automáticamente al iniciar la aplicación para asegurar que:
 * - Todos los permisos estén creados en la base de datos
 * - Los roles base del sistema existan con sus permisos predefinidos
 */
@Injectable()
export class PermisosInicializadorService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}

  /**
   * Método que se ejecuta automáticamente cuando el módulo se inicializa
   * Asegura que el sistema tenga todos los permisos y roles necesarios
   */
  async onModuleInit() {
    await this.inicializarPermisos();
    await this.rolesService.inicializarRolesPredefinidos();
  }

  /**
   * Crea todos los permisos definidos en PermisoEnum en la base de datos
   * Solo crea permisos que no existan, no modifica permisos existentes
   */
  private async inicializarPermisos() {
    // Iterar sobre todos los módulos de permisos
    for (const [modulo, permisos] of Object.entries(PERMISOS_POR_MODULO)) {
      // Crear cada permiso del módulo
      for (const permiso of permisos) {
        await this.crearPermisoSiNoExiste({
          nombre: permiso,
          descripcion: this.obtenerDescripcionPermiso(permiso),
          modulo: modulo
        });
      }
    }
  }

  /**
   * Crea un permiso en la base de datos solo si no existe
   * 
   * @param permisoData - Datos del permiso a crear
   */
  private async crearPermisoSiNoExiste(permisoData: {
    nombre: string;
    descripcion: string;
    modulo: string;
  }) {
    // Verificar si el permiso ya existe
    const permisoExistente = await this.prisma.permiso.findUnique({
      where: { nombre: permisoData.nombre }
    });

    if (permisoExistente) {
      return; // El permiso ya existe, no hacer nada
    }

    // Crear el permiso
    try {
      await this.prisma.permiso.create({
        data: permisoData
      });
    } catch (error) {
      // Ignorar errores de conflicto (permiso ya existe)
      // Esto puede pasar si múltiples instancias intentan crear el mismo permiso simultáneamente
      console.warn(`Permiso ${permisoData.nombre} ya existe o hubo un error al crearlo:`, error.message);
    }
  }

  /**
   * Genera una descripción legible para cada permiso
   * 
   * @param permiso - Nombre del permiso del enum
   * @returns Descripción legible del permiso
   */
  private obtenerDescripcionPermiso(permiso: PermisoEnum): string {
    const descripciones: Record<PermisoEnum, string> = {
      // Usuarios
      [PermisoEnum.VER_USUARIOS]: 'Permite ver la lista de usuarios del sistema',
      [PermisoEnum.CREAR_USUARIOS]: 'Permite registrar nuevos usuarios en el sistema',
      [PermisoEnum.EDITAR_USUARIOS]: 'Permite modificar información de usuarios existentes',
      [PermisoEnum.ELIMINAR_USUARIOS]: 'Permite eliminar usuarios del sistema',
      [PermisoEnum.ASIGNAR_ROLES]: 'Permite cambiar el rol asignado a los usuarios',

      // Roles y Permisos
      [PermisoEnum.GESTIONAR_ROLES]: 'Permite crear, editar y eliminar roles del sistema',
      [PermisoEnum.VER_ROLES]: 'Permite consultar los roles existentes y sus permisos',
      [PermisoEnum.ASIGNAR_PERMISOS_INDIVIDUALES]: 'Permite otorgar permisos especiales a usuarios específicos',
      [PermisoEnum.REVOCAR_PERMISOS_INDIVIDUALES]: 'Permite quitar permisos especiales de usuarios específicos',

      // Citas
      [PermisoEnum.VER_CITAS]: 'Permite ver las citas propias o asignadas',
      [PermisoEnum.CREAR_CITAS]: 'Permite agendar nuevas citas médicas',
      [PermisoEnum.EDITAR_CITAS]: 'Permite modificar citas existentes',
      [PermisoEnum.CANCELAR_CITAS]: 'Permite cancelar citas programadas',
      [PermisoEnum.VER_TODAS_LAS_CITAS]: 'Permite ver todas las citas del sistema',

      // Tratamientos
      [PermisoEnum.VER_TRATAMIENTOS]: 'Permite ver tratamientos propios o asignados',
      [PermisoEnum.CREAR_TRATAMIENTOS]: 'Permite crear nuevos planes de tratamiento',
      [PermisoEnum.EDITAR_TRATAMIENTOS]: 'Permite modificar tratamientos existentes',
      [PermisoEnum.APROBAR_TRATAMIENTOS]: 'Permite aprobar tratamientos realizados por estudiantes',
      [PermisoEnum.VER_TODOS_TRATAMIENTOS]: 'Permite ver todos los tratamientos del sistema',

      // Pacientes
      [PermisoEnum.VER_PACIENTES]: 'Permite acceder a información básica de pacientes',
      [PermisoEnum.CREAR_PACIENTES]: 'Permite registrar nuevos pacientes en el sistema',
      [PermisoEnum.EDITAR_PACIENTES]: 'Permite modificar información de pacientes existentes',

      // Solicitudes
      [PermisoEnum.CREAR_SOLICITUDES]: 'Permite crear solicitudes de permisos especiales',
      [PermisoEnum.VER_SOLICITUDES]: 'Permite ver solicitudes de permisos pendientes',
      [PermisoEnum.APROBAR_SOLICITUDES]: 'Permite aprobar o rechazar solicitudes de permisos',

      // Especialidades
      [PermisoEnum.VER_ESPECIALIDADES]: 'Permite consultar las especialidades disponibles',
      [PermisoEnum.GESTIONAR_ESPECIALIDADES]: 'Permite crear y modificar especialidades médicas',
    };

    return descripciones[permiso] || `Permiso: ${permiso}`;
  }
}