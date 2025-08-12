import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Logger,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { SetMetadata } from '@nestjs/common';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';
import { SolicitudService } from './solicitud.service';
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
 * Controlador para gestión de solicitudes académicas
 * Maneja endpoints para el flujo completo de solicitudes de estudiantes
 * para asignación a especialidades con aprobación docente
 */
@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudController {
  private readonly logger = new Logger(SolicitudController.name);

  constructor(private readonly solicitudService: SolicitudService) {}

  // ============================================================================
  // ENDPOINTS PARA CREAR SOLICITUDES
  // ============================================================================

  /**
   * Crear nueva solicitud estándar
   * POST /solicitudes
   * NOTA: Solo ESTUDIANTES pueden crear solicitudes como solicitantes
   * Los ADMIN pueden gestionar el sistema pero no crear solicitudes para sí mismos
   */
  @Post()
  @RequireRoles(RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async crearSolicitud(
    @Body() createDto: CrearSolicitudDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Estudiante ${req.user.id} creando nueva solicitud`);
    
    // Para estudiantes, siempre usar su ID como estudianteId
    createDto.estudianteId = req.user.id;

    return this.solicitudService.crearSolicitud(createDto);
  }

  /**
   * Crear solicitud rápida (versión simplificada para estudiantes)
   * POST /solicitudes/rapida
   */
  @Post('rapida')
  @RequireRoles(RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async crearSolicitudRapida(
    @Body() createDto: CrearSolicitudRapidaDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Estudiante ${req.user.id} creando solicitud rápida`);
    return this.solicitudService.crearSolicitudRapida(createDto, req.user.id);
  }

  /**
   * Crear solicitudes masivas (solo administradores)
   * POST /solicitudes/masiva
   */
  @Post('masiva')
  @RequireRoles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async crearSolicitudMasiva(
    @Body() createDto: CrearSolicitudMasivaDto,
    @Request() req: any
  ): Promise<ISolicitudResumen[]> {
    this.logger.log(`Administrador ${req.user.id} creando solicitudes masivas para ${createDto.estudianteIds.length} estudiantes`);
    return this.solicitudService.crearSolicitudMasiva(createDto);
  }

  /**
   * Crear solicitud prioritaria
   * POST /solicitudes/prioritaria
   */
  @Post('prioritaria')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @HttpCode(HttpStatus.CREATED)
  async crearSolicitudPrioritaria(
    @Body() createDto: CrearSolicitudPrioritariaDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} creando solicitud prioritaria`);
    
    // Agregar ID del coordinador que autoriza
    if (createDto.prioridad === 'ALTA') {
      createDto.coordinadorAutorizaId = req.user.id;
    }

    return this.solicitudService.crearSolicitudPrioritaria(createDto);
  }

  // ============================================================================
  // ENDPOINTS PARA CONSULTAR SOLICITUDES
  // ============================================================================

  /**
   * Obtener solicitudes con filtros
   * GET /solicitudes
   */
  @Get()
  async obtenerSolicitudes(
    @Query() filtros: FiltrosSolicitudesDto,
    @Request() req: any
  ): Promise<RespuestaPaginadaSolicitudesDto> {
    this.logger.log(`Usuario ${req.user.id} consultando solicitudes con filtros`);
    return this.solicitudService.obtenerSolicitudesConFiltros(
      filtros,
      req.user.id,
      req.user.role
    );
  }

  /**
   * Obtener solicitud específica por ID
   * GET /solicitudes/:id
   */
  @Get(':id')
  async obtenerSolicitudPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} consultando solicitud ${id}`);
    return this.solicitudService.obtenerSolicitudPorId(id, req.user.id, req.user.role);
  }

  /**
   * Obtener solicitudes por especialidad
   * GET /solicitudes/especialidad/:especialidadId
   */
  @Get('especialidad/:especialidadId')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  async obtenerSolicitudesPorEspecialidad(
    @Param('especialidadId', ParseIntPipe) especialidadId: number,
    @Request() req: any
  ): Promise<ISolicitudesPorEspecialidad> {
    this.logger.log(`Usuario ${req.user.id} consultando solicitudes de especialidad ${especialidadId}`);
    return this.solicitudService.obtenerSolicitudesPorEspecialidad(especialidadId);
  }

  /**
   * Obtener solicitudes por estudiante
   * GET /solicitudes/estudiante/:estudianteId
   */
  @Get('estudiante/:estudianteId')
  async obtenerSolicitudesPorEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Request() req: any
  ): Promise<ISolicitudesPorEstudiante> {
    // Los estudiantes solo pueden ver sus propias solicitudes
    if (req.user.role === RoleEnum.ESTUDIANTE && req.user.id !== estudianteId) {
      throw new Error('No tienes permisos para acceder a estas solicitudes');
    }

    this.logger.log(`Usuario ${req.user.id} consultando solicitudes del estudiante ${estudianteId}`);
    return this.solicitudService.obtenerSolicitudesPorEstudiante(estudianteId);
  }

  /**
   * Obtener mis solicitudes (endpoint específico para estudiantes)
   * GET /solicitudes/mis-solicitudes
   */
  @Get('mis-solicitudes')
  @RequireRoles(RoleEnum.ESTUDIANTE)
  async obtenerMisSolicitudes(@Request() req: any): Promise<ISolicitudesPorEstudiante> {
    this.logger.log(`Estudiante ${req.user.id} consultando sus solicitudes`);
    return this.solicitudService.obtenerSolicitudesPorEstudiante(req.user.id);
  }

  // ============================================================================
  // ENDPOINTS PARA PROCESAR SOLICITUDES
  // ============================================================================

  /**
   * Procesar solicitud (aprobar/rechazar/asignar docente)
   * PUT /solicitudes/:id/procesar
   */
  @Put(':id/procesar')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  async procesarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() procesarDto: ProcesarSolicitudDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} procesando solicitud ${id}`);
    return this.solicitudService.procesarSolicitud(id, procesarDto, req.user.id);
  }

  /**
   * Actualizar información básica de solicitud
   * PUT /solicitudes/:id
   * NOTA: Los estudiantes solo pueden actualizar sus propias solicitudes
   * Los ADMIN pueden actualizar cualquier solicitud para gestión del sistema
   */
  @Put(':id')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.ADMIN)
  async actualizarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarSolicitudBasicaDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} actualizando solicitud ${id}`);

    // Para estudiantes, siempre usar su ID. Para ADMIN, permitir gestión del sistema
    const estudianteId = req.user.role === RoleEnum.ESTUDIANTE ? req.user.id : undefined;
    
    return this.solicitudService.actualizarSolicitudBasica(id, updateDto, estudianteId || req.user.id);
  }

  /**
   * Cancelar solicitud
   * PUT /solicitudes/:id/cancelar
   * NOTA: Los estudiantes solo pueden cancelar sus propias solicitudes
   * Los ADMIN pueden cancelar cualquier solicitud para gestión del sistema
   */
  @Put(':id/cancelar')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.ADMIN)
  async cancelarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelarDto: CancelarSolicitudDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} cancelando solicitud ${id}`);

    // Para estudiantes, siempre usar su ID. Para ADMIN, permitir gestión del sistema
    const estudianteId = req.user.role === RoleEnum.ESTUDIANTE ? req.user.id : undefined;
    
    return this.solicitudService.cancelarSolicitud(id, cancelarDto, estudianteId || req.user.id);
  }

  /**
   * Asignar docente a solicitud
   * PUT /solicitudes/:id/asignar-docente
   */
  @Put(':id/asignar-docente')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  async asignarDocente(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarDto: AsignarDocenteDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} asignando docente a solicitud ${id}`);

    const procesarDto: ProcesarSolicitudDto = {
      nuevoEstado: 'PENDIENTE' as any,
      docenteId: asignarDto.docenteId,
      comentariosDocente: asignarDto.comentariosAsignacion || 'Docente asignado por administración'
    };

    return this.solicitudService.procesarSolicitud(id, procesarDto, req.user.id);
  }

  /**
   * Responder a solicitud (por parte del docente)
   * PUT /solicitudes/:id/responder
   */
  @Put(':id/responder')
  @RequireRoles(RoleEnum.PROFESOR)
  async responderSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() responderDto: ResponderSolicitudDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Docente ${req.user.id} respondiendo solicitud ${id}`);

    // Nota: ResponderSolicitudDto es para mensajes, no para cambio de estado
    // Para cambio de estado, crear un procesarDto básico
    const procesarDto: ProcesarSolicitudDto = {
      nuevoEstado: 'PENDIENTE' as any, // Estado se mantiene hasta decisión final
      docenteId: req.user.id,
      comentariosDocente: responderDto.mensaje
    };

    return this.solicitudService.procesarSolicitud(id, procesarDto, req.user.id);
  }

  // ============================================================================
  // ENDPOINTS PARA ESTADÍSTICAS Y REPORTES
  // ============================================================================

  /**
   * Obtener estadísticas generales de solicitudes
   * GET /solicitudes/estadisticas/generales
   */
  @Get('estadisticas/generales')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO, RoleEnum.PROFESOR)
  async obtenerEstadisticasGenerales(
    @Query() filtros: EstadisticasSolicitudesDto,
    @Request() req: any
  ): Promise<IEstadisticasSolicitudes> {
    this.logger.log(`Usuario ${req.user.id} consultando estadísticas generales`);
    return this.solicitudService.obtenerEstadisticasSolicitudes(filtros);
  }

  /**
   * Obtener dashboard de solicitudes
   * GET /solicitudes/dashboard
   */
  @Get('dashboard')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async obtenerDashboard(
    @Query() filtros: DashboardSolicitudesDto,
    @Request() req: any
  ): Promise<IDashboardSolicitudes> {
    this.logger.log(`Usuario ${req.user.id} consultando dashboard`);
    return this.solicitudService.obtenerDashboardSolicitudes(
      filtros,
      req.user.id,
      req.user.role
    );
  }

  /**
   * Generar reporte de solicitudes
   * POST /solicitudes/reportes/generar
   */
  @Post('reportes/generar')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  async generarReporte(
    @Body() reporteDto: GenerarReporteSolicitudesDto,
    @Request() req: any
  ): Promise<IReporteSolicitudes> {
    this.logger.log(`Usuario ${req.user.id} generando reporte de solicitudes`);
    
    // TODO: Implementar generación de reportes
    throw new Error('Funcionalidad de reportes en desarrollo');
  }

  // ============================================================================
  // ENDPOINTS ESPECIALIZADOS POR ROL
  // ============================================================================

  /**
   * Panel de control para docentes - solicitudes asignadas
   * GET /solicitudes/docente/panel
   */
  @Get('docente/panel')
  @RequireRoles(RoleEnum.PROFESOR)
  async obtenerPanelDocente(@Request() req: any): Promise<ISolicitudesPorDocente> {
    this.logger.log(`Docente ${req.user.id} accediendo a su panel`);
    
    // TODO: Implementar panel específico para docentes
    throw new Error('Panel docente en desarrollo');
  }

  /**
   * Búsqueda avanzada de solicitudes
   * POST /solicitudes/busqueda-avanzada
   */
  @Post('busqueda-avanzada')
  @RequireRoles(RoleEnum.ADMIN, RoleEnum.SECRETARIO, RoleEnum.PROFESOR)
  async busquedaAvanzada(
    @Body() busquedaDto: BusquedaAvanzadaSolicitudesDto,
    @Request() req: any
  ): Promise<RespuestaPaginadaSolicitudesDto> {
    this.logger.log(`Usuario ${req.user.id} realizando búsqueda avanzada`);
    
    // TODO: Implementar búsqueda avanzada
    throw new Error('Búsqueda avanzada en desarrollo');
  }

  /**
   * Validar si se puede crear una solicitud
   * POST /solicitudes/validar-creacion
   * NOTA: Solo estudiantes necesitan validar creación de solicitudes
   */
  @Post('validar-creacion')
  @RequireRoles(RoleEnum.ESTUDIANTE)
  async validarCreacionSolicitud(
    @Body() validarDto: ValidarCreacionSolicitudDto,
    @Request() req: any
  ): Promise<IValidacionSolicitud> {
    this.logger.log(`Estudiante ${req.user.id} validando creación de solicitud`);
    
    // TODO: Implementar validación de creación
    throw new Error('Validación de creación en desarrollo');
  }

  /**
   * Obtener notificaciones relacionadas con solicitudes
   * GET /solicitudes/notificaciones
   */
  @Get('notificaciones')
  async obtenerNotificaciones(
    @Query() filtros: FiltrosNotificacionesSolicitudesDto,
    @Request() req: any
  ): Promise<INotificacionSolicitud[]> {
    this.logger.log(`Usuario ${req.user.id} consultando notificaciones`);
    
    // TODO: Implementar sistema de notificaciones
    throw new Error('Sistema de notificaciones en desarrollo');
  }

  /**
   * Programar entrevista para solicitud
   * PUT /solicitudes/:id/programar-entrevista
   */
  @Put(':id/programar-entrevista')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  async programarEntrevista(
    @Param('id', ParseIntPipe) id: number,
    @Body() entrevistaDto: ProgramarEntrevistaDto,
    @Request() req: any
  ): Promise<ISolicitudCompleta> {
    this.logger.log(`Usuario ${req.user.id} programando entrevista para solicitud ${id}`);
    
    // TODO: Implementar programación de entrevistas
    throw new Error('Programación de entrevistas en desarrollo');
  }

  // ============================================================================
  // ENDPOINTS DE CONFIGURACIÓN (SOLO ADMIN)
  // ============================================================================

  /**
   * Obtener configuración del sistema de solicitudes
   * GET /solicitudes/configuracion
   */
  @Get('configuracion')
  @RequireRoles(RoleEnum.ADMIN)
  async obtenerConfiguracion(@Request() req: any): Promise<IConfiguracionSolicitudes> {
    this.logger.log(`Administrador ${req.user.id} consultando configuración`);
    
    // TODO: Implementar configuración del sistema
    throw new Error('Configuración del sistema en desarrollo');
  }

  /**
   * Actualizar configuración del sistema de solicitudes
   * PUT /solicitudes/configuracion
   */
  @Put('configuracion')
  @RequireRoles(RoleEnum.ADMIN)
  async actualizarConfiguracion(
    @Body() config: IConfiguracionSolicitudes,
    @Request() req: any
  ): Promise<IConfiguracionSolicitudes> {
    this.logger.log(`Administrador ${req.user.id} actualizando configuración`);
    
    // TODO: Implementar actualización de configuración
    throw new Error('Actualización de configuración en desarrollo');
  }

  // ============================================================================
  // ENDPOINTS DE UTILIDAD
  // ============================================================================

  /**
   * Obtener estadísticas rápidas para el usuario actual
   * GET /solicitudes/mi-resumen
   */
  @Get('mi-resumen')
  async obtenerMiResumen(@Request() req: any): Promise<any> {
    this.logger.log(`Usuario ${req.user.id} consultando su resumen personal`);
    
    // Retornar datos según el rol del usuario
    switch (req.user.role) {
      case RoleEnum.ESTUDIANTE:
        return this.solicitudService.obtenerSolicitudesPorEstudiante(req.user.id);
      
      case RoleEnum.PROFESOR:
        // TODO: Implementar resumen para docentes
        throw new Error('Resumen para docentes en desarrollo');
      
      case RoleEnum.ADMIN:
      case RoleEnum.SECRETARIO:
        // TODO: Implementar resumen administrativo
        throw new Error('Resumen administrativo en desarrollo');
      
      default:
        throw new Error('Rol no válido para obtener resumen');
    }
  }

  /**
   * Obtener contadores rápidos
   * GET /solicitudes/contadores
   */
  @Get('contadores')
  async obtenerContadores(@Request() req: any): Promise<any> {
    this.logger.log(`Usuario ${req.user.id} consultando contadores`);
    
    // TODO: Implementar contadores específicos por rol
    return {
      total: 0,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      canceladas: 0
    };
  }
}
