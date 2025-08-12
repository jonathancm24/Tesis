import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EstadoTratamiento, TipoDiagnostico } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearTratamientoDto, 
  ActualizarTratamientoBasicoDto, 
  ActualizarEstadoTratamientoDto, 
  ActualizarTratamientoCompletoDto 
} from './DTO/crear-actualizar-tratamiento.dto';
import { 
  FiltrosTratamientosDto, 
  RespuestaPaginadaTratamientosDto, 
  EstadisticasTratamientosDto 
} from './DTO/filtros-tratamientos.dto';
import { 
  ITratamiento, 
  IFiltrosTratamientos, 
  IEstadisticasTratamientos, 
  ITratamientoResumen 
} from './Interface/tratamiento.interface';

/**
 * Servicio para gestión de tratamientos clínicos
 * Maneja toda la lógica de negocio relacionada con tratamientos médicos
 * Incluye validaciones de permisos y estados según el rol del usuario
 */
@Injectable()
export class TratamientoService {
  private readonly logger = new Logger(TratamientoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo tratamiento con estado PENDIENTE por defecto
   * Solo disponible para estudiantes y profesores
   * @param createDto - Datos del tratamiento a crear
   * @returns Tratamiento creado con toda la información
   */
  async crearTratamiento(createDto: CrearTratamientoDto): Promise<ITratamiento> {
    this.logger.log(`Creando nuevo tratamiento para caso clínico ${createDto.casoClinicoId}`);

    try {
      // Verificar que el caso clínico existe
      const casoClinico = await this.prisma.casoClinico.findUnique({
        where: { id: createDto.casoClinicoId },
        include: { estudiante: true }
      });

      if (!casoClinico) {
        throw new NotFoundException(`Caso clínico con ID ${createDto.casoClinicoId} no encontrado`);
      }

      // Verificar que el estudiante existe
      const estudiante = await this.prisma.usuario.findUnique({
        where: { id: createDto.estudianteId },
        include: { role: true }
      });

      if (!estudiante) {
        throw new NotFoundException(`Estudiante con ID ${createDto.estudianteId} no encontrado`);
      }

      // Validar códigos CIE-10 y procedimiento si se proporcionan
      if (createDto.cie10Codigo) {
        await this.validarCodigoCIE10(createDto.cie10Codigo);
      }

      if (createDto.procedimientoCodigo) {
        await this.validarCodigoProcedimiento(createDto.procedimientoCodigo);
      }

      const nuevoTratamiento = await this.prisma.tratamiento.create({
        data: {
          ...createDto,
          estado: EstadoTratamiento.PENDIENTE, // Estado por defecto
        },
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          docente: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          casoClinico: {
            select: { id: true, fechaCreacion: true }
          },
          cie10: {
            select: { codigo: true, descripcion: true }
          },
          procedimiento: {
            select: { codigo: true, descripcion: true }
          }
        }
      });

      this.logger.log(`Tratamiento creado exitosamente con ID: ${nuevoTratamiento.id}`);
      return nuevoTratamiento as ITratamiento;

    } catch (error) {
      this.logger.error(`Error al crear tratamiento: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualiza información básica del tratamiento
   * Disponible para estudiantes solo si el estado es RECHAZADO
   * @param id - ID del tratamiento
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario que hace la actualización
   * @param rolUsuario - Rol del usuario (para validar permisos)
   * @returns Tratamiento actualizado
   */
  async actualizarTratamientoBasico(
    id: number, 
    updateDto: ActualizarTratamientoBasicoDto, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<ITratamiento> {
    this.logger.log(`Actualizando tratamiento ${id} - Usuario: ${usuarioId}, Rol: ${rolUsuario}`);

    const tratamiento = await this.obtenerTratamientoPorId(id);

    // Validar permisos según el rol y estado
    await this.validarPermisosActualizacion(tratamiento, usuarioId, rolUsuario, 'basico');

    // Validar códigos si se actualizan
    if (updateDto.cie10Codigo) {
      await this.validarCodigoCIE10(updateDto.cie10Codigo);
    }

    if (updateDto.procedimientoCodigo) {
      await this.validarCodigoProcedimiento(updateDto.procedimientoCodigo);
    }

    try {
      const tratamientoActualizado = await this.prisma.tratamiento.update({
        where: { id },
        data: updateDto,
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          docente: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          casoClinico: {
            select: { id: true, fechaCreacion: true }
          }
        }
      });

      this.logger.log(`Tratamiento ${id} actualizado exitosamente`);
      return tratamientoActualizado as ITratamiento;

    } catch (error) {
      this.logger.error(`Error al actualizar tratamiento ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el tratamiento');
    }
  }

  /**
   * Actualiza el estado del tratamiento
   * Solo disponible para profesores
   * @param id - ID del tratamiento
   * @param updateDto - Nuevo estado y datos relacionados
   * @returns Tratamiento con estado actualizado
   */
  async actualizarEstadoTratamiento(
    id: number, 
    updateDto: ActualizarEstadoTratamientoDto
  ): Promise<ITratamiento> {
    this.logger.log(`Actualizando estado de tratamiento ${id} a ${updateDto.estado}`);

    const tratamiento = await this.obtenerTratamientoPorId(id);

    // Validar transición de estado
    this.validarTransicionEstado(tratamiento.estado, updateDto.estado);

    try {
      const tratamientoActualizado = await this.prisma.tratamiento.update({
        where: { id },
        data: {
          estado: updateDto.estado,
          docenteId: updateDto.docenteId,
        },
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          docente: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          casoClinico: {
            select: { id: true, fechaCreacion: true }
          }
        }
      });

      // Registrar el cambio de estado si es necesario
      if (updateDto.motivo) {
        await this.registrarCambioEstado(
          id, 
          tratamiento.estado, 
          updateDto.estado, 
          updateDto.docenteId, 
          updateDto.motivo
        );
      }

      this.logger.log(`Estado de tratamiento ${id} actualizado a ${updateDto.estado}`);
      return tratamientoActualizado as ITratamiento;

    } catch (error) {
      this.logger.error(`Error al actualizar estado de tratamiento ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el estado del tratamiento');
    }
  }

  /**
   * Actualización completa del tratamiento (solo profesores)
   * Permite cambiar tanto información médica como estado
   * @param id - ID del tratamiento
   * @param updateDto - Todos los datos a actualizar
   * @returns Tratamiento completamente actualizado
   */
  async actualizarTratamientoCompleto(
    id: number, 
    updateDto: ActualizarTratamientoCompletoDto
  ): Promise<ITratamiento> {
    this.logger.log(`Actualización completa de tratamiento ${id}`);

    const tratamiento = await this.obtenerTratamientoPorId(id);

    // Validar transición de estado si se proporciona
    if (updateDto.estado && updateDto.estado !== tratamiento.estado) {
      this.validarTransicionEstado(tratamiento.estado, updateDto.estado);
    }

    // Validar códigos si se actualizan
    if (updateDto.cie10Codigo) {
      await this.validarCodigoCIE10(updateDto.cie10Codigo);
    }

    if (updateDto.procedimientoCodigo) {
      await this.validarCodigoProcedimiento(updateDto.procedimientoCodigo);
    }

    try {
      const { motivo, ...datosActualizacion } = updateDto;
      
      const tratamientoActualizado = await this.prisma.tratamiento.update({
        where: { id },
        data: datosActualizacion,
        include: {
          estudiante: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          docente: {
            select: { id: true, nombre: true, apellido: true, email: true }
          },
          casoClinico: {
            select: { id: true, fechaCreacion: true }
          }
        }
      });

      // Registrar cambio de estado si aplica
      if (updateDto.estado && updateDto.estado !== tratamiento.estado && motivo) {
        await this.registrarCambioEstado(
          id, 
          tratamiento.estado, 
          updateDto.estado, 
          updateDto.docenteId || tratamiento.docenteId, 
          motivo
        );
      }

      this.logger.log(`Tratamiento ${id} actualizado completamente`);
      return tratamientoActualizado as ITratamiento;

    } catch (error) {
      this.logger.error(`Error en actualización completa de tratamiento ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar completamente el tratamiento');
    }
  }

  /**
   * Obtiene todos los tratamientos de un caso clínico específico
   * @param casoClinicoId - ID del caso clínico
   * @returns Lista de tratamientos del caso clínico
   */
  async obtenerTratamientosPorCasoClinico(casoClinicoId: number): Promise<ITratamientoResumen[]> {
    this.logger.log(`Obteniendo tratamientos para caso clínico ${casoClinicoId}`);

    // Verificar que el caso clínico existe
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico con ID ${casoClinicoId} no encontrado`);
    }

    const tratamientos = await this.prisma.tratamiento.findMany({
      where: { casoClinicoId },
      include: {
        estudiante: {
          select: { nombre: true, apellido: true }
        },
        docente: {
          select: { nombre: true, apellido: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    return tratamientos.map(t => ({
      id: t.id,
      descripcion: t.descripcion,
      estado: t.estado,
      fechaCreacion: t.fechaCreacion,
      nombreEstudiante: `${t.estudiante.nombre} ${t.estudiante.apellido}`,
      nombreDocente: t.docente ? `${t.docente.nombre} ${t.docente.apellido}` : undefined,
      casoClinicoId: t.casoClinicoId,
      tipoDiagnostico: t.tipoDiagnostico
    }));
  }

  /**
   * Obtiene un tratamiento específico por su ID
   * @param id - ID del tratamiento
   * @returns Tratamiento completo con relaciones
   */
  async obtenerTratamientoPorId(id: number): Promise<ITratamiento> {
    this.logger.log(`Obteniendo tratamiento por ID: ${id}`);

    const tratamiento = await this.prisma.tratamiento.findUnique({
      where: { id },
      include: {
        estudiante: {
          select: { id: true, nombre: true, apellido: true, email: true }
        },
        docente: {
          select: { id: true, nombre: true, apellido: true, email: true }
        },
        casoClinico: {
          select: { id: true, fechaCreacion: true }
        },
        cie10: {
          select: { codigo: true, descripcion: true }
        },
        procedimiento: {
          select: { codigo: true, descripcion: true }
        },
        observaciones: {
          select: { id: true, descripcion: true, fecha: true },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!tratamiento) {
      throw new NotFoundException(`Tratamiento con ID ${id} no encontrado`);
    }

    return tratamiento as ITratamiento;
  }

  /**
   * Obtiene tratamientos con filtros y paginación
   * @param filtros - Criterios de filtrado
   * @returns Resultado paginado de tratamientos
   */
  async obtenerTratamientosConFiltros(filtros: FiltrosTratamientosDto): Promise<RespuestaPaginadaTratamientosDto> {
    this.logger.log(`Obteniendo tratamientos con filtros: ${JSON.stringify(filtros)}`);

    const { pagina = 1, limite = 10, ordenarPor = 'fechaCreacion', direccion = 'desc', ...criterios } = filtros;
    const saltar = (pagina - 1) * limite;

    // Construir condiciones WHERE
    const where: any = {};

    if (criterios.casoClinicoId) {
      where.casoClinicoId = criterios.casoClinicoId;
    }

    if (criterios.estudianteId) {
      where.estudianteId = criterios.estudianteId;
    }

    if (criterios.docenteId) {
      where.docenteId = criterios.docenteId;
    }

    if (criterios.estado) {
      where.estado = criterios.estado;
    }

    if (criterios.tipoDiagnostico) {
      where.tipoDiagnostico = criterios.tipoDiagnostico;
    }

    if (criterios.fechaDesde || criterios.fechaHasta) {
      where.fechaCreacion = {};
      if (criterios.fechaDesde) {
        where.fechaCreacion.gte = new Date(criterios.fechaDesde);
      }
      if (criterios.fechaHasta) {
        where.fechaCreacion.lte = new Date(criterios.fechaHasta);
      }
    }

    if (criterios.busqueda) {
      where.descripcion = {
        contains: criterios.busqueda,
        mode: 'insensitive'
      };
    }

    const [tratamientos, total] = await Promise.all([
      this.prisma.tratamiento.findMany({
        where,
        include: {
          estudiante: {
            select: { nombre: true, apellido: true }
          },
          docente: {
            select: { nombre: true, apellido: true }
          }
        },
        orderBy: { [ordenarPor]: direccion },
        skip: saltar,
        take: limite
      }),
      this.prisma.tratamiento.count({ where })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      data: tratamientos.map(t => ({
        id: t.id,
        descripcion: t.descripcion,
        estado: t.estado,
        fechaCreacion: t.fechaCreacion,
        nombreEstudiante: `${t.estudiante.nombre} ${t.estudiante.apellido}`,
        nombreDocente: t.docente ? `${t.docente.nombre} ${t.docente.apellido}` : null,
        casoClinicoId: t.casoClinicoId,
        tipoDiagnostico: t.tipoDiagnostico
      })),
      total,
      pagina,
      limite,
      totalPaginas,
      hayPaginaSiguiente: pagina < totalPaginas,
      hayPaginaAnterior: pagina > 1
    };
  }

  /**
   * Obtiene estadísticas de tratamientos
   * @param filtros - Filtros para las estadísticas
   * @returns Estadísticas completas de tratamientos
   */
  async obtenerEstadisticasTratamientos(filtros: EstadisticasTratamientosDto): Promise<IEstadisticasTratamientos> {
    this.logger.log(`Obteniendo estadísticas de tratamientos`);

    const where: any = {};

    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.fechaCreacion = {};
      if (filtros.fechaDesde) {
        where.fechaCreacion.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        where.fechaCreacion.lte = new Date(filtros.fechaHasta);
      }
    }

    if (filtros.estudianteId) {
      where.estudianteId = filtros.estudianteId;
    }

    if (filtros.docenteId) {
      where.docenteId = filtros.docenteId;
    }

    const [total, porEstado, porTipoDiagnostico, tratamientosDelMes] = await Promise.all([
      this.prisma.tratamiento.count({ where }),
      this.obtenerEstadisticasPorEstado(where),
      this.obtenerEstadisticasPorTipoDiagnostico(where),
      this.obtenerTratamientosDelMes(where)
    ]);

    return {
      total,
      porEstado,
      porTipoDiagnostico,
      tratamientosDelMes,
      promedioTiempoAprobacion: await this.calcularPromedioTiempoAprobacion(where)
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS AUXILIARES
  // ===============================

  /**
   * Valida los permisos para actualizar un tratamiento
   * @param tratamiento - Tratamiento a actualizar
   * @param usuarioId - ID del usuario que intenta actualizar
   * @param rolUsuario - Rol del usuario
   * @param tipoActualizacion - Tipo de actualización (básico o completo)
   */
  private async validarPermisosActualizacion(
    tratamiento: ITratamiento, 
    usuarioId: number, 
    rolUsuario: string, 
    tipoActualizacion: 'basico' | 'completo'
  ): Promise<void> {
    // Los profesores pueden actualizar cualquier tratamiento
    if (rolUsuario === RoleEnum.PROFESOR || rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes solo pueden actualizar sus propios tratamientos
    if (tratamiento.estudianteId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para actualizar este tratamiento');
    }

    // Los estudiantes solo pueden actualizar si el estado es RECHAZADO
    if (tipoActualizacion === 'basico' && tratamiento.estado !== EstadoTratamiento.RECHAZADO) {
      throw new ForbiddenException('Solo puedes editar tratamientos que han sido rechazados');
    }
  }

  /**
   * Valida las transiciones de estado permitidas
   * @param estadoActual - Estado actual del tratamiento
   * @param nuevoEstado - Nuevo estado propuesto
   */
  private validarTransicionEstado(estadoActual: EstadoTratamiento, nuevoEstado: EstadoTratamiento): void {
    const transicionesPermitidas: Record<EstadoTratamiento, EstadoTratamiento[]> = {
      [EstadoTratamiento.PENDIENTE]: [
        EstadoTratamiento.APROBADO, 
        EstadoTratamiento.RECHAZADO, 
        EstadoTratamiento.CANCELADO
      ],
      [EstadoTratamiento.RECHAZADO]: [
        EstadoTratamiento.PENDIENTE, 
        EstadoTratamiento.CANCELADO
      ],
      [EstadoTratamiento.APROBADO]: [
        EstadoTratamiento.EN_PROCESO, 
        EstadoTratamiento.CANCELADO
      ],
      [EstadoTratamiento.EN_PROCESO]: [
        EstadoTratamiento.FINALIZADO, 
        EstadoTratamiento.CANCELADO
      ],
      [EstadoTratamiento.FINALIZADO]: [], // Estado final
      [EstadoTratamiento.CANCELADO]: [] // Estado final
    };

    const transicionesValidas = transicionesPermitidas[estadoActual] || [];

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`
      );
    }
  }

  /**
   * Valida que un código CIE-10 exista en la base de datos
   * @param codigo - Código CIE-10 a validar
   */
  private async validarCodigoCIE10(codigo: string): Promise<void> {
    const existe = await this.prisma.cIE10yOtrasClasificaciones.findFirst({
      where: { 
        codigo,
        tipo: 'CIE10'
      }
    });

    if (!existe) {
      throw new BadRequestException(`Código CIE-10 ${codigo} no encontrado`);
    }
  }

  /**
   * Valida que un código de procedimiento exista en la base de datos
   * @param codigo - Código de procedimiento a validar
   */
  private async validarCodigoProcedimiento(codigo: string): Promise<void> {
    const existe = await this.prisma.cIE10yOtrasClasificaciones.findFirst({
      where: { 
        codigo,
        tipo: 'PROCEDIMIENTO'
      }
    });

    if (!existe) {
      throw new BadRequestException(`Código de procedimiento ${codigo} no encontrado`);
    }
  }

  /**
   * Registra el cambio de estado en el historial
   * @param tratamientoId - ID del tratamiento
   * @param estadoAnterior - Estado anterior
   * @param estadoNuevo - Nuevo estado
   * @param usuarioId - Usuario que hizo el cambio
   * @param motivo - Motivo del cambio
   */
  private async registrarCambioEstado(
    tratamientoId: number,
    estadoAnterior: EstadoTratamiento,
    estadoNuevo: EstadoTratamiento,
    usuarioId: number,
    motivo: string
  ): Promise<void> {
    // Aquí podrías crear una tabla de historial de cambios de estado
    // Por ahora lo registramos en los logs
    this.logger.log(
      `Cambio de estado registrado - Tratamiento: ${tratamientoId}, ` +
      `${estadoAnterior} -> ${estadoNuevo}, Usuario: ${usuarioId}, Motivo: ${motivo}`
    );
  }

  /**
   * Obtiene estadísticas agrupadas por estado
   * @param where - Condiciones de filtrado
   * @returns Conteo por cada estado
   */
  private async obtenerEstadisticasPorEstado(where: any): Promise<Record<EstadoTratamiento, number>> {
    const resultados = await this.prisma.tratamiento.groupBy({
      by: ['estado'],
      where,
      _count: { estado: true }
    });

    const porEstado = {} as Record<EstadoTratamiento, number>;
    
    // Inicializar todos los estados en 0
    Object.values(EstadoTratamiento).forEach(estado => {
      porEstado[estado] = 0;
    });

    // Llenar con los valores reales
    resultados.forEach(resultado => {
      porEstado[resultado.estado] = resultado._count.estado;
    });

    return porEstado;
  }

  /**
   * Obtiene estadísticas agrupadas por tipo de diagnóstico
   * @param where - Condiciones de filtrado
   * @returns Conteo por cada tipo de diagnóstico
   */
  private async obtenerEstadisticasPorTipoDiagnostico(where: any): Promise<Record<TipoDiagnostico, number>> {
    const resultados = await this.prisma.tratamiento.groupBy({
      by: ['tipoDiagnostico'],
      where,
      _count: { tipoDiagnostico: true }
    });

    const porTipo = {} as Record<TipoDiagnostico, number>;
    
    // Inicializar todos los tipos en 0
    Object.values(TipoDiagnostico).forEach(tipo => {
      porTipo[tipo] = 0;
    });

    // Llenar con los valores reales
    resultados.forEach(resultado => {
      porTipo[resultado.tipoDiagnostico] = resultado._count.tipoDiagnostico;
    });

    return porTipo;
  }

  /**
   * Obtiene el número de tratamientos creados en el mes actual
   * @param where - Condiciones base de filtrado
   * @returns Número de tratamientos del mes
   */
  private async obtenerTratamientosDelMes(where: any): Promise<number> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    return this.prisma.tratamiento.count({
      where: {
        ...where,
        fechaCreacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });
  }

  /**
   * Calcula el promedio de días entre creación y aprobación
   * @param where - Condiciones de filtrado
   * @returns Promedio en días o undefined si no hay datos
   */
  private async calcularPromedioTiempoAprobacion(where: any): Promise<number | undefined> {
    const tratamientosAprobados = await this.prisma.tratamiento.findMany({
      where: {
        ...where,
        estado: EstadoTratamiento.APROBADO,
        docenteId: { not: null }
      },
      select: {
        fechaCreacion: true,
        fechaActualizacion: true
      }
    });

    if (tratamientosAprobados.length === 0) {
      return undefined;
    }

    const totalDias = tratamientosAprobados.reduce((suma, tratamiento) => {
      const diferencia = tratamiento.fechaActualizacion.getTime() - tratamiento.fechaCreacion.getTime();
      const dias = diferencia / (1000 * 60 * 60 * 24);
      return suma + dias;
    }, 0);

    return Math.round(totalDias / tratamientosAprobados.length);
  }
}
