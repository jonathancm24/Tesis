/**
 * Servicio de Personal de Clínica
 * 
 * Maneja toda la lógica de negocio para la gestión de asignaciones
 * de personal (docentes, estudiantes, coordinadores) a las clínicas
 * del sistema universitario. Proporciona operaciones CRUD básicas
 * con validaciones de negocio apropiadas.
 * 
 * Funcionalidades:
 * - Asignar personal a clínicas específicas
 * - Consultar asignaciones con filtros avanzados
 * - Actualizar información de asignaciones
 * - Finalizar asignaciones de personal
 * - Validar disponibilidad y conflictos
 * - Generar estadísticas de asignaciones
 * 
 * @fileoverview Servicio de lógica de negocio para personal de clínica
 * @module PersonalClinicaService
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AsignarPersonalClinicaDto,
  ActualizarPersonalClinicaDto,
  FiltrosPersonalClinicaDto,
  PersonalClinicaRespuestaDto,
  EstadisticasPersonalClinicaDto
} from './personal-clinica.dto';

/**
 * Servicio de Personal de Clínica
 * 
 * Proporciona métodos para gestionar las asignaciones de personal
 * a clínicas del sistema universitario, incluyendo validaciones
 * de negocio y operaciones optimizadas.
 */
@Injectable()
export class PersonalClinicaService {
  private readonly logger = new Logger(PersonalClinicaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Asignar personal a una clínica
   * 
   * Crea una nueva asignación de personal a una clínica específica,
   * validando que tanto la clínica como el usuario existan y que
   * no haya conflictos con asignaciones activas.
   * 
   * @param asignarDto - Datos de la asignación
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación creada
   * 
   * @throws {NotFoundException} - Clínica o usuario no encontrado
   * @throws {ConflictException} - Ya existe asignación activa
   * @throws {BadRequestException} - Clínica inactiva o datos inválidos
   */
  async asignar(asignarDto: AsignarPersonalClinicaDto): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Asignando usuario ${asignarDto.usuarioId} a clínica ${asignarDto.clinicaId}`);

    // Validar que la clínica existe y está activa
    const clinica = await this.prisma.clinica.findUnique({
      where: { id: asignarDto.clinicaId }
    });

    if (!clinica) {
      throw new NotFoundException(`Clínica con ID ${asignarDto.clinicaId} no encontrada`);
    }

    if (clinica.estado === 'INACTIVA' || clinica.estado === 'FUERA_SERVICIO') {
      throw new BadRequestException(`No se puede asignar personal a una clínica ${clinica.estado.toLowerCase()}`);
    }

    // Validar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: asignarDto.usuarioId },
      include: {
        role: true
      }
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${asignarDto.usuarioId} no encontrado`);
    }

    if (!usuario.activo) {
      throw new BadRequestException('No se puede asignar un usuario inactivo');
    }

    // Verificar si ya existe una asignación activa
    const asignacionExistente = await this.prisma.personalClinica.findFirst({
      where: {
        clinicaId: asignarDto.clinicaId,
        usuarioId: asignarDto.usuarioId,
        fechaFin: null // Solo asignaciones activas
      }
    });

    if (asignacionExistente) {
      throw new ConflictException('El usuario ya está asignado activamente a esta clínica');
    }

    // Validar si se está asignando como responsable
    if (asignarDto.esResponsable) {
      const responsableActual = await this.prisma.personalClinica.findFirst({
        where: {
          clinicaId: asignarDto.clinicaId,
          esResponsable: true,
          fechaFin: null
        },
        include: {
          usuario: {
            select: { nombre: true, apellido: true }
          }
        }
      });

      if (responsableActual) {
        throw new ConflictException(
          `La clínica ya tiene un responsable asignado: ${responsableActual.usuario.nombre} ${responsableActual.usuario.apellido}`
        );
      }
    }

    try {
      // Crear la asignación
      const asignacion = await this.prisma.personalClinica.create({
        data: {
          clinicaId: asignarDto.clinicaId,
          usuarioId: asignarDto.usuarioId,
          esResponsable: asignarDto.esResponsable || false,
          observaciones: asignarDto.observaciones
        },
        include: {
          clinica: {
            include: {
              parroquiaBase: {
                include: {
                  canton: {
                    include: {
                      provincia: true
                    }
                  }
                }
              }
            }
          },
          usuario: {
            include: {
              role: true,
              especialidades: {
                include: {
                  especialidad: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`Asignación creada exitosamente con ID: ${asignacion.id}`);
      return this.mapearAsignacionRespuesta(asignacion);
    } catch (error) {
      this.logger.error(`Error al crear asignación: ${error.message}`, error.stack);
      throw new BadRequestException('Error al asignar personal a la clínica');
    }
  }

  /**
   * Obtener todas las asignaciones con filtros
   * 
   * Consulta asignaciones de personal aplicando filtros de búsqueda
   * y opcionalmente incluyendo información detallada de clínicas y usuarios.
   * 
   * @param filtros - Criterios de filtrado
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Lista de asignaciones
   */
  async obtenerTodas(filtros: FiltrosPersonalClinicaDto = {}): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log('Consultando asignaciones de personal con filtros');

    // Construir condiciones de filtrado
    const where: any = {};

    if (filtros.clinicaId) {
      where.clinicaId = filtros.clinicaId;
    }

    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId;
    }

    if (filtros.esResponsable !== undefined) {
      where.esResponsable = filtros.esResponsable;
    }

    if (filtros.soloActivos !== false) {
      where.fechaFin = null; // Por defecto solo mostrar asignaciones activas
    }

    // Filtros relacionados con la clínica
    if (filtros.tipoClinica || filtros.estadoClinica) {
      where.clinica = {};
      if (filtros.tipoClinica) {
        where.clinica.tipo = filtros.tipoClinica;
      }
      if (filtros.estadoClinica) {
        where.clinica.estado = filtros.estadoClinica;
      }
    }

    // Configurar inclusión de relaciones
    const include: any = {};

    if (filtros.incluirClinica) {
      include.clinica = {
        include: {
          parroquiaBase: {
            include: {
              canton: {
                include: {
                  provincia: true
                }
              }
            }
          }
        }
      };
    }

    if (filtros.incluirUsuario) {
      include.usuario = {
        include: {
          role: true,
          especialidades: {
            include: {
              especialidad: true
            }
          }
        }
      };
    }

    try {
      const asignaciones = await this.prisma.personalClinica.findMany({
        where,
        include,
        orderBy: [
          { esResponsable: 'desc' }, // Responsables primero
          { fechaAsignacion: 'desc' }
        ]
      });

      this.logger.log(`Encontradas ${asignaciones.length} asignaciones`);
      return asignaciones.map(asignacion => this.mapearAsignacionRespuesta(asignacion));
    } catch (error) {
      this.logger.error(`Error al obtener asignaciones: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las asignaciones de personal');
    }
  }

  /**
   * Obtener asignación por ID
   * 
   * Busca una asignación específica por su identificador,
   * incluyendo toda la información relacionada.
   * 
   * @param id - ID de la asignación
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación encontrada
   * 
   * @throws {NotFoundException} - Asignación no encontrada
   */
  async obtenerPorId(id: number): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Obteniendo asignación con ID: ${id}`);

    const asignacion = await this.prisma.personalClinica.findUnique({
      where: { id },
      include: {
        clinica: {
          include: {
            parroquiaBase: {
              include: {
                canton: {
                  include: {
                    provincia: true
                  }
                }
              }
            }
          }
        },
        usuario: {
          include: {
            role: true,
            especialidades: {
              include: {
                especialidad: true
              }
            }
          }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de personal con ID ${id} no encontrada`);
    }

    return this.mapearAsignacionRespuesta(asignacion);
  }

  /**
   * Actualizar asignación de personal
   * 
   * Modifica los datos de una asignación existente, incluyendo
   * la posibilidad de finalizar la asignación.
   * 
   * @param id - ID de la asignación a actualizar
   * @param actualizarDto - Datos a actualizar
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación actualizada
   * 
   * @throws {NotFoundException} - Asignación no encontrada
   * @throws {ConflictException} - Conflicto con responsabilidad
   */
  async actualizar(id: number, actualizarDto: ActualizarPersonalClinicaDto): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Actualizando asignación con ID: ${id}`);

    // Verificar que la asignación existe
    const asignacionExistente = await this.prisma.personalClinica.findUnique({
      where: { id },
      include: {
        clinica: true,
        usuario: true
      }
    });

    if (!asignacionExistente) {
      throw new NotFoundException(`Asignación de personal con ID ${id} no encontrada`);
    }

    // Validar si se está cambiando a responsable
    if (actualizarDto.esResponsable && !asignacionExistente.esResponsable) {
      const responsableActual = await this.prisma.personalClinica.findFirst({
        where: {
          clinicaId: asignacionExistente.clinicaId,
          esResponsable: true,
          fechaFin: null,
          id: { not: id } // Excluir la asignación actual
        },
        include: {
          usuario: {
            select: { nombre: true, apellido: true }
          }
        }
      });

      if (responsableActual) {
        throw new ConflictException(
          `La clínica ya tiene un responsable asignado: ${responsableActual.usuario.nombre} ${responsableActual.usuario.apellido}`
        );
      }
    }

    // Preparar datos para actualización
    const datosActualizacion: any = {};

    if (actualizarDto.esResponsable !== undefined) {
      datosActualizacion.esResponsable = actualizarDto.esResponsable;
    }

    if (actualizarDto.observaciones !== undefined) {
      datosActualizacion.observaciones = actualizarDto.observaciones;
    }

    if (actualizarDto.fechaFin !== undefined) {
      datosActualizacion.fechaFin = new Date(actualizarDto.fechaFin);
    }

    try {
      const asignacionActualizada = await this.prisma.personalClinica.update({
        where: { id },
        data: datosActualizacion,
        include: {
          clinica: {
            include: {
              parroquiaBase: {
                include: {
                  canton: {
                    include: {
                      provincia: true
                    }
                  }
                }
              }
            }
          },
          usuario: {
            include: {
              role: true,
              especialidades: {
                include: {
                  especialidad: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`Asignación ${id} actualizada exitosamente`);
      return this.mapearAsignacionRespuesta(asignacionActualizada);
    } catch (error) {
      this.logger.error(`Error al actualizar asignación: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la asignación de personal');
    }
  }

  /**
   * Finalizar asignación de personal
   * 
   * Establece una fecha de fin para la asignación, efectivamente
   * terminando la relación del usuario con la clínica.
   * 
   * @param id - ID de la asignación a finalizar
   * @returns Promise<{ mensaje: string }> - Confirmación de finalización
   * 
   * @throws {NotFoundException} - Asignación no encontrada
   * @throws {BadRequestException} - Asignación ya finalizada
   */
  async finalizar(id: number): Promise<{ mensaje: string }> {
    this.logger.log(`Finalizando asignación con ID: ${id}`);

    const asignacion = await this.prisma.personalClinica.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { nombre: true, apellido: true }
        },
        clinica: {
          select: { nombre: true }
        }
      }
    });

    if (!asignacion) {
      throw new NotFoundException(`Asignación de personal con ID ${id} no encontrada`);
    }

    if (asignacion.fechaFin) {
      throw new BadRequestException('La asignación ya está finalizada');
    }

    try {
      await this.prisma.personalClinica.update({
        where: { id },
        data: {
          fechaFin: new Date()
        }
      });

      this.logger.log(`Asignación ${id} finalizada exitosamente`);
      return { 
        mensaje: `Asignación de ${asignacion.usuario.nombre} ${asignacion.usuario.apellido} a ${asignacion.clinica.nombre} finalizada exitosamente` 
      };
    } catch (error) {
      this.logger.error(`Error al finalizar asignación: ${error.message}`, error.stack);
      throw new BadRequestException('Error al finalizar la asignación de personal');
    }
  }

  /**
   * Obtener personal asignado a una clínica específica
   * 
   * Consulta todo el personal asignado a una clínica determinada,
   * útil para ver el staff completo de una instalación.
   * 
   * @param clinicaId - ID de la clínica
   * @param soloActivos - Filtrar solo asignaciones activas
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Personal de la clínica
   */
  async obtenerPorClinica(clinicaId: number, soloActivos: boolean = true): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo personal de clínica ${clinicaId}`);

    return this.obtenerTodas({
      clinicaId,
      soloActivos,
      incluirUsuario: true,
      incluirClinica: false
    });
  }

  /**
   * Obtener clínicas asignadas a un usuario
   * 
   * Consulta todas las clínicas donde un usuario específico
   * está asignado, útil para ver la carga de trabajo.
   * 
   * @param usuarioId - ID del usuario
   * @param soloActivos - Filtrar solo asignaciones activas
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Clínicas del usuario
   */
  async obtenerPorUsuario(usuarioId: number, soloActivos: boolean = true): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo clínicas de usuario ${usuarioId}`);

    return this.obtenerTodas({
      usuarioId,
      soloActivos,
      incluirClinica: true,
      incluirUsuario: false
    });
  }

  /**
   * Obtener estadísticas de personal de clínica
   * 
   * Genera un resumen estadístico del sistema de asignaciones
   * de personal a clínicas.
   * 
   * @returns Promise<EstadisticasPersonalClinicaDto> - Estadísticas del sistema
   */
  async obtenerEstadisticas(): Promise<EstadisticasPersonalClinicaDto> {
    this.logger.log('Generando estadísticas de personal de clínica');

    try {
      const [
        totalAsignaciones,
        asignacionesActivas,
        responsablesActivos,
        porTipoClinica,
        porRolUsuario,
        clinicasConMasPersonal
      ] = await Promise.all([
        // Total de asignaciones
        this.prisma.personalClinica.count(),

        // Asignaciones activas
        this.prisma.personalClinica.count({
          where: { fechaFin: null }
        }),

        // Responsables activos
        this.prisma.personalClinica.count({
          where: {
            esResponsable: true,
            fechaFin: null
          }
        }),

        // Por tipo de clínica
        this.prisma.personalClinica.groupBy({
          by: ['clinicaId'],
          where: { fechaFin: null },
          _count: true
        }).then(async (result) => {
          const clinicaIds = result.map(r => r.clinicaId);
          const clinicas = await this.prisma.clinica.findMany({
            where: { id: { in: clinicaIds } },
            select: { id: true, tipo: true }
          });
          
          const tipoCount: Record<string, number> = {};
          result.forEach(r => {
            const clinica = clinicas.find(c => c.id === r.clinicaId);
            if (clinica) {
              tipoCount[clinica.tipo] = (tipoCount[clinica.tipo] || 0) + r._count;
            }
          });
          return tipoCount;
        }),

        // Por rol de usuario
        this.prisma.personalClinica.findMany({
          where: { fechaFin: null },
          include: {
            usuario: {
              include: {
                role: true
              }
            }
          }
        }).then(asignaciones => {
          const rolCount: Record<string, number> = {};
          asignaciones.forEach(a => {
            const rol = a.usuario.role.nombre;
            rolCount[rol] = (rolCount[rol] || 0) + 1;
          });
          return rolCount;
        }),

        // Clínicas con más personal
        this.prisma.personalClinica.groupBy({
          by: ['clinicaId'],
          where: { fechaFin: null },
          _count: true,
          orderBy: { _count: { clinicaId: 'desc' } },
          take: 5
        }).then(async (result) => {
          const clinicaIds = result.map(r => r.clinicaId);
          const clinicas = await this.prisma.clinica.findMany({
            where: { id: { in: clinicaIds } },
            select: { id: true, nombre: true }
          });

          return result.map(r => {
            const clinica = clinicas.find(c => c.id === r.clinicaId);
            return {
              clinicaId: r.clinicaId,
              nombre: clinica?.nombre || 'Clínica Desconocida',
              totalPersonal: r._count
            };
          });
        })
      ]);

      const asignacionesFinalizadas = totalAsignaciones - asignacionesActivas;

      return {
        totalAsignaciones,
        asignacionesActivas,
        asignacionesFinalizadas,
        responsablesActivos,
        porTipoClinica,
        porRolUsuario,
        clinicasConMasPersonal
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener estadísticas de personal de clínica');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Mapear entidad Prisma a DTO de respuesta
   * 
   * @private
   * @param asignacion - Entidad de asignación de Prisma
   * @returns PersonalClinicaRespuestaDto - Objeto de respuesta formateado
   */
  private mapearAsignacionRespuesta(asignacion: any): PersonalClinicaRespuestaDto {
    const respuesta: PersonalClinicaRespuestaDto = {
      id: asignacion.id,
      clinicaId: asignacion.clinicaId,
      usuarioId: asignacion.usuarioId,
      fechaAsignacion: asignacion.fechaAsignacion,
      fechaFin: asignacion.fechaFin,
      esResponsable: asignacion.esResponsable,
      observaciones: asignacion.observaciones,
      estado: asignacion.fechaFin ? 'FINALIZADA' : 'ACTIVA'
    };

    // Calcular días de asignación
    if (!asignacion.fechaFin) {
      const fechaInicio = new Date(asignacion.fechaAsignacion);
      const fechaActual = new Date();
      const diferenciaTiempo = fechaActual.getTime() - fechaInicio.getTime();
      respuesta.diasAsignacion = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
    }

    // Agregar información de clínica si está incluida
    if (asignacion.clinica) {
      respuesta.clinica = {
        id: asignacion.clinica.id,
        nombre: asignacion.clinica.nombre,
        codigo: asignacion.clinica.codigo,
        tipo: asignacion.clinica.tipo,
        estado: asignacion.clinica.estado,
        descripcion: asignacion.clinica.descripcion,
        telefono: asignacion.clinica.telefono,
        email: asignacion.clinica.email,
        capacidadPacientes: asignacion.clinica.capacidadPacientes,
        direccionBase: asignacion.clinica.direccionBase,
        placaVehiculo: asignacion.clinica.placaVehiculo
      };

      // Agregar información de parroquia si existe
      if (asignacion.clinica.parroquiaBase) {
        respuesta.clinica.parroquiaBase = {
          id: asignacion.clinica.parroquiaBase.id,
          nombre: asignacion.clinica.parroquiaBase.nombre,
          canton: {
            nombre: asignacion.clinica.parroquiaBase.canton.nombre,
            provincia: {
              nombre: asignacion.clinica.parroquiaBase.canton.provincia.nombre
            }
          }
        };
      }
    }

    // Agregar información de usuario si está incluida
    if (asignacion.usuario) {
      respuesta.usuario = {
        id: asignacion.usuario.id,
        nombre: asignacion.usuario.nombre,
        apellido: asignacion.usuario.apellido,
        email: asignacion.usuario.email,
        telefono: asignacion.usuario.telefono,
        numeroDocumento: asignacion.usuario.numeroDocumento,
        role: {
          id: asignacion.usuario.role.id,
          nombre: asignacion.usuario.role.nombre
        }
      };

      // Agregar especialidades si existen
      if (asignacion.usuario.especialidades) {
        respuesta.usuario.especialidades = asignacion.usuario.especialidades.map((ue: any) => ({
          id: ue.especialidad.id,
          nombre: ue.especialidad.nombre
        }));
      }
    }

    return respuesta;
  }
}
