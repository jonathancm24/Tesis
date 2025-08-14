import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EstadoCasoClinico, EstadoTratamiento, EstadoObservacion } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearCasoClinicoDto, 
  ActualizarCasoClinicoBasicoDto, 
  ActualizarEstadoCasoClinicoDto, 
  ActualizarCasoClinicoCompletoDto,
  AsignarCalificacionDto 
} from './DTO/crear-actualizar-caso.dto';
import { 
  FiltrosCasosClinicoDto, 
  RespuestaPaginadaCasosClinicoDto, 
  EstadisticasCasosClinicoDto,
  ValidarFinalizacionDto 
} from './DTO/filtros-casos.dto';
import { 
  ICasoClinico, 
  IFiltrosCasosClinico, 
  IEstadisticasCasosClinico, 
  ICasoClinicoResumen,
  IValidacionFinalizacion,
  IPacienteCasoClinico 
} from './Interface/caso-clinico.interface';

/**
 * Servicio para gestión de casos clínicos
 * Maneja toda la lógica de negocio relacionada con casos clínicos odontológicos
 * Incluye validaciones de permisos, estados y integración con tratamientos
 * Aprovecha el sistema de filtros y pipes existente para manejo de errores
 */
@Injectable()
export class CasoClinicoService {
  private readonly logger = new Logger(CasoClinicoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo caso clínico con estado EN_REVISION por defecto
   * Solo disponible para estudiantes y profesores
   * @param createDto - Datos del caso clínico a crear
   * @returns Caso clínico creado con toda la información
   */
  async crearCasoClinico(createDto: CrearCasoClinicoDto): Promise<ICasoClinico> {
    this.logger.log(`Creando nuevo caso clínico para paciente ${createDto.pacienteId}`);

    try {
      // Verificar que el paciente existe y no tiene otro caso activo
      await this.validarPacienteDisponible(createDto.pacienteId);

      // Verificar que la especialidad existe
      await this.validarEspecialidadExiste(createDto.especialidadId);

      // Verificar que el estudiante existe y es válido
      await this.validarEstudianteValido(createDto.estudianteId);

      // Verificar que el profesor existe y es válido
      await this.validarProfesorValido(createDto.profesorId);

      const nuevoCasoClinico = await this.prisma.casoClinico.create({
        data: {
          ...createDto,
          estado: EstadoCasoClinico.EN_REVISION, // Estado por defecto
        },
        include: this.getCasoClinicoInclude()
      });

      this.logger.log(`Caso clínico creado exitosamente con ID: ${nuevoCasoClinico.id}`);
      return this.mapearCasoClinicoCompleto(nuevoCasoClinico);

    } catch (error) {
      this.logger.error(`Error al crear caso clínico: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualiza información básica del caso clínico
   * Disponible para estudiantes solo si el estado es EN_REVISION
   * @param id - ID del caso clínico
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario que hace la actualización
   * @param rolUsuario - Rol del usuario (para validar permisos)
   * @returns Caso clínico actualizado
   */
  async actualizarCasoClinicoBasico(
    id: number, 
    updateDto: ActualizarCasoClinicoBasicoDto, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<ICasoClinico> {
    this.logger.log(`Actualizando caso clínico ${id} - Usuario: ${usuarioId}, Rol: ${rolUsuario}`);

    const casoClinico = await this.obtenerCasoClinicoPorId(id);

    // Validar permisos según el rol y estado
    await this.validarPermisosActualizacion(casoClinico, usuarioId, rolUsuario, 'basico');

    try {
      const casoActualizado = await this.prisma.casoClinico.update({
        where: { id },
        data: updateDto,
        include: this.getCasoClinicoInclude()
      });

      this.logger.log(`Caso clínico ${id} actualizado exitosamente`);
      return this.mapearCasoClinicoCompleto(casoActualizado);

    } catch (error) {
      this.logger.error(`Error al actualizar caso clínico ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el caso clínico');
    }
  }

  /**
   * Actualiza el estado del caso clínico
   * Solo disponible para profesores
   * @param id - ID del caso clínico
   * @param updateDto - Nuevo estado y datos relacionados
   * @returns Caso clínico con estado actualizado
   */
  async actualizarEstadoCasoClinico(
    id: number, 
    updateDto: ActualizarEstadoCasoClinicoDto
  ): Promise<ICasoClinico> {
    this.logger.log(`Actualizando estado de caso clínico ${id} a ${updateDto.estado}`);

    const casoClinico = await this.obtenerCasoClinicoPorId(id);

    // Validar transición de estado
    await this.validarTransicionEstado(casoClinico.estado, updateDto.estado, id);

    try {
      const casoActualizado = await this.prisma.casoClinico.update({
        where: { id },
        data: {
          estado: updateDto.estado,
          profesorId: updateDto.profesorId,
          calificacion: updateDto.calificacion,
        },
        include: this.getCasoClinicoInclude()
      });

      // Registrar el cambio de estado si es necesario
      if (updateDto.motivo) {
        await this.registrarCambioEstado(
          id, 
          casoClinico.estado, 
          updateDto.estado, 
          updateDto.profesorId, 
          updateDto.motivo
        );
      }

      this.logger.log(`Estado de caso clínico ${id} actualizado a ${updateDto.estado}`);
      return this.mapearCasoClinicoCompleto(casoActualizado);

    } catch (error) {
      this.logger.error(`Error al actualizar estado de caso clínico ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el estado del caso clínico');
    }
  }

  /**
   * Actualización completa del caso clínico (solo profesores)
   * Permite cambiar tanto información médica como estado
   * @param id - ID del caso clínico
   * @param updateDto - Todos los datos a actualizar
   * @returns Caso clínico completamente actualizado
   */
  async actualizarCasoClinicoCompleto(
    id: number, 
    updateDto: ActualizarCasoClinicoCompletoDto
  ): Promise<ICasoClinico> {
    this.logger.log(`Actualización completa de caso clínico ${id}`);

    const casoClinico = await this.obtenerCasoClinicoPorId(id);

    // Validar transición de estado si se proporciona
    if (updateDto.estado && updateDto.estado !== casoClinico.estado) {
      await this.validarTransicionEstado(casoClinico.estado, updateDto.estado, id);
    }

    try {
      const { motivo, ...datosActualizacion } = updateDto;
      
      const casoActualizado = await this.prisma.casoClinico.update({
        where: { id },
        data: datosActualizacion,
        include: this.getCasoClinicoInclude()
      });

      // Registrar cambio de estado si aplica
      if (updateDto.estado && updateDto.estado !== casoClinico.estado && motivo) {
        await this.registrarCambioEstado(
          id, 
          casoClinico.estado, 
          updateDto.estado, 
          updateDto.profesorId || casoClinico.profesorId, 
          motivo
        );
      }

      this.logger.log(`Caso clínico ${id} actualizado completamente`);
      return this.mapearCasoClinicoCompleto(casoActualizado);

    } catch (error) {
      this.logger.error(`Error en actualización completa de caso clínico ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar completamente el caso clínico');
    }
  }

  /**
   * Asigna o actualiza la calificación de un caso clínico
   * Solo disponible para profesores
   * @param id - ID del caso clínico
   * @param calificacionDto - Datos de la calificación
   * @returns Caso clínico con calificación actualizada
   */
  async asignarCalificacion(
    id: number, 
    calificacionDto: AsignarCalificacionDto
  ): Promise<ICasoClinico> {
    this.logger.log(`Asignando calificación ${calificacionDto.calificacion} a caso clínico ${id}`);

    const casoClinico = await this.obtenerCasoClinicoPorId(id);

    // Solo se puede calificar casos APROBADOS o FINALIZADOS
    if (casoClinico.estado !== 'APROBADO' && casoClinico.estado !== 'FINALIZADO') {
      throw new BadRequestException('Solo se pueden calificar casos APROBADOS o FINALIZADOS');
    }

    try {
      const casoActualizado = await this.prisma.casoClinico.update({
        where: { id },
        data: {
          calificacion: calificacionDto.calificacion,
          profesorId: calificacionDto.profesorId,
        },
        include: this.getCasoClinicoInclude()
      });

      // Registrar la calificación en observaciones si hay comentario
      if (calificacionDto.observacion) {
        await this.registrarObservacionCalificacion(
          id, 
          calificacionDto.profesorId, 
          calificacionDto.calificacion, 
          calificacionDto.observacion
        );
      }

      this.logger.log(`Calificación asignada exitosamente a caso clínico ${id}`);
      return this.mapearCasoClinicoCompleto(casoActualizado);

    } catch (error) {
      this.logger.error(`Error al asignar calificación a caso clínico ${id}: ${error.message}`);
      throw new BadRequestException('Error al asignar la calificación');
    }
  }

  /**
   * Obtiene un caso clínico específico por su ID
   * @param id - ID del caso clínico
   * @returns Caso clínico completo con relaciones
   */
  async obtenerCasoClinicoPorId(id: number): Promise<ICasoClinico> {
    this.logger.log(`Obteniendo caso clínico por ID: ${id}`);

    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id },
      include: {
        ...this.getCasoClinicoInclude(),
        tratamientos: {
          select: { 
            id: true, 
            descripcion: true, 
            estado: true, 
            fechaCreacion: true 
          },
          orderBy: { fechaCreacion: 'desc' }
        },
        observaciones: {
          select: { 
            id: true, 
            descripcion: true, 
            fecha: true,
            docente: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico con ID ${id} no encontrado`);
    }

    return this.mapearCasoClinicoCompleto(casoClinico);
  }

  /**
   * Obtiene casos clínicos con filtros y paginación
   * @param filtros - Criterios de filtrado
   * @returns Resultado paginado de casos clínicos
   */
  async obtenerCasosClinicoConFiltros(filtros: FiltrosCasosClinicoDto): Promise<RespuestaPaginadaCasosClinicoDto> {
    this.logger.log(`Obteniendo casos clínicos con filtros: ${JSON.stringify(filtros)}`);

    const { pagina = 1, limite = 10, ordenarPor = 'fechaCreacion', direccion = 'desc', ...criterios } = filtros;
    const saltar = (pagina - 1) * limite;

    // Construir condiciones WHERE
    const where = this.buildWhereConditions(criterios);

    const [casosClinico, total] = await Promise.all([
      this.prisma.casoClinico.findMany({
        where,
        include: {
          estudiante: {
            select: { nombre: true, apellido: true }
          },
          profesor: {
            select: { nombre: true, apellido: true }
          },
          paciente: {
            select: { nombre: true, apellido: true }
          },
          especialidad: {
            select: { nombre: true }
          },
          _count: {
            select: { 
              tratamientos: true
            }
          }
        },
        orderBy: { [ordenarPor]: direccion },
        skip: saltar,
        take: limite
      }),
      this.prisma.casoClinico.count({ where })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      data: casosClinico.map(caso => this.mapearCasoClinicoResumen(caso)),
      total,
      pagina,
      limite,
      totalPaginas,
      hayPaginaSiguiente: pagina < totalPaginas,
      hayPaginaAnterior: pagina > 1
    };
  }

  /**
   * Valida si un caso clínico puede ser finalizado
   * Verifica que todos los tratamientos estén FINALIZADOS
   * @param validacionDto - Datos para la validación
   * @returns Información de validación de finalización
   */
  async validarFinalizacion(validacionDto: ValidarFinalizacionDto): Promise<IValidacionFinalizacion> {
    this.logger.log(`Validando finalización de caso clínico ${validacionDto.casoClinicoId}`);

    const casoClinico = await this.obtenerCasoClinicoPorId(validacionDto.casoClinicoId);

    const tratamientos = await this.prisma.tratamiento.findMany({
      where: { casoClinicoId: validacionDto.casoClinicoId },
      select: { id: true, descripcion: true, estado: true }
    });

    const tratamientosTotal = tratamientos.length;
    const tratamientosFinalizados = tratamientos.filter(t => t.estado === EstadoTratamiento.FINALIZADO).length;
    const tratamientosPendientes = tratamientosTotal - tratamientosFinalizados;

    const puedeFinalizarse = tratamientosPendientes === 0 || validacionDto.forzarValidacion === true;
    
    let motivo = '';
    if (tratamientosTotal === 0) {
      motivo = 'El caso clínico no tiene tratamientos asociados';
    } else if (tratamientosPendientes > 0 && !validacionDto.forzarValidacion) {
      motivo = `Faltan ${tratamientosPendientes} tratamientos por finalizar`;
    } else if (puedeFinalizarse) {
      motivo = 'Todos los tratamientos están finalizados - Caso listo para finalizar';
    }

    return {
      puedeFinalizarse,
      tratamientosTotal,
      tratamientosFinalizados,
      tratamientosPendientes,
      motivo,
      tratamientosSinFinalizar: puedeFinalizarse ? undefined : tratamientos
        .filter(t => t.estado !== EstadoTratamiento.FINALIZADO)
        .map(t => ({
          id: t.id,
          descripcion: t.descripcion,
          estado: t.estado
        }))
    };
  }

  /**
   * Obtiene estadísticas de casos clínicos
   * @param filtros - Filtros para las estadísticas
   * @returns Estadísticas completas de casos clínicos
   */
  async obtenerEstadisticasCasosClinico(filtros: EstadisticasCasosClinicoDto): Promise<IEstadisticasCasosClinico> {
    this.logger.log(`Obteniendo estadísticas de casos clínicos`);

    const where = this.buildWhereConditions(filtros);

    const [
      total, 
      porEstado, 
      porEspecialidad, 
      casosDelMes,
      promedioCalificacion,
      casosConTratamientos,
      casosSinTratamientos
    ] = await Promise.all([
      this.prisma.casoClinico.count({ where }),
      this.obtenerEstadisticasPorEstado(where),
      this.obtenerEstadisticasPorEspecialidad(where),
      this.obtenerCasosDelMes(where),
      this.calcularPromedioCalificacion(where),
      this.contarCasosConTratamientos(where),
      this.contarCasosSinTratamientos(where)
    ]);

    return {
      total,
      porEstado,
      porEspecialidad,
      casosDelMes,
      promedioCalificacion,
      tiempoPromedioFinalizacion: await this.calcularTiempoPromedioFinalizacion(where),
      casosConTratamientos,
      casosSinTratamientos
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS AUXILIARES
  // ===============================

  /**
   * Configuración estándar de include para casos clínicos
   * Centraliza el patrón de include para consistencia
   */
  private getCasoClinicoInclude() {
    return {
      estudiante: {
        select: { id: true, nombre: true, apellido: true, email: true }
      },
      profesor: {
        select: { id: true, nombre: true, apellido: true, email: true }
      },
      paciente: {
        select: { 
          id: true, 
          nombre: true, 
          apellido: true, 
          fechaNacimiento: true,
          genero: true,
          numeroDocumento: true,
          tipoDocumento: true
        }
      },
      especialidad: {
        select: { id: true, nombre: true, descripcion: true }
      }
    };
  }

  /**
   * Mapea el resultado de Prisma a la interface ICasoClinico
   * @param casoClinico - Resultado de Prisma
   * @returns Caso clínico mapeado
   */
  private mapearCasoClinicoCompleto(casoClinico: any): ICasoClinico {
    return {
      id: casoClinico.id,
      fechaCreacion: casoClinico.fechaCreacion,
      fechaActualizacion: casoClinico.fechaActualizacion,
      pacienteId: casoClinico.pacienteId,
      profesorId: casoClinico.profesorId,
      estudianteId: casoClinico.estudianteId,
      especialidadId: casoClinico.especialidadId,
      calificacion: casoClinico.calificacion,
      estado: casoClinico.estado,
      ATM: casoClinico.ATM,
      CarayCuello: casoClinico.CarayCuello,
      PielyMucosa: casoClinico.PielyMucosa,
      craneo: casoClinico.craneo,
      enfermedadActual: casoClinico.enfermedadActual,
      facies: casoClinico.facies,
      marcha: casoClinico.marcha,
      motivoConsulta: casoClinico.motivoConsulta,
      peso: casoClinico.peso,
      talla: casoClinico.talla
    };
  }

  /**
   * Mapea el resultado de Prisma a ICasoClinicoResumen para listados
   * @param caso - Resultado de Prisma con includes
   * @returns Resumen del caso clínico
   */
  private mapearCasoClinicoResumen(caso: any): ICasoClinicoResumen {
    return {
      id: caso.id,
      fechaCreacion: caso.fechaCreacion,
      estado: caso.estado,
      motivoConsulta: caso.motivoConsulta,
      nombreEstudiante: `${caso.estudiante.nombre} ${caso.estudiante.apellido}`,
      nombreProfesor: `${caso.profesor.nombre} ${caso.profesor.apellido}`,
      nombrePaciente: `${caso.paciente.nombre} ${caso.paciente.apellido}`,
      nombreEspecialidad: caso.especialidad.nombre,
      calificacion: caso.calificacion,
      totalTratamientos: caso._count?.tratamientos || 0,
      tratamientosFinalizados: 0 // Se calculará en el query específico
    };
  }

  /**
   * Construye las condiciones WHERE para filtros
   * @param criterios - Criterios de filtrado
   * @returns Objeto WHERE para Prisma
   */
  private buildWhereConditions(criterios: any): any {
    const where: any = {};

    if (criterios.especialidadId) {
      where.especialidadId = criterios.especialidadId;
    }

    if (criterios.estudianteId) {
      where.estudianteId = criterios.estudianteId;
    }

    if (criterios.profesorId) {
      where.profesorId = criterios.profesorId;
    }

    if (criterios.pacienteId) {
      where.pacienteId = criterios.pacienteId;
    }

    if (criterios.estado) {
      where.estado = criterios.estado;
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
      where.OR = [
        { motivoConsulta: { contains: criterios.busqueda, mode: 'insensitive' } },
        { enfermedadActual: { contains: criterios.busqueda, mode: 'insensitive' } }
      ];
    }

    if (criterios.conTratamientos === true) {
      where.tratamientos = { some: {} };
    } else if (criterios.conTratamientos === false) {
      where.tratamientos = { none: {} };
    }

    return where;
  }

  // Métodos de validación y otros auxiliares continuarán...
  // [El resto de métodos privados seguirían el mismo patrón]

  /**
   * Valida que el paciente esté disponible para un nuevo caso
   * @param pacienteId - ID del paciente
   */
  private async validarPacienteDisponible(pacienteId: number): Promise<void> {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId }
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${pacienteId} no encontrado`);
    }

    // Verificar que no tenga casos activos
    const casosActivos = await this.prisma.casoClinico.count({
      where: {
        pacienteId,
        estado: {
          notIn: [EstadoCasoClinico.FINALIZADO, EstadoCasoClinico.CANCELADO]
        }
      }
    });

    if (casosActivos > 0) {
      throw new BadRequestException('El paciente ya tiene un caso clínico activo');
    }
  }

  /**
   * Valida que la especialidad exista
   * @param especialidadId - ID de la especialidad
   */
  private async validarEspecialidadExiste(especialidadId: number): Promise<void> {
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id: especialidadId }
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${especialidadId} no encontrada`);
    }
  }

  /**
   * Valida que el estudiante sea válido
   * @param estudianteId - ID del estudiante
   */
  private async validarEstudianteValido(estudianteId: number): Promise<void> {
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: estudianteId },
      include: { role: true }
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
    }

    if (estudiante.role.nombre !== RoleEnum.ESTUDIANTE) {
      throw new BadRequestException('El usuario especificado no es un estudiante');
    }

    if (!estudiante.activo) {
      throw new BadRequestException('El estudiante no está activo en el sistema');
    }
  }

  /**
   * Valida que el profesor sea válido
   * @param profesorId - ID del profesor
   */
  private async validarProfesorValido(profesorId: number): Promise<void> {
    const profesor = await this.prisma.usuario.findUnique({
      where: { id: profesorId },
      include: { role: true }
    });

    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${profesorId} no encontrado`);
    }

    if (profesor.role.nombre !== RoleEnum.PROFESOR) {
      throw new BadRequestException('El usuario especificado no es un profesor');
    }

    if (!profesor.activo) {
      throw new BadRequestException('El profesor no está activo en el sistema');
    }
  }

  /**
   * Valida los permisos para actualizar un caso clínico
   * @param casoClinico - Caso clínico a actualizar
   * @param usuarioId - ID del usuario que intenta actualizar
   * @param rolUsuario - Rol del usuario
   * @param tipoActualizacion - Tipo de actualización
   */
  private async validarPermisosActualizacion(
    casoClinico: ICasoClinico, 
    usuarioId: number, 
    rolUsuario: string, 
    tipoActualizacion: 'basico' | 'completo'
  ): Promise<void> {
    // Los profesores pueden actualizar cualquier caso
    if (rolUsuario === RoleEnum.PROFESOR || rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes solo pueden actualizar sus propios casos
    if (casoClinico.estudianteId !== usuarioId) {
      throw new ForbiddenException('No tienes permisos para actualizar este caso clínico');
    }

    // Los estudiantes solo pueden actualizar si el estado es EN_REVISION
    if (tipoActualizacion === 'basico' && casoClinico.estado !== EstadoCasoClinico.EN_REVISION) {
      throw new ForbiddenException('Solo puedes editar casos clínicos en estado EN_REVISION');
    }
  }

  /**
   * Valida las transiciones de estado permitidas
   * @param estadoActual - Estado actual del caso
   * @param nuevoEstado - Nuevo estado propuesto
   * @param casoId - ID del caso (para validaciones específicas)
   */
  private async validarTransicionEstado(
    estadoActual: EstadoCasoClinico, 
    nuevoEstado: EstadoCasoClinico,
    casoId: number
  ): Promise<void> {
    const transicionesPermitidas: Record<EstadoCasoClinico, EstadoCasoClinico[]> = {
      [EstadoCasoClinico.EN_REVISION]: [
        EstadoCasoClinico.APROBADO, 
        EstadoCasoClinico.CANCELADO
      ],
      [EstadoCasoClinico.APROBADO]: [
        EstadoCasoClinico.PENDIENTE_ESTUDIOS,
        EstadoCasoClinico.EN_TRATAMIENTO, 
        EstadoCasoClinico.CANCELADO
      ],
      [EstadoCasoClinico.PENDIENTE_ESTUDIOS]: [
        EstadoCasoClinico.EN_TRATAMIENTO,
        EstadoCasoClinico.CANCELADO
      ],
      [EstadoCasoClinico.EN_TRATAMIENTO]: [
        EstadoCasoClinico.FINALIZADO, 
        EstadoCasoClinico.CANCELADO
      ],
      [EstadoCasoClinico.FINALIZADO]: [], // Estado final
      [EstadoCasoClinico.CANCELADO]: [] // Estado final
    };

    const transicionesValidas = transicionesPermitidas[estadoActual] || [];

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`
      );
    }

    // Validación especial para FINALIZADO: verificar tratamientos
    if (nuevoEstado === EstadoCasoClinico.FINALIZADO) {
      const validacion = await this.validarFinalizacion({ casoClinicoId: casoId });
      if (!validacion.puedeFinalizarse) {
        throw new BadRequestException(
          `No se puede finalizar el caso: ${validacion.motivo}`
        );
      }
    }
  }

  /**
   * Registra el cambio de estado en el historial
   * @param casoId - ID del caso clínico
   * @param estadoAnterior - Estado anterior
   * @param estadoNuevo - Nuevo estado
   * @param usuarioId - Usuario que hizo el cambio
   * @param motivo - Motivo del cambio
   */
  private async registrarCambioEstado(
    casoId: number,
    estadoAnterior: EstadoCasoClinico,
    estadoNuevo: EstadoCasoClinico,
    usuarioId: number,
    motivo: string
  ): Promise<void> {
    this.logger.log(
      `Cambio de estado registrado - Caso: ${casoId}, ` +
      `${estadoAnterior} -> ${estadoNuevo}, Usuario: ${usuarioId}, Motivo: ${motivo}`
    );

    // Obtener el estudiante del caso clínico para cumplir con el schema
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoId },
      select: { estudianteId: true }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico ${casoId} no encontrado`);
    }

    // Crear observación del cambio de estado
    await this.prisma.observacion.create({
      data: {
        titulo: `Cambio de estado: ${estadoAnterior} → ${estadoNuevo}`,
        descripcion: motivo,
        docenteId: usuarioId,
        estudianteId: casoClinico.estudianteId, // Campo requerido por el esquema
        casoClinicoId: casoId,
        estado: EstadoObservacion.FINALIZADO
      }
    });
  }

  /**
   * Registra observación de calificación
   * @param casoId - ID del caso clínico
   * @param profesorId - ID del profesor
   * @param calificacion - Calificación asignada
   * @param observacion - Observación del profesor
   */
  private async registrarObservacionCalificacion(
    casoId: number,
    profesorId: number,
    calificacion: number,
    observacion: string
  ): Promise<void> {
    // Obtener el estudiante del caso clínico para cumplir con el schema
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoId },
      select: { estudianteId: true }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico ${casoId} no encontrado`);
    }

    await this.prisma.observacion.create({
      data: {
        titulo: `Calificación asignada: ${calificacion}/100`,
        descripcion: observacion,
        docenteId: profesorId,
        estudianteId: casoClinico.estudianteId, // Campo requerido por el esquema
        casoClinicoId: casoId,
        estado: EstadoObservacion.FINALIZADO
      }
    });
  }

  // Métodos de estadísticas (simplificados por espacio)
  private async obtenerEstadisticasPorEstado(where: any): Promise<Record<EstadoCasoClinico, number>> {
    const resultados = await this.prisma.casoClinico.groupBy({
      by: ['estado'],
      where,
      _count: { estado: true }
    });

    const porEstado = {} as Record<EstadoCasoClinico, number>;
    Object.values(EstadoCasoClinico).forEach(estado => {
      porEstado[estado] = 0;
    });

    resultados.forEach(resultado => {
      porEstado[resultado.estado] = resultado._count.estado;
    });

    return porEstado;
  }

  private async obtenerEstadisticasPorEspecialidad(where: any): Promise<{ [key: string]: number }> {
    const resultados = await this.prisma.casoClinico.groupBy({
      by: ['especialidadId'],
      where,
      _count: { especialidadId: true },
      _avg: { calificacion: true }
    });

    // Mapear IDs a nombres de especialidades
    const especialidades = await this.prisma.especialidad.findMany({
      select: { id: true, nombre: true }
    });

    const porEspecialidad: { [key: string]: number } = {};
    
    resultados.forEach(resultado => {
      const especialidad = especialidades.find(e => e.id === resultado.especialidadId);
      const nombre = especialidad?.nombre || `Especialidad ${resultado.especialidadId}`;
      porEspecialidad[nombre] = resultado._count.especialidadId;
    });

    return porEspecialidad;
  }

  private async obtenerCasosDelMes(where: any): Promise<number> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    return this.prisma.casoClinico.count({
      where: {
        ...where,
        fechaCreacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });
  }

  private async calcularPromedioCalificacion(where: any): Promise<number | undefined> {
    const resultado = await this.prisma.casoClinico.aggregate({
      where: {
        ...where,
        calificacion: { not: null }
      },
      _avg: { calificacion: true }
    });

    return resultado._avg.calificacion || undefined;
  }

  private async calcularTiempoPromedioFinalizacion(where: any): Promise<number | undefined> {
    const casosFinalizados = await this.prisma.casoClinico.findMany({
      where: {
        ...where,
        estado: EstadoCasoClinico.FINALIZADO
      },
      select: {
        fechaCreacion: true,
        fechaActualizacion: true
      }
    });

    if (casosFinalizados.length === 0) {
      return undefined;
    }

    const totalDias = casosFinalizados.reduce((suma, caso) => {
      const diferencia = caso.fechaActualizacion.getTime() - caso.fechaCreacion.getTime();
      const dias = diferencia / (1000 * 60 * 60 * 24);
      return suma + dias;
    }, 0);

    return Math.round(totalDias / casosFinalizados.length);
  }

  private async contarCasosConTratamientos(where: any): Promise<number> {
    return this.prisma.casoClinico.count({
      where: {
        ...where,
        tratamientos: { some: {} }
      }
    });
  }

  private async contarCasosSinTratamientos(where: any): Promise<number> {
    return this.prisma.casoClinico.count({
      where: {
        ...where,
        tratamientos: { none: {} }
      }
    });
  }

  /**
   * Obtener profesores disponibles para supervisión de casos clínicos
   * Retorna solo profesores activos con rol PROFESOR
   */
  async obtenerProfesoresDisponibles() {
    try {
      const profesores = await this.prisma.usuario.findMany({
        where: {
          activo: true,
          role: {
            nombre: RoleEnum.PROFESOR
          }
        },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true
        },
        orderBy: [
          { apellido: 'asc' },
          { nombre: 'asc' }
        ]
      });

      return profesores;
    } catch (error) {
      this.logger.error('Error al obtener profesores disponibles:', error);
      throw new BadRequestException('Error al obtener profesores disponibles');
    }
  }
}
