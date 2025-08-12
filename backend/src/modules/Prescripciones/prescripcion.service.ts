import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { EstadoPrescripcion, EstadoObservacion } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearPrescripcionDto, 
  ActualizarPrescripcionBasicaDto, 
  ActualizarEstadoPrescripcionDto, 
  ActualizarPrescripcionCompletaDto,
  ValidarInteraccionesDto,
  ValidarDosificacionDto,
  CompletarPrescripcionDto 
} from './DTO/crear-actualizar-prescripcion.dto';
import { 
  FiltrosPrescripcionesDto, 
  RespuestaPaginadaPrescripcionesDto, 
  EstadisticasPrescripcionesDto,
  ValidarFinalizacionPrescripcionDto,
  GenerarReportePrescripcionesDto,
  BusquedaAvanzadaPrescripcionesDto 
} from './DTO/filtros-prescripciones.dto';
import { 
  IPrescripcion, 
  IFiltrosPrescripciones, 
  IEstadisticasPrescripciones, 
  IPrescripcionResumen,
  IValidacionInteracciones,
  IValidacionDosificacion,
  IValidacionFinalizacionPrescripcion,
  IReportePrescripciones,
  IPrescripcionConCaso 
} from './Interface/prescripcion.interface';

/**
 * Servicio para gestión de prescripciones médicas
 * Maneja toda la lógica de negocio relacionada con prescripciones farmacológicas
 * Incluye validaciones de permisos, estados, interacciones y dosificación
 * Aprovecha el sistema de filtros y pipes existente para manejo de errores
 */
@Injectable()
export class PrescripcionService {
  private readonly logger = new Logger(PrescripcionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva prescripción con estado PENDIENTE por defecto
   * Solo disponible para estudiantes y profesores
   * @param createDto - Datos de la prescripción a crear
   * @returns Prescripción creada con toda la información
   */
  async crearPrescripcion(createDto: CrearPrescripcionDto): Promise<IPrescripcion> {
    this.logger.log(`Creando nueva prescripción para caso clínico ${createDto.casoClinicoId}`);

    try {
      // Verificar que el caso clínico existe y está activo
      await this.validarCasoClinicoExiste(createDto.casoClinicoId);

      // Validar que no existan prescripciones duplicadas del mismo medicamento activas
      await this.validarPrescripcionDuplicada(createDto.casoClinicoId, createDto.medicamento);

      const nuevaPrescripcion = await this.prisma.prescripcion.create({
        data: {
          ...createDto,
          estado: EstadoPrescripcion.PENDIENTE, // Estado por defecto
        },
        include: this.getPrescripcionInclude()
      });

      this.logger.log(`Prescripción creada exitosamente con ID: ${nuevaPrescripcion.id}`);
      return this.mapearPrescripcionCompleta(nuevaPrescripcion);

    } catch (error) {
      this.logger.error(`Error al crear prescripción: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualiza información básica de la prescripción
   * Disponible para estudiantes solo si el estado es PENDIENTE
   * @param id - ID de la prescripción
   * @param updateDto - Datos a actualizar
   * @param usuarioId - ID del usuario que hace la actualización
   * @param rolUsuario - Rol del usuario (para validar permisos)
   * @returns Prescripción actualizada
   */
  async actualizarPrescripcionBasica(
    id: number, 
    updateDto: ActualizarPrescripcionBasicaDto, 
    usuarioId: number, 
    rolUsuario: string
  ): Promise<IPrescripcion> {
    this.logger.log(`Actualizando prescripción ${id} - Usuario: ${usuarioId}, Rol: ${rolUsuario}`);

    const prescripcion = await this.obtenerPrescripcionPorId(id);

    // Validar permisos según el rol y estado
    await this.validarPermisosActualizacion(prescripcion, usuarioId, rolUsuario, 'basica');

    try {
      const prescripcionActualizada = await this.prisma.prescripcion.update({
        where: { id },
        data: updateDto,
        include: this.getPrescripcionInclude()
      });

      this.logger.log(`Prescripción ${id} actualizada exitosamente`);
      return this.mapearPrescripcionCompleta(prescripcionActualizada);

    } catch (error) {
      this.logger.error(`Error al actualizar prescripción ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar la prescripción');
    }
  }

  /**
   * Actualiza el estado de la prescripción
   * Solo disponible para profesores
   * @param id - ID de la prescripción
   * @param updateDto - Nuevo estado y datos relacionados
   * @returns Prescripción con estado actualizado
   */
  async actualizarEstadoPrescripcion(
    id: number, 
    updateDto: ActualizarEstadoPrescripcionDto
  ): Promise<IPrescripcion> {
    this.logger.log(`Actualizando estado de prescripción ${id} a ${updateDto.estado}`);

    const prescripcion = await this.obtenerPrescripcionPorId(id);

    // Validar transición de estado
    await this.validarTransicionEstado(prescripcion.estado, updateDto.estado, id);

    try {
      const prescripcionActualizada = await this.prisma.prescripcion.update({
        where: { id },
        data: {
          estado: updateDto.estado,
        },
        include: this.getPrescripcionInclude()
      });

      // Registrar el cambio de estado si se proporciona motivo
      if (updateDto.motivo || updateDto.observaciones) {
        await this.registrarCambioEstado(
          id, 
          prescripcion.estado, 
          updateDto.estado, 
          updateDto.motivo || 'Cambio de estado sin motivo específico',
          updateDto.observaciones
        );
      }

      this.logger.log(`Estado de prescripción ${id} actualizado a ${updateDto.estado}`);
      return this.mapearPrescripcionCompleta(prescripcionActualizada);

    } catch (error) {
      this.logger.error(`Error al actualizar estado de prescripción ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar el estado de la prescripción');
    }
  }

  /**
   * Actualización completa de la prescripción (solo profesores)
   * Permite cambiar tanto información farmacológica como estado
   * @param id - ID de la prescripción
   * @param updateDto - Todos los datos a actualizar
   * @returns Prescripción completamente actualizada
   */
  async actualizarPrescripcionCompleta(
    id: number, 
    updateDto: ActualizarPrescripcionCompletaDto
  ): Promise<IPrescripcion> {
    this.logger.log(`Actualización completa de prescripción ${id}`);

    const prescripcion = await this.obtenerPrescripcionPorId(id);

    // Validar transición de estado si se proporciona
    if (updateDto.estado && updateDto.estado !== prescripcion.estado) {
      await this.validarTransicionEstado(prescripcion.estado, updateDto.estado, id);
    }

    try {
      const { motivo, observacionesDocente, ...datosActualizacion } = updateDto;
      
      const prescripcionActualizada = await this.prisma.prescripcion.update({
        where: { id },
        data: datosActualizacion,
        include: this.getPrescripcionInclude()
      });

      // Registrar cambio de estado si aplica
      if (updateDto.estado && updateDto.estado !== prescripcion.estado) {
        await this.registrarCambioEstado(
          id, 
          prescripcion.estado, 
          updateDto.estado, 
          motivo || 'Actualización completa de prescripción',
          observacionesDocente
        );
      }

      this.logger.log(`Prescripción ${id} actualizada completamente`);
      return this.mapearPrescripcionCompleta(prescripcionActualizada);

    } catch (error) {
      this.logger.error(`Error en actualización completa de prescripción ${id}: ${error.message}`);
      throw new BadRequestException('Error al actualizar completamente la prescripción');
    }
  }

  /**
   * Completa una prescripción marcándola como COMPLETADO
   * Registra información sobre el cumplimiento del tratamiento
   * @param completarDto - Datos de finalización de la prescripción
   * @returns Prescripción completada
   */
  async completarPrescripcion(
    completarDto: CompletarPrescripcionDto
  ): Promise<IPrescripcion> {
    this.logger.log(`Completando prescripción ${completarDto.prescripcionId}`);

    const prescripcion = await this.obtenerPrescripcionPorId(completarDto.prescripcionId);

    // Validar que puede ser completada
    if (prescripcion.estado !== EstadoPrescripcion.EN_PROCESO) {
      throw new BadRequestException('Solo se pueden completar prescripciones en estado EN_PROCESO');
    }

    try {
      const prescripcionCompletada = await this.prisma.prescripcion.update({
        where: { id: completarDto.prescripcionId },
        data: {
          estado: EstadoPrescripcion.COMPLETADO,
        },
        include: this.getPrescripcionInclude()
      });

      // Registrar información de cumplimiento
      await this.registrarCompletacion(
        completarDto.prescripcionId,
        completarDto.observacionesCumplimiento,
        completarDto.porcentajeCumplimiento,
        completarDto.presentoEfectosAdversos,
        completarDto.descripcionEfectosAdversos
      );

      this.logger.log(`Prescripción ${completarDto.prescripcionId} completada exitosamente`);
      return this.mapearPrescripcionCompleta(prescripcionCompletada);

    } catch (error) {
      this.logger.error(`Error al completar prescripción ${completarDto.prescripcionId}: ${error.message}`);
      throw new BadRequestException('Error al completar la prescripción');
    }
  }

  /**
   * Obtiene una prescripción específica por su ID
   * @param id - ID de la prescripción
   * @returns Prescripción completa con relaciones
   */
  async obtenerPrescripcionPorId(id: number): Promise<IPrescripcion> {
    this.logger.log(`Obteniendo prescripción por ID: ${id}`);

    const prescripcion = await this.prisma.prescripcion.findUnique({
      where: { id },
      include: {
        ...this.getPrescripcionInclude(),
        observaciones: {
          select: { 
            id: true, 
            titulo: true,
            descripcion: true, 
            fecha: true,
            estado: true,
            docente: {
              select: { nombre: true, apellido: true }
            }
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });

    if (!prescripcion) {
      throw new NotFoundException(`Prescripción con ID ${id} no encontrada`);
    }

    return this.mapearPrescripcionCompleta(prescripcion);
  }

  /**
   * Obtiene prescripciones con filtros y paginación
   * @param filtros - Criterios de filtrado
   * @returns Resultado paginado de prescripciones
   */
  async obtenerPrescripcionesConFiltros(filtros: FiltrosPrescripcionesDto): Promise<RespuestaPaginadaPrescripcionesDto> {
    this.logger.log(`Obteniendo prescripciones con filtros: ${JSON.stringify(filtros)}`);

    const { pagina = 1, limite = 10, ordenarPor = 'fechaCreacion', direccion = 'desc', ...criterios } = filtros;
    const saltar = (pagina - 1) * limite;

    // Construir condiciones WHERE
    const where = this.buildWhereConditions(criterios);

    const [prescripciones, total] = await Promise.all([
      this.prisma.prescripcion.findMany({
        where,
        include: {
          casoClinico: {
            select: {
              paciente: {
                select: { nombre: true, apellido: true }
              },
              estudiante: {
                select: { nombre: true, apellido: true }
              },
              profesor: {
                select: { nombre: true, apellido: true }
              },
              especialidad: {
                select: { nombre: true }
              },
              motivoConsulta: true
            }
          }
        },
        orderBy: { [ordenarPor]: direccion },
        skip: saltar,
        take: limite
      }),
      this.prisma.prescripcion.count({ where })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      data: prescripciones.map(prescripcion => this.mapearPrescripcionResumen(prescripcion)),
      total,
      pagina,
      limite,
      totalPaginas,
      hayPaginaSiguiente: pagina < totalPaginas,
      hayPaginaAnterior: pagina > 1
    };
  }

  /**
   * Valida interacciones medicamentosas
   * Verifica conflictos con otras prescripciones del mismo paciente
   * @param validacionDto - Datos para la validación
   * @returns Información de validación de interacciones
   */
  async validarInteracciones(validacionDto: ValidarInteraccionesDto): Promise<IValidacionInteracciones> {
    this.logger.log(`Validando interacciones para prescripción ${validacionDto.prescripcionId}`);

    const prescripcion = await this.obtenerPrescripcionPorId(validacionDto.prescripcionId);

    // Obtener otras prescripciones activas del mismo paciente
    const prescripcionesActivas = await this.obtenerPrescripcionesActivasDelPaciente(
      prescripcion.casoClinicoId, 
      validacionDto.prescripcionId,
      validacionDto.incluirOtrosCasos
    );

    // Simular validación de interacciones (en un sistema real se conectaría a una base de datos de interacciones)
    const interaccionesEncontradas = await this.verificarInteraccionesMedicamentosas(
      prescripcion.medicamento,
      prescripcionesActivas
    );

    const tieneInteracciones = interaccionesEncontradas.length > 0;
    const interaccionesSeveras = interaccionesEncontradas.filter(i => i.tipoInteraccion === 'SEVERA');

    return {
      prescripcionId: validacionDto.prescripcionId,
      tieneInteracciones,
      interaccionesEncontradas,
      advertencias: this.generarAdvertenciasInteracciones(interaccionesEncontradas),
      requiereAprobacionEspecial: interaccionesSeveras.length > 0 && !validacionDto.forzarValidacion
    };
  }

  /**
   * Valida la dosificación de una prescripción
   * Verifica que la dosis sea apropiada según parámetros del paciente
   * @param validacionDto - Datos para la validación
   * @returns Información de validación de dosificación
   */
  async validarDosificacion(validacionDto: ValidarDosificacionDto): Promise<IValidacionDosificacion> {
    this.logger.log(`Validando dosificación para prescripción ${validacionDto.prescripcionId}`);

    const prescripcion = await this.obtenerPrescripcionPorId(validacionDto.prescripcionId);

    // Obtener datos del paciente
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: prescripcion.casoClinicoId },
      include: {
        paciente: {
          select: { 
            fechaNacimiento: true, 
            genero: true 
          }
        }
      }
    });

    if (!casoClinico) {
      throw new NotFoundException('Caso clínico no encontrado para validación');
    }

    // Calcular edad del paciente
    const edad = this.calcularEdad(casoClinico.paciente.fechaNacimiento);
    const peso = validacionDto.pesoKg || casoClinico.peso || null;

    // Simular validación de dosificación (en un sistema real usaría guías farmacológicas)
    const validacionDosis = await this.verificarDosificacionApropiada(
      prescripcion.medicamento,
      prescripcion.dosis,
      edad,
      peso,
      casoClinico.paciente.genero,
      validacionDto.considerarCondicionesMedicas
    );

    return validacionDosis;
  }

  /**
   * Valida si una prescripción puede ser finalizada
   * @param validacionDto - Datos para la validación
   * @returns Información de validación de finalización
   */
  async validarFinalizacion(validacionDto: ValidarFinalizacionPrescripcionDto): Promise<IValidacionFinalizacionPrescripcion> {
    this.logger.log(`Validando finalización de prescripción ${validacionDto.prescripcionId}`);

    const prescripcion = await this.obtenerPrescripcionPorId(validacionDto.prescripcionId);

    const camposFaltantes: string[] = [];
    const validacionesPendientes: string[] = [];

    // Verificar campos requeridos
    if (!prescripcion.medicamento) camposFaltantes.push('Medicamento');
    if (!prescripcion.dosis) camposFaltantes.push('Dosis');
    if (!prescripcion.frecuencia) camposFaltantes.push('Frecuencia');
    if (!prescripcion.duracion) camposFaltantes.push('Duración');

    // Verificar estado apropiado
    const estadosFinalizables: EstadoPrescripcion[] = [EstadoPrescripcion.APROBADO, EstadoPrescripcion.EN_PROCESO];
    if (!estadosFinalizables.includes(prescripcion.estado)) {
      validacionesPendientes.push(`Estado actual: ${prescripcion.estado} no permite finalización`);
    }

    // Verificar interacciones si está habilitado
    if (validacionDto.verificarInteracciones) {
      const interacciones = await this.validarInteracciones({ 
        prescripcionId: validacionDto.prescripcionId 
      });
      if (interacciones.requiereAprobacionEspecial) {
        validacionesPendientes.push('Requiere aprobación especial por interacciones medicamentosas');
      }
    }

    const puedeFinalizarse = (camposFaltantes.length === 0 && validacionesPendientes.length === 0) || 
                            validacionDto.forzarValidacion === true;

    let motivo = '';
    if (camposFaltantes.length > 0) {
      motivo = `Campos faltantes: ${camposFaltantes.join(', ')}`;
    } else if (validacionesPendientes.length > 0) {
      motivo = `Validaciones pendientes: ${validacionesPendientes.join(', ')}`;
    } else {
      motivo = 'Prescripción lista para finalizar';
    }

    return {
      prescripcionId: validacionDto.prescripcionId,
      puedeFinalizarse,
      camposFaltantes,
      validacionesPendientes,
      observacionesRequeridas: prescripcion.estado === EstadoPrescripcion.APROBADO,
      aprobacionDocenteRequerida: prescripcion.estado === EstadoPrescripcion.PENDIENTE,
      motivo
    };
  }

  /**
   * Obtiene estadísticas de prescripciones
   * @param filtros - Filtros para las estadísticas
   * @returns Estadísticas completas de prescripciones
   */
  async obtenerEstadisticasPrescripciones(filtros: EstadisticasPrescripcionesDto): Promise<IEstadisticasPrescripciones> {
    this.logger.log(`Obteniendo estadísticas de prescripciones`);

    const where = this.buildWhereConditions(filtros);

    const [
      total, 
      porEstado, 
      porMedicamento, 
      porViaAdministracion,
      porPresentacion,
      prescripcionesDelMes,
      tiempoPromedioAprobacion,
      medicamentosMasPrescritos,
      prescripcionesPorEstudiante
    ] = await Promise.all([
      this.prisma.prescripcion.count({ where }),
      this.obtenerEstadisticasPorEstado(where),
      this.obtenerEstadisticasPorMedicamento(where),
      this.obtenerEstadisticasPorViaAdministracion(where),
      this.obtenerEstadisticasPorPresentacion(where),
      this.obtenerPrescripcionesDelMes(where),
      this.calcularTiempoPromedioAprobacion(where),
      this.obtenerMedicamentosMasPrescritos(where),
      this.obtenerPrescripcionesPorEstudiante(where)
    ]);

    const totalAprobadas = porEstado[EstadoPrescripcion.APROBADO] || 0;
    const porcentajeAprobacion = total > 0 ? Math.round((totalAprobadas / total) * 100) : 0;

    return {
      total,
      porEstado,
      porMedicamento,
      porViaAdministracion,
      porPresentacion,
      prescripcionesDelMes,
      tiempoPromedioAprobacion,
      porcentajeAprobacion,
      medicamentosMasPrescritos,
      prescripcionesPorEstudiante
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS AUXILIARES
  // ===============================

  /**
   * Configuración estándar de include para prescripciones
   */
  private getPrescripcionInclude() {
    return {
      casoClinico: {
        select: {
          id: true,
          motivoConsulta: true,
          estado: true,
          paciente: {
            select: { 
              id: true, 
              nombre: true, 
              apellido: true, 
              fechaNacimiento: true,
              genero: true
            }
          },
          estudiante: {
            select: { id: true, nombre: true, apellido: true }
          },
          profesor: {
            select: { id: true, nombre: true, apellido: true }
          },
          especialidad: {
            select: { id: true, nombre: true }
          }
        }
      }
    };
  }

  /**
   * Mapea el resultado de Prisma a la interface IPrescripcion
   */
  private mapearPrescripcionCompleta(prescripcion: any): IPrescripcion {
    return {
      id: prescripcion.id,
      medicamento: prescripcion.medicamento,
      dosis: prescripcion.dosis,
      frecuencia: prescripcion.frecuencia,
      duracion: prescripcion.duracion,
      estado: prescripcion.estado,
      fechaCreacion: prescripcion.fechaCreacion,
      fechaActualizacion: prescripcion.fechaActualizacion,
      casoClinicoId: prescripcion.casoClinicoId,
      concentracion: prescripcion.concentracion,
      Nrodefarmacos: prescripcion.Nrodefarmacos,
      presentacion: prescripcion.presentacion,
      viadeadministracion: prescripcion.viadeadministracion
    };
  }

  /**
   * Mapea el resultado de Prisma a IPrescripcionResumen para listados
   */
  private mapearPrescripcionResumen(prescripcion: any): IPrescripcionResumen {
    return {
      id: prescripcion.id,
      medicamento: prescripcion.medicamento,
      dosis: prescripcion.dosis,
      estado: prescripcion.estado,
      fechaCreacion: prescripcion.fechaCreacion,
      nombrePaciente: `${prescripcion.casoClinico.paciente.nombre} ${prescripcion.casoClinico.paciente.apellido}`,
      nombreEstudiante: `${prescripcion.casoClinico.estudiante.nombre} ${prescripcion.casoClinico.estudiante.apellido}`,
      casoClinicoId: prescripcion.casoClinicoId,
      concentracion: prescripcion.concentracion,
      presentacion: prescripcion.presentacion
    };
  }

  /**
   * Construye las condiciones WHERE para filtros
   */
  private buildWhereConditions(criterios: any): any {
    const where: any = {};

    if (criterios.casoClinicoId) {
      where.casoClinicoId = criterios.casoClinicoId;
    }

    if (criterios.estado) {
      where.estado = criterios.estado;
    }

    if (criterios.medicamento) {
      where.medicamento = { contains: criterios.medicamento, mode: 'insensitive' };
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
        { medicamento: { contains: criterios.busqueda, mode: 'insensitive' } },
        { dosis: { contains: criterios.busqueda, mode: 'insensitive' } },
        { concentracion: { contains: criterios.busqueda, mode: 'insensitive' } }
      ];
    }

    if (criterios.viaAdministracion) {
      where.viadeadministracion = { contains: criterios.viaAdministracion, mode: 'insensitive' };
    }

    if (criterios.presentacion) {
      where.presentacion = { contains: criterios.presentacion, mode: 'insensitive' };
    }

    if (criterios.conObservaciones === true) {
      where.observaciones = { some: {} };
    } else if (criterios.conObservaciones === false) {
      where.observaciones = { none: {} };
    }

    return where;
  }

  // Métodos de validación y otros auxiliares continuarán...
  // [El resto de métodos privados seguirían el mismo patrón]

  private async validarCasoClinicoExiste(casoClinicoId: number): Promise<void> {
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico con ID ${casoClinicoId} no encontrado`);
    }
  }

  private async validarPrescripcionDuplicada(casoClinicoId: number, medicamento: string): Promise<void> {
    const prescripcionExistente = await this.prisma.prescripcion.findFirst({
      where: {
        casoClinicoId,
        medicamento: { contains: medicamento, mode: 'insensitive' },
        estado: {
          notIn: [EstadoPrescripcion.CANCELADO, EstadoPrescripcion.COMPLETADO]
        }
      }
    });

    if (prescripcionExistente) {
      throw new BadRequestException(`Ya existe una prescripción activa de ${medicamento} para este caso clínico`);
    }
  }

  private async validarPermisosActualizacion(
    prescripcion: IPrescripcion, 
    usuarioId: number, 
    rolUsuario: string, 
    tipoActualizacion: 'basica' | 'completa'
  ): Promise<void> {
    // Los profesores pueden actualizar cualquier prescripción
    if (rolUsuario === RoleEnum.PROFESOR || rolUsuario === RoleEnum.ADMIN) {
      return;
    }

    // Los estudiantes solo pueden actualizar prescripciones PENDIENTES
    if (tipoActualizacion === 'basica' && prescripcion.estado !== EstadoPrescripcion.PENDIENTE) {
      throw new ForbiddenException('Solo puedes editar prescripciones en estado PENDIENTE');
    }
  }

  private async validarTransicionEstado(
    estadoActual: EstadoPrescripcion, 
    nuevoEstado: EstadoPrescripcion,
    prescripcionId: number
  ): Promise<void> {
    const transicionesPermitidas: Record<EstadoPrescripcion, EstadoPrescripcion[]> = {
      [EstadoPrescripcion.PENDIENTE]: [
        EstadoPrescripcion.APROBADO, 
        EstadoPrescripcion.RECHAZADO,
        EstadoPrescripcion.CANCELADO
      ],
      [EstadoPrescripcion.APROBADO]: [
        EstadoPrescripcion.EN_PROCESO,
        EstadoPrescripcion.CANCELADO
      ],
      [EstadoPrescripcion.RECHAZADO]: [
        EstadoPrescripcion.PENDIENTE,
        EstadoPrescripcion.CANCELADO
      ],
      [EstadoPrescripcion.EN_PROCESO]: [
        EstadoPrescripcion.COMPLETADO,
        EstadoPrescripcion.INCOMPLETO,
        EstadoPrescripcion.CANCELADO
      ],
      [EstadoPrescripcion.COMPLETADO]: [], // Estado final
      [EstadoPrescripcion.INCOMPLETO]: [
        EstadoPrescripcion.EN_PROCESO,
        EstadoPrescripcion.CANCELADO
      ],
      [EstadoPrescripcion.CANCELADO]: [] // Estado final
    };

    const transicionesValidas = transicionesPermitidas[estadoActual] || [];

    if (!transicionesValidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}`
      );
    }
  }

  private async registrarCambioEstado(
    prescripcionId: number,
    estadoAnterior: EstadoPrescripcion,
    estadoNuevo: EstadoPrescripcion,
    motivo: string,
    observaciones?: string
  ): Promise<void> {
    this.logger.log(
      `Cambio de estado registrado - Prescripción: ${prescripcionId}, ` +
      `${estadoAnterior} -> ${estadoNuevo}, Motivo: ${motivo}`
    );

    // Obtener información del caso clínico y estudiante
    const prescripcion = await this.prisma.prescripcion.findUnique({
      where: { id: prescripcionId },
      include: {
        casoClinico: {
          select: { estudianteId: true }
        }
      }
    });

    if (!prescripcion) {
      throw new NotFoundException(`Prescripción ${prescripcionId} no encontrada`);
    }

    // Crear observación del cambio de estado
    await this.prisma.observacion.create({
      data: {
        titulo: `Cambio de estado: ${estadoAnterior} → ${estadoNuevo}`,
        descripcion: `${motivo}${observaciones ? `\n\nObservaciones: ${observaciones}` : ''}`,
        estudianteId: prescripcion.casoClinico.estudianteId,
        prescripcionId: prescripcionId,
        estado: EstadoObservacion.FINALIZADO
      }
    });
  }

  private async registrarCompletacion(
    prescripcionId: number,
    observacionesCumplimiento?: string,
    porcentajeCumplimiento?: number,
    presentoEfectosAdversos?: boolean,
    descripcionEfectosAdversos?: string
  ): Promise<void> {
    const prescripcion = await this.prisma.prescripcion.findUnique({
      where: { id: prescripcionId },
      include: {
        casoClinico: {
          select: { estudianteId: true }
        }
      }
    });

    if (!prescripcion) return;

    let descripcion = 'Prescripción completada exitosamente.';
    
    if (observacionesCumplimiento) {
      descripcion += `\n\nObservaciones: ${observacionesCumplimiento}`;
    }
    
    if (porcentajeCumplimiento !== undefined) {
      descripcion += `\n\nCumplimiento: ${porcentajeCumplimiento}%`;
    }
    
    if (presentoEfectosAdversos && descripcionEfectosAdversos) {
      descripcion += `\n\nEfectos adversos: ${descripcionEfectosAdversos}`;
    }

    await this.prisma.observacion.create({
      data: {
        titulo: 'Prescripción completada',
        descripcion,
        estudianteId: prescripcion.casoClinico.estudianteId,
        prescripcionId: prescripcionId,
        estado: EstadoObservacion.FINALIZADO
      }
    });
  }

  // Métodos auxiliares para estadísticas (simplificados)
  private async obtenerEstadisticasPorEstado(where: any): Promise<Record<EstadoPrescripcion, number>> {
    const resultados = await this.prisma.prescripcion.groupBy({
      by: ['estado'],
      where,
      _count: { estado: true }
    });

    const porEstado = {} as Record<EstadoPrescripcion, number>;
    Object.values(EstadoPrescripcion).forEach(estado => {
      porEstado[estado] = 0;
    });

    resultados.forEach(resultado => {
      porEstado[resultado.estado] = resultado._count.estado;
    });

    return porEstado;
  }

  private async obtenerEstadisticasPorMedicamento(where: any): Promise<{ [key: string]: number }> {
    const resultados = await this.prisma.prescripcion.groupBy({
      by: ['medicamento'],
      where,
      _count: { medicamento: true }
    });

    const porMedicamento: { [key: string]: number } = {};
    resultados.forEach(resultado => {
      porMedicamento[resultado.medicamento] = resultado._count.medicamento;
    });

    return porMedicamento;
  }

  private async obtenerEstadisticasPorViaAdministracion(where: any): Promise<{ [key: string]: number }> {
    const resultados = await this.prisma.prescripcion.groupBy({
      by: ['viadeadministracion'],
      where,
      _count: { viadeadministracion: true }
    });

    const porVia: { [key: string]: number } = {};
    resultados.forEach(resultado => {
      porVia[resultado.viadeadministracion] = resultado._count.viadeadministracion;
    });

    return porVia;
  }

  private async obtenerEstadisticasPorPresentacion(where: any): Promise<{ [key: string]: number }> {
    const resultados = await this.prisma.prescripcion.groupBy({
      by: ['presentacion'],
      where,
      _count: { presentacion: true }
    });

    const porPresentacion: { [key: string]: number } = {};
    resultados.forEach(resultado => {
      porPresentacion[resultado.presentacion] = resultado._count.presentacion;
    });

    return porPresentacion;
  }

  private async obtenerPrescripcionesDelMes(where: any): Promise<number> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    return this.prisma.prescripcion.count({
      where: {
        ...where,
        fechaCreacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });
  }

  private async calcularTiempoPromedioAprobacion(where: any): Promise<number | undefined> {
    // Simplificado - en implementación real calcularía el tiempo entre creación y aprobación
    return undefined;
  }

  private async obtenerMedicamentosMasPrescritos(where: any): Promise<Array<{
    medicamento: string;
    concentracion: string;
    cantidad: number;
    porcentaje: number;
  }>> {
    const resultados = await this.prisma.prescripcion.groupBy({
      by: ['medicamento', 'concentracion'],
      where,
      _count: { medicamento: true },
      orderBy: { _count: { medicamento: 'desc' } },
      take: 10
    });

    const total = await this.prisma.prescripcion.count({ where });

    return resultados.map(resultado => ({
      medicamento: resultado.medicamento,
      concentracion: resultado.concentracion,
      cantidad: resultado._count.medicamento,
      porcentaje: total > 0 ? Math.round((resultado._count.medicamento / total) * 100) : 0
    }));
  }

  private async obtenerPrescripcionesPorEstudiante(where: any): Promise<Array<{
    estudianteId: number;
    nombreEstudiante: string;
    total: number;
    aprobadas: number;
    pendientes: number;
    rechazadas: number;
  }>> {
    // Simplificado - implementación completa requeriría múltiples queries
    return [];
  }

  // Métodos auxiliares adicionales
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  private async obtenerPrescripcionesActivasDelPaciente(
    casoClinicoId: number, 
    prescripcionExcluir: number,
    incluirOtrosCasos?: boolean
  ): Promise<any[]> {
    const whereCondition: any = {
      id: { not: prescripcionExcluir },
      estado: {
        in: [
          EstadoPrescripcion.APROBADO, 
          EstadoPrescripcion.EN_PROCESO
        ]
      }
    };

    if (incluirOtrosCasos) {
      // Obtener el paciente del caso clínico actual
      const casoActual = await this.prisma.casoClinico.findUnique({
        where: { id: casoClinicoId },
        select: { pacienteId: true }
      });

      if (casoActual) {
        whereCondition.casoClinico = {
          pacienteId: casoActual.pacienteId
        };
      }
    } else {
      whereCondition.casoClinicoId = casoClinicoId;
    }

    return this.prisma.prescripcion.findMany({
      where: whereCondition,
      select: {
        id: true,
        medicamento: true,
        dosis: true,
        concentracion: true
      }
    });
  }

  private async verificarInteraccionesMedicamentosas(
    medicamento: string,
    prescripcionesActivas: any[]
  ): Promise<Array<{
    medicamentoConflicto: string;
    prescripcionConflictoId: number;
    tipoInteraccion: 'LEVE' | 'MODERADA' | 'SEVERA';
    descripcion: string;
    recomendacion?: string;
  }>> {
    // Simulación de validación de interacciones
    // En un sistema real se conectaría a una base de datos de interacciones medicamentosas
    const interacciones: Array<{
      medicamentoConflicto: string;
      prescripcionConflictoId: number;
      tipoInteraccion: 'LEVE' | 'MODERADA' | 'SEVERA';
      descripcion: string;
      recomendacion?: string;
    }> = [];

    // Ejemplo: detectar interacciones comunes
    for (const prescripcionActiva of prescripcionesActivas) {
      if (medicamento.toLowerCase().includes('warfarina') && 
          prescripcionActiva.medicamento.toLowerCase().includes('aspirina')) {
        interacciones.push({
          medicamentoConflicto: prescripcionActiva.medicamento,
          prescripcionConflictoId: prescripcionActiva.id,
          tipoInteraccion: 'SEVERA',
          descripcion: 'Riesgo aumentado de sangrado',
          recomendacion: 'Monitoreo estrecho de INR y signos de sangrado'
        });
      }
    }

    return interacciones;
  }

  private generarAdvertenciasInteracciones(
    interacciones: Array<{
      tipoInteraccion: 'LEVE' | 'MODERADA' | 'SEVERA';
      descripcion: string;
    }>
  ): string[] {
    const advertencias: string[] = [];

    const interaccionesSeveras = interacciones.filter(i => i.tipoInteraccion === 'SEVERA');
    const interaccionesModeradas = interacciones.filter(i => i.tipoInteraccion === 'MODERADA');

    if (interaccionesSeveras.length > 0) {
      advertencias.push(`Se encontraron ${interaccionesSeveras.length} interacciones severas que requieren atención inmediata`);
    }

    if (interaccionesModeradas.length > 0) {
      advertencias.push(`Se encontraron ${interaccionesModeradas.length} interacciones moderadas que requieren monitoreo`);
    }

    return advertencias;
  }

  private async verificarDosificacionApropiada(
    medicamento: string,
    dosis: string,
    edad: number,
    peso: number | null,
    genero: string,
    considerarCondicionesMedicas?: boolean
  ): Promise<IValidacionDosificacion> {
    // Simulación de validación de dosificación
    // En un sistema real usaría guías farmacológicas y algoritmos de dosificación

    const factoresConsiderados = [
      { factor: 'Edad', valor: `${edad} años`, impacto: 'SIN_EFECTO' as const },
      ...(peso ? [{ factor: 'Peso', valor: `${peso} kg`, impacto: 'SIN_EFECTO' as const }] : []),
      { factor: 'Género', valor: genero, impacto: 'SIN_EFECTO' as const }
    ];

    return {
      prescripcionId: 0, // Se asignará en el llamador
      dosisApropiada: true,
      factoresConsiderados,
      advertenciasDosis: [],
      requiereAjuste: false
    };
  }
}
