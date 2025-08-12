import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { EstadoObservacion } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleEnum } from '../../common/enums/roles.enum';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { ObservacionService } from './observacion.service';
import {
  CrearObservacionDto,
  CrearSeguimientoTratamientoDto,
  CrearRetroalimentacionDocenteDto,
  ActualizarObservacionBasicaDto,
  ActualizarEstadoObservacionDto,
  ResponderObservacionDto,
  CompletarObservacionDto
} from './DTO/crear-actualizar-observacion.dto';
import {
  FiltrosObservacionesDto,
  RespuestaPaginadaObservacionesDto
} from './DTO/filtros-observaciones.dto';
import {
  IObservacion,
  IObservacionCompleta,
  IObservacionesPorEntidad
} from './Interface/observacion.interface';

@ApiTags('Observaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('observaciones')
export class ObservacionController {
  constructor(private readonly observacionService: ObservacionService) {}

  // ============================================================================
  // CREAR OBSERVACIONES
  // ============================================================================

  @Post()
  @ApiOperation({
    summary: 'Crear observación general',
    description: 'Permite crear observaciones para cualquier entidad del sistema'
  })
  @ApiResponse({ status: 201, description: 'Observación creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async crearObservacion(
    @Body() createObservacionDto: CrearObservacionDto
  ): Promise<IObservacionCompleta> {
    return this.observacionService.crearObservacion(createObservacionDto);
  }

  @Post('seguimiento-tratamiento')
  @ApiOperation({
    summary: 'Crear seguimiento de tratamiento',
    description: 'Permite a estudiantes crear seguimiento para tratamientos'
  })
  @ApiResponse({ status: 201, description: 'Seguimiento creado exitosamente' })
  @RequireRoles(RoleEnum.ESTUDIANTE, RoleEnum.ADMIN)
  async crearSeguimientoTratamiento(
    @Body() seguimientoDto: CrearSeguimientoTratamientoDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.crearSeguimientoTratamiento(
      seguimientoDto,
      req.user.id
    );
  }

  @Post('retroalimentacion-docente')
  @ApiOperation({
    summary: 'Crear retroalimentación docente',
    description: 'Permite a profesores crear retroalimentación'
  })
  @ApiResponse({ status: 201, description: 'Retroalimentación creada exitosamente' })
  @RequireRoles(RoleEnum.PROFESOR, RoleEnum.ADMIN)
  async crearRetroalimentacionDocente(
    @Body() retroalimentacionDto: CrearRetroalimentacionDocenteDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.crearRetroalimentacionDocente(
      retroalimentacionDto,
      req.user.id
    );
  }

  // ============================================================================
  // CONSULTAR OBSERVACIONES
  // ============================================================================

  @Get()
  @ApiOperation({
    summary: 'Obtener observaciones con filtros',
    description: 'Permite obtener observaciones aplicando múltiples filtros'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoObservacion })
  @ApiQuery({ name: 'entidadTipo', required: false, type: String })
  @ApiQuery({ name: 'entidadId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de observaciones obtenida exitosamente' })
  async obtenerObservaciones(
    @Query() filtros: FiltrosObservacionesDto
  ): Promise<RespuestaPaginadaObservacionesDto> {
    return this.observacionService.obtenerObservacionesConFiltros(filtros);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener observación por ID',
    description: 'Obtiene una observación específica con todos sus detalles'
  })
  @ApiParam({ name: 'id', description: 'ID de la observación', type: 'number' })
  @ApiResponse({ status: 200, description: 'Observación obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Observación no encontrada' })
  async obtenerObservacionPorId(
    @Param('id', ParseIntPipe) id: number
  ): Promise<IObservacionCompleta> {
    return this.observacionService.obtenerObservacionPorId(id);
  }

  @Get('por-entidad/listar')
  @ApiOperation({
    summary: 'Obtener observaciones por entidad',
    description: 'Obtiene observaciones filtradas por entidad específica'
  })
  @ApiQuery({ name: 'entidadTipo', required: true, type: String })
  @ApiQuery({ name: 'entidadId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Observaciones obtenidas exitosamente' })
  async obtenerObservacionesPorEntidad(
    @Query() filtros: FiltrosObservacionesDto
  ): Promise<IObservacionesPorEntidad> {
    return this.observacionService.obtenerObservacionesPorEntidad(filtros);
  }

  // ============================================================================
  // ACTUALIZAR OBSERVACIONES
  // ============================================================================

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar observación básica',
    description: 'Permite actualizar campos básicos de una observación'
  })
  @ApiParam({ name: 'id', description: 'ID de la observación', type: 'number' })
  @ApiResponse({ status: 200, description: 'Observación actualizada exitosamente' })
  async actualizarObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarObservacionBasicaDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.actualizarObservacionBasica(
      id,
      updateDto,
      req.user.id,
      req.user.roleId
    );
  }

  @Put(':id/estado')
  @ApiOperation({
    summary: 'Actualizar estado de observación',
    description: 'Permite cambiar el estado de una observación'
  })
  @ApiParam({ name: 'id', description: 'ID de la observación', type: 'number' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  async actualizarEstadoObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() estadoDto: ActualizarEstadoObservacionDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.actualizarEstadoObservacion(
      id,
      estadoDto,
      req.user.id,
      req.user.role
    );
  }

  @Put(':id/responder')
  @ApiOperation({
    summary: 'Responder a observación',
    description: 'Permite responder a una observación existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la observación', type: 'number' })
  @ApiResponse({ status: 200, description: 'Respuesta agregada exitosamente' })
  async responderObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() respuestaDto: ResponderObservacionDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.responderObservacion(
      respuestaDto,
      req.user.id
    );
  }

  @Put(':id/completar')
  @ApiOperation({
    summary: 'Completar observación',
    description: 'Marca una observación como completada'
  })
  @ApiParam({ name: 'id', description: 'ID de la observación', type: 'number' })
  @ApiResponse({ status: 200, description: 'Observación completada exitosamente' })
  async completarObservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() completarDto: CompletarObservacionDto,
    @Request() req: any
  ): Promise<IObservacionCompleta> {
    return this.observacionService.completarObservacion(
      completarDto,
      req.user.id
    );
  }
}
