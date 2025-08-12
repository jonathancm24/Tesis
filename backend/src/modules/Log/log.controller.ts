/**
 * Controlador para la gestión de Logs del sistema
 * 
 * Expone endpoints REST exclusivamente para consulta y análisis
 * de logs de auditoría del sistema. Este controlador está diseñado
 * para administradores y proporciona capacidades avanzadas de
 * monitoreo y análisis de actividad.
 * 
 * @fileoverview Controlador de logs de auditoría
 * @module LogController
 */

import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseBoolPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LogService } from './log.service';
import {
  FiltrosLogDto,
  PaginacionLogDto,
  LogRespuestaDto,
  LogsPaginadosDto,
  EstadisticasLogDto,
  MetricasActividadDto
} from './log.dto';

/**
 * Controlador para gestionar logs de auditoría
 * 
 * Proporciona endpoints de solo lectura para consultar,
 * analizar y monitorear la actividad del sistema.
 * Acceso restringido solo a administradores.
 */
@ApiTags('Logs de Auditoría')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogController {
  private readonly logger = new Logger(LogController.name);

  constructor(private readonly logService: LogService) {}

  /**
   * Obtener logs paginados con filtros avanzados
   * 
   * Consulta logs del sistema aplicando filtros específicos
   * con paginación para manejar grandes volúmenes de datos.
   * Incluye resumen estadístico de los resultados.
   * 
   * @param pagina - Número de página (empezando desde 1)
   * @param limite - Cantidad de elementos por página
   * @param ordenarPor - Campo por el cual ordenar
   * @param direccion - Dirección del ordenamiento
   * @param usuarioId - Filtrar por ID de usuario específico
   * @param nombreUsuario - Filtrar por nombre de usuario
   * @param emailUsuario - Filtrar por email de usuario
   * @param accion - Filtrar por acción específica
   * @param tabla - Filtrar por tabla afectada
   * @param fechaInicio - Fecha de inicio del rango
   * @param fechaFin - Fecha final del rango
   * @param rolUsuario - Filtrar por rol del usuario
   * @param usuarioActivo - Filtrar solo usuarios activos
   * @param incluirUsuario - Incluir información del usuario
   * @param incluirDetalles - Incluir detalles JSON
   * @param buscarEnDetalles - Buscar texto en detalles
   * @returns Logs paginados con información adicional
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener logs paginados con filtros',
    description: 'Consulta logs del sistema aplicando filtros avanzados. Incluye paginación, ordenamiento y resumen estadístico de resultados.'
  })
  @ApiQuery({ name: 'pagina', required: true, type: Number, description: 'Número de página (desde 1)' })
  @ApiQuery({ name: 'limite', required: true, type: Number, description: 'Elementos por página (máx 100)' })
  @ApiQuery({ name: 'ordenarPor', required: false, enum: ['fecha', 'usuarioId', 'accion', 'tabla'], description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'direccion', required: false, enum: ['asc', 'desc'], description: 'Dirección del ordenamiento' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number, description: 'ID del usuario' })
  @ApiQuery({ name: 'nombreUsuario', required: false, type: String, description: 'Nombre del usuario (búsqueda parcial)' })
  @ApiQuery({ name: 'emailUsuario', required: false, type: String, description: 'Email del usuario (búsqueda parcial)' })
  @ApiQuery({ name: 'accion', required: false, type: String, description: 'Acción realizada' })
  @ApiQuery({ name: 'tabla', required: false, type: String, description: 'Tabla afectada' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha de inicio (ISO 8601)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha final (ISO 8601)' })
  @ApiQuery({ name: 'rolUsuario', required: false, type: String, description: 'Rol del usuario' })
  @ApiQuery({ name: 'usuarioActivo', required: false, type: Boolean, description: 'Solo usuarios activos' })
  @ApiQuery({ name: 'incluirUsuario', required: false, type: Boolean, description: 'Incluir info del usuario' })
  @ApiQuery({ name: 'incluirDetalles', required: false, type: Boolean, description: 'Incluir detalles JSON' })
  @ApiQuery({ name: 'buscarEnDetalles', required: false, type: String, description: 'Buscar en detalles' })
  @ApiResponse({
    status: 200,
    description: 'Logs obtenidos exitosamente',
    type: LogsPaginadosDto
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token requerido'
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores'
  })
  async obtenerLogs(
    @Query('pagina', ParseIntPipe) pagina: number,
    @Query('limite', ParseIntPipe) limite: number,
    @Query('ordenarPor') ordenarPor?: 'fecha' | 'usuarioId' | 'accion' | 'tabla',
    @Query('direccion') direccion?: 'asc' | 'desc',
    @Query('usuarioId') usuarioId?: number,
    @Query('nombreUsuario') nombreUsuario?: string,
    @Query('emailUsuario') emailUsuario?: string,
    @Query('accion') accion?: string,
    @Query('tabla') tabla?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('rolUsuario') rolUsuario?: string,
    @Query('usuarioActivo', new ParseBoolPipe({ optional: true })) usuarioActivo?: boolean,
    @Query('incluirUsuario', new ParseBoolPipe({ optional: true })) incluirUsuario?: boolean,
    @Query('incluirDetalles', new ParseBoolPipe({ optional: true })) incluirDetalles?: boolean,
    @Query('buscarEnDetalles') buscarEnDetalles?: string
  ): Promise<LogsPaginadosDto> {
    this.logger.log('Consulta de logs recibida con filtros avanzados');

    try {
      // Validar parámetros de paginación
      if (pagina < 1) {
        throw new BadRequestException('La página debe ser mayor a 0');
      }
      if (limite < 1 || limite > 100) {
        throw new BadRequestException('El límite debe estar entre 1 y 100');
      }

      // Construir DTOs de filtros y paginación
      const filtros: FiltrosLogDto = {
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
        nombreUsuario,
        emailUsuario,
        accion,
        tabla,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        rolUsuario,
        usuarioActivo,
        incluirUsuario: incluirUsuario ?? false,
        incluirDetalles: incluirDetalles ?? false,
        buscarEnDetalles
      };

      const paginacion: PaginacionLogDto = {
        pagina,
        limite,
        ordenarPor: ordenarPor || 'fecha',
        direccion: direccion || 'desc'
      };

      // Validar fechas si se proporcionan
      if (filtros.fechaInicio && filtros.fechaFin) {
        if (filtros.fechaInicio >= filtros.fechaFin) {
          throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha final');
        }
      }

      return await this.logService.obtenerLogsPaginados(filtros, paginacion);

    } catch (error) {
      this.logger.error(`Error en consulta de logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales del sistema de logs
   * 
   * Calcula métricas y estadísticas del sistema de logs
   * para análisis de actividad y toma de decisiones.
   * Incluye distribuciones, usuarios más activos y tendencias.
   * 
   * @returns Estadísticas detalladas del sistema
   */
  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de logs',
    description: 'Calcula métricas generales del sistema: totales, distribuciones por acción/tabla, usuarios más activos, actividad temporal.'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas calculadas exitosamente',
    type: EstadisticasLogDto
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores'
  })
  async obtenerEstadisticas(): Promise<EstadisticasLogDto> {
    this.logger.log('Calculando estadísticas generales de logs');
    return await this.logService.obtenerEstadisticas();
  }

  /**
   * Obtener métricas de actividad en tiempo real
   * 
   * Proporciona información actualizada para dashboard
   * de monitoreo del sistema. Incluye usuarios conectados,
   * actividad reciente, errores y alertas de seguridad.
   * 
   * @returns Métricas de actividad en tiempo real
   */
  @Get('metricas-actividad')
  @ApiOperation({
    summary: 'Obtener métricas de actividad en tiempo real',
    description: 'Información actualizada para dashboard: usuarios conectados, actividad reciente, errores, alertas de seguridad.'
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
    type: MetricasActividadDto
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo administradores'
  })
  async obtenerMetricasActividad(): Promise<MetricasActividadDto> {
    this.logger.log('Obteniendo métricas de actividad en tiempo real');
    return await this.logService.obtenerMetricasActividad();
  }

  /**
   * Buscar logs por texto libre
   * 
   * Búsqueda textual en acciones, tablas, usuarios y detalles
   * de los logs para encontrar información específica.
   * Útil para investigaciones y análisis forense.
   * 
   * @param texto - Texto a buscar (mínimo 2 caracteres)
   * @param pagina - Número de página
   * @param limite - Elementos por página
   * @returns Logs que contienen el texto buscado
   */
  @Get('buscar')
  @ApiOperation({
    summary: 'Buscar logs por texto libre',
    description: 'Búsqueda textual en acciones, tablas, usuarios y detalles. Útil para investigaciones y análisis.'
  })
  @ApiQuery({ name: 'texto', type: String, description: 'Texto a buscar (mín 2 caracteres)' })
  @ApiQuery({ name: 'pagina', type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limite', type: Number, description: 'Elementos por página', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Búsqueda completada exitosamente',
    type: LogsPaginadosDto
  })
  @ApiResponse({
    status: 400,
    description: 'Texto de búsqueda inválido'
  })
  async buscarLogs(
    @Query('texto') texto: string,
    @Query('pagina', ParseIntPipe) pagina: number = 1,
    @Query('limite', ParseIntPipe) limite: number = 20
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Búsqueda de logs por texto: "${texto}"`);

    const paginacion: PaginacionLogDto = {
      pagina,
      limite,
      ordenarPor: 'fecha',
      direccion: 'desc'
    };

    return await this.logService.buscarLogsPorTexto(texto, paginacion);
  }

  /**
   * Obtener logs de un usuario específico
   * 
   * Consulta todas las actividades registradas para un usuario
   * en particular. Útil para auditorías de usuario y análisis
   * de comportamiento individual.
   * 
   * @param usuarioId - ID del usuario
   * @param pagina - Número de página
   * @param limite - Elementos por página
   * @returns Logs del usuario especificado
   */
  @Get('usuario/:usuarioId')
  @ApiOperation({
    summary: 'Obtener logs de un usuario específico',
    description: 'Consulta todas las actividades de un usuario. Útil para auditorías individuales y análisis de comportamiento.'
  })
  @ApiParam({
    name: 'usuarioId',
    type: Number,
    description: 'ID único del usuario'
  })
  @ApiQuery({ name: 'pagina', type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limite', type: Number, description: 'Elementos por página', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Logs del usuario obtenidos exitosamente',
    type: LogsPaginadosDto
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado'
  })
  async obtenerLogsPorUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query('pagina', ParseIntPipe) pagina: number = 1,
    @Query('limite', ParseIntPipe) limite: number = 20
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Obteniendo logs para usuario ID: ${usuarioId}`);

    const paginacion: PaginacionLogDto = {
      pagina,
      limite,
      ordenarPor: 'fecha',
      direccion: 'desc'
    };

    return await this.logService.obtenerLogsPorUsuario(usuarioId, paginacion);
  }

  /**
   * Obtener logs por rango de fechas
   * 
   * Consulta logs en un período específico con análisis
   * estadístico del período. Útil para reportes periódicos
   * y análisis de tendencias temporales.
   * 
   * @param fechaInicio - Fecha de inicio (ISO 8601)
   * @param fechaFin - Fecha final (ISO 8601)
   * @param pagina - Número de página
   * @param limite - Elementos por página
   * @returns Logs en el rango especificado
   */
  @Get('rango-fechas')
  @ApiOperation({
    summary: 'Obtener logs por rango de fechas',
    description: 'Consulta logs en período específico con análisis estadístico. Útil para reportes y análisis de tendencias.'
  })
  @ApiQuery({ name: 'fechaInicio', type: String, description: 'Fecha de inicio (ISO 8601)' })
  @ApiQuery({ name: 'fechaFin', type: String, description: 'Fecha final (ISO 8601)' })
  @ApiQuery({ name: 'pagina', type: Number, description: 'Número de página', example: 1 })
  @ApiQuery({ name: 'limite', type: Number, description: 'Elementos por página', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Logs del período obtenidos exitosamente',
    type: LogsPaginadosDto
  })
  @ApiResponse({
    status: 400,
    description: 'Rango de fechas inválido'
  })
  async obtenerLogsPorRangoFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('pagina', ParseIntPipe) pagina: number = 1,
    @Query('limite', ParseIntPipe) limite: number = 20
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Obteniendo logs desde ${fechaInicio} hasta ${fechaFin}`);

    try {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        throw new BadRequestException('Formato de fecha inválido. Use formato ISO 8601');
      }

      const paginacion: PaginacionLogDto = {
        pagina,
        limite,
        ordenarPor: 'fecha',
        direccion: 'desc'
      };

      return await this.logService.obtenerLogsPorRangoFechas(inicio, fin, paginacion);

    } catch (error) {
      this.logger.error(`Error en consulta por rango de fechas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un log específico por ID
   * 
   * Consulta los detalles completos de un log específico
   * incluyendo toda la información del usuario y detalles JSON.
   * Útil para análisis detallado de eventos específicos.
   * 
   * @param id - ID único del log
   * @returns Log con información completa
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener log específico por ID',
    description: 'Consulta detalles completos de un log específico incluyendo información del usuario y detalles JSON.'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del log'
  })
  @ApiResponse({
    status: 200,
    description: 'Log encontrado exitosamente',
    type: LogRespuestaDto
  })
  @ApiResponse({
    status: 404,
    description: 'Log no encontrado'
  })
  async obtenerLogPorId(@Param('id', ParseIntPipe) id: number): Promise<LogRespuestaDto> {
    this.logger.log(`Obteniendo log con ID: ${id}`);
    return await this.logService.obtenerLogPorId(id);
  }
}
