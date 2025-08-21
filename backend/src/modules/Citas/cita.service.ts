/**
 * Servicio de Citas Médicas
 * 
 * Contiene toda la lógica de negocio para la gestión de citas médicas/odontológicas
 * en el sistema académico. Maneja operaciones CRUD, verificación de disponibilidad,
 * gestión de estados y conflictos de horarios.
 * 
 * @fileoverview Servicio para la gestión de citas médicas
 * @module CitaService
 * @requires Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException
 */

import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HorarioUtil } from '../../common/utils/horario.util';
import { DiaSemana } from '@prisma/client';
import { 
  CrearCitaDto, 
  ActualizarCitaDto, 
  FiltrosCitasDto,
  ConsultarDisponibilidadDto,
  EstadisticasCitasDto,
  CambiarEstadoMasivoCitasDto,
  EstadoCita 
} from './DTO';
import { 
  ICita, 
  ICitaCompleta, 
  IRespuestaPaginadaCitas, 
  IEstadisticasCitas,
  IAccesoCita,
  IRespuestaDisponibilidad,
  IVerificacionConflicto
} from './Interface';

/**
 * Servicio para gestión de citas médicas
 * 
 * Proporciona métodos para crear, leer, actualizar y eliminar citas médicas,
 * así como funcionalidades avanzadas de verificación de disponibilidad,
 * gestión de conflictos y estadísticas.
 * 
 * @example
 * ```typescript
 * const cita = await citaService.crearCita({
 *   pacienteId: 1,
 *   estudianteId: 2,
 *   especialidadId: 1,
 *   fecha: '2025-01-15',
 *   horaInicio: '09:00',
 *   horaFin: '10:00'
 * }, usuarioId);
 * ```
 */
@Injectable()
export class CitaService {
  private readonly logger = new Logger(CitaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva cita médica
   * 
   * Valida disponibilidad del estudiante, existencia de entidades relacionadas
   * y verifica que no haya conflictos de horario antes de crear la cita.
   * 
   * @param datos - Datos de la cita a crear
   * @param usuarioId - ID del usuario que crea la cita
   * @returns Promise<ICita> - Cita creada
   * @throws NotFoundException - Si alguna entidad relacionada no existe
   * @throws BadRequestException - Si hay conflictos de horario o datos inválidos
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async crearCita(datos: CrearCitaDto, usuarioId: number): Promise<ICita> {
    this.logger.log(`Creando cita para paciente ${datos.pacienteId} con estudiante ${datos.estudianteId} por usuario ${usuarioId}`);

    // Validar que las entidades relacionadas existen
    await this.validarEntidadesRelacionadas(datos);

    // Validar horarios
    HorarioUtil.validarRangoHorarios(datos.horaInicio, datos.horaFin, 30, 240);

    // Crear fecha y hora completas
    const fechaCita = new Date(datos.fecha);
    const horaInicio = HorarioUtil.crearFechaHora(datos.fecha, datos.horaInicio);
    const horaFin = HorarioUtil.crearFechaHora(datos.fecha, datos.horaFin);

    // Verificar disponibilidad del estudiante
    const disponibilidad = await this.verificarDisponibilidadEstudiante(
      datos.estudianteId, 
      fechaCita, 
      datos.horaInicio, 
      datos.horaFin
    );

    if (!disponibilidad.disponible) {
      throw new BadRequestException(`Estudiante no disponible: ${disponibilidad.motivo}`);
    }

    // Verificar conflictos de horario
    const conflicto = await this.verificarConflictosHorario(
      datos.estudianteId,
      horaInicio,
      horaFin
    );

    if (conflicto.hayConflicto) {
      throw new BadRequestException(`Conflicto de horario: ${conflicto.motivo}`);
    }

    try {
      const nuevaCita = await this.prisma.cita.create({
        data: {
          fecha: fechaCita,
          estado: EstadoCita.RESERVADA,
          observaciones: datos.observaciones,
          pacienteId: datos.pacienteId,
          especialidadId: datos.especialidadId,
          estudianteId: datos.estudianteId,
          docenteId: datos.docenteId,
          horainicio: horaInicio,
          horafin: horaFin
        }
      });

      this.logger.log(`Cita creada exitosamente con ID: ${nuevaCita.id}`);
      return nuevaCita;
    } catch (error) {
      this.logger.error(`Error al crear cita: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la cita médica');
    }
  }

  /**
   * Obtener citas con filtros y paginación
   * 
   * Permite filtrar citas por paciente, estudiante, fecha, estado, etc.
   * y devuelve resultados paginados con información relacionada.
   * 
   * @param filtros - Criterios de filtrado y paginación
   * @param usuarioId - ID del usuario que consulta
   * @returns Promise<IRespuestaPaginadaCitas> - Resultados paginados
   */
  async obtenerCitas(
    filtros: FiltrosCitasDto,
    usuarioId: number
  ): Promise<IRespuestaPaginadaCitas> {
    this.logger.log(`Obteniendo citas con filtros para usuario ${usuarioId}`);

    const página = filtros.página || 1;
    const límite = Math.min(filtros.límite || 10, 100);
    const saltar = (página - 1) * límite;

    // Construir condiciones WHERE
    const where: any = {};

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }

    if (filtros.estudianteId) {
      where.estudianteId = filtros.estudianteId;
    }

    if (filtros.docenteId) {
      where.docenteId = filtros.docenteId;
    }

    if (filtros.especialidadId) {
      where.especialidadId = filtros.especialidadId;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    // Filtros de fecha
    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.fecha = {};
      if (filtros.fechaDesde && filtros.fechaDesde.trim() !== '') {
        where.fecha.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta && filtros.fechaHasta.trim() !== '') {
        where.fecha.lte = new Date(filtros.fechaHasta + 'T23:59:59.999Z');
      }
    }

    // Filtros de hora
    if (filtros.horaDesde || filtros.horaHasta) {
      const condicionesHora = [];
      
        if (filtros.horaDesde) {
        condicionesHora.push({
          horainicio: {
            gte: HorarioUtil.crearFechaHora('2000-01-01', filtros.horaDesde)
          }
        });
      }
      
      if (filtros.horaHasta) {
        condicionesHora.push({
          horafin: {
            lte: HorarioUtil.crearFechaHora('2000-01-01', filtros.horaHasta)
          }
        });
      }      if (condicionesHora.length > 0) {
        where.AND = condicionesHora;
      }
    }

    // Búsqueda en observaciones
    if (filtros.busqueda) {
      where.observaciones = {
        contains: filtros.busqueda,
        mode: 'insensitive'
      };
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    const campo = filtros.ordenarPor || 'fecha';
    const dirección = filtros.dirección || 'asc';
    
    if (campo === 'horaInicio') {
      orderBy.horainicio = dirección;
    } else {
      orderBy[campo] = dirección;
    }

    try {
      // Ejecutar consultas en paralelo
      const [citas, total] = await Promise.all([
        this.prisma.cita.findMany({
          where,
          include: {
            paciente: {
              select: { 
                id: true, 
                nombre: true, 
                apellido: true, 
                email: true, 
                telefono: true,
                numeroDocumento: true,
                fechaNacimiento: true
              }
            },
            estudiante: {
              select: { 
                id: true, 
                nombre: true, 
                apellido: true, 
                email: true, 
                telefono: true 
              }
            },
            docente: {
              select: { 
                id: true, 
                nombre: true, 
                apellido: true, 
                email: true, 
                telefono: true 
              }
            },
            especialidad: {
              select: { 
                id: true, 
                nombre: true, 
                descripcion: true 
              }
            }
          },
          orderBy,
          skip: saltar,
          take: límite
        }),
        this.prisma.cita.count({ where })
      ]);

      const totalPáginas = Math.ceil(total / límite);

      this.logger.log(`Encontradas ${total} citas, mostrando página ${página} de ${totalPáginas}`);

      return {
        citas,
        paginación: {
          total,
          página,
          límite,
          totalPáginas
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener citas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las citas');
    }
  }

  /**
   * Obtener una cita por ID
   * 
   * Busca una cita específica por su ID y verifica permisos de acceso.
   * 
   * @param id - ID de la cita a buscar
   * @param usuarioId - ID del usuario que consulta
   * @returns Promise<ICitaCompleta> - Cita con relaciones completas
   * @throws NotFoundException - Si la cita no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async obtenerCitaPorId(id: number, usuarioId: number): Promise<ICitaCompleta> {
    this.logger.log(`Obteniendo cita ${id} para usuario ${usuarioId}`);

    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          select: { 
            id: true, 
            nombre: true, 
            apellido: true, 
            email: true, 
            telefono: true,
            numeroDocumento: true,
            fechaNacimiento: true
          }
        },
        estudiante: {
          select: { 
            id: true, 
            nombre: true, 
            apellido: true, 
            email: true, 
            telefono: true 
          }
        },
        docente: {
          select: { 
            id: true, 
            nombre: true, 
            apellido: true, 
            email: true, 
            telefono: true 
          }
        },
        especialidad: {
          select: { 
            id: true, 
            nombre: true, 
            descripcion: true 
          }
        }
      }
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    // Verificar permisos de acceso
    const tieneAcceso = await this.verificarAccesoCita(id, usuarioId);
    if (!tieneAcceso.tieneAcceso) {
      throw new ForbiddenException(tieneAcceso.motivo);
    }

    return cita as ICitaCompleta;
  }

  /**
   * Actualizar una cita existente
   * 
   * Permite modificar campos específicos de una cita,
   * incluyendo reagendamiento y cambio de estado.
   * 
   * @param id - ID de la cita a actualizar
   * @param datos - Datos a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @returns Promise<ICita> - Cita actualizada
   * @throws NotFoundException - Si la cita no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   * @throws BadRequestException - Si hay conflictos o datos inválidos
   */
  async actualizarCita(
    id: number,
    datos: ActualizarCitaDto,
    usuarioId: number
  ): Promise<ICita> {
    this.logger.log(`Actualizando cita ${id} por usuario ${usuarioId}`);

    // Verificar que la cita existe
    const citaExistente = await this.prisma.cita.findUnique({
      where: { id }
    });

    if (!citaExistente) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    // Verificar permisos de edición
    const accesoInfo = await this.verificarAccesoCita(id, usuarioId);
    if (!accesoInfo.permisos.editar) {
      throw new ForbiddenException('No tiene permisos para editar esta cita');
    }

    // Preparar datos de actualización
    const datosActualizacion: any = {};

    // Si se cambia fecha/hora, verificar disponibilidad
    if (datos.fecha || datos.horaInicio || datos.horaFin) {
      const fechaFinal = datos.fecha || citaExistente.fecha.toISOString().split('T')[0];
      const horaInicioFinal = datos.horaInicio || HorarioUtil.extraerHora(citaExistente.horainicio);
      const horaFinFinal = datos.horaFin || HorarioUtil.extraerHora(citaExistente.horafin);

      // Validar horarios
      HorarioUtil.validarRangoHorarios(horaInicioFinal, horaFinFinal, 30, 240);

      // Crear fechas completas
      const nuevaHoraInicio = HorarioUtil.crearFechaHora(fechaFinal, horaInicioFinal);
      const nuevaHoraFin = HorarioUtil.crearFechaHora(fechaFinal, horaFinFinal);

      // Verificar conflictos (excluyendo la cita actual)
      const conflicto = await this.verificarConflictosHorario(
        citaExistente.estudianteId,
        nuevaHoraInicio,
        nuevaHoraFin,
        id
      );

      if (conflicto.hayConflicto) {
        throw new BadRequestException(`Conflicto de horario: ${conflicto.motivo}`);
      }

      datosActualizacion.fecha = new Date(fechaFinal);
      datosActualizacion.horainicio = nuevaHoraInicio;
      datosActualizacion.horafin = nuevaHoraFin;
    }

    // Otros campos a actualizar
    if (datos.estado !== undefined) {
      datosActualizacion.estado = datos.estado;
      
      // Si se cancela o marca como no asistió, liberar el horario
      if (datos.estado === EstadoCita.CANCELADA || datos.estado === EstadoCita.NO_ASISTIO) {
        this.logger.log(`Liberando horario de cita ${id} por cambio de estado a ${datos.estado}`);
      }
    }

    if (datos.observaciones !== undefined) {
      datosActualizacion.observaciones = datos.observaciones;
    }

    if (datos.docenteId !== undefined) {
      datosActualizacion.docenteId = datos.docenteId;
    }

    try {
      const citaActualizada = await this.prisma.cita.update({
        where: { id },
        data: datosActualizacion
      });

      this.logger.log(`Cita ${id} actualizada exitosamente`);
      return citaActualizada;
    } catch (error) {
      this.logger.error(`Error al actualizar cita: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la cita');
    }
  }

  /**
   * Cancelar una cita
   * 
   * Cambia el estado de la cita a CANCELADA, liberando
   * el horario para nuevas citas.
   * 
   * @param id - ID de la cita a cancelar
   * @param motivo - Motivo de la cancelación
   * @param usuarioId - ID del usuario que cancela
   * @returns Promise<ICita> - Cita cancelada
   */
  async cancelarCita(id: number, motivo: string, usuarioId: number): Promise<ICita> {
    this.logger.log(`Cancelando cita ${id} por usuario ${usuarioId}`);

    return await this.actualizarCita(id, {
      estado: EstadoCita.CANCELADA,
      observaciones: motivo
    }, usuarioId);
  }

  /**
   * Consultar disponibilidad de un estudiante
   * 
   * Obtiene los horarios disponibles de un estudiante
   * en una fecha específica, considerando sus citas existentes.
   * 
   * @param datos - Parámetros de consulta de disponibilidad
   * @returns Promise<IRespuestaDisponibilidad> - Información de disponibilidad
   */
  async consultarDisponibilidad(datos: ConsultarDisponibilidadDto): Promise<IRespuestaDisponibilidad> {
    this.logger.log(`Consultando disponibilidad del estudiante ${datos.estudianteId} para fecha ${datos.fecha}`);

    // Obtener información del estudiante
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: datos.estudianteId },
      select: { nombre: true, apellido: true, email: true }
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${datos.estudianteId} no encontrado`);
    }

    // Determinar día de la semana
    const fecha = new Date(datos.fecha);
    const diaSemana = HorarioUtil.obtenerDiaSemana(fecha);

    // Obtener disponibilidad configurada
    const disponibilidades = await this.prisma.disponibilidad.findMany({
      where: {
        usuarioId: datos.estudianteId,
        dia: diaSemana
      }
    });

    // Obtener citas existentes para esa fecha
    const citasExistentes = await this.prisma.cita.findMany({
      where: {
        estudianteId: datos.estudianteId,
        fecha: {
          gte: new Date(datos.fecha + 'T00:00:00.000Z'),
          lte: new Date(datos.fecha + 'T23:59:59.999Z')
        },
        estado: {
          in: [EstadoCita.RESERVADA, EstadoCita.FINALIZADA]
        }
      },
      include: {
        paciente: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    // Calcular horarios disponibles
    const horariosDisponibles = this.calcularHorariosDisponibles(
      disponibilidades,
      citasExistentes
    );

    return {
      fecha: datos.fecha,
      estudianteId: datos.estudianteId,
      estudiante,
      diaSemana,
      tieneDisponibilidad: disponibilidades.length > 0,
      horariosConfigurados: disponibilidades.map(d => ({
        horaInicio: d.horaInicio,
        horaFin: d.horaFin
      })),
      citasExistentes: citasExistentes.map(c => ({
        horaInicio: HorarioUtil.extraerHora(c.horainicio),
        horaFin: HorarioUtil.extraerHora(c.horafin),
        estado: c.estado,
        paciente: `${c.paciente.nombre} ${c.paciente.apellido}`
      })),
      horariosDisponibles
    };
  }

  /**
   * Obtener estadísticas básicas de citas
   * 
   * Calcula y devuelve estadísticas generales del sistema
   * de citas médicas.
   * 
   * @returns Promise<IEstadisticasCitas> - Estadísticas del sistema
   */
  async obtenerEstadisticasBasicas(): Promise<IEstadisticasCitas> {
    this.logger.log('Calculando estadísticas básicas de citas');

    try {
      // Obtener totales básicos
      const [
        totalCitas,
        distribuciones,
        especialidades,
        estudiantesActivos
      ] = await Promise.all([
        this.prisma.cita.count(),
        this.prisma.cita.groupBy({
          by: ['estado'],
          _count: { estado: true }
        }),
        this.prisma.cita.groupBy({
          by: ['especialidadId'],
          _count: { especialidadId: true },
          orderBy: { _count: { especialidadId: 'desc' } }
        }),
        this.prisma.cita.groupBy({
          by: ['estudianteId'],
          _count: { estudianteId: true },
          _avg: { id: true },
          orderBy: { _count: { estudianteId: 'desc' } },
          take: 10
        })
      ]);

      // Procesar distribución por estado
      const porEstado: Record<string, number> = {};
      distribuciones.forEach(item => {
        porEstado[item.estado] = item._count.estado;
      });

      // Obtener nombres de especialidades
      const especialidadIds = especialidades.map(e => e.especialidadId);
      const especialidadInfo = await this.prisma.especialidad.findMany({
        where: { id: { in: especialidadIds } },
        select: { id: true, nombre: true }
      });

      const porEspecialidad: Record<string, number> = {};
      especialidades.forEach(item => {
        const esp = especialidadInfo.find(e => e.id === item.especialidadId);
        if (esp) {
          porEspecialidad[esp.nombre] = item._count.especialidadId;
        }
      });

      // Calcular métricas
      const citasCanceladas = porEstado[EstadoCita.CANCELADA] || 0;
      const citasNoAsistio = porEstado[EstadoCita.NO_ASISTIO] || 0;
      const tasaCancelacion = totalCitas > 0 ? (citasCanceladas / totalCitas) * 100 : 0;
      const tasaNoAsistencia = totalCitas > 0 ? (citasNoAsistio / totalCitas) * 100 : 0;

      // Calcular promedio por día (últimos 30 días)
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 30);
      
      const citasUltimos30Dias = await this.prisma.cita.count({
        where: {
          fecha: { gte: fechaInicio }
        }
      });
      
      const promedioPorDia = citasUltimos30Dias / 30;

      // Obtener horarios más solicitados
      const horariosDistribucion = await this.prisma.cita.findMany({
        select: { horainicio: true },
        take: 1000 // Muestra representativa
      });

      const conteoHorarios: Record<string, number> = {};
      horariosDistribucion.forEach(cita => {
        const hora = HorarioUtil.extraerHora(cita.horainicio);
        conteoHorarios[hora] = (conteoHorarios[hora] || 0) + 1;
      });

      const horariosMasSolicitados = Object.entries(conteoHorarios)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([hora, cantidad]) => ({
          hora,
          cantidad,
          porcentaje: (cantidad / horariosDistribucion.length) * 100
        }));

      return {
        totalCitas,
        porEstado,
        porEspecialidad,
        promedioPorDia: Number(promedioPorDia.toFixed(2)),
        tasaCancelacion: Number(tasaCancelacion.toFixed(2)),
        tasaNoAsistencia: Number(tasaNoAsistencia.toFixed(2)),
        horariosMasSolicitados,
        estudiantesMasActivos: [], // TODO: Implementar con más detalle
        especialidadesMasDemandadas: [] // TODO: Implementar con más detalle
      };
    } catch (error) {
      this.logger.error(`Error al calcular estadísticas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las estadísticas');
    }
  }

  /**
   * Cambiar estado masivo de citas
   * 
   * Permite cambiar el estado de múltiples citas simultáneamente,
   * útil para cancelaciones masivas o operaciones administrativas.
   * 
   * @param datos - IDs de citas y nuevo estado
   * @param usuarioId - ID del usuario que realiza el cambio
   * @returns Promise<number> - Cantidad de citas actualizadas
   */
  async cambiarEstadoMasivo(
    datos: CambiarEstadoMasivoCitasDto,
    usuarioId: number
  ): Promise<number> {
    this.logger.log(`Cambiando estado masivo de ${datos.citaIds.length} citas a ${datos.nuevoEstado} por usuario ${usuarioId}`);

    try {
      const resultado = await this.prisma.cita.updateMany({
        where: {
          id: { in: datos.citaIds }
        },
        data: {
          estado: datos.nuevoEstado,
          observaciones: datos.motivo
        }
      });

      this.logger.log(`${resultado.count} citas actualizadas exitosamente`);
      return resultado.count;
    } catch (error) {
      this.logger.error(`Error al cambiar estado masivo: ${error.message}`, error.stack);
      throw new BadRequestException('Error al cambiar el estado de las citas');
    }
  }

  // MÉTODOS PRIVADOS DE UTILIDAD

  /**
   * Validar que las entidades relacionadas existen
   * 
   * @private
   */
  private async validarEntidadesRelacionadas(datos: CrearCitaDto): Promise<void> {
    const [paciente, estudiante, especialidad, docente] = await Promise.all([
      this.prisma.paciente.findUnique({ where: { id: datos.pacienteId } }),
      this.prisma.usuario.findUnique({ where: { id: datos.estudianteId } }),
      this.prisma.especialidad.findUnique({ where: { id: datos.especialidadId } }),
      datos.docenteId ? this.prisma.usuario.findUnique({ where: { id: datos.docenteId } }) : null
    ]);

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${datos.pacienteId} no encontrado`);
    }

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${datos.estudianteId} no encontrado`);
    }

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${datos.especialidadId} no encontrada`);
    }

    if (datos.docenteId && !docente) {
      throw new NotFoundException(`Docente con ID ${datos.docenteId} no encontrado`);
    }
  }

  /**
   * Verificar disponibilidad del estudiante
   * 
   * @private
   */
  private async verificarDisponibilidadEstudiante(
    estudianteId: number,
    fecha: Date,
    horaInicio: string,
    horaFin: string
  ): Promise<{ disponible: boolean; motivo?: string }> {
    const diaSemana = HorarioUtil.obtenerDiaSemana(fecha);
    
    const disponibilidad = await this.prisma.disponibilidad.findFirst({
      where: {
        usuarioId: estudianteId,
        dia: diaSemana
      }
    });

    if (!disponibilidad) {
      return {
        disponible: false,
        motivo: `Estudiante no trabaja los ${diaSemana.toLowerCase()}`
      };
    }

    const inicioMinutos = HorarioUtil.convertirHoraAMinutos(horaInicio);
    const finMinutos = HorarioUtil.convertirHoraAMinutos(horaFin);
    const dispInicioMinutos = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaInicio);
    const dispFinMinutos = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaFin);

    if (inicioMinutos < dispInicioMinutos || finMinutos > dispFinMinutos) {
      return {
        disponible: false,
        motivo: `Horario fuera del rango de disponibilidad (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
      };
    }

    return { disponible: true };
  }

  /**
   * Verificar conflictos de horario
   * 
   * @private
   */
  private async verificarConflictosHorario(
    estudianteId: number,
    horaInicio: Date,
    horaFin: Date,
    excluirCitaId?: number
  ): Promise<IVerificacionConflicto> {
    const where: any = {
      estudianteId,
      estado: {
        in: [EstadoCita.RESERVADA, EstadoCita.FINALIZADA]
      },
      OR: [
        {
          AND: [
            { horainicio: { lt: horaFin } },
            { horafin: { gt: horaInicio } }
          ]
        }
      ]
    };

    if (excluirCitaId) {
      where.id = { not: excluirCitaId };
    }

    const citasConflictivas = await this.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: { nombre: true, apellido: true }
        }
      }
    });

    if (citasConflictivas.length > 0) {
      return {
        hayConflicto: true,
        motivo: 'Ya existe una cita en este horario',
        citasConflictivas: citasConflictivas.map(c => ({
          id: c.id,
          horaInicio: HorarioUtil.extraerHora(c.horainicio),
          horaFin: HorarioUtil.extraerHora(c.horafin),
          estado: c.estado,
          paciente: `${c.paciente.nombre} ${c.paciente.apellido}`
        }))
      };
    }

    return { hayConflicto: false };
  }

  /**
   * Calcular horarios disponibles
   * 
   * @private
   */
  private calcularHorariosDisponibles(disponibilidades: any[], citasExistentes: any[]): any[] {
    // Implementación simplificada
    // TODO: Implementar lógica completa de cálculo de slots disponibles
    return [];
  }

  /**
   * Verificar acceso de usuario a una cita
   * 
   * @private
   */
  private async verificarAccesoCita(citaId: number, usuarioId: number): Promise<IAccesoCita> {
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        estudiante: true,
        docente: true
      }
    });

    if (!cita) {
      return {
        tieneAcceso: false,
        motivo: 'Cita no encontrada',
        permisos: {
          leer: false,
          editar: false,
          cancelar: false,
          reagendar: false,
          cambiarEstado: false
        }
      };
    }

    const esEstudiante = cita.estudianteId === usuarioId;
    const esDocente = cita.docenteId === usuarioId;

    if (!esEstudiante && !esDocente) {
      return {
        tieneAcceso: false,
        motivo: 'No tiene permisos para acceder a esta cita',
        permisos: {
          leer: false,
          editar: false,
          cancelar: false,
          reagendar: false,
          cambiarEstado: false
        }
      };
    }

    const rolEnCita = esEstudiante ? 'estudiante' : 'docente';
    
    return {
      tieneAcceso: true,
      motivo: `Acceso autorizado como ${rolEnCita}`,
      rolEnCita: rolEnCita as 'estudiante' | 'docente',
      permisos: {
        leer: true,
        editar: true,
        cancelar: true,
        reagendar: esDocente, // Solo docente puede reagendar
        cambiarEstado: esDocente // Solo docente puede cambiar estado final
      }
    };
  }
}
