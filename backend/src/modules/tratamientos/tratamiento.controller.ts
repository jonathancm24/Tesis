import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TratamientoService } from './tratamiento.service';
import { 
  CrearTratamientoDto, 
  ActualizarTratamientoBasicoDto, 
  ActualizarEstadoTratamientoDto, 
  ActualizarTratamientoCompletoDto 
} from './DTO/crear-actualizar-tratamiento.dto';
import { 
  FiltrosTratamientosDto, 
  EstadisticasTratamientosDto 
} from './DTO/filtros-tratamientos.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';

/**
 * Controlador para gestión de tratamientos clínicos
 * Maneja todas las operaciones CRUD con validaciones de permisos específicas
 * Incluye endpoints diferenciados para estudiantes y profesores
 */
@ApiTags('Tratamientos')
@Controller('tratamientos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TratamientoController {
  private readonly logger = new Logger(TratamientoController.name);

  constructor(private readonly tratamientoService: TratamientoService) {}

  // ===============================
  // ENDPOINTS PARA CREAR TRATAMIENTOS
  // ===============================

  /**
   * Crear nuevo tratamiento (Estudiantes y Profesores)
   * El estado por defecto es PENDIENTE
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Crear nuevo tratamiento',
    description: 'Crea un nuevo tratamiento con estado PENDIENTE por defecto. Disponible para estudiantes y profesores.'
  })
  @ApiResponse({
    status: 201,
    description: 'Tratamiento creado exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o códigos CIE-10/procedimiento no encontrados'
  })
  @ApiResponse({
    status: 404,
    description: 'Caso clínico o estudiante no encontrado'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token requerido'
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Rol insuficiente'
  })
  async crearTratamiento(@Body() createDto: CrearTratamientoDto) {
    this.logger.log('POST /tratamientos - Creando nuevo tratamiento');
    return await this.tratamientoService.crearTratamiento(createDto);
  }

  // ===============================
  // ENDPOINTS PARA ACTUALIZAR TRATAMIENTOS
  // ===============================

  /**
   * Actualizar información básica del tratamiento
   * Para estudiantes: solo si el estado es RECHAZADO
   * Para profesores: sin restricciones de estado
   */
  @Put(':id/basico')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Actualizar información básica del tratamiento',
    description: 'Actualiza información médica del tratamiento. Los estudiantes solo pueden editar tratamientos RECHAZADOS.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento actualizado exitosamente'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para actualizar este tratamiento o estado no permite edición'
  })
  @ApiResponse({
    status: 404,
    description: 'Tratamiento no encontrado'
  })
  async actualizarTratamientoBasico(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarTratamientoBasicoDto,
    @Request() req: any
  ) {
    this.logger.log(`PUT /tratamientos/${id}/basico - Usuario: ${req.user.id}, Rol: ${req.user.rol}`);
    
    return await this.tratamientoService.actualizarTratamientoBasico(
      id, 
      updateDto, 
      req.user.id, 
      req.user.rol
    );
  }

  /**
   * Actualizar estado del tratamiento (Solo Profesores)
   * Permite cambiar el estado y asignar docente responsable
   */
  @Put(':id/estado')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Actualizar estado del tratamiento',
    description: 'Cambia el estado del tratamiento y asigna docente. Solo disponible para profesores.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del tratamiento actualizado exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no válida'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo profesores pueden cambiar el estado'
  })
  @ApiResponse({
    status: 404,
    description: 'Tratamiento no encontrado'
  })
  async actualizarEstadoTratamiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarEstadoTratamientoDto
  ) {
    this.logger.log(`PUT /tratamientos/${id}/estado - Nuevo estado: ${updateDto.estado}`);
    return await this.tratamientoService.actualizarEstadoTratamiento(id, updateDto);
  }

  /**
   * Actualización completa del tratamiento (Solo Profesores)
   * Permite cambiar tanto información médica como estado en una sola operación
   */
  @Put(':id/completo')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Actualización completa del tratamiento',
    description: 'Actualiza toda la información del tratamiento incluyendo estado. Solo para profesores.'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento actualizado completamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o transición de estado no permitida'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo profesores pueden realizar actualizaciones completas'
  })
  @ApiResponse({
    status: 404,
    description: 'Tratamiento no encontrado'
  })
  async actualizarTratamientoCompleto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarTratamientoCompletoDto
  ) {
    this.logger.log(`PUT /tratamientos/${id}/completo - Actualización completa`);
    return await this.tratamientoService.actualizarTratamientoCompleto(id, updateDto);
  }

  // ===============================
  // ENDPOINTS PARA CONSULTAR TRATAMIENTOS
  // ===============================

  /**
   * Obtener todos los tratamientos de un caso clínico específico
   * Retorna resumen de tratamientos ordenados por fecha de creación
   */
  @Get('caso-clinico/:casoClinicoId')
  @ApiOperation({
    summary: 'Obtener tratamientos por caso clínico',
    description: 'Obtiene todos los tratamientos asociados a un caso clínico específico'
  })
  @ApiParam({
    name: 'casoClinicoId',
    description: 'ID del caso clínico',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos obtenida exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Caso clínico no encontrado'
  })
  async obtenerTratamientosPorCasoClinico(
    @Param('casoClinicoId', ParseIntPipe) casoClinicoId: number
  ) {
    this.logger.log(`GET /tratamientos/caso-clinico/${casoClinicoId} - Obteniendo tratamientos`);
    return await this.tratamientoService.obtenerTratamientosPorCasoClinico(casoClinicoId);
  }

  
  /**
   * Obtener tratamientos con filtros y paginación
   * Permite búsqueda avanzada y filtrado por múltiples criterios
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener tratamientos con filtros',
    description: 'Obtiene tratamientos con filtros avanzados y paginación'
  })
  @ApiQuery({
    name: 'casoClinicoId',
    required: false,
    description: 'ID del caso clínico para filtrar'
  })
  @ApiQuery({
    name: 'estudianteId',
    required: false,
    description: 'ID del estudiante para filtrar'
  })
  @ApiQuery({
    name: 'docenteId',
    required: false,
    description: 'ID del docente para filtrar'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Estado del tratamiento para filtrar',
    enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_PROCESO', 'FINALIZADO']
  })
  @ApiQuery({
    name: 'tipoDiagnostico',
    required: false,
    description: 'Tipo de diagnóstico para filtrar'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    description: 'Fecha desde (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    description: 'Fecha hasta (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    description: 'Término de búsqueda en la descripción'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página (default: 1)'
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Elementos por página (default: 10, max: 100)'
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    description: 'Campo para ordenar (default: fechaCreacion)'
  })
  @ApiQuery({
    name: 'direccion',
    required: false,
    description: 'Dirección del ordenamiento: asc o desc (default: desc)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de tratamientos obtenida exitosamente'
  })
  async obtenerTratamientosConFiltros(@Query() filtros: FiltrosTratamientosDto) {
    this.logger.log('GET /tratamientos - Obteniendo tratamientos con filtros');
    return await this.tratamientoService.obtenerTratamientosConFiltros(filtros);
  }

  /**
   * Obtener un tratamiento específico por su ID
   * Retorna información completa incluyendo relaciones
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener tratamiento por ID',
    description: 'Obtiene un tratamiento específico con toda su información y relaciones'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamiento obtenido exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Tratamiento no encontrado'
  })
  async obtenerTratamientoPorId(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /tratamientos/${id} - Obteniendo tratamiento específico`);
    return await this.tratamientoService.obtenerTratamientoPorId(id);
  }

  // ===============================
  // ENDPOINTS PARA ESTADÍSTICAS
  // ===============================

  /**
   * Obtener estadísticas de tratamientos
   * Proporciona métricas útiles para reportes y dashboard
   */
  @Get('estadisticas/general')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Obtener estadísticas de tratamientos',
    description: 'Obtiene estadísticas completas de tratamientos por estado, tipo y período'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    description: 'Fecha desde para las estadísticas (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    description: 'Fecha hasta para las estadísticas (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'estudianteId',
    required: false,
    description: 'ID del estudiante para estadísticas específicas'
  })
  @ApiQuery({
    name: 'docenteId',
    required: false,
    description: 'ID del docente para estadísticas específicas'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo personal autorizado puede ver estadísticas'
  })
  async obtenerEstadisticasTratamientos(@Query() filtros: EstadisticasTratamientosDto) {
    this.logger.log('GET /tratamientos/estadisticas/general - Obteniendo estadísticas');
    return await this.tratamientoService.obtenerEstadisticasTratamientos(filtros);
  }

  // ===============================
  // ENDPOINTS ESPECÍFICOS POR ROL
  // ===============================

  /**
   * Obtener tratamientos del estudiante autenticado
   * Muestra solo los tratamientos propios del estudiante
   */
  @Get('mis-tratamientos/estudiante')
  @RequireRoles(RoleEnum.ESTUDIANTE)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Obtener mis tratamientos (estudiante)',
    description: 'Obtiene todos los tratamientos del estudiante autenticado'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado específico'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página (default: 1)'
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Elementos por página (default: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos del estudiante'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo estudiantes pueden acceder a esta ruta'
  })
  async obtenerMisTratamientosEstudiante(
    @Request() req: any,
    @Query() filtros: FiltrosTratamientosDto
  ) {
    this.logger.log(`GET /tratamientos/mis-tratamientos/estudiante - Estudiante: ${req.user.id}`);
    
    // Forzar el filtro por el estudiante autenticado
    const filtrosEstudiante = { ...filtros, estudianteId: req.user.id };
    
    return await this.tratamientoService.obtenerTratamientosConFiltros(filtrosEstudiante);
  }

  /**
   * Obtener tratamientos asignados al profesor autenticado
   * Muestra tratamientos donde el profesor es el docente asignado
   */
  @Get('mis-tratamientos/profesor')
  @RequireRoles(RoleEnum.PROFESOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Obtener mis tratamientos (profesor)',
    description: 'Obtiene todos los tratamientos asignados al profesor autenticado'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado específico'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página (default: 1)'
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Elementos por página (default: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos del profesor'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo profesores pueden acceder a esta ruta'
  })
  async obtenerMisTratamientosProfesor(
    @Request() req: any,
    @Query() filtros: FiltrosTratamientosDto
  ) {
    this.logger.log(`GET /tratamientos/mis-tratamientos/profesor - Profesor: ${req.user.id}`);
    
    // Forzar el filtro por el profesor autenticado
    const filtrosProfesor = { ...filtros, docenteId: req.user.id };
    
    return await this.tratamientoService.obtenerTratamientosConFiltros(filtrosProfesor);
  }

  /**
   * Obtener tratamientos pendientes de revisión (Solo Profesores)
   * Lista todos los tratamientos que esperan aprobación o revisión
   */
  @Get('pendientes-revision')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Obtener tratamientos pendientes de revisión',
    description: 'Lista tratamientos con estado PENDIENTE que requieren revisión del profesor'
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    description: 'Número de página (default: 1)'
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Elementos por página (default: 10)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tratamientos pendientes'
  })
  @ApiResponse({
    status: 403,
    description: 'Solo profesores pueden revisar tratamientos'
  })
  async obtenerTratamientosPendientesRevision(@Query() filtros: FiltrosTratamientosDto) {
    this.logger.log('GET /tratamientos/pendientes-revision - Obteniendo tratamientos pendientes');
    
    // Forzar el filtro por estado PENDIENTE
    const filtrosPendientes = { ...filtros, estado: 'PENDIENTE' as any };
    
    return await this.tratamientoService.obtenerTratamientosConFiltros(filtrosPendientes);
  }

  // ===============================
  // ENDPOINTS PARA VALIDACIONES
  // ===============================

  /**
   * Validar que el usuario puede editar un tratamiento específico
   * Útil para validaciones en el frontend antes de mostrar opciones de edición
   */
  @Get(':id/puede-editar')
  @ApiOperation({
    summary: 'Verificar si puede editar tratamiento',
    description: 'Verifica si el usuario autenticado puede editar el tratamiento especificado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID del tratamiento',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta con información sobre permisos de edición',
    schema: {
      type: 'object',
      properties: {
        puedeEditar: { type: 'boolean' },
        puedeEditarEstado: { type: 'boolean' },
        motivo: { type: 'string' }
      }
    }
  })
  async puedeEditarTratamiento(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    this.logger.log(`GET /tratamientos/${id}/puede-editar - Usuario: ${req.user.id}`);
    
    try {
      const tratamiento = await this.tratamientoService.obtenerTratamientoPorId(id);
      const esProfesor = req.user.rol === RoleEnum.PROFESOR || req.user.rol === RoleEnum.ADMIN;
      const esEstudiantePropietario = tratamiento.estudianteId === req.user.id;
      const estadoPermiteEdicion = tratamiento.estado === 'RECHAZADO';

      let puedeEditar = false;
      let puedeEditarEstado = false;
      let motivo = '';

      if (esProfesor) {
        puedeEditar = true;
        puedeEditarEstado = true;
        motivo = 'Profesor con permisos completos';
      } else if (esEstudiantePropietario && estadoPermiteEdicion) {
        puedeEditar = true;
        puedeEditarEstado = false;
        motivo = 'Estudiante puede editar tratamiento rechazado';
      } else if (esEstudiantePropietario) {
        puedeEditar = false;
        puedeEditarEstado = false;
        motivo = 'Solo se pueden editar tratamientos rechazados';
      } else {
        puedeEditar = false;
        puedeEditarEstado = false;
        motivo = 'Sin permisos para este tratamiento';
      }

      return {
        puedeEditar,
        puedeEditarEstado,
        motivo,
        estadoActual: tratamiento.estado
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          puedeEditar: false,
          puedeEditarEstado: false,
          motivo: 'Tratamiento no encontrado'
        };
      }
      throw error;
    }
  }
}
