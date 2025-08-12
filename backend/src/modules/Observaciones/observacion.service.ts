import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EstadoObservacion } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearObservacionDto, 
  CrearSeguimientoTratamientoDto,
  CrearRetroalimentacionDocenteDto,
  ActualizarObservacionBasicaDto,
  ActualizarEstadoObservacionDto,
  ResponderObservacionDto,
  CompletarObservacionDto,
  ProgramarRecordatorioDto
} from './DTO/crear-actualizar-observacion.dto';
import { 
  FiltrosObservacionesDto, 
  RespuestaPaginadaObservacionesDto, 
  EstadisticasObservacionesDto,
  BusquedaAvanzadaObservacionesDto,
  GenerarReporteObservacionesDto,
  ValidarFinalizacionObservacionDto,
  DashboardObservacionesDto
} from './DTO/filtros-observaciones.dto';
import { 
  IObservacion,
  IObservacionCompleta,
  IObservacionResumen,
  IEstadisticasObservaciones,
  IObservacionesPorEntidad,
  IDashboardObservaciones,
  IValidacionObservacion,
  IReporteObservaciones,
  ISeguimientoTratamiento,
  IRetroalimentacionDocente
} from './Interface/observacion.interface';

/**
 * Servicio para gestión de observaciones del sistema
 * Maneja seguimiento de tratamientos y retroalimentación docente
 * Soporta relaciones polimórficas con múltiples entidades
 * Integra notificaciones y sistema de recordatorios
 */
@Injectable()
export class ObservacionService {
  private readonly logger = new Logger(ObservacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una observación genérica en el sistema
   * Valida la relación polimórfica y permisos del usuario
   * @param createDto - Datos de la observación a crear
   * @returns Observación creada con información completa
   */
  async crearObservacion(createDto: CrearObservacionDto): Promise<IObservacionCompleta> {
    this.logger.log(`Creando nueva observación: ${createDto.titulo}`);

    try {
      // Validar que solo una entidad esté relacionada
      await this.validarRelacionPolimorfica(createDto);

      // Validar que las entidades existan
      await this.validarEntidadesExisten(createDto);

      const nuevaObservacion = await this.prisma.observacion.create({
        data: {
          ...createDto,
          estado: EstadoObservacion.PENDIENTE,
          fecha: new Date()
        },
        include: this.getObservacionInclude()
      });

      this.logger.log(`Observación creada exitosamente con ID: ${nuevaObservacion.id}`);
      return this.mapearObservacionCompleta(nuevaObservacion);

    } catch (error) {
      this.logger.error(`Error al crear observación: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crea un seguimiento específico de tratamiento (para estudiantes)
   * Genera automáticamente el título y estructura el contenido
   * @param seguimientoDto - Datos del seguimiento de tratamiento
   * @returns Observación creada como seguimiento
   */
  async crearSeguimientoTratamiento(
    seguimientoDto: CrearSeguimientoTratamientoDto,
    estudianteId: number
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Creando seguimiento de tratamiento ${seguimientoDto.tratamientoId} por estudiante ${estudianteId}`);

    // Obtener información del tratamiento
    const tratamiento = await this.prisma.tratamiento.findUnique({
      where: { id: seguimientoDto.tratamientoId },
      include: {
        casoClinico: {
          include: {
            paciente: { select: { nombre: true, apellido: true } }
          }
        }
      }
    });

    if (!tratamiento) {
      throw new NotFoundException(`Tratamiento con ID ${seguimientoDto.tratamientoId} no encontrado`);
    }

    // Generar título automático
    const titulo = `Seguimiento de tratamiento - ${tratamiento.casoClinico.paciente.nombre} ${tratamiento.casoClinico.paciente.apellido}`;

    // Estructurar la descripción
    let descripcion = `**Progreso realizado:**\n${seguimientoDto.progreso}\n\n`;
    
    if (seguimientoDto.dificultadesEncontradas) {
      descripcion += `**Dificultades encontradas:**\n${seguimientoDto.dificultadesEncontradas}\n\n`;
    }
    
    if (seguimientoDto.solucionesAplicadas) {
      descripcion += `**Soluciones aplicadas:**\n${seguimientoDto.solucionesAplicadas}\n\n`;
    }
    
    if (seguimientoDto.proximosPasos) {
      descripcion += `**Próximos pasos:**\n${seguimientoDto.proximosPasos}\n\n`;
    }

    descripcion += `**Necesita ayuda:** ${seguimientoDto.necesitaAyuda ? 'Sí' : 'No'}\n`;
    
    if (seguimientoDto.autoevaluacion) {
      descripcion += `**Autoevaluación:** ${seguimientoDto.autoevaluacion}\n`;
    }

    const observacionDto: CrearObservacionDto = {
      titulo,
      descripcion,
      estudianteId,
      tratamientoId: seguimientoDto.tratamientoId
    };

    return this.crearObservacion(observacionDto);
  }

  /**
   * Crea retroalimentación específica de docente
   * Estructura el contenido según el tipo de evaluación
   * @param retroalimentacionDto - Datos de la retroalimentación
   * @param docenteId - ID del docente que crea la retroalimentación
   * @returns Observación creada como retroalimentación
   */
  async crearRetroalimentacionDocente(
    retroalimentacionDto: CrearRetroalimentacionDocenteDto,
    docenteId: number
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Creando retroalimentación docente para ${retroalimentacionDto.entidadTipo} ${retroalimentacionDto.entidadId}`);

    // Generar título automático
    const titulo = `Retroalimentación de ${retroalimentacionDto.entidadTipo.toLowerCase().replace('_', ' ')}`;

    // Estructurar la descripción
    let descripcion = `**Observaciones del docente:**\n${retroalimentacionDto.observaciones}\n\n`;

    if (retroalimentacionDto.calificacion) {
      descripcion += `**Calificación:** ${retroalimentacionDto.calificacion}/10\n\n`;
    }

    descripcion += `**Aspectos positivos:**\n`;
    retroalimentacionDto.aspectosPositivos.forEach(aspecto => {
      descripcion += `• ${aspecto}\n`;
    });

    if (retroalimentacionDto.areasAMejorar.length > 0) {
      descripcion += `\n**Áreas a mejorar:**\n`;
      retroalimentacionDto.areasAMejorar.forEach(area => {
        descripcion += `• ${area}\n`;
      });
    }

    descripcion += `\n**Recomendaciones:**\n`;
    retroalimentacionDto.recomendaciones.forEach(recomendacion => {
      descripcion += `• ${recomendacion}\n`;
    });

    if (retroalimentacionDto.requiereRevision) {
      descripcion += `\n**Requiere revisión adicional**`;
      if (retroalimentacionDto.fechaProximaRevision) {
        descripcion += ` programada para ${new Date(retroalimentacionDto.fechaProximaRevision).toLocaleDateString()}`;
      }
    }

    // Crear la observación según el tipo de entidad
    const observacionDto: CrearObservacionDto = {
      titulo,
      descripcion,
      estudianteId: retroalimentacionDto.estudianteId,
      docenteId,
      ...(retroalimentacionDto.entidadTipo === 'CASO_CLINICO' && { casoClinicoId: retroalimentacionDto.entidadId }),
      ...(retroalimentacionDto.entidadTipo === 'TRATAMIENTO' && { tratamientoId: retroalimentacionDto.entidadId }),
      ...(retroalimentacionDto.entidadTipo === 'PRESCRIPCION' && { prescripcionId: retroalimentacionDto.entidadId }),
      ...(retroalimentacionDto.entidadTipo === 'ODONTOGRAMA' && { odontogramaId: retroalimentacionDto.entidadId })
    };

    return this.crearObservacion(observacionDto);
  }

  /**
   * Actualiza información básica de una observación
   * Valida permisos según el rol del usuario
   * @param id - ID de la observación
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @param rolUsuario - Rol del usuario
   * @returns Observación actualizada
   */
  async actualizarObservacionBasica(
    id: number, 
    updateDto: ActualizarObservacionBasicaDto, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Actualizando observación ${id} - Usuario: ${usuarioId}, Rol: ${rolUsuario}`);

    const observacion = await this.obtenerObservacionPorId(id);

    // Validar permisos de edición
    await this.validarPermisosEdicion(observacion, usuarioId, rolUsuario);

    try {
      const observacionActualizada = await this.prisma.observacion.update({
        where: { id },
        data: updateDto,
        include: this.getObservacionInclude()
      });

      this.logger.log(`Observación ${id} actualizada exitosamente`);
      return this.mapearObservacionCompleta(observacionActualizada);

    } catch (error) {
      this.logger.error(`Error al actualizar observación ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar la observación');
    }
  }

  /**
   * Actualiza el estado de una observación
   * Solo disponible para docentes o propietarios
   * @param id - ID de la observación
   * @param updateDto - Nuevo estado y comentario
   * @returns Observación con estado actualizado
   */
  async actualizarEstadoObservacion(
    id: number, 
    updateDto: ActualizarEstadoObservacionDto,
    usuarioId: number,
    rolUsuario: string
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Actualizando estado de observación ${id} a ${updateDto.estado}`);

    const observacion = await this.obtenerObservacionPorId(id);

    // Validar transición de estado
    await this.validarTransicionEstado(observacion.estado, updateDto.estado);

    // Validar permisos para cambio de estado
    await this.validarPermisosEstado(observacion, usuarioId, rolUsuario);

    try {
      const observacionActualizada = await this.prisma.observacion.update({
        where: { id },
        data: {
          estado: updateDto.estado
        },
        include: this.getObservacionInclude()
      });

      // Registrar el cambio si hay comentario
      if (updateDto.comentario) {
        await this.registrarComentarioEstado(id, observacion.estado, updateDto.estado, updateDto.comentario, usuarioId);
      }

      this.logger.log(`Estado de observación ${id} actualizado a ${updateDto.estado}`);
      return this.mapearObservacionCompleta(observacionActualizada);

    } catch (error) {
      this.logger.error(`Error al actualizar estado de observación ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el estado de la observación');
    }
  }

  /**
   * Permite a un docente responder a una observación
   * Incluye calificación y recomendaciones opcionales
   * @param responderDto - Datos de la respuesta
   * @param docenteId - ID del docente que responde
   * @returns Observación con la respuesta incorporada
   */
  async responderObservacion(
    responderDto: ResponderObservacionDto,
    docenteId: number
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Docente ${docenteId} respondiendo a observación ${responderDto.observacionId}`);

    const observacion = await this.obtenerObservacionPorId(responderDto.observacionId);

    if (observacion.estado === EstadoObservacion.FINALIZADO) {
      throw new BadRequestException('No se puede responder a una observación finalizada');
    }

    try {
      // Estructurar la respuesta
      let respuestaCompleta = `**Respuesta del docente:**\n${responderDto.respuesta}\n\n`;

      if (responderDto.calificacion) {
        respuestaCompleta += `**Calificación asignada:** ${responderDto.calificacion}/10\n\n`;
      }

      if (responderDto.recomendaciones && responderDto.recomendaciones.length > 0) {
        respuestaCompleta += `**Recomendaciones adicionales:**\n`;
        responderDto.recomendaciones.forEach(rec => {
          respuestaCompleta += `• ${rec}\n`;
        });
      }

      // Actualizar la observación agregando la respuesta
      const descripcionActualizada = observacion.descripcion + '\n\n---\n\n' + respuestaCompleta;

      const observacionActualizada = await this.prisma.observacion.update({
        where: { id: responderDto.observacionId },
        data: {
          descripcion: descripcionActualizada,
          docenteId: docenteId,
          estado: responderDto.finalizar ? EstadoObservacion.FINALIZADO : EstadoObservacion.REVISADO
        },
        include: this.getObservacionInclude()
      });

      this.logger.log(`Respuesta agregada a observación ${responderDto.observacionId}`);
      return this.mapearObservacionCompleta(observacionActualizada);

    } catch (error) {
      this.logger.error(`Error al responder observación ${responderDto.observacionId}: ${error.message}`);
      throw new BadRequestException('Error al responder la observación');
    }
  }

  /**
   * Completa una observación marcándola como finalizada
   * Registra resumen final y resultados obtenidos
   * @param completarDto - Datos de finalización
   * @returns Observación completada
   */
  async completarObservacion(
    completarDto: CompletarObservacionDto,
    usuarioId: number
  ): Promise<IObservacionCompleta> {
    this.logger.log(`Completando observación ${completarDto.observacionId}`);

    const observacion = await this.obtenerObservacionPorId(completarDto.observacionId);

    // Validar que puede ser completada
    if (observacion.estado === EstadoObservacion.FINALIZADO) {
      throw new BadRequestException('La observación ya está finalizada');
    }

    try {
      // Estructurar el resumen final
      let resumenCompleto = '\n\n---\n\n**RESUMEN FINAL:**\n';
      resumenCompleto += `${completarDto.resumenFinal}\n\n`;

      if (completarDto.resultados) {
        resumenCompleto += `**Resultados obtenidos:**\n${completarDto.resultados}\n\n`;
      }

      if (completarDto.leccionesAprendidas) {
        resumenCompleto += `**Lecciones aprendidas:**\n${completarDto.leccionesAprendidas}\n\n`;
      }

      resumenCompleto += `**Fecha de finalización:** ${new Date().toLocaleDateString()}`;

      const observacionActualizada = await this.prisma.observacion.update({
        where: { id: completarDto.observacionId },
        data: {
          descripcion: observacion.descripcion + resumenCompleto,
          estado: EstadoObservacion.FINALIZADO
        },
        include: this.getObservacionInclude()
      });

      this.logger.log(`Observación ${completarDto.observacionId} completada exitosamente`);
      return this.mapearObservacionCompleta(observacionActualizada);

    } catch (error) {
      this.logger.error(`Error al completar observación ${completarDto.observacionId}: ${error.message}`);
      throw new BadRequestException('Error al completar la observación');
    }
  }

  /**
   * Obtiene una observación específica por su ID
   * @param id - ID de la observación
   * @returns Observación completa con relaciones
   */
  async obtenerObservacionPorId(id: number): Promise<IObservacionCompleta> {
    this.logger.log(`Obteniendo observación por ID: ${id}`);

    const observacion = await this.prisma.observacion.findUnique({
      where: { id },
      include: this.getObservacionInclude()
    });

    if (!observacion) {
      throw new NotFoundException(`Observación con ID ${id} no encontrada`);
    }

    return this.mapearObservacionCompleta(observacion);
  }

  /**
   * Obtiene observaciones con filtros y paginación
   * @param filtros - Criterios de filtrado
   * @returns Resultado paginado de observaciones
   */
  async obtenerObservacionesConFiltros(filtros: FiltrosObservacionesDto): Promise<RespuestaPaginadaObservacionesDto> {
    this.logger.log(`Obteniendo observaciones con filtros: ${JSON.stringify(filtros)}`);

    const { pagina = 1, limite = 10, ordenarPor = 'fecha', direccion = 'desc', ...criterios } = filtros;
    const saltar = (pagina - 1) * limite;

    // Construir condiciones WHERE
    const where = this.buildWhereConditions(criterios);

    const [observaciones, total] = await Promise.all([
      this.prisma.observacion.findMany({
        where,
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true }
          },
          docente: {
            select: { id: true, nombre: true, apellido: true }
          },
          casoClinico: {
            select: { id: true, motivoConsulta: true }
          },
          tratamiento: {
            select: { id: true, descripcion: true }
          },
          prescripcion: {
            select: { id: true, medicamento: true }
          },
          odontograma: {
            select: { id: true }
          }
        },
        orderBy: { [this.mapOrderField(ordenarPor)]: direccion },
        skip: saltar,
        take: limite
      }),
      this.prisma.observacion.count({ where })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      data: observaciones.map(obs => this.mapearObservacionResumen(obs)),
      total,
      pagina,
      limite,
      totalPaginas,
      hayPaginaSiguiente: pagina < totalPaginas,
      hayPaginaAnterior: pagina > 1
    };
  }

  /**
   * Obtiene observaciones agrupadas por tipo de entidad
   * @param filtros - Filtros específicos para la búsqueda
   * @returns Observaciones organizadas por tipo de entidad
   */
  async obtenerObservacionesPorEntidad(filtros: FiltrosObservacionesDto): Promise<IObservacionesPorEntidad> {
    this.logger.log(`Obteniendo observaciones agrupadas por entidad`);

    const where = this.buildWhereConditions(filtros);

    const [casosClinicos, tratamientos, prescripciones, odontogramas] = await Promise.all([
      this.prisma.observacion.findMany({
        where: { ...where, casoClinicoId: { not: null } },
        include: this.getObservacionInclude(),
        orderBy: { fecha: 'desc' }
      }),
      this.prisma.observacion.findMany({
        where: { ...where, tratamientoId: { not: null } },
        include: this.getObservacionInclude(),
        orderBy: { fecha: 'desc' }
      }),
      this.prisma.observacion.findMany({
        where: { ...where, prescripcionId: { not: null } },
        include: this.getObservacionInclude(),
        orderBy: { fecha: 'desc' }
      }),
      this.prisma.observacion.findMany({
        where: { ...where, odontogramaId: { not: null } },
        include: this.getObservacionInclude(),
        orderBy: { fecha: 'desc' }
      })
    ]);

    return {
      casosClinicos: casosClinicos.map(obs => this.mapearObservacionCompleta(obs)),
      tratamientos: tratamientos.map(obs => this.mapearObservacionCompleta(obs)),
      prescripciones: prescripciones.map(obs => this.mapearObservacionCompleta(obs)),
      odontogramas: odontogramas.map(obs => this.mapearObservacionCompleta(obs)),
      total: casosClinicos.length + tratamientos.length + prescripciones.length + odontogramas.length
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS AUXILIARES
  // ===============================

  /**
   * Configuración estándar de include para observaciones
   */
  private getObservacionInclude() {
    return {
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
          apellido: true, 
          email: true 
        }
      },
      casoClinico: {
        select: { 
          id: true, 
          motivoConsulta: true,
          paciente: {
            select: { nombre: true, apellido: true }
          }
        }
      },
      tratamiento: {
        select: { 
          id: true, 
          nombre: true, 
          descripcion: true 
        }
      },
      prescripcion: {
        select: { 
          id: true, 
          medicamento: true, 
          dosis: true 
        }
      },
      odontograma: {
        select: { 
          id: true 
        }
      }
    };
  }

  /**
   * Mapea el resultado de Prisma a la interface IObservacionCompleta
   */
  private mapearObservacionCompleta(observacion: any): IObservacionCompleta {
    const tipoEntidad = this.determinarTipoEntidad(observacion);
    const entidadId = this.determinarEntidadId(observacion);

    return {
      id: observacion.id,
      titulo: observacion.titulo,
      descripcion: observacion.descripcion,
      fecha: observacion.fecha,
      estado: observacion.estado,
      estudianteId: observacion.estudianteId,
      docenteId: observacion.docenteId,
      casoClinicoId: observacion.casoClinicoId,
      tratamientoId: observacion.tratamientoId,
      prescripcionId: observacion.prescripcionId,
      odontogramaId: observacion.odontogramaId,
      tipoEntidad,
      entidadId,
      estudiante: observacion.estudiante,
      docente: observacion.docente,
      entidadRelacionada: this.mapearEntidadRelacionada(observacion, tipoEntidad)
    };
  }

  /**
   * Mapea una observación a su versión resumida para listados
   */
  private mapearObservacionResumen(observacion: any): IObservacionResumen {
    const tipoEntidad = this.determinarTipoEntidad(observacion);
    const entidadId = this.determinarEntidadId(observacion);
    const tituloEntidad = this.determinarTituloEntidad(observacion, tipoEntidad);

    return {
      id: observacion.id,
      titulo: observacion.titulo,
      fecha: observacion.fecha,
      estado: observacion.estado,
      nombreEstudiante: `${observacion.estudiante.nombre} ${observacion.estudiante.apellido}`,
      nombreDocente: observacion.docente ? `${observacion.docente.nombre} ${observacion.docente.apellido}` : undefined,
      tipoEntidad,
      entidadId,
      tituloEntidad
    };
  }

  /**
   * Determina el tipo de entidad relacionada con la observación
   */
  private determinarTipoEntidad(observacion: any): 'CASO_CLINICO' | 'TRATAMIENTO' | 'PRESCRIPCION' | 'ODONTOGRAMA' {
    if (observacion.casoClinicoId) return 'CASO_CLINICO';
    if (observacion.tratamientoId) return 'TRATAMIENTO';
    if (observacion.prescripcionId) return 'PRESCRIPCION';
    if (observacion.odontogramaId) return 'ODONTOGRAMA';
    throw new Error('Observación sin entidad relacionada válida');
  }

  /**
   * Determina el ID de la entidad relacionada
   */
  private determinarEntidadId(observacion: any): number {
    return observacion.casoClinicoId || observacion.tratamientoId || 
           observacion.prescripcionId || observacion.odontogramaId;
  }

  /**
   * Mapea la entidad relacionada con información básica
   */
  private mapearEntidadRelacionada(observacion: any, tipoEntidad: string): any {
    switch (tipoEntidad) {
      case 'CASO_CLINICO':
        return observacion.casoClinico ? {
          tipo: 'CASO_CLINICO',
          id: observacion.casoClinico.id,
          titulo: observacion.casoClinico.motivoConsulta,
          descripcion: `Paciente: ${observacion.casoClinico.paciente?.nombre} ${observacion.casoClinico.paciente?.apellido}`
        } : null;
      
      case 'TRATAMIENTO':
        return observacion.tratamiento ? {
          tipo: 'TRATAMIENTO',
          id: observacion.tratamiento.id,
          titulo: observacion.tratamiento.nombre,
          descripcion: observacion.tratamiento.descripcion
        } : null;
      
      case 'PRESCRIPCION':
        return observacion.prescripcion ? {
          tipo: 'PRESCRIPCION',
          id: observacion.prescripcion.id,
          titulo: observacion.prescripcion.medicamento,
          descripcion: `Dosis: ${observacion.prescripcion.dosis}`
        } : null;
      
      case 'ODONTOGRAMA':
        return observacion.odontograma ? {
          tipo: 'ODONTOGRAMA',
          id: observacion.odontograma.id,
          titulo: `Odontograma #${observacion.odontograma.id}`,
          descripcion: 'Observación de odontograma'
        } : null;
      
      default:
        return null;
    }
  }

  /**
   * Determina el título de la entidad para mostrar en resúmenes
   */
  private determinarTituloEntidad(observacion: any, tipoEntidad: string): string {
    switch (tipoEntidad) {
      case 'CASO_CLINICO':
        return observacion.casoClinico?.motivoConsulta || 'Caso clínico';
      case 'TRATAMIENTO':
        return observacion.tratamiento?.nombre || 'Tratamiento';
      case 'PRESCRIPCION':
        return observacion.prescripcion?.medicamento || 'Prescripción';
      case 'ODONTOGRAMA':
        return `Odontograma #${observacion.odontograma?.id || 'N/A'}`;
      default:
        return 'Entidad desconocida';
    }
  }

  /**
   * Construye las condiciones WHERE para filtros
   */
  private buildWhereConditions(criterios: any): any {
    const where: any = {};

    if (criterios.estudianteId) {
      where.estudianteId = criterios.estudianteId;
    }

    if (criterios.docenteId) {
      where.docenteId = criterios.docenteId;
    }

    if (criterios.estado) {
      where.estado = criterios.estado;
    }

    if (criterios.tipoEntidad) {
      switch (criterios.tipoEntidad) {
        case 'CASO_CLINICO':
          where.casoClinicoId = { not: null };
          break;
        case 'TRATAMIENTO':
          where.tratamientoId = { not: null };
          break;
        case 'PRESCRIPCION':
          where.prescripcionId = { not: null };
          break;
        case 'ODONTOGRAMA':
          where.odontogramaId = { not: null };
          break;
      }
    }

    if (criterios.entidadId && criterios.tipoEntidad) {
      switch (criterios.tipoEntidad) {
        case 'CASO_CLINICO':
          where.casoClinicoId = criterios.entidadId;
          break;
        case 'TRATAMIENTO':
          where.tratamientoId = criterios.entidadId;
          break;
        case 'PRESCRIPCION':
          where.prescripcionId = criterios.entidadId;
          break;
        case 'ODONTOGRAMA':
          where.odontogramaId = criterios.entidadId;
          break;
      }
    }

    if (criterios.fechaDesde || criterios.fechaHasta) {
      where.fecha = {};
      if (criterios.fechaDesde) {
        where.fecha.gte = new Date(criterios.fechaDesde);
      }
      if (criterios.fechaHasta) {
        where.fecha.lte = new Date(criterios.fechaHasta);
      }
    }

    if (criterios.busqueda) {
      where.OR = [
        { titulo: { contains: criterios.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: criterios.busqueda, mode: 'insensitive' } }
      ];
    }

    if (criterios.pendientesDeRespuesta === true) {
      where.AND = [
        { estado: { in: [EstadoObservacion.PENDIENTE, EstadoObservacion.REVISADO] } },
        { docenteId: null }
      ];
    }

    return where;
  }

  /**
   * Mapea los campos de ordenamiento
   */
  private mapOrderField(campo: string): string {
    const mappings: Record<string, string> = {
      'fecha': 'fecha',
      'titulo': 'titulo',
      'estado': 'estado',
      'estudiante': 'estudianteId',
      'docente': 'docenteId'
    };
    return mappings[campo] || 'fecha';
  }

  // Métodos de validación continuarán en la siguiente parte...
  // [El resto de métodos privados seguirían el mismo patrón]

  /**
   * Valida que solo una entidad esté relacionada con la observación
   */
  private async validarRelacionPolimorfica(createDto: CrearObservacionDto): Promise<void> {
    const entidadesRelacionadas = [
      createDto.casoClinicoId,
      createDto.tratamientoId,
      createDto.prescripcionId,
      createDto.odontogramaId
    ].filter(Boolean);

    if (entidadesRelacionadas.length === 0) {
      throw new BadRequestException('Debe especificar una entidad relacionada (caso clínico, tratamiento, prescripción u odontograma)');
    }

    if (entidadesRelacionadas.length > 1) {
      throw new BadRequestException('Solo puede especificar una entidad relacionada por observación');
    }
  }

  /**
   * Valida que las entidades relacionadas existan en la base de datos
   */
  private async validarEntidadesExisten(createDto: CrearObservacionDto): Promise<void> {
    // Validar estudiante
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: createDto.estudianteId }
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${createDto.estudianteId} no encontrado`);
    }

    // Validar docente si se proporciona
    if (createDto.docenteId) {
      const docente = await this.prisma.usuario.findUnique({
        where: { id: createDto.docenteId }
      });
      if (!docente) {
        throw new NotFoundException(`Docente con ID ${createDto.docenteId} no encontrado`);
      }
    }

    // Validar entidad relacionada
    if (createDto.casoClinicoId) {
      const casoClinico = await this.prisma.casoClinico.findUnique({
        where: { id: createDto.casoClinicoId }
      });
      if (!casoClinico) {
        throw new NotFoundException(`Caso clínico con ID ${createDto.casoClinicoId} no encontrado`);
      }
    }

    if (createDto.tratamientoId) {
      const tratamiento = await this.prisma.tratamiento.findUnique({
        where: { id: createDto.tratamientoId }
      });
      if (!tratamiento) {
        throw new NotFoundException(`Tratamiento con ID ${createDto.tratamientoId} no encontrado`);
      }
    }

    if (createDto.prescripcionId) {
      const prescripcion = await this.prisma.prescripcion.findUnique({
        where: { id: createDto.prescripcionId }
      });
      if (!prescripcion) {
        throw new NotFoundException(`Prescripción con ID ${createDto.prescripcionId} no encontrada`);
      }
    }

    if (createDto.odontogramaId) {
      const odontograma = await this.prisma.odontograma.findUnique({
        where: { id: createDto.odontogramaId }
      });
      if (!odontograma) {
        throw new NotFoundException(`Odontograma con ID ${createDto.odontogramaId} no encontrado`);
      }
    }
  }

  /**
   * Valida permisos de edición según el rol y propiedad
   */
  private async validarPermisosEdicion(
    observacion: IObservacionCompleta, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<void> {
    // Los profesores pueden editar cualquier observación
    if (rolUsuario === RoleEnum.PROFESOR || rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes solo pueden editar sus propias observaciones PENDIENTES
    if (rolUsuario === RoleEnum.ESTUDIANTE) {
      if (observacion.estudianteId !== usuarioId) {
        throw new ForbiddenException('Solo puedes editar tus propias observaciones');
      }
      if (observacion.estado !== EstadoObservacion.PENDIENTE) {
        throw new ForbiddenException('Solo puedes editar observaciones en estado PENDIENTE');
      }
      return;
    }

    throw new ForbiddenException('No tienes permisos para editar esta observación');
  }

  /**
   * Valida transiciones de estado permitidas
   */
  private async validarTransicionEstado(
    estadoActual: EstadoObservacion, 
    nuevoEstado: EstadoObservacion
  ): Promise<void> {
    const transicionesPermitidas: Record<EstadoObservacion, EstadoObservacion[]> = {
      [EstadoObservacion.PENDIENTE]: [
        EstadoObservacion.REVISADO,
        EstadoObservacion.FINALIZADO
      ],
      [EstadoObservacion.REVISADO]: [
        EstadoObservacion.FINALIZADO,
        EstadoObservacion.INCOMPLETO
      ],
      [EstadoObservacion.FINALIZADO]: [], // Estado final
      [EstadoObservacion.INCOMPLETO]: [
        EstadoObservacion.REVISADO,
        EstadoObservacion.FINALIZADO
      ]
    };

    const transicionesValidas = transicionesPermitidas[estadoActual] || [];

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`
      );
    }
  }

  /**
   * Valida permisos para cambio de estado
   */
  private async validarPermisosEstado(
    observacion: IObservacionCompleta, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<void> {
    // Los profesores pueden cambiar cualquier estado
    if (rolUsuario === RoleEnum.PROFESOR || rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes pueden finalizar sus propias observaciones
    if (rolUsuario === RoleEnum.ESTUDIANTE && observacion.estudianteId === usuarioId) {
      return;
    }

    throw new ForbiddenException('No tienes permisos para cambiar el estado de esta observación');
  }

  /**
   * Registra un comentario sobre el cambio de estado
   */
  private async registrarComentarioEstado(
    observacionId: number,
    estadoAnterior: EstadoObservacion,
    estadoNuevo: EstadoObservacion,
    comentario: string,
    usuarioId: number
  ): Promise<void> {
    this.logger.log(
      `Cambio de estado registrado - Observación: ${observacionId}, ` +
      `${estadoAnterior} -> ${estadoNuevo}, Usuario: ${usuarioId}`
    );

    // En un sistema más complejo, esto podría crear un registro de auditoría
    // Por ahora, simplemente logueamos el cambio
  }
}
