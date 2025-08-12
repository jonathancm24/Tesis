import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseIntPipe,
  Request,
  Logger,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PrescripcionService } from './prescripcion.service';
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
  IValidacionInteracciones, 
  IValidacionDosificacion, 
  IValidacionFinalizacionPrescripcion,
  IEstadisticasPrescripciones 
} from './Interface/prescripcion.interface';

/**
 * Controlador de prescripciones médicas
 * Maneja todas las operaciones CRUD y validaciones farmacológicas
 * Implementa autorización basada en roles y validación de permisos
 */
@ApiTags('prescripciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('prescripciones')
export class PrescripcionController {
  private readonly logger = new Logger(PrescripcionController.name);

  constructor(private readonly prescripcionService: PrescripcionService) {}

  /**
   * Crear nueva prescripción médica
   * Disponible para estudiantes y profesores
   */
  @Post()
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Crear nueva prescripción',
    description: 'Crea una nueva prescripción médica con estado PENDIENTE por defecto. Valida duplicados y existencia del caso clínico.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Prescripción creada exitosamente',
    type: Object // En sistema real sería el tipo específico
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o prescripción duplicada' })
  @ApiResponse({ status: 404, description: 'Caso clínico no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para esta operación' })
  async crearPrescripcion(@Body() createDto: CrearPrescripcionDto): Promise<IPrescripcion> {
    this.logger.log(`POST /prescripciones - Crear prescripción para caso ${createDto.casoClinicoId}`);
    return this.prescripcionService.crearPrescripcion(createDto);
  }

  /**
   * Obtener prescripción específica por ID
   * Disponible para todos los roles autenticados
   */
  @Get(':id')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Obtener prescripción por ID',
    description: 'Retorna información completa de una prescripción específica incluyendo datos del caso clínico y paciente.' 
  })
  @ApiParam({ name: 'id', description: 'ID único de la prescripción', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prescripción encontrada',
    type: Object
  })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async obtenerPrescripcionPorId(@Param('id', ParseIntPipe) id: number): Promise<IPrescripcion> {
    this.logger.log(`GET /prescripciones/${id} - Obtener prescripción específica`);
    return this.prescripcionService.obtenerPrescripcionPorId(id);
  }

  /**
   * Obtener prescripciones con filtros y paginación
   * Disponible para todos los roles con diferentes niveles de acceso
   */
  @Get()
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Listar prescripciones con filtros',
    description: 'Obtiene una lista paginada de prescripciones con capacidad de filtrado por múltiples criterios.' 
  })
  @ApiQuery({ name: 'pagina', description: 'Número de página (base 1)', required: false, type: 'number' })
  @ApiQuery({ name: 'limite', description: 'Cantidad de resultados por página', required: false, type: 'number' })
  @ApiQuery({ name: 'estado', description: 'Filtrar por estado de prescripción', required: false })
  @ApiQuery({ name: 'casoClinicoId', description: 'Filtrar por caso clínico específico', required: false, type: 'number' })
  @ApiQuery({ name: 'medicamento', description: 'Búsqueda parcial por nombre de medicamento', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de prescripciones obtenida exitosamente',
    type: Object
  })
  async obtenerPrescripciones(@Query() filtros: FiltrosPrescripcionesDto): Promise<RespuestaPaginadaPrescripcionesDto> {
    this.logger.log(`GET /prescripciones - Listar con filtros: ${JSON.stringify(filtros)}`);
    return this.prescripcionService.obtenerPrescripcionesConFiltros(filtros);
  }

  /**
   * Actualizar información básica de prescripción
   * Estudiantes: solo prescripciones PENDIENTES
   * Profesores: cualquier prescripción
   */
  @Patch(':id/basica')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar información básica',
    description: 'Permite actualizar medicamento, dosis, frecuencia, etc. Los estudiantes solo pueden editar prescripciones PENDIENTES.' 
  })
  @ApiParam({ name: 'id', description: 'ID de la prescripción a actualizar', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prescripción actualizada exitosamente',
    type: Object
  })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar esta prescripción' })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async actualizarPrescripcionBasica(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarPrescripcionBasicaDto,
    @Request() req: any
  ): Promise<IPrescripcion> {
    this.logger.log(`PATCH /prescripciones/${id}/basica - Usuario: ${req.user.id}, Rol: ${req.user.rol}`);
    return this.prescripcionService.actualizarPrescripcionBasica(
      id, 
      updateDto, 
      req.user.id, 
      req.user.rol
    );
  }

  /**
   * Actualizar estado de prescripción
   * Solo disponible para profesores
   */
  @Patch(':id/estado')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar estado de prescripción',
    description: 'Cambia el estado de la prescripción (ej: PENDIENTE → APROBADO). Solo profesores pueden realizar esta acción.' 
  })
  @ApiParam({ name: 'id', description: 'ID de la prescripción', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado exitosamente',
    type: Object
  })
  @ApiResponse({ status: 400, description: 'Transición de estado no válida' })
  @ApiResponse({ status: 403, description: 'Solo profesores pueden cambiar estados' })
  async actualizarEstadoPrescripcion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarEstadoPrescripcionDto
  ): Promise<IPrescripcion> {
    this.logger.log(`PATCH /prescripciones/${id}/estado - Nuevo estado: ${updateDto.estado}`);
    return this.prescripcionService.actualizarEstadoPrescripcion(id, updateDto);
  }

  /**
   * Actualización completa de prescripción
   * Solo disponible para profesores
   */
  @Patch(':id/completa')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Actualización completa de prescripción',
    description: 'Permite actualizar todos los campos de la prescripción incluyendo estado. Exclusivo para profesores.' 
  })
  @ApiParam({ name: 'id', description: 'ID de la prescripción', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prescripción actualizada completamente',
    type: Object
  })
  @ApiResponse({ status: 403, description: 'Solo profesores pueden realizar actualizaciones completas' })
  async actualizarPrescripcionCompleta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarPrescripcionCompletaDto
  ): Promise<IPrescripcion> {
    this.logger.log(`PATCH /prescripciones/${id}/completa - Actualización completa`);
    return this.prescripcionService.actualizarPrescripcionCompleta(id, updateDto);
  }

  /**
   * Completar prescripción
   * Marca la prescripción como COMPLETADO y registra información de cumplimiento
   */
  @Patch(':id/completar')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @ApiOperation({ 
    summary: 'Completar prescripción',
    description: 'Marca una prescripción como completada registrando información sobre cumplimiento y efectos adversos.' 
  })
  @ApiParam({ name: 'id', description: 'ID de la prescripción', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prescripción completada exitosamente',
    type: Object
  })
  @ApiResponse({ status: 400, description: 'La prescripción no puede ser completada en su estado actual' })
  async completarPrescripcion(@Body() completarDto: CompletarPrescripcionDto): Promise<IPrescripcion> {
    this.logger.log(`PATCH /prescripciones/${completarDto.prescripcionId}/completar`);
    return this.prescripcionService.completarPrescripcion(completarDto);
  }

  /**
   * Validar interacciones medicamentosas
   * Verifica conflictos con otras prescripciones del paciente
   */
  @Post('validar-interacciones')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar interacciones medicamentosas',
    description: 'Analiza posibles interacciones medicamentosas con otras prescripciones activas del paciente.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación de interacciones completada',
    type: Object
  })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async validarInteracciones(@Body() validacionDto: ValidarInteraccionesDto): Promise<IValidacionInteracciones> {
    this.logger.log(`POST /prescripciones/validar-interacciones - Prescripción: ${validacionDto.prescripcionId}`);
    return this.prescripcionService.validarInteracciones(validacionDto);
  }

  /**
   * Validar dosificación de medicamento
   * Verifica que la dosis sea apropiada según parámetros del paciente
   */
  @Post('validar-dosificacion')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar dosificación',
    description: 'Verifica que la dosificación sea apropiada considerando edad, peso y condiciones del paciente.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación de dosificación completada',
    type: Object
  })
  @ApiResponse({ status: 404, description: 'Prescripción o datos del paciente no encontrados' })
  async validarDosificacion(@Body() validacionDto: ValidarDosificacionDto): Promise<IValidacionDosificacion> {
    this.logger.log(`POST /prescripciones/validar-dosificacion - Prescripción: ${validacionDto.prescripcionId}`);
    return this.prescripcionService.validarDosificacion(validacionDto);
  }

  /**
   * Validar si una prescripción puede ser finalizada
   * Verifica completitud de datos y validaciones pendientes
   */
  @Post('validar-finalizacion')
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar posibilidad de finalización',
    description: 'Verifica si una prescripción cumple con todos los requisitos para ser finalizada.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación de finalización completada',
    type: Object
  })
  async validarFinalizacion(@Body() validacionDto: ValidarFinalizacionPrescripcionDto): Promise<IValidacionFinalizacionPrescripcion> {
    this.logger.log(`POST /prescripciones/validar-finalizacion - Prescripción: ${validacionDto.prescripcionId}`);
    return this.prescripcionService.validarFinalizacion(validacionDto);
  }

  /**
   * Obtener estadísticas de prescripciones
   * Proporciona métricas agregadas y análisis estadísticos
   */
  @Get('estadisticas/resumen')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @ApiOperation({ 
    summary: 'Obtener estadísticas de prescripciones',
    description: 'Proporciona estadísticas detalladas incluyendo distribución por estado, medicamentos más prescritos, etc.' 
  })
  @ApiQuery({ name: 'fechaDesde', description: 'Fecha de inicio para el análisis', required: false })
  @ApiQuery({ name: 'fechaHasta', description: 'Fecha de fin para el análisis', required: false })
  @ApiQuery({ name: 'estudianteId', description: 'Filtrar por estudiante específico', required: false, type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    type: Object
  })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver estadísticas' })
  async obtenerEstadisticas(@Query() filtros: EstadisticasPrescripcionesDto): Promise<IEstadisticasPrescripciones> {
    this.logger.log(`GET /prescripciones/estadisticas/resumen - Filtros: ${JSON.stringify(filtros)}`);
    return this.prescripcionService.obtenerEstadisticasPrescripciones(filtros);
  }

  /**
   * Eliminar prescripción (eliminación lógica)
   * Solo disponible para profesores y solo para prescripciones PENDIENTES
   */
  @Delete(':id')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar prescripción',
    description: 'Eliminación lógica de prescripción. Solo permitido para prescripciones PENDIENTES.' 
  })
  @ApiParam({ name: 'id', description: 'ID de la prescripción a eliminar', type: 'number' })
  @ApiResponse({ status: 204, description: 'Prescripción eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar prescripción en este estado' })
  @ApiResponse({ status: 403, description: 'Solo profesores pueden eliminar prescripciones' })
  @ApiResponse({ status: 404, description: 'Prescripción no encontrada' })
  async eliminarPrescripcion(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<void> {
    this.logger.log(`DELETE /prescripciones/${id} - Usuario: ${req.user.id}`);
    
    // Primero verificar que existe y obtener datos
    const prescripcion = await this.prescripcionService.obtenerPrescripcionPorId(id);
    
    // Cambiar estado a CANCELADO en lugar de eliminar físicamente
    await this.prescripcionService.actualizarEstadoPrescripcion(id, {
      estado: 'CANCELADO' as any,
      motivo: 'Eliminado por el profesor',
      observaciones: `Eliminado por usuario ${req.user.id} el ${new Date().toISOString()}`
    });
  }

  /**
   * Búsqueda avanzada de prescripciones
   * Permite combinaciones complejas de filtros
   */
  @Post('busqueda-avanzada')
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN, RoleEnum.SECRETARIO)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Búsqueda avanzada de prescripciones',
    description: 'Permite realizar búsquedas complejas combinando múltiples criterios y filtros especializados.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Búsqueda completada exitosamente',
    type: Object
  })
  async busquedaAvanzada(@Body() criterios: BusquedaAvanzadaPrescripcionesDto): Promise<RespuestaPaginadaPrescripcionesDto> {
    this.logger.log(`POST /prescripciones/busqueda-avanzada - Criterios: ${JSON.stringify(criterios)}`);
    
    // Convertir criterios de búsqueda avanzada a filtros estándar
    const filtrosConvertidos: FiltrosPrescripcionesDto = {
      ...criterios,
      busqueda: criterios.busqueda || ''
    };
    
    return this.prescripcionService.obtenerPrescripcionesConFiltros(filtrosConvertidos);
  }
}
