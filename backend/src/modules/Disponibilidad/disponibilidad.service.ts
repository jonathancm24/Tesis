/**
 * Servicio de Disponibilidad
 * 
 * Maneja toda la lógica de negocio para la gestión de disponibilidad
 * horaria de estudiantes en el sistema académico. Permite crear, consultar,
 * actualizar y validar horarios de disponibilidad, asegurando que los
 * secretarios solo puedan asignar citas en horarios configurados.
 * 
 * @fileoverview Servicio de lógica de negocio para disponibilidad
 * @module DisponibilidadService
 * @requires NestJS, Prisma, DTOs, Interfaces
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DiaSemana } from '@prisma/client';
import { HorarioUtil } from '../../common/utils/horario.util';
import {
  CrearDisponibilidadDto,
  ActualizarDisponibilidadDto,
  FiltrosDisponibilidadDto,
  CrearDisponibilidadMasivaDto,
  ConsultarDisponibilidadEspecificaDto,
  RespuestaPaginadaDisponibilidadDto,
  EstadisticasDisponibilidadDto
} from './DTO';
import {
  IDisponibilidad,
  IDisponibilidadCompleta,
  IRespuestaConsultaDisponibilidad,
  IResultadoCreacionMasiva,
  IResultadoValidacionHorario,
  ISlotTiempo,
  IRespuestaSlotsDisponibles
} from './Interface';

/**
 * Servicio de Disponibilidad
 * 
 * Proporciona métodos para gestionar la disponibilidad horaria de estudiantes,
 * incluyendo validaciones de negocio, detección de conflictos y consultas
 * optimizadas para el sistema de citas.
 * 
 * @class DisponibilidadService
 */
@Injectable()
export class DisponibilidadService {
  private readonly logger = new Logger(DisponibilidadService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nueva disponibilidad horaria
   * 
   * Crea una nueva disponibilidad validando que no existan conflictos
   * de horario y que el usuario esté autorizado.
   * 
   * @param crearDisponibilidadDto - Datos de la disponibilidad a crear
   * @param usuarioAutenticadoId - ID del usuario que realiza la operación
   * @returns Promise<IDisponibilidad> - Disponibilidad creada
   * 
   * @throws {NotFoundException} - Usuario no encontrado
   * @throws {BadRequestException} - Datos inválidos o horario incorrecto
   * @throws {ConflictException} - Conflicto de horarios
   * @throws {ForbiddenException} - Sin permisos para crear disponibilidad
   */
  async crearDisponibilidad(
    crearDisponibilidadDto: CrearDisponibilidadDto,
    usuarioAutenticadoId: number
  ): Promise<IDisponibilidad> {
    this.logger.log(`Creando disponibilidad para usuario ${crearDisponibilidadDto.usuarioId || usuarioAutenticadoId}`);

    const usuarioId = crearDisponibilidadDto.usuarioId || usuarioAutenticadoId;

    // Validar que el usuario existe y está activo
    await this.validarUsuarioExiste(usuarioId);

    // Validar permisos: solo el propio usuario o administradores pueden crear
    await this.validarPermisosUsuario(usuarioId, usuarioAutenticadoId);

    // Validar formato y lógica de horarios
    HorarioUtil.validarRangoHorarios(crearDisponibilidadDto.horaInicio, crearDisponibilidadDto.horaFin);

    // Verificar conflictos con disponibilidades existentes
    await this.verificarConflictosHorario({
      dia: crearDisponibilidadDto.dia,
      horaInicio: crearDisponibilidadDto.horaInicio,
      horaFin: crearDisponibilidadDto.horaFin,
      usuarioId: usuarioId
    });

    try {
      const nuevaDisponibilidad = await this.prisma.disponibilidad.create({
        data: {
          dia: crearDisponibilidadDto.dia,
          horaInicio: crearDisponibilidadDto.horaInicio,
          horaFin: crearDisponibilidadDto.horaFin,
          usuarioId: usuarioId
        }
      });

      this.logger.log(`Disponibilidad creada exitosamente con ID ${nuevaDisponibilidad.id}`);

      return nuevaDisponibilidad;
    } catch (error) {
      this.logger.error(`Error al crear disponibilidad: ${error.message}`);
      throw new BadRequestException('Error al crear la disponibilidad');
    }
  }

  /**
   * Obtener disponibilidades con filtros y paginación
   * 
   * Consulta disponibilidades aplicando filtros múltiples y paginación.
   * 
   * @param filtros - Criterios de filtrado y paginación
   * @param usuarioAutenticadoId - ID del usuario que consulta
   * @returns Promise<RespuestaPaginadaDisponibilidadDto> - Lista paginada
   */
  async obtenerDisponibilidades(
    filtros: FiltrosDisponibilidadDto,
    usuarioAutenticadoId: number
  ): Promise<RespuestaPaginadaDisponibilidadDto> {
    this.logger.log(`Consultando disponibilidades con filtros para usuario ${usuarioAutenticadoId}`);

    const {
      usuarioId,
      dia,
      dias,
      horaMinima,
      horaMaxima,
      soloActivas = true,
      incluirUsuario = false,
      página = 1,
      límite = 10,
      ordenarPor = 'dia',
      dirección = 'asc'
    } = filtros;

    // Construir condiciones de filtrado
    const where: any = {};

    // Filtro por usuario específico
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    // Filtro por día específico
    if (dia) {
      where.dia = dia;
    }

    // Filtro por múltiples días
    if (dias && dias.length > 0) {
      where.dia = { in: dias };
    }

    // Filtros de rango horario
    if (horaMinima || horaMaxima) {
      where.AND = [];
      
      if (horaMinima) {
        where.AND.push({
          horaInicio: { gte: horaMinima }
        });
      }
      
      if (horaMaxima) {
        where.AND.push({
          horaFin: { lte: horaMaxima }
        });
      }
    }

    // Solo usuarios activos (si se especifica)
    if (soloActivas) {
      where.usuario = {
        activo: true
      };
    }

    // Configurar inclusión de datos relacionados
    const include: any = {};
    if (incluirUsuario) {
      include.usuario = {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          activo: true
        }
      };
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    if (ordenarPor === 'usuario') {
      orderBy.usuario = { nombre: dirección };
    } else {
      orderBy[ordenarPor] = dirección;
    }

    try {
      // Calcular offset para paginación
      const offset = (página - 1) * límite;

      // Ejecutar consulta con paginación
      const [disponibilidades, total] = await Promise.all([
        this.prisma.disponibilidad.findMany({
          where,
          include,
          orderBy,
          skip: offset,
          take: límite
        }),
        this.prisma.disponibilidad.count({ where })
      ]);

      // Calcular metadatos de paginación
      const totalPáginas = Math.ceil(total / límite);
      const tieneSiguiente = página < totalPáginas;
      const tieneAnterior = página > 1;

      this.logger.log(`Consulta completada: ${disponibilidades.length} disponibilidades de ${total} total`);

      return {
        disponibilidades,
        total,
        página,
        límite,
        totalPáginas,
        tieneSiguiente,
        tieneAnterior
      };
    } catch (error) {
      this.logger.error(`Error al consultar disponibilidades: ${error.message}`);
      throw new BadRequestException('Error al consultar las disponibilidades');
    }
  }

  /**
   * Obtener disponibilidad por ID
   * 
   * Busca una disponibilidad específica verificando permisos de acceso.
   * 
   * @param id - ID de la disponibilidad
   * @param usuarioAutenticadoId - ID del usuario que consulta
   * @returns Promise<IDisponibilidadCompleta> - Disponibilidad completa
   * 
   * @throws {NotFoundException} - Disponibilidad no encontrada
   * @throws {ForbiddenException} - Sin permisos de acceso
   */
  async obtenerDisponibilidadPorId(
    id: number,
    usuarioAutenticadoId: number
  ): Promise<IDisponibilidadCompleta> {
    this.logger.log(`Consultando disponibilidad ${id} para usuario ${usuarioAutenticadoId}`);

    const disponibilidad = await this.prisma.disponibilidad.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            activo: true
          }
        }
      }
    });

    if (!disponibilidad) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }

    // Validar permisos de acceso
    await this.validarPermisosAcceso(disponibilidad.usuarioId, usuarioAutenticadoId);

    return disponibilidad;
  }

  /**
   * Actualizar disponibilidad existente
   * 
   * Modifica una disponibilidad validando permisos y conflictos.
   * 
   * @param id - ID de la disponibilidad a actualizar
   * @param actualizarDisponibilidadDto - Datos a actualizar
   * @param usuarioAutenticadoId - ID del usuario que actualiza
   * @returns Promise<IDisponibilidad> - Disponibilidad actualizada
   * 
   * @throws {NotFoundException} - Disponibilidad no encontrada
   * @throws {ForbiddenException} - Sin permisos de modificación
   * @throws {ConflictException} - Conflicto de horarios
   */
  async actualizarDisponibilidad(
    id: number,
    actualizarDisponibilidadDto: ActualizarDisponibilidadDto,
    usuarioAutenticadoId: number
  ): Promise<IDisponibilidad> {
    this.logger.log(`Actualizando disponibilidad ${id} por usuario ${usuarioAutenticadoId}`);

    // Verificar que la disponibilidad existe
    const disponibilidadExistente = await this.obtenerDisponibilidadPorId(id, usuarioAutenticadoId);

    // Validar permisos de modificación
    await this.validarPermisosUsuario(disponibilidadExistente.usuarioId, usuarioAutenticadoId);

    // Si se actualizan los horarios, validar formato
    if (actualizarDisponibilidadDto.horaInicio || actualizarDisponibilidadDto.horaFin) {
      const horaInicio = actualizarDisponibilidadDto.horaInicio || disponibilidadExistente.horaInicio;
      const horaFin = actualizarDisponibilidadDto.horaFin || disponibilidadExistente.horaFin;
      
      HorarioUtil.validarRangoHorarios(horaInicio, horaFin);
    }

    // Verificar conflictos solo si se cambian datos críticos
    if (
      actualizarDisponibilidadDto.dia ||
      actualizarDisponibilidadDto.horaInicio ||
      actualizarDisponibilidadDto.horaFin ||
      actualizarDisponibilidadDto.usuarioId
    ) {
      await this.verificarConflictosHorario({
        dia: actualizarDisponibilidadDto.dia || disponibilidadExistente.dia,
        horaInicio: actualizarDisponibilidadDto.horaInicio || disponibilidadExistente.horaInicio,
        horaFin: actualizarDisponibilidadDto.horaFin || disponibilidadExistente.horaFin,
        usuarioId: actualizarDisponibilidadDto.usuarioId || disponibilidadExistente.usuarioId
      }, id);
    }

    try {
      const disponibilidadActualizada = await this.prisma.disponibilidad.update({
        where: { id },
        data: {
          ...actualizarDisponibilidadDto
        }
      });

      this.logger.log(`Disponibilidad ${id} actualizada exitosamente`);

      return disponibilidadActualizada;
    } catch (error) {
      this.logger.error(`Error al actualizar disponibilidad ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar la disponibilidad');
    }
  }

  /**
   * Eliminar disponibilidad
   * 
   * Elimina una disponibilidad verificando permisos y dependencias.
   * 
   * @param id - ID de la disponibilidad a eliminar
   * @param usuarioAutenticadoId - ID del usuario que elimina
   * @returns Promise<void>
   * 
   * @throws {NotFoundException} - Disponibilidad no encontrada
   * @throws {ForbiddenException} - Sin permisos de eliminación
   * @throws {ConflictException} - Disponibilidad tiene citas asociadas
   */
  async eliminarDisponibilidad(
    id: number,
    usuarioAutenticadoId: number
  ): Promise<void> {
    this.logger.log(`Eliminando disponibilidad ${id} por usuario ${usuarioAutenticadoId}`);

    // Verificar que la disponibilidad existe
    const disponibilidad = await this.obtenerDisponibilidadPorId(id, usuarioAutenticadoId);

    // Validar permisos de eliminación
    await this.validarPermisosUsuario(disponibilidad.usuarioId, usuarioAutenticadoId);

    // Verificar si hay citas asociadas a esta disponibilidad
    await this.verificarCitasAsociadas(disponibilidad);

    try {
      await this.prisma.disponibilidad.delete({
        where: { id }
      });

      this.logger.log(`Disponibilidad ${id} eliminada exitosamente`);
    } catch (error) {
      this.logger.error(`Error al eliminar disponibilidad ${id}: ${error.message}`);
      throw new BadRequestException('Error al eliminar la disponibilidad');
    }
  }

  /**
   * Crear múltiples disponibilidades
   * 
   * Crea varias disponibilidades en una sola operación con validación.
   * 
   * @param crearMasivoDto - Datos para creación masiva
   * @param usuarioAutenticadoId - ID del usuario que crea
   * @returns Promise<IResultadoCreacionMasiva> - Resultado detallado
   */
  async crearDisponibilidadMasiva(
    crearMasivoDto: CrearDisponibilidadMasivaDto,
    usuarioAutenticadoId: number
  ): Promise<IResultadoCreacionMasiva> {
    this.logger.log(`Creando disponibilidades masivas para usuario ${crearMasivoDto.usuarioId || usuarioAutenticadoId}`);

    const usuarioId = crearMasivoDto.usuarioId || usuarioAutenticadoId;

    // Validar usuario y permisos
    await this.validarUsuarioExiste(usuarioId);
    await this.validarPermisosUsuario(usuarioId, usuarioAutenticadoId);

    const resultado: IResultadoCreacionMasiva = {
      totalProcesadas: crearMasivoDto.disponibilidades.length,
      creadasExitosamente: 0,
      fallos: 0,
      disponibilidadesCreadas: [],
      errores: [],
      advertencias: []
    };

    for (const disponibilidadData of crearMasivoDto.disponibilidades) {
      try {
        // Validar formato de horarios
        HorarioUtil.validarRangoHorarios(disponibilidadData.horaInicio, disponibilidadData.horaFin);

        // Verificar conflictos
        await this.verificarConflictosHorario({
          dia: disponibilidadData.dia,
          horaInicio: disponibilidadData.horaInicio,
          horaFin: disponibilidadData.horaFin,
          usuarioId: usuarioId
        });

        // Crear disponibilidad
        const nuevaDisponibilidad = await this.prisma.disponibilidad.create({
          data: {
            ...disponibilidadData,
            usuarioId: usuarioId
          }
        });

        resultado.disponibilidadesCreadas.push(nuevaDisponibilidad);
        resultado.creadasExitosamente++;

      } catch (error) {
        resultado.fallos++;
        resultado.errores.push({
          dia: disponibilidadData.dia,
          horaInicio: disponibilidadData.horaInicio,
          horaFin: disponibilidadData.horaFin,
          error: error.message
        });
      }
    }

    this.logger.log(`Creación masiva completada: ${resultado.creadasExitosamente}/${resultado.totalProcesadas} exitosas`);

    return resultado;
  }

  /**
   * Consultar disponibilidad específica
   * 
   * Verifica si un usuario está disponible en una fecha/hora específica.
   * 
   * @param consultaDto - Parámetros de consulta
   * @returns Promise<IRespuestaConsultaDisponibilidad> - Resultado detallado
   */
  async consultarDisponibilidadEspecifica(
    consultaDto: ConsultarDisponibilidadEspecificaDto
  ): Promise<IRespuestaConsultaDisponibilidad> {
    this.logger.log(`Consultando disponibilidad específica para usuario ${consultaDto.usuarioId} en fecha ${consultaDto.fecha}`);

    // Validar usuario
    const usuario = await this.validarUsuarioExiste(consultaDto.usuarioId);

    // Determinar día de la semana
    const fecha = new Date(consultaDto.fecha);
    const diaSemana = HorarioUtil.obtenerDiaSemana(fecha);

    // Obtener disponibilidades configuradas para ese día
    const disponibilidadesConfiguradas = await this.prisma.disponibilidad.findMany({
      where: {
        usuarioId: consultaDto.usuarioId,
        dia: diaSemana
      },
      orderBy: { horaInicio: 'asc' }
    });

    // Verificar si el horario solicitado está dentro de alguna disponibilidad
    const estaDisponible = this.verificarHorarioDentroDeDisponibilidad(
      consultaDto.horaInicio,
      consultaDto.horaFin,
      disponibilidadesConfiguradas
    );

    let motivo = '';
    if (!estaDisponible) {
      if (disponibilidadesConfiguradas.length === 0) {
        motivo = `No hay disponibilidad configurada para ${diaSemana}`;
      } else {
        motivo = 'El horario solicitado está fuera de las horas de disponibilidad configuradas';
      }
    }

    // Obtener citas existentes que puedan interferir
    const citasExistentes = await this.obtenerCitasEnFecha(consultaDto.usuarioId, consultaDto.fecha);

    // Generar horarios alternativos si no está disponible
    const horariosAlternativos = estaDisponible ? [] : 
      await this.generarHorariosAlternativos(disponibilidadesConfiguradas, citasExistentes);

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email
      },
      fecha: consultaDto.fecha,
      diaSemana,
      horarioSolicitado: {
        horaInicio: consultaDto.horaInicio,
        horaFin: consultaDto.horaFin
      },
      estaDisponible,
      motivo: motivo || undefined,
      disponibilidadesConfiguradas: disponibilidadesConfiguradas.map(d => ({
        id: d.id,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin
      })),
      citasExistentes: citasExistentes.map(c => ({
        id: c.id,
        horaInicio: c.horainicio.toTimeString().substring(0, 5),
        horaFin: c.horafin.toTimeString().substring(0, 5),
        estado: c.estado,
        paciente: `${c.paciente.nombre} ${c.paciente.apellido}`
      })),
      horariosAlternativos
    };
  }

  /**
   * Obtener slots disponibles para una fecha
   * 
   * Genera una lista de slots de tiempo disponibles para citas.
   * 
   * @param usuarioId - ID del usuario
   * @param fecha - Fecha a consultar
   * @param duracionSlot - Duración de cada slot en minutos (default: 60)
   * @returns Promise<IRespuestaSlotsDisponibles> - Slots disponibles
   */
  async obtenerSlotsDisponibles(
    usuarioId: number,
    fecha: string,
    duracionSlot: number = 60
  ): Promise<IRespuestaSlotsDisponibles> {
    this.logger.log(`Generando slots disponibles para usuario ${usuarioId} en fecha ${fecha}`);

    const usuario = await this.validarUsuarioExiste(usuarioId);
    const fechaObj = new Date(fecha);
    const diaSemana = HorarioUtil.obtenerDiaSemana(fechaObj);

    // Obtener disponibilidades del día
    const disponibilidades = await this.prisma.disponibilidad.findMany({
      where: {
        usuarioId,
        dia: diaSemana
      },
      orderBy: { horaInicio: 'asc' }
    });

    // Obtener citas existentes
    const citasExistentes = await this.obtenerCitasEnFecha(usuarioId, fecha);

    // Generar slots
    const slots: ISlotTiempo[] = [];

    for (const disponibilidad of disponibilidades) {
      const slotsDisponibilidad = this.generarSlotsParaDisponibilidad(
        disponibilidad,
        citasExistentes,
        duracionSlot
      );
      slots.push(...slotsDisponibilidad);
    }

    // Calcular resumen
    const totalSlots = slots.length;
    const slotsDisponibles = slots.filter(s => s.disponible).length;
    const slotsOcupados = totalSlots - slotsDisponibles;
    const porcentajeDisponibilidad = totalSlots > 0 ? (slotsDisponibles / totalSlots) * 100 : 0;

    return {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido
      },
      fecha,
      diaSemana,
      slots,
      resumen: {
        totalSlots,
        slotsDisponibles,
        slotsOcupados,
        porcentajeDisponibilidad: Math.round(porcentajeDisponibilidad * 100) / 100
      }
    };
  }

  /**
   * Obtener estadísticas de disponibilidad
   * 
   * Genera métricas y estadísticas del sistema de disponibilidad.
   * 
   * @returns Promise<EstadisticasDisponibilidadDto> - Estadísticas completas
   */
  async obtenerEstadisticas(): Promise<EstadisticasDisponibilidadDto> {
    this.logger.log('Generando estadísticas de disponibilidad');

    try {
      const [
        totalDisponibilidades,
        estudiantesConDisponibilidad,
        distribucionPorDia
      ] = await Promise.all([
        this.prisma.disponibilidad.count(),
        this.prisma.disponibilidad.groupBy({
          by: ['usuarioId'],
          _count: { id: true }
        }).then(result => result.length),
        this.prisma.disponibilidad.groupBy({
          by: ['dia'],
          _count: { id: true }
        })
      ]);

      // Procesar distribución por día
      const distribucion = distribucionPorDia.reduce((acc, item) => {
        acc[item.dia] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Encontrar día más popular
      const diaMasPopular = Object.entries(distribucion)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'LUNES';

      return {
        totalDisponibilidades,
        estudiantesConDisponibilidad,
        diaMasPopular,
        horaPromedioInicio: '08:30', // Calcular promedio real
        horaPromedioFin: '17:00',   // Calcular promedio real
        distribucionPorDia: distribucion
      };
    } catch (error) {
      this.logger.error(`Error al generar estadísticas: ${error.message}`);
      throw new BadRequestException('Error al generar estadísticas');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar que un usuario existe y está activo
   * 
   * @private
   * @param usuarioId - ID del usuario a validar
   * @returns Promise<Usuario> - Usuario validado
   * @throws {NotFoundException} - Usuario no encontrado
   */
  private async validarUsuarioExiste(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        activo: true
      }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new BadRequestException('El usuario no está activo');
    }

    return usuario;
  }

  /**
   * Validar permisos de usuario para operaciones
   * 
   * @private
   * @param usuarioObjetivo - ID del usuario objetivo
   * @param usuarioAutenticado - ID del usuario autenticado
   * @throws {ForbiddenException} - Sin permisos suficientes
   */
  private async validarPermisosUsuario(
    usuarioObjetivo: number,
    usuarioAutenticado: number
  ): Promise<void> {
    // El usuario puede gestionar su propia disponibilidad
    if (usuarioObjetivo === usuarioAutenticado) {
      return;
    }

    // TODO: Implementar validación de roles de administrador/secretario
    // Por ahora, solo permite autogestión
    throw new ForbiddenException('No tiene permisos para gestionar la disponibilidad de otro usuario');
  }

  /**
   * Validar permisos de acceso a disponibilidad
   * 
   * @private
   * @param usuarioDisponibilidad - ID del propietario de la disponibilidad
   * @param usuarioConsulta - ID del usuario que consulta
   * @throws {ForbiddenException} - Sin permisos de acceso
   */
  private async validarPermisosAcceso(
    usuarioDisponibilidad: number,
    usuarioConsulta: number
  ): Promise<void> {
    // El usuario puede ver su propia disponibilidad
    if (usuarioDisponibilidad === usuarioConsulta) {
      return;
    }

    // TODO: Implementar validación de roles que pueden ver otras disponibilidades
    // Secretarios y docentes deberían poder ver disponibilidades de estudiantes
    throw new ForbiddenException('No tiene permisos para acceder a esta disponibilidad');
  }

  /**
   * Verificar conflictos de horario con disponibilidades existentes
   * 
   * @private
   * @param horario - Horario a verificar
   * @param excluirId - ID a excluir de la verificación
   * @throws {ConflictException} - Conflicto de horarios detectado
   */
  private async verificarConflictosHorario(
    horario: {
      dia: DiaSemana;
      horaInicio: string;
      horaFin: string;
      usuarioId: number;
    },
    excluirId?: number
  ): Promise<void> {
    const where: any = {
      usuarioId: horario.usuarioId,
      dia: horario.dia
    };

    if (excluirId) {
      where.id = { not: excluirId };
    }

    const disponibilidadesExistentes = await this.prisma.disponibilidad.findMany({
      where
    });

    for (const disponibilidad of disponibilidadesExistentes) {
      if (HorarioUtil.verificarSolapamientoHorarios(
        horario.horaInicio,
        horario.horaFin,
        disponibilidad.horaInicio,
        disponibilidad.horaFin
      )) {
        throw new ConflictException(
          `Conflicto de horario detectado con disponibilidad existente (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
        );
      }
    }
  }

  /**
   * Verificar si hay citas asociadas a una disponibilidad
   * 
   * @private
   * @param disponibilidad - Disponibilidad a verificar
   * @throws {ConflictException} - Hay citas asociadas
   */
  private async verificarCitasAsociadas(disponibilidad: IDisponibilidad): Promise<void> {
    // Verificar citas futuras que dependan de esta disponibilidad
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    const citasAsociadas = await this.prisma.cita.count({
      where: {
        estudianteId: disponibilidad.usuarioId,
        fecha: { gte: fechaActual },
        estado: { in: ['RESERVADA', 'DISPONIBLE'] }
      }
    });

    if (citasAsociadas > 0) {
      throw new ConflictException(
        'No se puede eliminar la disponibilidad porque tiene citas asociadas'
      );
    }
  }

  /**
   * Verificar si un horario está dentro de las disponibilidades
   * 
   * @private
   * @param horaInicio - Hora de inicio a verificar
   * @param horaFin - Hora de fin a verificar
   * @param disponibilidades - Lista de disponibilidades
   * @returns boolean - True si está disponible
   */
  private verificarHorarioDentroDeDisponibilidad(
    horaInicio: string,
    horaFin: string,
    disponibilidades: IDisponibilidad[]
  ): boolean {
    const minutosInicio = HorarioUtil.convertirHoraAMinutos(horaInicio);
    const minutosFin = HorarioUtil.convertirHoraAMinutos(horaFin);

    return disponibilidades.some(disponibilidad => {
      const dispMinutosInicio = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaInicio);
      const dispMinutosFin = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaFin);

      return minutosInicio >= dispMinutosInicio && minutosFin <= dispMinutosFin;
    });
  }

  /**
   * Obtener citas existentes en una fecha específica
   * 
   * @private
   * @param usuarioId - ID del usuario
   * @param fecha - Fecha a consultar
   * @returns Promise<Cita[]> - Lista de citas
   */
  private async obtenerCitasEnFecha(usuarioId: number, fecha: string) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    return await this.prisma.cita.findMany({
      where: {
        estudianteId: usuarioId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estado: { in: ['RESERVADA', 'DISPONIBLE'] }
      },
      include: {
        paciente: {
          select: {
            nombre: true,
            apellido: true
          }
        }
      },
      orderBy: { horainicio: 'asc' }
    });
  }

  /**
   * Generar horarios alternativos disponibles
   * 
   * @private
   * @param disponibilidades - Disponibilidades configuradas
   * @param citasExistentes - Citas existentes
   * @returns Array de horarios alternativos
   */
  private async generarHorariosAlternativos(
    disponibilidades: IDisponibilidad[],
    citasExistentes: any[]
  ) {
    const horariosAlternativos = [];

    for (const disponibilidad of disponibilidades) {
      const slots = this.generarSlotsParaDisponibilidad(disponibilidad, citasExistentes, 60);
      
      for (const slot of slots.filter(s => s.disponible)) {
        horariosAlternativos.push({
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
          disponible: true
        });
      }
    }

    return horariosAlternativos.slice(0, 5); // Limitar a 5 alternativas
  }

  /**
   * Generar slots de tiempo para una disponibilidad
   * 
   * @private
   * @param disponibilidad - Disponibilidad base
   * @param citasExistentes - Citas que ocupan tiempo
   * @param duracionSlot - Duración de cada slot en minutos
   * @returns Array de slots
   */
  private generarSlotsParaDisponibilidad(
    disponibilidad: IDisponibilidad,
    citasExistentes: any[],
    duracionSlot: number
  ): ISlotTiempo[] {
    const slots: ISlotTiempo[] = [];
    
    const minutosInicio = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaInicio);
    const minutosFin = HorarioUtil.convertirHoraAMinutos(disponibilidad.horaFin);

    for (let minutos = minutosInicio; minutos + duracionSlot <= minutosFin; minutos += duracionSlot) {
      const horaInicioSlot = HorarioUtil.convertirMinutosAHora(minutos);
      const horaFinSlot = HorarioUtil.convertirMinutosAHora(minutos + duracionSlot);

      // Verificar si el slot está ocupado por alguna cita
      const citaConflicto = citasExistentes.find(cita => {
        const citaInicio = cita.horainicio.toTimeString().substring(0, 5);
        const citaFin = cita.horafin.toTimeString().substring(0, 5);
        
        return HorarioUtil.verificarSolapamientoHorarios(
          horaInicioSlot,
          horaFinSlot,
          citaInicio,
          citaFin
        );
      });

      slots.push({
        horaInicio: horaInicioSlot,
        horaFin: horaFinSlot,
        duracion: duracionSlot,
        disponible: !citaConflicto,
        motivo: citaConflicto ? `Ocupado por cita con ${citaConflicto.paciente.nombre}` : undefined,
        citaId: citaConflicto?.id
      });
    }

    return slots;
  }
}
