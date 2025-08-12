/**
 * Controlador de Clínicas
 * 
 * Proporciona endpoints REST para la gestión de clínicas móviles
 * y consultorios de la universidad. Maneja las operaciones básicas
 * de creación, consulta, actualización y eliminación de clínicas.
 * 
 * Endpoints disponibles:
 * - POST /clinicas - Crear nueva clínica
 * - GET /clinicas - Obtener todas las clínicas con filtros
 * - GET /clinicas/:id - Obtener clínica específica
 * - PUT /clinicas/:id - Actualizar clínica
 * - DELETE /clinicas/:id - Eliminar clínica
 * - GET /clinicas/tipo/:tipo - Obtener clínicas por tipo
 * - GET /clinicas/estadisticas - Estadísticas del sistema
 * 
 * @fileoverview Controlador REST para clínicas
 * @module ClinicaController
 */

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
import { ClinicaService } from './clinica.service';
import {
  CrearClinicaDto,
  ActualizarClinicaDto,
  FiltrosClinicaDto,
  ClinicaRespuestaDto,
  TipoClinica,
  EstadoClinica
} from './clinica.dto';

/**
 * Controlador de Clínicas
 * 
 * Maneja todas las operaciones HTTP relacionadas con la gestión
 * de clínicas universitarias, incluyendo validación de entrada,
 * autenticación y formateo de respuestas.
 */
@ApiTags('Clínicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clinicas')
export class ClinicaController {
  private readonly logger = new Logger(ClinicaController.name);

  constructor(private readonly clinicaService: ClinicaService) {}

  /**
   * Crear nueva clínica
   * 
   * Registra una nueva clínica en el sistema universitario.
   * Valida datos específicos según el tipo de clínica.
   * 
   * @route POST /clinicas
   * @param crearClinicaDto - Datos de la clínica a crear
   * @returns Promise<ClinicaRespuestaDto> - Clínica creada
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva clínica',
    description: 'Registra una nueva clínica móvil o consultorio en el sistema universitario'
  })
  @ApiBody({
    type: CrearClinicaDto,
    description: 'Datos de la clínica a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Clínica creada exitosamente',
    type: ClinicaRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltantes'
  })
  @ApiResponse({
    status: 409,
    description: 'Código o nombre de clínica ya existe'
  })
  @ApiResponse({
    status: 404,
    description: 'Parroquia base no encontrada'
  })
  async crear(@Body() crearClinicaDto: CrearClinicaDto): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Creando clínica: ${crearClinicaDto.nombre} (${crearClinicaDto.codigo})`);

    try {
      const clinica = await this.clinicaService.crear(crearClinicaDto);
      this.logger.log(`Clínica ${clinica.id} creada exitosamente`);
      return clinica;
    } catch (error) {
      this.logger.error(`Error al crear clínica: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todas las clínicas
   * 
   * Consulta clínicas con filtros opcionales y soporte
   * para incluir relaciones como horarios y personal.
   * 
   * @route GET /clinicas
   * @param filtros - Parámetros de filtrado
   * @returns Promise<ClinicaRespuestaDto[]> - Lista de clínicas
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener clínicas',
    description: 'Consulta todas las clínicas con filtros opcionales'
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoClinica,
    description: 'Filtrar por tipo de clínica'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: EstadoClinica,
    description: 'Filtrar por estado de clínica'
  })
  @ApiQuery({
    name: 'parroquiaBaseId',
    required: false,
    type: Number,
    description: 'Filtrar por parroquia base'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Búsqueda en nombre, código o descripción'
  })
  @ApiQuery({
    name: 'incluirHorarios',
    required: false,
    type: Boolean,
    description: 'Incluir horarios de atención'
  })
  @ApiQuery({
    name: 'incluirPersonal',
    required: false,
    type: Boolean,
    description: 'Incluir personal asignado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clínicas obtenida exitosamente',
    type: [ClinicaRespuestaDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos'
  })
  async obtenerTodas(@Query() filtros: FiltrosClinicaDto): Promise<ClinicaRespuestaDto[]> {
    this.logger.log('Consultando clínicas con filtros');

    try {
      const clinicas = await this.clinicaService.obtenerTodas(filtros);
      this.logger.log(`Encontradas ${clinicas.length} clínicas`);
      return clinicas;
    } catch (error) {
      this.logger.error(`Error al obtener clínicas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener clínica por ID
   * 
   * Busca una clínica específica por su identificador,
   * incluyendo toda la información relacionada.
   * 
   * @route GET /clinicas/:id
   * @param id - ID de la clínica
   * @returns Promise<ClinicaRespuestaDto> - Clínica encontrada
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener clínica por ID',
    description: 'Busca una clínica específica por su identificador único'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la clínica'
  })
  @ApiResponse({
    status: 200,
    description: 'Clínica encontrada exitosamente',
    type: ClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica no encontrada'
  })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Obteniendo clínica con ID: ${id}`);

    try {
      const clinica = await this.clinicaService.obtenerPorId(id);
      this.logger.log(`Clínica ${id} encontrada: ${clinica.nombre}`);
      return clinica;
    } catch (error) {
      this.logger.error(`Error al obtener clínica ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener clínicas por tipo
   * 
   * Consulta clínicas filtradas por su tipo operativo.
   * Útil para obtener solo clínicas móviles, fijas o temporales.
   * 
   * @route GET /clinicas/tipo/:tipo
   * @param tipo - Tipo de clínica
   * @returns Promise<ClinicaRespuestaDto[]> - Lista de clínicas del tipo especificado
   */
  @Get('tipo/:tipo')
  @ApiOperation({
    summary: 'Obtener clínicas por tipo',
    description: 'Consulta clínicas filtradas por su tipo operativo'
  })
  @ApiParam({
    name: 'tipo',
    enum: TipoClinica,
    description: 'Tipo de clínica (FIJA, MOVIL, TEMPORAL)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clínicas del tipo especificado',
    type: [ClinicaRespuestaDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Tipo de clínica inválido'
  })
  async obtenerPorTipo(@Param('tipo') tipo: TipoClinica): Promise<ClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo clínicas de tipo: ${tipo}`);

    try {
      const clinicas = await this.clinicaService.obtenerPorTipo(tipo);
      this.logger.log(`Encontradas ${clinicas.length} clínicas de tipo ${tipo}`);
      return clinicas;
    } catch (error) {
      this.logger.error(`Error al obtener clínicas por tipo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de clínicas
   * 
   * Proporciona un resumen estadístico del estado actual
   * de las clínicas en el sistema.
   * 
   * @route GET /clinicas/estadisticas
   * @returns Promise<object> - Estadísticas de clínicas
   */
  @Get('estadisticas/resumen')
  @ApiOperation({
    summary: 'Obtener estadísticas de clínicas',
    description: 'Proporciona un resumen estadístico del estado de las clínicas'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 15 },
        porTipo: {
          type: 'object',
          properties: {
            FIJA: { type: 'number', example: 8 },
            MOVIL: { type: 'number', example: 5 },
            TEMPORAL: { type: 'number', example: 2 }
          }
        },
        porEstado: {
          type: 'object',
          properties: {
            ACTIVA: { type: 'number', example: 12 },
            INACTIVA: { type: 'number', example: 2 },
            MANTENIMIENTO: { type: 'number', example: 1 }
          }
        },
        conPersonalActivo: { type: 'number', example: 10 },
        conHorariosActivos: { type: 'number', example: 12 }
      }
    }
  })
  async obtenerEstadisticas(): Promise<object> {
    this.logger.log('Obteniendo estadísticas de clínicas');

    try {
      const estadisticas = await this.clinicaService.obtenerEstadisticas();
      this.logger.log(`Estadísticas generadas: ${estadisticas.total} clínicas total`);
      return estadisticas;
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualizar clínica
   * 
   * Modifica los datos de una clínica existente.
   * Valida unicidad de códigos y nombres.
   * 
   * @route PUT /clinicas/:id
   * @param id - ID de la clínica a actualizar
   * @param actualizarClinicaDto - Datos a actualizar
   * @returns Promise<ClinicaRespuestaDto> - Clínica actualizada
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar clínica',
    description: 'Modifica los datos de una clínica existente'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la clínica a actualizar'
  })
  @ApiBody({
    type: ActualizarClinicaDto,
    description: 'Datos a actualizar de la clínica'
  })
  @ApiResponse({
    status: 200,
    description: 'Clínica actualizada exitosamente',
    type: ClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica no encontrada'
  })
  @ApiResponse({
    status: 409,
    description: 'Código o nombre de clínica ya existe'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarClinicaDto: ActualizarClinicaDto
  ): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Actualizando clínica ${id}`);

    try {
      const clinica = await this.clinicaService.actualizar(id, actualizarClinicaDto);
      this.logger.log(`Clínica ${id} actualizada exitosamente`);
      return clinica;
    } catch (error) {
      this.logger.error(`Error al actualizar clínica ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar clínica
   * 
   * Realiza un soft delete cambiando el estado a INACTIVA.
   * Valida que no tenga dependencias activas.
   * 
   * @route DELETE /clinicas/:id
   * @param id - ID de la clínica a eliminar
   * @returns Promise<{ mensaje: string }> - Confirmación de eliminación
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar clínica',
    description: 'Desactiva una clínica del sistema (soft delete)'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la clínica a eliminar'
  })
  @ApiResponse({
    status: 200,
    description: 'Clínica eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        mensaje: {
          type: 'string',
          example: 'Clínica eliminada exitosamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Clínica tiene dependencias activas'
  })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<{ mensaje: string }> {
    this.logger.log(`Eliminando clínica ${id}`);

    try {
      const resultado = await this.clinicaService.eliminar(id);
      this.logger.log(`Clínica ${id} eliminada exitosamente`);
      return resultado;
    } catch (error) {
      this.logger.error(`Error al eliminar clínica ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
