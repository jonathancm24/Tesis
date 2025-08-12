/**
 * Controlador de Personal de Clínica
 * 
 * Proporciona endpoints REST para la gestión de asignaciones de personal
 * (docentes, estudiantes, coordinadores) a las clínicas del sistema
 * universitario. Maneja las operaciones básicas de asignación, consulta,
 * actualización y finalización de asignaciones.
 * 
 * Endpoints disponibles:
 * - POST /personal-clinica - Asignar personal a clínica
 * - GET /personal-clinica - Obtener todas las asignaciones con filtros
 * - GET /personal-clinica/:id - Obtener asignación específica
 * - PUT /personal-clinica/:id - Actualizar asignación
 * - DELETE /personal-clinica/:id - Finalizar asignación
 * - GET /personal-clinica/clinica/:id - Personal de una clínica
 * - GET /personal-clinica/usuario/:id - Clínicas de un usuario
 * - GET /personal-clinica/estadisticas - Estadísticas del sistema
 * 
 * @fileoverview Controlador REST para personal de clínica
 * @module PersonalClinicaController
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
  HttpStatus,
  ParseBoolPipe
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
import { PersonalClinicaService } from './personal-clinica.service';
import {
  AsignarPersonalClinicaDto,
  ActualizarPersonalClinicaDto,
  FiltrosPersonalClinicaDto,
  PersonalClinicaRespuestaDto,
  EstadisticasPersonalClinicaDto
} from './personal-clinica.dto';

/**
 * Controlador de Personal de Clínica
 * 
 * Maneja todas las operaciones HTTP relacionadas con la gestión
 * de asignaciones de personal a clínicas, incluyendo validación
 * de entrada, autenticación y formateo de respuestas.
 */
@ApiTags('Personal de Clínica')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-clinica')
export class PersonalClinicaController {
  private readonly logger = new Logger(PersonalClinicaController.name);

  constructor(private readonly personalClinicaService: PersonalClinicaService) {}

  /**
   * Asignar personal a clínica
   * 
   * Crea una nueva asignación de personal a una clínica específica.
   * Valida disponibilidad y conflictos existentes.
   * 
   * @route POST /personal-clinica
   * @param asignarDto - Datos de la asignación
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación creada
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar personal a clínica',
    description: 'Crea una nueva asignación de personal a una clínica específica del sistema'
  })
  @ApiBody({
    type: AsignarPersonalClinicaDto,
    description: 'Datos de la asignación de personal'
  })
  @ApiResponse({
    status: 201,
    description: 'Personal asignado exitosamente',
    type: PersonalClinicaRespuestaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o clínica inactiva'
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica o usuario no encontrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe asignación activa o conflicto de responsabilidad'
  })
  async asignar(@Body() asignarDto: AsignarPersonalClinicaDto): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Asignando usuario ${asignarDto.usuarioId} a clínica ${asignarDto.clinicaId}`);

    try {
      const asignacion = await this.personalClinicaService.asignar(asignarDto);
      this.logger.log(`Asignación ${asignacion.id} creada exitosamente`);
      return asignacion;
    } catch (error) {
      this.logger.error(`Error al asignar personal: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener todas las asignaciones
   * 
   * Consulta asignaciones de personal con filtros opcionales y soporte
   * para incluir información detallada de clínicas y usuarios.
   * 
   * @route GET /personal-clinica
   * @param filtros - Parámetros de filtrado
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Lista de asignaciones
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener asignaciones de personal',
    description: 'Consulta todas las asignaciones de personal con filtros opcionales'
  })
  @ApiQuery({
    name: 'clinicaId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de clínica específica'
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de usuario específico'
  })
  @ApiQuery({
    name: 'esResponsable',
    required: false,
    type: Boolean,
    description: 'Filtrar solo responsables de clínica'
  })
  @ApiQuery({
    name: 'soloActivos',
    required: false,
    type: Boolean,
    description: 'Filtrar solo asignaciones activas (por defecto: true)'
  })
  @ApiQuery({
    name: 'tipoClinica',
    required: false,
    type: String,
    description: 'Filtrar por tipo de clínica (FIJA, MOVIL, TEMPORAL)'
  })
  @ApiQuery({
    name: 'estadoClinica',
    required: false,
    type: String,
    description: 'Filtrar por estado de clínica'
  })
  @ApiQuery({
    name: 'incluirClinica',
    required: false,
    type: Boolean,
    description: 'Incluir información detallada de la clínica'
  })
  @ApiQuery({
    name: 'incluirUsuario',
    required: false,
    type: Boolean,
    description: 'Incluir información detallada del usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asignaciones obtenida exitosamente',
    type: [PersonalClinicaRespuestaDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos'
  })
  async obtenerTodas(@Query() filtros: FiltrosPersonalClinicaDto): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log('Consultando asignaciones de personal con filtros');

    try {
      const asignaciones = await this.personalClinicaService.obtenerTodas(filtros);
      this.logger.log(`Encontradas ${asignaciones.length} asignaciones`);
      return asignaciones;
    } catch (error) {
      this.logger.error(`Error al obtener asignaciones: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener asignación por ID
   * 
   * Busca una asignación específica por su identificador,
   * incluyendo toda la información relacionada.
   * 
   * @route GET /personal-clinica/:id
   * @param id - ID de la asignación
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación encontrada
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener asignación por ID',
    description: 'Busca una asignación específica por su identificador único'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la asignación'
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación encontrada exitosamente',
    type: PersonalClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada'
  })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Obteniendo asignación con ID: ${id}`);

    try {
      const asignacion = await this.personalClinicaService.obtenerPorId(id);
      this.logger.log(`Asignación ${id} encontrada`);
      return asignacion;
    } catch (error) {
      this.logger.error(`Error al obtener asignación ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener personal de una clínica
   * 
   * Consulta todo el personal asignado a una clínica específica.
   * Útil para ver el staff completo de una instalación.
   * 
   * @route GET /personal-clinica/clinica/:id
   * @param id - ID de la clínica
   * @param soloActivos - Filtrar solo asignaciones activas
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Personal de la clínica
   */
  @Get('clinica/:id')
  @ApiOperation({
    summary: 'Obtener personal de clínica',
    description: 'Consulta todo el personal asignado a una clínica específica'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la clínica'
  })
  @ApiQuery({
    name: 'soloActivos',
    required: false,
    type: Boolean,
    description: 'Filtrar solo asignaciones activas (por defecto: true)'
  })
  @ApiResponse({
    status: 200,
    description: 'Personal de la clínica obtenido exitosamente',
    type: [PersonalClinicaRespuestaDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Clínica no encontrada'
  })
  async obtenerPorClinica(
    @Param('id', ParseIntPipe) id: number,
    @Query('soloActivos', new ParseBoolPipe({ optional: true })) soloActivos: boolean = true
  ): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo personal de clínica ${id}`);

    try {
      const personal = await this.personalClinicaService.obtenerPorClinica(id, soloActivos);
      this.logger.log(`Encontrado personal de clínica ${id}: ${personal.length} asignaciones`);
      return personal;
    } catch (error) {
      this.logger.error(`Error al obtener personal de clínica: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener clínicas de un usuario
   * 
   * Consulta todas las clínicas donde un usuario específico está asignado.
   * Útil para ver la carga de trabajo de una persona.
   * 
   * @route GET /personal-clinica/usuario/:id
   * @param id - ID del usuario
   * @param soloActivos - Filtrar solo asignaciones activas
   * @returns Promise<PersonalClinicaRespuestaDto[]> - Clínicas del usuario
   */
  @Get('usuario/:id')
  @ApiOperation({
    summary: 'Obtener clínicas de usuario',
    description: 'Consulta todas las clínicas donde un usuario específico está asignado'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del usuario'
  })
  @ApiQuery({
    name: 'soloActivos',
    required: false,
    type: Boolean,
    description: 'Filtrar solo asignaciones activas (por defecto: true)'
  })
  @ApiResponse({
    status: 200,
    description: 'Clínicas del usuario obtenidas exitosamente',
    type: [PersonalClinicaRespuestaDto]
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado'
  })
  async obtenerPorUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('soloActivos', new ParseBoolPipe({ optional: true })) soloActivos: boolean = true
  ): Promise<PersonalClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo clínicas de usuario ${id}`);

    try {
      const clinicas = await this.personalClinicaService.obtenerPorUsuario(id, soloActivos);
      this.logger.log(`Encontradas clínicas de usuario ${id}: ${clinicas.length} asignaciones`);
      return clinicas;
    } catch (error) {
      this.logger.error(`Error al obtener clínicas de usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de personal
   * 
   * Proporciona un resumen estadístico del sistema de asignaciones
   * de personal a clínicas.
   * 
   * @route GET /personal-clinica/estadisticas/resumen
   * @returns Promise<EstadisticasPersonalClinicaDto> - Estadísticas del sistema
   */
  @Get('estadisticas/resumen')
  @ApiOperation({
    summary: 'Obtener estadísticas de personal',
    description: 'Proporciona un resumen estadístico del sistema de asignaciones'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    type: EstadisticasPersonalClinicaDto
  })
  async obtenerEstadisticas(): Promise<EstadisticasPersonalClinicaDto> {
    this.logger.log('Obteniendo estadísticas de personal de clínica');

    try {
      const estadisticas = await this.personalClinicaService.obtenerEstadisticas();
      this.logger.log(`Estadísticas generadas: ${estadisticas.totalAsignaciones} asignaciones total`);
      return estadisticas;
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualizar asignación
   * 
   * Modifica los datos de una asignación existente, incluyendo
   * la posibilidad de finalizar la asignación.
   * 
   * @route PUT /personal-clinica/:id
   * @param id - ID de la asignación a actualizar
   * @param actualizarDto - Datos a actualizar
   * @returns Promise<PersonalClinicaRespuestaDto> - Asignación actualizada
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar asignación',
    description: 'Modifica los datos de una asignación existente'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la asignación a actualizar'
  })
  @ApiBody({
    type: ActualizarPersonalClinicaDto,
    description: 'Datos a actualizar de la asignación'
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación actualizada exitosamente',
    type: PersonalClinicaRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con responsabilidad de clínica'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarPersonalClinicaDto
  ): Promise<PersonalClinicaRespuestaDto> {
    this.logger.log(`Actualizando asignación ${id}`);

    try {
      const asignacion = await this.personalClinicaService.actualizar(id, actualizarDto);
      this.logger.log(`Asignación ${id} actualizada exitosamente`);
      return asignacion;
    } catch (error) {
      this.logger.error(`Error al actualizar asignación ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Finalizar asignación
   * 
   * Establece una fecha de fin para la asignación, efectivamente
   * terminando la relación del usuario con la clínica.
   * 
   * @route DELETE /personal-clinica/:id
   * @param id - ID de la asignación a finalizar
   * @returns Promise<{ mensaje: string }> - Confirmación de finalización
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finalizar asignación',
    description: 'Finaliza la asignación de personal estableciendo una fecha de fin'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la asignación a finalizar'
  })
  @ApiResponse({
    status: 200,
    description: 'Asignación finalizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        mensaje: {
          type: 'string',
          example: 'Asignación de Dr. Juan Pérez a Clínica Central finalizada exitosamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Asignación no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Asignación ya está finalizada'
  })
  async finalizar(@Param('id', ParseIntPipe) id: number): Promise<{ mensaje: string }> {
    this.logger.log(`Finalizando asignación ${id}`);

    try {
      const resultado = await this.personalClinicaService.finalizar(id);
      this.logger.log(`Asignación ${id} finalizada exitosamente`);
      return resultado;
    } catch (error) {
      this.logger.error(`Error al finalizar asignación ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
