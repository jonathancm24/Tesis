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
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PreguntasClinicasService } from './preguntas-clinicas.service';
import { RespuestasClinicasService } from './respuestas-clinicas.service';
import {
  CrearPreguntaClinicaDto,
  ActualizarPreguntaClinicaDto,
  CrearPreguntasLoteDto
} from './DTO/crear-pregunta-clinica.dto';
import {
  CrearRespuestaClinicaDto,
  ActualizarRespuestaClinicaDto,
  CrearRespuestasLoteDto
} from './DTO/respuesta-clinica.dto';
import { TipoPregunta } from '@prisma/client';

/**
 * Controlador para gestión de preguntas y respuestas clínicas
 * Maneja todas las operaciones CRUD para preguntas y respuestas clínicas por especialidad
 */
@ApiTags('Preguntas Clínicas')
@Controller('preguntas-clinicas')
export class PreguntasClinicasController {
  private readonly logger = new Logger(PreguntasClinicasController.name);

  constructor(
    private readonly preguntasService: PreguntasClinicasService,
    private readonly respuestasService: RespuestasClinicasService
  ) { }

  // ===============================
  // ENDPOINTS PARA PREGUNTAS
  // ===============================

  // Crear nueva pregunta clínica
  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Los @Api son operaciones que permiten interactuar con el sistema
  // por ejemplo @ApiResponse sirve para documentar las posibles respuestas de la API
  @ApiOperation({// Sirve para describir la operación que realiza el endpoint
    summary: 'Crear nueva pregunta clínica',
    description: 'Crea una nueva pregunta clínica para una especialidad específica'
  })
  @ApiResponse({
    status: 201,
    description: 'Pregunta clínica creada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 404,
    description: 'Especialidad no encontrada'
  })
  async crearPregunta(@Body() createDto: CrearPreguntaClinicaDto) {
    this.logger.log('POST /preguntas-clinicas - Creando nueva pregunta clínica');
    return await this.preguntasService.crearPregunta(createDto);
  }

  // Obtener preguntas por especialidad
  @Get('especialidad/:especialidadId')
  @ApiOperation({
    summary: 'Obtener preguntas por especialidad',
    description: 'Obtiene todas las preguntas clínicas de una especialidad específica'
  })
  @ApiParam({// Sirve para describir el parámetro de la ruta
    name: 'especialidadId',
    description: 'ID de la especialidad',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de preguntas obtenida exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Especialidad no encontrada'
  })
  async obtenerPreguntasPorEspecialidad(
    @Param('especialidadId', ParseIntPipe) especialidadId: number
  ) {
    this.logger.log(`GET /preguntas-clinicas/especialidad/${especialidadId}`);
    return await this.preguntasService.obtenerPreguntasPorEspecialidad(especialidadId);
  }

  // Crear preguntas en lote
  @Post('lote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear preguntas en lote',
    description: 'Crea múltiples preguntas clínicas para una especialidad en una sola operación'
  })
  @ApiResponse({
    status: 201,
    description: 'Preguntas creadas exitosamente en lote'
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de entrada'
  })
  async crearPreguntasLote(@Body() createLoteDto: CrearPreguntasLoteDto) {
    this.logger.log('POST /preguntas-clinicas/lote - Creando preguntas en lote');
    return await this.preguntasService.crearPreguntasLote(createLoteDto);
  }

  // Obtener todas las preguntas clínicas
  @Get()
  @ApiOperation({
    summary: 'Obtener preguntas con filtros',
    description: 'Obtiene preguntas clínicas con filtros y paginación'
  })
  @ApiQuery({// Sirve para describir un parámetro de consulta
    name: 'especialidadId',
    required: false,
    description: 'ID de la especialidad para filtrar'
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Tipo de pregunta para filtrar'
  })
  @ApiQuery({
    name: 'obligatoria',
    required: false,
    description: 'Filtrar por preguntas obligatorias (true/false)'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    description: 'Término de búsqueda en el texto de la pregunta'
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
    description: 'Lista paginada de preguntas obtenida exitosamente'
  })
  async obtenerPreguntasConFiltros(
    @Query('especialidadId') especialidadId?: number,
    @Query('tipo') tipo?: string,
    @Query('obligatoria') obligatoria?: boolean,
    @Query('busqueda') busqueda?: string,
    @Query('pagina') pagina: number = 1,
    @Query('limite') limite: number = 10
  ) {
    this.logger.log('GET /preguntas-clinicas - Obteniendo preguntas con filtros');

    const filtros = {
      especialidadId: especialidadId ? Number(especialidadId) : undefined,
      TipoPregunta,
      obligatoria: obligatoria !== undefined ? Boolean(obligatoria) : undefined,
      busqueda
    };

    return await this.preguntasService.obtenerPreguntasConFiltros(filtros, Number(pagina), Number(limite));
  }

  // Obtener estadísticas de preguntas
  @Get('estadisticas/especialidad')
  @ApiOperation({
    summary: 'Obtener estadísticas de preguntas',
    description: 'Obtiene estadísticas de preguntas por especialidad'
  })
  @ApiQuery({
    name: 'especialidadId',
    required: false,
    description: 'ID de la especialidad (opcional, si no se proporciona devuelve todas)',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  async obtenerEstadisticasPorEspecialidad(
    @Query('especialidadId') especialidadId?: string
  ) {
    this.logger.log(`GET /preguntas-clinicas/estadisticas/especialidad - EspecialidadId: ${especialidadId || 'todas'}`);
    
    // Convertir a número si se proporciona
    const especialidadIdNum = especialidadId ? Number(especialidadId) : undefined;
    
    // Validar que sea un número válido si se proporciona
    if (especialidadId && isNaN(especialidadIdNum)) {
      throw new BadRequestException('El ID de especialidad debe ser un número válido');
    }
    
    return await this.preguntasService.obtenerEstadisticasPorEspecialidad(especialidadIdNum);
  }

  // ===============================
  // ENDPOINTS PARA RESPUESTAS
  // ===============================

  // Crear respuesta clínica
  @Post('respuestas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva respuesta clínica',
    description: 'Crea una nueva respuesta a una pregunta clínica'
  })
  @ApiResponse({
    status: 201,
    description: 'Respuesta clínica creada exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o formato de respuesta incorrecto'
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta o caso clínico no encontrado'
  })
  async crearRespuesta(@Body() createDto: CrearRespuestaClinicaDto) {
    this.logger.log('POST /preguntas-clinicas/respuestas - Creando nueva respuesta clínica');
    return await this.respuestasService.crearRespuesta(createDto);
  }

  // Obtener respuestas por caso clínico
  @Get('respuestas/caso/:casoClinicoId')
  @ApiOperation({
    summary: 'Obtener respuestas por caso clínico',
    description: 'Obtiene todas las respuestas de un caso clínico específico'
  })
  @ApiParam({
    name: 'casoClinicoId',
    description: 'ID del caso clínico',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de respuestas obtenida exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Caso clínico no encontrado'
  })
  async obtenerRespuestasPorCaso(
    @Param('casoClinicoId', ParseIntPipe) casoClinicoId: number
  ) {
    this.logger.log(`GET /preguntas-clinicas/respuestas/caso/${casoClinicoId}`);
    return await this.respuestasService.obtenerRespuestasPorCaso(casoClinicoId);
  }

  // Obtener respuesta por ID
  @Get('respuestas/:id')
  @ApiOperation({
    summary: 'Obtener respuesta por ID',
    description: 'Obtiene una respuesta clínica específica por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la respuesta',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta obtenida exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Respuesta no encontrada'
  })
  async obtenerRespuestaPorId(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /preguntas-clinicas/respuestas/${id}`);
    return await this.respuestasService.obtenerRespuestaPorId(id);
  }

  // Actualizar respuesta por ID
  @Put('respuestas/:id')
  @ApiOperation({
    summary: 'Actualizar respuesta clínica',
    description: 'Actualiza una respuesta clínica existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la respuesta',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta actualizada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Respuesta no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Formato de respuesta inválido'
  })
  async actualizarRespuesta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarRespuestaClinicaDto
  ) {
    this.logger.log(`PUT /preguntas-clinicas/respuestas/${id}`);
    return await this.respuestasService.actualizarRespuesta(id, updateDto);
  }

  // Eliminar respuesta por ID
  @Delete('respuestas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar respuesta clínica',
    description: 'Elimina una respuesta clínica específica'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la respuesta',
    type: 'number'
  })
  @ApiResponse({
    status: 204,
    description: 'Respuesta eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Respuesta no encontrada'
  })
  async eliminarRespuesta(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /preguntas-clinicas/respuestas/${id}`);
    await this.respuestasService.eliminarRespuesta(id);
  }

  // Crear respuestas en lote
  @Post('respuestas/lote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear respuestas en lote',
    description: 'Crea múltiples respuestas para un caso clínico en una sola operación'
  })
  @ApiResponse({
    status: 201,
    description: 'Respuestas creadas exitosamente en lote'
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de entrada o validación'
  })
  async crearRespuestasLote(@Body() createLoteDto: CrearRespuestasLoteDto) {
    this.logger.log('POST /preguntas-clinicas/respuestas/lote - Creando respuestas en lote');
    return await this.respuestasService.crearRespuestasLote(createLoteDto);
  }

  // Obtener estadísticas generales de respuestas
  @Get('respuestas/estadisticas/general')
  @ApiOperation({
    summary: 'Obtener estadísticas de respuestas',
    description: 'Obtiene estadísticas generales de respuestas clínicas'
  })
  @ApiQuery({
    name: 'especialidadId',
    required: false,
    description: 'ID de la especialidad para filtrar estadísticas'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  async obtenerEstadisticasRespuestas(
    @Query('especialidadId') especialidadId?: number
  ) {
    this.logger.log('GET /preguntas-clinicas/respuestas/estadisticas/general');
    return await this.respuestasService.obtenerEstadisticasRespuestas(
      especialidadId ? Number(especialidadId) : undefined
    );
  }

  // Obtener pregunta por ID
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener pregunta por ID',
    description: 'Obtiene una pregunta clínica específica por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la pregunta',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta obtenida exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta no encontrada'
  })
  async obtenerPreguntaPorId(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`GET /preguntas-clinicas/${id}`);
    return await this.preguntasService.obtenerPreguntaPorId(id);
  }

  // Actualizar pregunta por ID
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar pregunta clínica',
    description: 'Actualiza una pregunta clínica existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la pregunta',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta actualizada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta no encontrada'
  })
  async actualizarPregunta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ActualizarPreguntaClinicaDto
  ) {
    this.logger.log(`PUT /preguntas-clinicas/${id}`);
    return await this.preguntasService.actualizarPregunta(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar pregunta clínica',
    description: 'Elimina una pregunta clínica si no tiene respuestas asociadas'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la pregunta',
    type: 'number'
  })
  @ApiResponse({
    status: 204,
    description: 'Pregunta eliminada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar - tiene respuestas asociadas'
  })
  async eliminarPregunta(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /preguntas-clinicas/${id}`);
    await this.preguntasService.eliminarPregunta(id);
  }

  // ===============================
  // ENDPOINTS PARA MIGRACIÓN DE FORMATO
  // ===============================

  // Migrar una pregunta específica al formato nuevo
  @Put(':id/migrar-formato')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Migrar pregunta al formato optimizado',
    description: 'Convierte una pregunta del formato antiguo al nuevo formato de texto plano optimizado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la pregunta',
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Pregunta migrada exitosamente'
  })
  @ApiResponse({
    status: 404,
    description: 'Pregunta no encontrada'
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el proceso de migración'
  })
  async migrarPreguntaFormato(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`PUT /preguntas-clinicas/${id}/migrar-formato`);
    return await this.preguntasService.migrarPreguntaAFormatoNuevo(id);
  }

  // Migrar todas las preguntas de una especialidad
  @Post('migrar-formato-masivo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Migración masiva al formato optimizado',
    description: 'Convierte todas las preguntas de una especialidad (o todas) al formato nuevo'
  })
  @ApiQuery({
    name: 'especialidadId',
    description: 'ID de la especialidad (opcional)',
    type: 'number',
    required: false
  })
  @ApiResponse({
    status: 200,
    description: 'Migración masiva completada',
    schema: {
      type: 'object',
      properties: {
        migradas: { type: 'number', description: 'Preguntas migradas exitosamente' },
        errores: { type: 'number', description: 'Preguntas con errores' },
        total: { type: 'number', description: 'Total de preguntas procesadas' }
      }
    }
  })
  async migrarFormatoMasivo(@Query('especialidadId') especialidadId?: string) {
    this.logger.log(`POST /preguntas-clinicas/migrar-formato-masivo ${especialidadId ? `especialidad: ${especialidadId}` : 'todas'}`);
    
    const especialidadIdNum = especialidadId ? parseInt(especialidadId) : undefined;
    
    if (especialidadId && isNaN(especialidadIdNum!)) {
      throw new BadRequestException('ID de especialidad inválido');
    }
    
    const resultado = await this.preguntasService.migrarPreguntasFormatoNuevo(especialidadIdNum);
    
    return {
      ...resultado,
      total: resultado.migradas + resultado.errores
    };
  }

  // Obtener estadísticas de formato
  @Get('estadisticas-formato')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Estadísticas de formato de preguntas',
    description: 'Obtiene información sobre qué preguntas usan el formato nuevo vs antiguo'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de formato obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        formatoNuevo: { type: 'number', description: 'Preguntas en formato nuevo' },
        formatoAntiguo: { type: 'number', description: 'Preguntas en formato antiguo' },
        total: { type: 'number', description: 'Total de preguntas' },
        porcentajeMigrado: { type: 'number', description: 'Porcentaje migrado' }
      }
    }
  })
  async obtenerEstadisticasFormato() {
    this.logger.log('GET /preguntas-clinicas/estadisticas-formato');
    
    const estadisticas = await this.preguntasService.obtenerEstadisticasFormato();
    
    return {
      ...estadisticas,
      porcentajeMigrado: estadisticas.total > 0 ? 
        Math.round((estadisticas.formatoNuevo / estadisticas.total) * 100) : 0
    };
  }
}
