import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { Request } from 'express';
import { CasoClinicoService } from './caso.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';
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
  IEstadisticasCasosClinico, 
  IValidacionFinalizacion 
} from './Interface/caso-clinico.interface';

/**
 * Controlador para la gestión de casos clínicos
 * Proporciona endpoints para CRUD y operaciones especiales de casos clínicos
 * Integra con el sistema de permisos y filtros existente
 */
@ApiTags('Casos Clínicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('casos-clinicos')
export class CasoClinicoController {
  constructor(private readonly casoClinicoService: CasoClinicoService) {}

  /**
   * Crear un nuevo caso clínico
   * Disponible para estudiantes y profesores
   */
  @Post()
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Crear nuevo caso clínico',
    description: 'Crea un nuevo caso clínico con estado EN_REVISION por defecto. Disponible para estudiantes y profesores.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Caso clínico creado exitosamente',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente, especialidad, estudiante o profesor no encontrado' 
  })
  @ApiBody({ 
    type: CrearCasoClinicoDto,
    description: 'Datos del caso clínico a crear'
  })
  @HttpCode(HttpStatus.CREATED)
  async crearCasoClinico(
    @Body() createDto: CrearCasoClinicoDto
  ): Promise<ICasoClinico> {
    return this.casoClinicoService.crearCasoClinico(createDto);
  }

  /**
   * Obtener casos clínicos con filtros y paginación
   * Disponible para todos los roles autenticados
   */
  @Get()
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Obtener casos clínicos con filtros',
    description: 'Obtiene una lista paginada de casos clínicos con opciones de filtrado y ordenamiento.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de casos clínicos obtenida exitosamente',
    type: Object // RespuestaPaginadaCasosClinicoDto
  })
  @ApiQuery({ 
    name: 'pagina', 
    required: false, 
    type: Number, 
    description: 'Número de página (por defecto: 1)' 
  })
  @ApiQuery({ 
    name: 'limite', 
    required: false, 
    type: Number, 
    description: 'Elementos por página (por defecto: 10)' 
  })
  @ApiQuery({ 
    name: 'especialidadId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por especialidad' 
  })
  @ApiQuery({ 
    name: 'estudianteId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por estudiante' 
  })
  @ApiQuery({ 
    name: 'profesorId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por profesor' 
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    enum: ['EN_REVISION', 'APROBADO', 'PENDIENTE_ESTUDIOS', 'EN_TRATAMIENTO', 'FINALIZADO', 'CANCELADO'], 
    description: 'Filtrar por estado' 
  })
  @ApiQuery({ 
    name: 'busqueda', 
    required: false, 
    type: String, 
    description: 'Búsqueda por motivo de consulta o enfermedad actual' 
  })
  async obtenerCasosClinico(
    @Query() filtros: FiltrosCasosClinicoDto
  ): Promise<RespuestaPaginadaCasosClinicoDto> {
    return this.casoClinicoService.obtenerCasosClinicoConFiltros(filtros);
  }

  /**
   * Obtener un caso clínico específico por ID
   * Disponible para todos los roles autenticados
   */
  @Get(':id')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Obtener caso clínico por ID',
    description: 'Obtiene la información completa de un caso clínico específico incluyendo relaciones.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso clínico encontrado',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  async obtenerCasoClinicoPorId(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ICasoClinico> {
    return this.casoClinicoService.obtenerCasoClinicoPorId(id);
  }

  /**
   * Actualizar información básica de un caso clínico
   * Estudiantes: solo sus casos en estado EN_REVISION
   * Profesores: cualquier caso
   */
  @Put(':id/basico')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar información básica del caso clínico',
    description: 'Actualiza información médica básica. Los estudiantes solo pueden editar sus casos en estado EN_REVISION.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso clínico actualizado exitosamente',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para actualizar este caso' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  @ApiBody({ 
    type: ActualizarCasoClinicoBasicoDto,
    description: 'Datos básicos a actualizar'
  })
  async actualizarCasoClinicoBasico(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarCasoClinicoBasicoDto,
    @Req() req: Request
  ): Promise<ICasoClinico> {
    const { user } = req as any;
    return this.casoClinicoService.actualizarCasoClinicoBasico(
      id, 
      updateDto, 
      user.sub, 
      user.role
    );
  }

  /**
   * Actualizar el estado de un caso clínico
   * Solo disponible para profesores
   */
  @Patch(':id/estado')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar estado del caso clínico',
    description: 'Cambia el estado del caso clínico. Solo disponible para profesores. Valida transiciones permitidas.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado exitosamente',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Transición de estado no permitida' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  @ApiBody({ 
    type: ActualizarEstadoCasoClinicoDto,
    description: 'Nuevo estado y datos relacionados'
  })
  async actualizarEstadoCasoClinico(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarEstadoCasoClinicoDto
  ): Promise<ICasoClinico> {
    return this.casoClinicoService.actualizarEstadoCasoClinico(id, updateDto);
  }

  /**
   * Actualización completa del caso clínico
   * Solo disponible para profesores
   */
  @Put(':id/completo')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualización completa del caso clínico',
    description: 'Permite actualizar tanto información médica como estado del caso. Solo disponible para profesores.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso clínico actualizado completamente',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  @ApiBody({ 
    type: ActualizarCasoClinicoCompletoDto,
    description: 'Todos los datos a actualizar'
  })
  async actualizarCasoClinicoCompleto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarCasoClinicoCompletoDto
  ): Promise<ICasoClinico> {
    return this.casoClinicoService.actualizarCasoClinicoCompleto(id, updateDto);
  }

  /**
   * Asignar o actualizar calificación
   * Solo disponible para profesores
   */
  @Patch(':id/calificacion')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Asignar calificación al caso clínico',
    description: 'Asigna o actualiza la calificación de un caso clínico. Solo para casos APROBADOS o FINALIZADOS.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Calificación asignada exitosamente',
    type: Object // ICasoClinico
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Estado del caso no permite calificación' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  @ApiBody({ 
    type: AsignarCalificacionDto,
    description: 'Datos de la calificación'
  })
  async asignarCalificacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() calificacionDto: AsignarCalificacionDto
  ): Promise<ICasoClinico> {
    return this.casoClinicoService.asignarCalificacion(id, calificacionDto);
  }

  /**
   * Validar si un caso clínico puede ser finalizado
   * Verifica que todos los tratamientos estén FINALIZADOS
   */
  @Post(':id/validar-finalizacion')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Validar finalización del caso clínico',
    description: 'Verifica si un caso clínico puede ser finalizado validando el estado de todos sus tratamientos.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación completada',
    type: Object // IValidacionFinalizacion
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID del caso clínico' 
  })
  @ApiBody({ 
    type: ValidarFinalizacionDto,
    description: 'Parámetros de validación'
  })
  async validarFinalizacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() validacionDto: ValidarFinalizacionDto
  ): Promise<IValidacionFinalizacion> {
    validacionDto.casoClinicoId = id;
    return this.casoClinicoService.validarFinalizacion(validacionDto);
  }

  /**
   * Obtener estadísticas de casos clínicos
   * Disponible para profesores y administradores
   */
  @Get('estadisticas/resumen')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Obtener estadísticas de casos clínicos',
    description: 'Obtiene estadísticas completas de casos clínicos incluyendo distribución por estado, especialidad y métricas.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    type: Object // IEstadisticasCasosClinico
  })
  @ApiQuery({ 
    name: 'especialidadId', 
    required: false, 
    type: Number, 
    description: 'Filtrar estadísticas por especialidad' 
  })
  @ApiQuery({ 
    name: 'fechaDesde', 
    required: false, 
    type: String, 
    description: 'Fecha de inicio (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'fechaHasta', 
    required: false, 
    type: String, 
    description: 'Fecha de fin (YYYY-MM-DD)' 
  })
  async obtenerEstadisticas(
    @Query() filtros: EstadisticasCasosClinicoDto
  ): Promise<IEstadisticasCasosClinico> {
    return this.casoClinicoService.obtenerEstadisticasCasosClinico(filtros);
  }

  /**
   * Obtener casos clínicos de un estudiante específico
   * Disponible para el propio estudiante y profesores
   */
  @Get('estudiante/:estudianteId')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener casos clínicos de un estudiante',
    description: 'Obtiene todos los casos clínicos asociados a un estudiante específico.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Casos del estudiante obtenidos exitosamente',
    type: Object // RespuestaPaginadaCasosClinicoDto
  })
  @ApiParam({ 
    name: 'estudianteId', 
    type: Number, 
    description: 'ID del estudiante' 
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    enum: ['EN_REVISION', 'APROBADO', 'PENDIENTE_ESTUDIOS', 'EN_TRATAMIENTO', 'FINALIZADO', 'CANCELADO'], 
    description: 'Filtrar por estado' 
  })
  async obtenerCasosDeEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query() filtros: Omit<FiltrosCasosClinicoDto, 'estudianteId'>,
    @Req() req: Request
  ): Promise<RespuestaPaginadaCasosClinicoDto> {
    const { user } = req as any;
    
    // Si es estudiante, solo puede ver sus propios casos
    if (user.role === RoleEnum.ESTUDIANTE && user.sub !== estudianteId) {
      throw new ForbiddenException('Solo puedes ver tus propios casos clínicos');
    }

    const filtrosCompletos: FiltrosCasosClinicoDto = {
      ...filtros,
      estudianteId
    };

    return this.casoClinicoService.obtenerCasosClinicoConFiltros(filtrosCompletos);
  }

  /**
   * Obtener casos clínicos asignados a un profesor
   * Disponible para el propio profesor y administradores
   */
  @Get('profesor/:profesorId')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener casos clínicos asignados a un profesor',
    description: 'Obtiene todos los casos clínicos asignados a un profesor específico.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Casos del profesor obtenidos exitosamente',
    type: Object // RespuestaPaginadaCasosClinicoDto
  })
  @ApiParam({ 
    name: 'profesorId', 
    type: Number, 
    description: 'ID del profesor' 
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    enum: ['EN_REVISION', 'APROBADO', 'PENDIENTE_ESTUDIOS', 'EN_TRATAMIENTO', 'FINALIZADO', 'CANCELADO'], 
    description: 'Filtrar por estado' 
  })
  async obtenerCasosDeProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Query() filtros: Omit<FiltrosCasosClinicoDto, 'profesorId'>,
    @Req() req: Request
  ): Promise<RespuestaPaginadaCasosClinicoDto> {
    const { user } = req as any;
    
    // Si es profesor, solo puede ver sus propios casos asignados
    if (user.role === RoleEnum.PROFESOR && user.sub !== profesorId) {
      throw new ForbiddenException('Solo puedes ver los casos clínicos que tienes asignados');
    }

    const filtrosCompletos: FiltrosCasosClinicoDto = {
      ...filtros,
      profesorId
    };

    return this.casoClinicoService.obtenerCasosClinicoConFiltros(filtrosCompletos);
  }

  /**
   * Obtener casos clínicos que requieren atención
   * Para profesores: casos EN_REVISION asignados
   * Para estudiantes: casos rechazados (estado EN_REVISION de sus casos)
   */
  @Get('pendientes/atencion')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Obtener casos que requieren atención',
    description: 'Obtiene casos que requieren atención según el rol: profesores ven casos EN_REVISION, estudiantes ven sus casos rechazados.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Casos pendientes obtenidos exitosamente',
    type: Object // RespuestaPaginadaCasosClinicoDto
  })
  async obtenerCasosPendientesAtencion(
    @Req() req: Request
  ): Promise<RespuestaPaginadaCasosClinicoDto> {
    const { user } = req as any;
    
    let filtros: FiltrosCasosClinicoDto = {};

    if (user.role === RoleEnum.PROFESOR) {
      // Profesores ven casos EN_REVISION que tienen asignados
      filtros = {
        profesorId: user.sub,
        estado: 'EN_REVISION'
      };
    } else if (user.role === RoleEnum.ESTUDIANTE) {
      // Estudiantes ven sus casos EN_REVISION (rechazados o nuevos)
      filtros = {
        estudianteId: user.sub,
        estado: 'EN_REVISION'
      };
    } else {
      // Administradores ven todos los casos EN_REVISION
      filtros = {
        estado: 'EN_REVISION'
      };
    }

    return this.casoClinicoService.obtenerCasosClinicoConFiltros(filtros);
  }
}
