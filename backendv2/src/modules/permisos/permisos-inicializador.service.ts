import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { PermisoEnum, PERMISOS_POR_MODULO } from '../../common/enums/permisos.enum';

@Injectable()
export class PermisosInicializadorService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}

  async onModuleInit() {
    try {
      console.log('🔧 Inicializando sistema de permisos...');
      
      await this.inicializarPermisos();
      console.log('✅ Permisos inicializados correctamente');
      
      await this.rolesService.inicializarRolesPredefinidos();
      console.log('✅ Roles base inicializados correctamente');
      
      console.log('🚀 Sistema de permisos listo');
    } catch (error) {
      console.error('❌ Error al inicializar sistema de permisos:', error.message);
    }
  }

  private async inicializarPermisos() {
    for (const [modulo, permisos] of Object.entries(PERMISOS_POR_MODULO)) {
      for (const permiso of permisos) {
        await this.crearPermisoSiNoExiste({
          nombre: permiso,
          descripcion: this.obtenerDescripcionPermiso(permiso),
          modulo: modulo
        });
      }
    }
  }

  private async crearPermisoSiNoExiste(permisoData: {
    nombre: string;
    descripcion: string;
    modulo: string;
  }) {
    try {
      const permisoExistente = await this.prisma.permiso.findUnique({
        where: { nombre: permisoData.nombre }
      });

      if (permisoExistente) {
        return;
      }

      await this.prisma.permiso.create({
        data: permisoData
      });

    } catch (error) {
      if (!error.message.includes('unique constraint')) {
        console.warn(`Error al crear permiso ${permisoData.nombre}:`, error.message);
      }
    }
  }

  private obtenerDescripcionPermiso(permiso: PermisoEnum): string {
    const descripciones: Record<PermisoEnum, string> = {
      [PermisoEnum.VER_USUARIOS]: 'Permite ver la lista de usuarios del sistema',
      [PermisoEnum.CREAR_USUARIOS]: 'Permite registrar nuevos usuarios en el sistema',
      [PermisoEnum.EDITAR_USUARIOS]: 'Permite modificar información de usuarios existentes',
      [PermisoEnum.ELIMINAR_USUARIOS]: 'Permite eliminar usuarios del sistema',
      [PermisoEnum.ASIGNAR_ROLES]: 'Permite cambiar el rol asignado a los usuarios',
      [PermisoEnum.GESTIONAR_ROLES]: 'Permite crear, editar y eliminar roles del sistema',
      [PermisoEnum.VER_ROLES]: 'Permite consultar los roles existentes y sus permisos',
      [PermisoEnum.ASIGNAR_PERMISOS_INDIVIDUALES]: 'Permite otorgar permisos especiales a usuarios específicos',
      [PermisoEnum.REVOCAR_PERMISOS_INDIVIDUALES]: 'Permite quitar permisos especiales de usuarios específicos',
      [PermisoEnum.VER_CITAS]: 'Permite ver las citas propias o asignadas',
      [PermisoEnum.CREAR_CITAS]: 'Permite agendar nuevas citas médicas',
      [PermisoEnum.EDITAR_CITAS]: 'Permite modificar citas existentes',
      [PermisoEnum.CANCELAR_CITAS]: 'Permite cancelar citas programadas',
      [PermisoEnum.VER_TODAS_LAS_CITAS]: 'Permite ver todas las citas del sistema',
      [PermisoEnum.VER_TRATAMIENTOS]: 'Permite ver tratamientos propios o asignados',
      [PermisoEnum.CREAR_TRATAMIENTOS]: 'Permite crear nuevos planes de tratamiento',
      [PermisoEnum.EDITAR_TRATAMIENTOS]: 'Permite modificar tratamientos existentes',
      [PermisoEnum.APROBAR_TRATAMIENTOS]: 'Permite aprobar tratamientos realizados por estudiantes',
      [PermisoEnum.VER_TODOS_TRATAMIENTOS]: 'Permite ver todos los tratamientos del sistema',
      [PermisoEnum.VER_PACIENTES]: 'Permite acceder a información básica de pacientes',
      [PermisoEnum.CREAR_PACIENTES]: 'Permite registrar nuevos pacientes en el sistema',
      [PermisoEnum.EDITAR_PACIENTES]: 'Permite modificar información de pacientes existentes',
      [PermisoEnum.CREAR_SOLICITUDES]: 'Permite crear solicitudes de permisos especiales',
      [PermisoEnum.VER_SOLICITUDES]: 'Permite ver solicitudes de permisos pendientes',
      [PermisoEnum.APROBAR_SOLICITUDES]: 'Permite aprobar o rechazar solicitudes de permisos',
      [PermisoEnum.VER_ESPECIALIDADES]: 'Permite consultar las especialidades disponibles',
      [PermisoEnum.GESTIONAR_ESPECIALIDADES]: 'Permite crear y modificar especialidades médicas',
      [PermisoEnum.VER_ENCUESTAS]: 'Permite consultar encuestas de tamizaje realizadas',
      [PermisoEnum.CREAR_ENCUESTAS]: 'Permite crear nuevas encuestas de tamizaje para pacientes',
      [PermisoEnum.VER_ESTADISTICAS]: 'Permite acceder a estadísticas del sistema',
      [PermisoEnum.VER_CONFIGURACION]: 'Permite ver configuraciones del sistema como preguntas de tamizaje',
      [PermisoEnum.VER_ARCHIVOS]: 'Permite visualizar listados de archivos en contextos autorizados',
      [PermisoEnum.SUBIR_ARCHIVOS]: 'Permite cargar documentos e imágenes al sistema',
      [PermisoEnum.DESCARGAR_ARCHIVOS]: 'Permite descargar archivos relacionados a casos y atención clínica',
    };

    return descripciones[permiso] || `Permiso: ${permiso}`;
  }
}