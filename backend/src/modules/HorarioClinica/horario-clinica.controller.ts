/**
 * Controlador para la gestión de horarios de clínica
 * 
 * Expone endpoints REST para administrar los horarios de atención
 * de las clínicas del sistema universitario. Incluye operaciones
 * CRUD completas y consultas especializadas para estadísticas.
 * 
 * @fileoverview Controlador de horarios de clínica
 * @module HorarioClinicaController
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus
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
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { HorarioClinicaService } from './horario-clinica.service';
import {
  CrearHorarioClinicaDto,
  ActualizarHorarioClinicaDto,
  FiltrosHorarioClinicaDto,
  HorarioClinicaRespuestaDto,
  HorariosClinicaAgrupadosDto,
  EstadisticasHorarioClinicaDto,
  DiaSemana
} from './horario-clinica.dto';

/**
 * Controlador para gestionar horarios de clínica
 * 
 * Proporciona endpoints para todas las operaciones relacionadas
 * con los horarios de atención de las clínicas universitarias.
 */
@ApiTags('Horarios de Clínica')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('horarios-clinica')
export class HorarioClinicaController {
  private readonly logger = new Logger(HorarioClinicaController.name);

  constructor(private readonly horarioClinicaService: HorarioClinicaService) {}

  /**
   * Crear un nuevo horario de clínica
   * 
   * Registra un horario de atención para una clínica específica.
   * Valida que no existan conflictos con horarios existentes.
   * 
   * @param datos - Información del horario a crear
   * @returns Horario creado con información adicional
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo horario de clínica',
    description: 'Registra un nuevo horario de atención para una clínica específica. Valida coherencia de horarios y ausencia de conflictos.'
  })
  @ApiBody({
    type: CrearHorarioClinicaDto,
    description: 'Datos del horario a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Horario creado exitosamente',
    type: HorarioClinicaRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o incoherentes'
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica no encontrada'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con horario existente'
  })
  async crear(@Body() datos: CrearHorarioClinicaDto): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Creando horario para clínica ${datos.clinicaId}, día ${datos.diaSemana}`);
    return await this.horarioClinicaService.crear(datos);
  }

  /**
   * Obtener todos los horarios con filtros opcionales
   * 
   * Consulta horarios aplicando filtros específicos como clínica,
   * día de la semana, estado activo, tipo de clínica, etc.
   * 
   * @param clinicaId - Filtrar por ID de clínica específica
   * @param diaSemana - Filtrar por día de la semana
   * @param soloActivos - Mostrar solo horarios activos
   * @param tipoClinica - Filtrar por tipo de clínica
   * @param estadoClinica - Filtrar por estado de clínica
   * @param incluirClinica - Incluir información detallada de la clínica
   * @returns Lista de horarios que cumplen los criterios
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener horarios con filtros',
    description: 'Consulta horarios aplicando filtros opcionales. Permite búsquedas específicas por clínica, día, estado, etc.'
  })
  @ApiQuery({
    name: 'clinicaId',
    required: false,
    type: Number,
    description: 'ID de clínica específica'
  })
  @ApiQuery({
    name: 'diaSemana',
    required: false,
    enum: DiaSemana,
    description: 'Día de la semana específico'
  })
  @ApiQuery({
    name: 'soloActivos',
    required: false,
    type: Boolean,
    description: 'Mostrar solo horarios activos'
  })
  @ApiQuery({
    name: 'tipoClinica',
    required: false,
    type: String,
    description: 'Tipo de clínica (FIJA, MOVIL, TEMPORAL)'
  })
  @ApiQuery({
    name: 'estadoClinica',
    required: false,
    type: String,
    description: 'Estado de clínica (ACTIVA, INACTIVA, etc.)'
  })
  @ApiQuery({
    name: 'incluirClinica',
    required: false,
    type: Boolean,
    description: 'Incluir información detallada de la clínica'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horarios encontrados',
    type: [HorarioClinicaRespuestaDto]
  })
  async obtenerTodos(
    @Query('clinicaId') clinicaId?: number,
    @Query('diaSemana') diaSemana?: DiaSemana,
    @Query('soloActivos', new ParseBoolPipe({ optional: true })) soloActivos?: boolean,
    @Query('tipoClinica') tipoClinica?: string,
    @Query('estadoClinica') estadoClinica?: string,
    @Query('incluirClinica', new ParseBoolPipe({ optional: true })) incluirClinica?: boolean
  ): Promise<HorarioClinicaRespuestaDto[]> {
    this.logger.log('Obteniendo horarios con filtros');
    
    const filtros: FiltrosHorarioClinicaDto = {
      clinicaId: clinicaId ? Number(clinicaId) : undefined,
      diaSemana,
      soloActivos,
      tipoClinica,
      estadoClinica,
      incluirClinica
    };

    return await this.horarioClinicaService.obtenerTodos(filtros);
  }

  /**
   * Obtener horarios agrupados por clínica
   * 
   * Retorna todos los horarios organizados por clínica para
   * facilitar la visualización y gestión administrativa.
   * 
   * @param tipoClinica - Filtrar por tipo de clínica
   * @param estadoClinica - Filtrar por estado de clínica
   * @param soloActivos - Considerar solo horarios activos
   * @returns Horarios agrupados por clínica
   */
  @Get('agrupados')
  @ApiOperation({
    summary: 'Obtener horarios agrupados por clínica',
    description: 'Retorna horarios organizados por clínica con totales y estadísticas por cada una.'
  })
  @ApiQuery({
    name: 'tipoClinica',
    required: false,
    type: String,
    description: 'Filtrar por tipo de clínica'
  })
  @ApiQuery({
    name: 'estadoClinica',
    required: false,
    type: String,
    description: 'Filtrar por estado de clínica'
  })
  @ApiQuery({
    name: 'soloActivos',
    required: false,
    type: Boolean,
    description: 'Considerar solo horarios activos'
  })
  @ApiResponse({
    status: 200,
    description: 'Horarios agrupados por clínica',
    type: [HorariosClinicaAgrupadosDto]
  })
  async obtenerAgrupadosPorClinica(
    @Query('tipoClinica') tipoClinica?: string,
    @Query('estadoClinica') estadoClinica?: string,
    @Query('soloActivos', new ParseBoolPipe({ optional: true })) soloActivos?: boolean
  ): Promise<HorariosClinicaAgrupadosDto[]> {
    this.logger.log('Obteniendo horarios agrupados por clínica');
    
    const filtros: FiltrosHorarioClinicaDto = {
      tipoClinica,
      estadoClinica,
      soloActivos
    };

    return await this.horarioClinicaService.obtenerAgrupadosPorClinica(filtros);
  }

  /**
   * Obtener estadísticas del sistema de horarios
   * 
   * Calcula métricas y estadísticas generales del sistema
   * de horarios para análisis y toma de decisiones.
   * 
   * @returns Estadísticas detalladas del sistema
   */
  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de horarios',
    description: 'Calcula métricas generales del sistema de horarios: totales, distribuciones, promedios, etc.'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del sistema de horarios',
    type: EstadisticasHorarioClinicaDto
  })
  async obtenerEstadisticas(): Promise<EstadisticasHorarioClinicaDto> {
    this.logger.log('Obteniendo estadísticas de horarios de clínica');
    return await this.horarioClinicaService.obtenerEstadisticas();
  }

  /**
   * Obtener un horario específico por ID
   * 
   * Consulta los detalles completos de un horario específico
   * incluyendo información de la clínica relacionada.
   * 
   * @param id - ID del horario a consultar
   * @returns Horario encontrado con información detallada
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener horario por ID',
    description: 'Consulta los detalles completos de un horario específico incluyendo información de la clínica.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del horario'
  })
  @ApiResponse({
    status: 200,
    description: 'Horario encontrado',
    type: HorarioClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Horario no encontrado'
  })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Obteniendo horario con ID: ${id}`);
    return await this.horarioClinicaService.obtenerPorId(id);
  }

  /**
   * Actualizar un horario existente
   * 
   * Modifica los datos de un horario validando coherencia
   * y ausencia de conflictos con otros horarios existentes.
   * 
   * @param id - ID del horario a actualizar
   * @param datos - Nuevos datos del horario
   * @returns Horario actualizado
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar horario existente',
    description: 'Modifica un horario existente validando coherencia y ausencia de conflictos.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del horario a actualizar'
  })
  @ApiBody({
    type: ActualizarHorarioClinicaDto,
    description: 'Nuevos datos del horario'
  })
  @ApiResponse({
    status: 200,
    description: 'Horario actualizado exitosamente',
    type: HorarioClinicaRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  @ApiResponse({
    status: 404,
    description: 'Horario no encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con horario existente'
  })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarHorarioClinicaDto
  ): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Actualizando horario ID: ${id}`);
    return await this.horarioClinicaService.actualizar(id, datos);
  }

  /**
   * Cambiar estado activo de un horario
   * 
   * Activa o desactiva un horario específico sin modificar
   * otros datos. Útil para gestión rápida de disponibilidad.
   * 
   * @param id - ID del horario
   * @param activo - Nuevo estado activo
   * @returns Horario con estado actualizado
   */
  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de horario',
    description: 'Activa o desactiva un horario específico para gestión rápida de disponibilidad.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del horario'
  })
  @ApiQuery({
    name: 'activo',
    type: Boolean,
    description: 'Nuevo estado activo (true/false)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del horario actualizado',
    type: HorarioClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Horario no encontrado'
  })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Query('activo', ParseBoolPipe) activo: boolean
  ): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Cambiando estado del horario ${id} a ${activo ? 'activo' : 'inactivo'}`);
    return await this.horarioClinicaService.cambiarEstado(id, activo);
  }

  /**
   * Eliminar un horario de clínica
   * 
   * Remueve permanentemente un horario del sistema.
   * Operación irreversible que debe usarse con precaución.
   * 
   * @param id - ID del horario a eliminar
   * @returns Confirmación de eliminación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar horario de clínica',
    description: 'Remueve permanentemente un horario del sistema. Operación irreversible.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID del horario a eliminar'
  })
  @ApiResponse({
    status: 200,
    description: 'Horario eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        mensaje: {
          type: 'string',
          example: 'Horario de LUNES para clínica Clínica Central eliminado exitosamente'
        },
        horarioEliminado: {
          $ref: '#/components/schemas/HorarioClinicaRespuestaDto'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Horario no encontrado'
  })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<{
    mensaje: string;
    horarioEliminado: HorarioClinicaRespuestaDto;
  }> {
    this.logger.log(`Eliminando horario ID: ${id}`);
    return await this.horarioClinicaService.eliminar(id);
  }
}
