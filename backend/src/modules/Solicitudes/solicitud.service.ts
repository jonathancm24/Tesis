import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EstadoSolicitud } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CrearSolicitudDto,
  CrearSolicitudRapidaDto,
  ActualizarSolicitudBasicaDto,
  ProcesarSolicitudDto,
  CancelarSolicitudDto,
  AsignarDocenteDto,
  CrearSolicitudMasivaDto,
  CrearSolicitudPrioritariaDto,
  ResponderSolicitudDto,
  ProgramarEntrevistaDto
} from './DTO/crear-actualizar-solicitud.dto';
import {
  FiltrosSolicitudesDto,
  RespuestaPaginadaSolicitudesDto,
  EstadisticasSolicitudesDto,
  BusquedaAvanzadaSolicitudesDto,
  GenerarReporteSolicitudesDto,
  DashboardSolicitudesDto,
  ValidarCreacionSolicitudDto,
  FiltrosNotificacionesSolicitudesDto
} from './DTO/filtros-solicitudes.dto';
import {
  ISolicitud,
  ISolicitudCompleta,
  ISolicitudResumen,
  ISolicitudesPorEspecialidad,
  ISolicitudesPorEstudiante,
  ISolicitudesPorDocente,
  IEstadisticasSolicitudes,
  IDashboardSolicitudes,
  INotificacionSolicitud,
  IValidacionSolicitud,
  IReporteSolicitudes,
  IConfiguracionSolicitudes
} from './Interface/solicitud.interface';

/**
 * Servicio para gestión de solicitudes del sistema académico
 * Maneja solicitudes de estudiantes para asignación a especialidades
 * Incluye proceso de aprobación, asignación de docentes y seguimiento
 */
@Injectable()
export class SolicitudService {
  private readonly logger = new Logger(SolicitudService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CREAR SOLICITUDES
  // ============================================================================

  /**
   * Crea una nueva solicitud estándar
   */
  async crearSolicitud(createDto: CrearSolicitudDto): Promise<ISolicitudCompleta> {
    this.logger.log(`Creando nueva solicitud para estudiante ${createDto.estudianteId} en especialidad ${createDto.especialidadId}`);

    // Validar que el estudiante no tenga solicitudes pendientes para la misma especialidad
    await this.validarSolicitudDuplicada(createDto.estudianteId, createDto.especialidadId);

    // Validar que existan el estudiante y la especialidad
    await this.validarEntidadesExisten(createDto.estudianteId, createDto.especialidadId);

    // Crear la solicitud
    const nuevaSolicitud = await this.prisma.solicitud.create({
      data: {
        estudianteId: createDto.estudianteId,
        especialidadId: createDto.especialidadId,
        observaciones: createDto.observaciones,
        estado: EstadoSolicitud.PENDIENTE,
        fecha: new Date()
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            numeroDocumento: true,
            telefono: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Generar notificaciones
    await this.generarNotificacionNuevaSolicitud(nuevaSolicitud);

    this.logger.log(`Solicitud ${nuevaSolicitud.id} creada exitosamente`);
    return this.mapearSolicitudCompleta(nuevaSolicitud);
  }

  /**
   * Crea una solicitud rápida (versión simplificada)
   */
  async crearSolicitudRapida(
    createDto: CrearSolicitudRapidaDto,
    estudianteId: number
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Creando solicitud rápida para estudiante ${estudianteId}`);

    const solicitudCompleta: CrearSolicitudDto = {
      estudianteId,
      especialidadId: createDto.especialidadId,
      observaciones: createDto.observaciones || 'Solicitud rápida de asignación'
    };

    return this.crearSolicitud(solicitudCompleta);
  }

  /**
   * Crea múltiples solicitudes para varios estudiantes
   */
  async crearSolicitudMasiva(createDto: CrearSolicitudMasivaDto): Promise<ISolicitudResumen[]> {
    this.logger.log(`Creando solicitudes masivas para ${createDto.estudianteIds.length} estudiantes`);

    const solicitudesCreadas: ISolicitudResumen[] = [];
    const errores: string[] = [];

    for (const estudianteId of createDto.estudianteIds) {
      try {
        const solicitudDto: CrearSolicitudDto = {
          estudianteId,
          especialidadId: createDto.especialidadId,
          observaciones: createDto.observacionesComunes
        };

        const solicitudCreada = await this.crearSolicitud(solicitudDto);
        solicitudesCreadas.push(this.mapearSolicitudResumen(solicitudCreada));
      } catch (error) {
        errores.push(`Error para estudiante ${estudianteId}: ${error.message}`);
        this.logger.warn(`Error creando solicitud masiva para estudiante ${estudianteId}: ${error.message}`);
      }
    }

    if (errores.length > 0) {
      this.logger.warn(`Errores en solicitud masiva: ${errores.join(', ')}`);
    }

    this.logger.log(`Solicitudes masivas completadas: ${solicitudesCreadas.length} exitosas, ${errores.length} errores`);
    return solicitudesCreadas;
  }

  /**
   * Crea una solicitud prioritaria
   */
  async crearSolicitudPrioritaria(createDto: CrearSolicitudPrioritariaDto): Promise<ISolicitudCompleta> {
    this.logger.log(`Creando solicitud prioritaria para estudiante ${createDto.estudianteId}`);

    // Validaciones adicionales para solicitudes prioritarias
    if (createDto.prioridad === 'ALTA' && !createDto.coordinadorAutorizaId) {
      throw new BadRequestException('Las solicitudes de alta prioridad requieren autorización de coordinador');
    }

    const solicitudBase: CrearSolicitudDto = {
      estudianteId: createDto.estudianteId,
      especialidadId: createDto.especialidadId,
      observaciones: `${createDto.observaciones}\n\nPRIORIDAD: ${createDto.prioridad}\nJustificación: ${createDto.justificacionPrioridad}`
    };

    const solicitudCreada = await this.crearSolicitud(solicitudBase);

    // Notificar inmediatamente a coordinadores para solicitudes prioritarias
    if (createDto.prioridad === 'ALTA') {
      await this.notificarSolicitudPrioritaria(solicitudCreada, createDto);
    }

    return solicitudCreada;
  }

  // ============================================================================
  // CONSULTAR SOLICITUDES
  // ============================================================================

  /**
   * Obtiene una solicitud por ID con validación de permisos
   */
  async obtenerSolicitudPorId(id: number, usuarioId: number, rolUsuario: string): Promise<ISolicitudCompleta> {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            numeroDocumento: true,
            telefono: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Validar permisos de acceso
    await this.validarPermisosAcceso(solicitud, usuarioId, rolUsuario);

    return this.mapearSolicitudCompleta(solicitud);
  }

  /**
   * Obtiene solicitudes con filtros aplicados
   */
  async obtenerSolicitudesConFiltros(
    filtros: FiltrosSolicitudesDto,
    usuarioId: number,
    rolUsuario: string
  ): Promise<RespuestaPaginadaSolicitudesDto> {
    const skip = (filtros.page - 1) * filtros.limit;
    
    // Construir filtros WHERE basado en rol del usuario
    const whereClause = await this.construirFiltrosWhere(filtros, usuarioId, rolUsuario);

    // Construir ordenamiento
    const orderBy = this.construirOrdenamiento(filtros.ordenarPor, filtros.direccion);

    // Ejecutar consultas
    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitud.findMany({
        where: whereClause,
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          especialidad: {
            select: {
              id: true,
              nombre: true
            }
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy,
        skip,
        take: filtros.limit
      }),
      this.prisma.solicitud.count({ where: whereClause })
    ]);

    const totalPaginas = Math.ceil(total / filtros.limit);

    return {
      solicitudes: solicitudes.map(s => this.mapearSolicitudResumen(s)),
      total,
      totalPaginas,
      paginaActual: filtros.page,
      elementosPorPagina: filtros.limit,
      tieneAnterior: filtros.page > 1,
      tieneSiguiente: filtros.page < totalPaginas
    };
  }

  /**
   * Obtiene solicitudes por especialidad
   */
  async obtenerSolicitudesPorEspecialidad(especialidadId: number): Promise<ISolicitudesPorEspecialidad> {
    // Obtener información de la especialidad
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id: especialidadId }
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${especialidadId} no encontrada`);
    }

    // Obtener solicitudes y estadísticas
    const [solicitudes, estadisticas] = await Promise.all([
      this.prisma.solicitud.findMany({
        where: { especialidadId },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          docente: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { fecha: 'desc' }
      }),
      this.obtenerEstadisticasPorEspecialidad(especialidadId)
    ]);

    return {
      especialidadId,
      especialidadNombre: especialidad.nombre,
      totalSolicitudes: estadisticas.total,
      solicitudesPendientes: estadisticas.pendientes,
      solicitudesAprobadas: estadisticas.aprobadas,
      solicitudesRechazadas: estadisticas.rechazadas,
      solicitudesCanceladas: estadisticas.canceladas,
      solicitudes: solicitudes.map(s => this.mapearSolicitudResumen(s)),
      tiempoPromedioRespuesta: estadisticas.tiempoPromedio
    };
  }

  /**
   * Obtiene solicitudes por estudiante
   */
  async obtenerSolicitudesPorEstudiante(estudianteId: number): Promise<ISolicitudesPorEstudiante> {
    // Obtener información del estudiante
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true
      }
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
    }

    // Obtener solicitudes del estudiante
    const solicitudes = await this.prisma.solicitud.findMany({
      where: { estudianteId },
      include: {
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    // Calcular estadísticas
    const solicitudesActivas = solicitudes.filter(s => 
      s.estado === EstadoSolicitud.PENDIENTE || s.estado === EstadoSolicitud.APROBADA
    ).length;

    const ultimaSolicitud = solicitudes.length > 0 ? solicitudes[0].fecha : undefined;

    // Agrupar por especialidad
    const especialidadesSolicitadas = this.agruparPorEspecialidad(solicitudes);

    return {
      estudianteId,
      estudianteNombre: `${estudiante.nombre} ${estudiante.apellido}`,
      estudianteEmail: estudiante.email,
      totalSolicitudes: solicitudes.length,
      solicitudesActivas,
      ultimaSolicitud,
      solicitudes: solicitudes.map(s => this.mapearSolicitudCompleta(s)),
      especialidadesSolicitadas
    };
  }

  // ============================================================================
  // PROCESAR SOLICITUDES
  // ============================================================================

  /**
   * Procesa una solicitud (aprobar/rechazar/asignar docente)
   */
  async procesarSolicitud(
    id: number,
    procesarDto: ProcesarSolicitudDto,
    usuarioId: number
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Procesando solicitud ${id} por usuario ${usuarioId}`);

    const solicitud = await this.obtenerSolicitudParaProcesar(id);

    // Validar transición de estado
    this.validarTransicionEstado(solicitud.estado, procesarDto.nuevoEstado);

    // Validar permisos del docente
    await this.validarPermisosDocente(procesarDto.docenteId, solicitud.especialidadId);

    // Actualizar solicitud
    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: procesarDto.nuevoEstado,
        docenteId: procesarDto.docenteId,
        observaciones: this.construirObservacionesActualizadas(
          solicitud.observaciones,
          procesarDto.comentariosDocente,
          procesarDto.nuevoEstado,
          usuarioId
        )
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            numeroDocumento: true,
            telefono: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Generar notificaciones según el nuevo estado
    await this.generarNotificacionCambioEstado(solicitudActualizada, procesarDto);

    // Si es aprobada, verificar si se necesitan acciones adicionales
    if (procesarDto.nuevoEstado === EstadoSolicitud.APROBADA) {
      await this.procesarSolicitudAprobada(solicitudActualizada, procesarDto);
    }

    this.logger.log(`Solicitud ${id} procesada exitosamente con estado ${procesarDto.nuevoEstado}`);
    return this.mapearSolicitudCompleta(solicitudActualizada);
  }

  /**
   * Actualiza información básica de la solicitud
   */
  async actualizarSolicitudBasica(
    id: number,
    updateDto: ActualizarSolicitudBasicaDto,
    estudianteId: number
  ): Promise<ISolicitudCompleta> {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id }
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Validar que el estudiante es el dueño de la solicitud
    if (solicitud.estudianteId !== estudianteId) {
      throw new ForbiddenException('No tienes permisos para actualizar esta solicitud');
    }

    // Solo permitir actualización si está pendiente
    if (solicitud.estado !== EstadoSolicitud.PENDIENTE) {
      throw new BadRequestException('Solo se pueden actualizar solicitudes pendientes');
    }

    const solicitudActualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        observaciones: updateDto.observaciones || solicitud.observaciones
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            numeroDocumento: true,
            telefono: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    this.logger.log(`Solicitud ${id} actualizada por estudiante ${estudianteId}`);
    return this.mapearSolicitudCompleta(solicitudActualizada);
  }

  /**
   * Cancela una solicitud
   */
  async cancelarSolicitud(
    id: number,
    cancelarDto: CancelarSolicitudDto,
    estudianteId: number
  ): Promise<ISolicitudCompleta> {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id }
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    // Validar que el estudiante es el dueño de la solicitud
    if (solicitud.estudianteId !== estudianteId) {
      throw new ForbiddenException('No tienes permisos para cancelar esta solicitud');
    }

    // No permitir cancelación de solicitudes ya procesadas
    if (solicitud.estado === EstadoSolicitud.APROBADA) {
      throw new BadRequestException('No se puede cancelar una solicitud ya aprobada');
    }

    const observacionesCancelacion = `${solicitud.observaciones || ''}\n\n--- CANCELACIÓN ---\nFecha: ${new Date().toISOString()}\nMotivo: ${cancelarDto.motivoCancelacion}`;

    if (cancelarDto.comentariosAdicionales) {
      observacionesCancelacion.concat(`\nComentarios: ${cancelarDto.comentariosAdicionales}`);
    }

    const solicitudCancelada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: EstadoSolicitud.CANCELADA,
        observaciones: observacionesCancelacion
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            numeroDocumento: true,
            telefono: true
          }
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            especialidades: {
              include: {
                especialidad: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Notificar cancelación
    await this.generarNotificacionCancelacion(solicitudCancelada, cancelarDto);

    this.logger.log(`Solicitud ${id} cancelada por estudiante ${estudianteId}`);
    return this.mapearSolicitudCompleta(solicitudCancelada);
  }

  // ============================================================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================================================

  /**
   * Obtiene estadísticas generales de solicitudes
   */
  async obtenerEstadisticasSolicitudes(
    filtros: EstadisticasSolicitudesDto
  ): Promise<IEstadisticasSolicitudes> {
    const whereClause = this.construirFiltrosFechas(filtros.fechaInicio, filtros.fechaFin);
    
    // Obtener estadísticas básicas
    const [
      totalSolicitudes,
      solicitudesPorEstado,
      solicitudesPorEspecialidadList,
      tendenciasMensuales,
      tiemposRespuesta,
      docentesMasActivos
    ] = await Promise.all([
      this.prisma.solicitud.count({ where: whereClause }),
      this.obtenerSolicitudesPorEstado(whereClause),
      this.obtenerEstadisticasSolicitudesPorEspecialidad(whereClause, filtros.especialidadIds),
      filtros.incluirTendencias ? this.obtenerTendenciasMensuales(whereClause) : [],
      filtros.incluirTiemposRespuesta ? this.obtenerTiemposRespuesta(whereClause) : null,
      this.obtenerDocentesMasActivos(whereClause, filtros.docenteIds)
    ]);

    return {
      totalSolicitudes,
      solicitudesPorEstado,
      solicitudesPorEspecialidad: solicitudesPorEspecialidadList,
      tendenciasMensuales,
      tiemposRespuesta,
      docentesMasActivos
    };
  }

  /**
   * Obtiene dashboard de solicitudes
   */
  async obtenerDashboardSolicitudes(
    filtros: DashboardSolicitudesDto,
    usuarioId: number,
    rolUsuario: string
  ): Promise<IDashboardSolicitudes> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - filtros.periodoEnDias);

    // Adaptar filtros según el rol del usuario
    const whereClause = await this.construirFiltrosDashboard(filtros, usuarioId, rolUsuario, fechaLimite);

    const [
      resumenGeneral,
      alertas,
      estadisticasRapidas,
      solicitudesRecientes,
      tendenciaUltimos30Dias
    ] = await Promise.all([
      this.obtenerResumenGeneral(whereClause),
      filtros.incluirAlertas ? this.generarAlertas(whereClause) : [],
      this.obtenerEstadisticasRapidas(whereClause),
      this.obtenerSolicitudesRecientes(whereClause, 10),
      filtros.incluirTendencias ? this.obtenerTendencia30Dias(whereClause) : []
    ]);

    return {
      resumenGeneral,
      alertas,
      estadisticasRapidas,
      solicitudesRecientes,
      tendenciaUltimos30Dias
    };
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ============================================================================

  private async validarSolicitudDuplicada(estudianteId: number, especialidadId: number): Promise<void> {
    const solicitudExistente = await this.prisma.solicitud.findFirst({
      where: {
        estudianteId,
        especialidadId,
        estado: EstadoSolicitud.PENDIENTE
      }
    });

    if (solicitudExistente) {
      throw new BadRequestException('Ya tienes una solicitud pendiente para esta especialidad');
    }
  }

  private async validarEntidadesExisten(estudianteId: number, especialidadId: number): Promise<void> {
    const [estudiante, especialidad] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id: estudianteId } }),
      this.prisma.especialidad.findUnique({ where: { id: especialidadId } })
    ]);

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
    }

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${especialidadId} no encontrada`);
    }
  }

  private async validarPermisosAcceso(solicitud: any, usuarioId: number, rolUsuario: string): Promise<void> {
    // Los administradores pueden ver todas las solicitudes
    if (rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes solo pueden ver sus propias solicitudes
    if (rolUsuario === RoleEnum.ESTUDIANTE && solicitud.estudianteId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para acceder a esta solicitud');
    }

    // Los docentes pueden ver solicitudes de especialidades donde están asignados
    if (rolUsuario === RoleEnum.PROFESOR) {
      const docenteEspecialidades = await this.prisma.usuarioEspecialidad.findMany({
        where: { usuarioId }
      });

      const especialidadIds = docenteEspecialidades.map(ue => ue.especialidadId);
      
      if (!especialidadIds.includes(solicitud.especialidadId) && solicitud.docenteId !== usuarioId) {
        throw new ForbiddenException('No tienes permisos para acceder a esta solicitud');
      }
    }
  }

  private validarTransicionEstado(estadoActual: EstadoSolicitud, nuevoEstado: EstadoSolicitud): void {
    const transicionesPermitidas: Record<EstadoSolicitud, EstadoSolicitud[]> = {
      [EstadoSolicitud.PENDIENTE]: [EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA, EstadoSolicitud.CANCELADA],
      [EstadoSolicitud.APROBADA]: [EstadoSolicitud.CANCELADA],
      [EstadoSolicitud.RECHAZADA]: [EstadoSolicitud.PENDIENTE],
      [EstadoSolicitud.CANCELADA]: []
    };

    const transicionesValidas = transicionesPermitidas[estadoActual] || [];

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(`No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`);
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE MAPEO
  // ============================================================================

  private mapearSolicitudCompleta(solicitud: any): ISolicitudCompleta {
    return {
      id: solicitud.id,
      fecha: solicitud.fecha,
      estado: solicitud.estado,
      observaciones: solicitud.observaciones,
      estudianteId: solicitud.estudianteId,
      docenteId: solicitud.docenteId,
      especialidadId: solicitud.especialidadId,
      estudiante: {
        id: solicitud.estudiante.id,
        nombre: solicitud.estudiante.nombre,
        apellido: solicitud.estudiante.apellido,
        email: solicitud.estudiante.email,
        numeroDocumento: solicitud.estudiante.numeroDocumento,
        telefono: solicitud.estudiante.telefono
      },
      docente: solicitud.docente ? {
        id: solicitud.docente.id,
        nombre: solicitud.docente.nombre,
        apellido: solicitud.docente.apellido,
        email: solicitud.docente.email,
        especialidades: solicitud.docente.especialidades?.map((e: any) => ({
          id: e.especialidad.id,
          nombre: e.especialidad.nombre
        })) || []
      } : undefined,
      especialidad: {
        id: solicitud.especialidad.id,
        nombre: solicitud.especialidad.nombre,
        descripcion: solicitud.especialidad.descripcion
      }
    };
  }

  private mapearSolicitudResumen(solicitud: any): ISolicitudResumen {
    const diasPendientes = solicitud.estado === EstadoSolicitud.PENDIENTE 
      ? Math.floor((new Date().getTime() - new Date(solicitud.fecha).getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    return {
      id: solicitud.id,
      fecha: solicitud.fecha,
      estado: solicitud.estado,
      estudianteNombre: `${solicitud.estudiante.nombre} ${solicitud.estudiante.apellido}`,
      docenteNombre: solicitud.docente ? `${solicitud.docente.nombre} ${solicitud.docente.apellido}` : undefined,
      especialidadNombre: solicitud.especialidad.nombre,
      observaciones: solicitud.observaciones,
      diasPendientes
    };
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ============================================================================

  private construirObservacionesActualizadas(
    observacionesActuales: string,
    comentariosDocente: string,
    nuevoEstado: EstadoSolicitud,
    docenteId: number
  ): string {
    const timestamp = new Date().toISOString();
    let observacionesActualizadas = observacionesActuales || '';
    
    observacionesActualizadas += `\n\n--- ACTUALIZACIÓN ${timestamp} ---\n`;
    observacionesActualizadas += `Estado cambiado a: ${nuevoEstado}\n`;
    observacionesActualizadas += `Docente ID: ${docenteId}\n`;
    
    if (comentariosDocente) {
      observacionesActualizadas += `Comentarios: ${comentariosDocente}`;
    }

    return observacionesActualizadas;
  }

  private async construirFiltrosWhere(
    filtros: FiltrosSolicitudesDto,
    usuarioId: number,
    rolUsuario: string
  ): Promise<any> {
    let whereClause: any = {};

    // Filtros por rol
    if (rolUsuario === RoleEnum.ESTUDIANTE) {
      whereClause.estudianteId = usuarioId;
    } else if (rolUsuario === RoleEnum.PROFESOR) {
      // Docentes ven solicitudes de sus especialidades o asignadas a ellos
      const especialidadesDocente = await this.prisma.usuarioEspecialidad.findMany({
        where: { usuarioId }
      });

      whereClause.OR = [
        { docenteId: usuarioId },
        { especialidadId: { in: especialidadesDocente.map(e => e.especialidadId) } }
      ];
    }

    // Aplicar filtros adicionales
    if (filtros.estado) {
      whereClause.estado = filtros.estado;
    }

    if (filtros.especialidadId) {
      whereClause.especialidadId = filtros.especialidadId;
    }

    if (filtros.estudianteId) {
      whereClause.estudianteId = filtros.estudianteId;
    }

    if (filtros.docenteId) {
      whereClause.docenteId = filtros.docenteId;
    }

    if (filtros.fechaInicio || filtros.fechaFin) {
      whereClause.fecha = {};
      if (filtros.fechaInicio) {
        whereClause.fecha.gte = new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        whereClause.fecha.lte = new Date(filtros.fechaFin);
      }
    }

    if (filtros.busqueda) {
      whereClause.observaciones = {
        contains: filtros.busqueda,
        mode: 'insensitive'
      };
    }

    return whereClause;
  }

  private construirOrdenamiento(ordenarPor?: string, direccion?: string): any {
    const orden = direccion === 'asc' ? 'asc' : 'desc';

    switch (ordenarPor) {
      case 'estado':
        return { estado: orden };
      case 'especialidad':
        return { especialidad: { nombre: orden } };
      case 'estudiante':
        return { estudiante: { apellido: orden } };
      case 'docente':
        return { docente: { apellido: orden } };
      default:
        return { fecha: orden };
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE NOTIFICACIONES
  // ============================================================================

  private async generarNotificacionNuevaSolicitud(solicitud: any): Promise<void> {
    // Implementar lógica de notificación para nueva solicitud
    this.logger.log(`Generando notificación para nueva solicitud ${solicitud.id}`);
    // TODO: Implementar sistema de notificaciones
  }

  private async generarNotificacionCambioEstado(
    solicitud: any,
    procesarDto: ProcesarSolicitudDto
  ): Promise<void> {
    // Implementar lógica de notificación para cambio de estado
    this.logger.log(`Generando notificación para cambio de estado de solicitud ${solicitud.id} a ${procesarDto.nuevoEstado}`);
    // TODO: Implementar sistema de notificaciones
  }

  private async generarNotificacionCancelacion(
    solicitud: any,
    cancelarDto: CancelarSolicitudDto
  ): Promise<void> {
    // Implementar lógica de notificación para cancelación
    this.logger.log(`Generando notificación para cancelación de solicitud ${solicitud.id}`);
    // TODO: Implementar sistema de notificaciones
  }

  private async notificarSolicitudPrioritaria(
    solicitud: ISolicitudCompleta,
    prioritariaDto: CrearSolicitudPrioritariaDto
  ): Promise<void> {
    // Implementar lógica de notificación urgente para solicitudes prioritarias
    this.logger.log(`Notificando solicitud prioritaria ${solicitud.id} con prioridad ${prioritariaDto.prioridad}`);
    // TODO: Implementar notificaciones urgentes
  }

  // ============================================================================
  // MÉTODOS PRIVADOS DE ESTADÍSTICAS - PLACEHOLDERS
  // ============================================================================

  private async obtenerEstadisticasPorEspecialidad(especialidadId: number) {
    // Implementar lógica de estadísticas por especialidad
    return {
      total: 0,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0,
      tiempoPromedio: 0
    };
  }

  private construirFiltrosFechas(fechaInicio?: string, fechaFin?: string): any {
    const where: any = {};
    
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    return where;
  }

  private async obtenerSolicitudesPorEstado(whereClause: any) {
    const result = await this.prisma.solicitud.groupBy({
      by: ['estado'],
      where: whereClause,
      _count: { estado: true }
    });

    return {
      pendientes: result.find(r => r.estado === EstadoSolicitud.PENDIENTE)?._count.estado || 0,
      aprobadas: result.find(r => r.estado === EstadoSolicitud.APROBADA)?._count.estado || 0,
      rechazadas: result.find(r => r.estado === EstadoSolicitud.RECHAZADA)?._count.estado || 0,
      canceladas: result.find(r => r.estado === EstadoSolicitud.CANCELADA)?._count.estado || 0
    };
  }

  // Métodos adicionales de estadísticas como placeholders...
  private async obtenerEstadisticasSolicitudesPorEspecialidad(whereClause: any, especialidadIds?: number[]) {
    // TODO: Implementar
    return [];
  }

  private async obtenerTendenciasMensuales(whereClause: any) {
    // TODO: Implementar
    return [];
  }

  private async obtenerTiemposRespuesta(whereClause: any) {
    // TODO: Implementar
    return null;
  }

  private async obtenerDocentesMasActivos(whereClause: any, docenteIds?: number[]) {
    // TODO: Implementar
    return [];
  }

  private agruparPorEspecialidad(solicitudes: any[]) {
    // TODO: Implementar agrupación por especialidad
    return [];
  }

  private async obtenerSolicitudParaProcesar(id: number) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id }
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    }

    return solicitud;
  }

  private async validarPermisosDocente(docenteId: number, especialidadId: number): Promise<void> {
    // Validar que el docente existe y tiene permisos para la especialidad
    const docenteEspecialidad = await this.prisma.usuarioEspecialidad.findFirst({
      where: {
        usuarioId: docenteId,
        especialidadId: especialidadId
      }
    });

    if (!docenteEspecialidad) {
      throw new BadRequestException('El docente no está autorizado para esta especialidad');
    }
  }

  private async procesarSolicitudAprobada(solicitud: any, procesarDto: ProcesarSolicitudDto): Promise<void> {
    // Implementar acciones adicionales para solicitudes aprobadas
    this.logger.log(`Procesando acciones adicionales para solicitud aprobada ${solicitud.id}`);
    // TODO: Implementar lógica adicional (crear asignaciones, notificaciones especiales, etc.)
  }

  // Métodos de dashboard como placeholders
  private async construirFiltrosDashboard(filtros: any, usuarioId: number, rolUsuario: string, fechaLimite: Date) {
    // TODO: Implementar
    return {};
  }

  private async obtenerResumenGeneral(whereClause: any) {
    // TODO: Implementar
    return {
      solicitudesHoy: 0,
      solicitudesSemana: 0,
      solicitudesMes: 0,
      pendientesUrgentes: 0
    };
  }

  private async generarAlertas(whereClause: any) {
    // TODO: Implementar
    return [];
  }

  private async obtenerEstadisticasRapidas(whereClause: any) {
    // TODO: Implementar
    return {
      tasaAprobacion: 0,
      tiempoPromedioRespuesta: 0,
      especialidadMasSolicitada: '',
      docenteMasActivo: ''
    };
  }

  private async obtenerSolicitudesRecientes(whereClause: any, limite: number) {
    // TODO: Implementar
    return [];
  }

  private async obtenerTendencia30Dias(whereClause: any) {
    // TODO: Implementar
    return [];
  }
}
