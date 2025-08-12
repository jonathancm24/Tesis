/**
 * Controlador de Disponibilidad
 * 
 * Maneja las solicitudes HTTP para la gestión de disponibilidad horaria
 * de estudiantes en el sistema académico. Proporciona endpoints REST para
 * que los estudiantes puedan definir sus horarios de atención y los
 * secretarios consulten disponibilidad para asignación de citas.
 * 
 * @fileoverview Controlador REST para disponibilidad horaria
 * @module DisponibilidadController
 * @requires NestJS Common, Swagger, Guards, DTOs, Service
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
  Request,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Logger,
  Patch
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DisponibilidadService } from './disponibilidad.service';
import {
  CrearDisponibilidadDto,
  ActualizarDisponibilidadDto,
  FiltrosDisponibilidadDto,
  CrearDisponibilidadMasivaDto,
  ConsultarDisponibilidadEspecificaDto,
  RespuestaPaginadaDisponibilidadDto,
  EstadisticasDisponibilidadDto,
  DiaSemana
} from './DTO';

/**
 * Controlador REST para Disponibilidad Horaria
 * 
 * Proporciona endpoints para gestionar la disponibilidad horaria de estudiantes
 * con autenticación JWT, validación de datos y documentación Swagger.
 * 
 * @example
 * GET /disponibilidad
 * POST /disponibilidad
 * PUT /disponibilidad/:id
 * DELETE /disponibilidad/:id
 */
@ApiTags('Disponibilidad Horaria')
@Controller('disponibilidad')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisponibilidadController {
  private readonly logger = new Logger(DisponibilidadController.name);

  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  /**
   * Crear nueva disponibilidad horaria
   * 
   * Endpoint para que los estudiantes definan su disponibilidad horaria.
   * Valida que no haya conflictos con horarios existentes.
   * 
   * @param crearDisponibilidadDto - Datos de la disponibilidad a crear
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Disponibilidad creada
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear disponibilidad horaria',
    description: 'Permite a los estudiantes definir su disponibilidad horaria para atención de pacientes'
  })
  @ApiCreatedResponse({
    description: 'Disponibilidad horaria creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        dia: { type: 'string', enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'], example: 'LUNES' },
        horaInicio: { type: 'string', example: '08:00' },
        horaFin: { type: 'string', example: '12:00' },
        usuarioId: { type: 'number', example: 2 }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, formato de hora incorrecto o conflicto de horarios'
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado o inactivo'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para crear disponibilidad para otro usuario'
  })
  async crearDisponibilidad(
    @Body() crearDisponibilidadDto: CrearDisponibilidadDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para crear disponibilidad del usuario ${request.user.userId}`);
    
    return await this.disponibilidadService.crearDisponibilidad(
      crearDisponibilidadDto,
      request.user.userId
    );
  }

  /**
   * Listar disponibilidades con filtros
   * 
   * Endpoint para obtener una lista paginada de disponibilidades
   * con opciones de filtrado avanzado.
   * 
   * @param filtros - Parámetros de filtrado y paginación
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaDisponibilidadDto> - Lista paginada
   */
  @Get()
  @ApiOperation({
    summary: 'Listar disponibilidades horarias',
    description: 'Obtiene una lista paginada de disponibilidades con opciones de filtrado'
  })
  @ApiOkResponse({
    description: 'Lista de disponibilidades obtenida exitosamente',
    type: RespuestaPaginadaDisponibilidadDto
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'ID del usuario (estudiante) para filtrar'
  })
  @ApiQuery({
    name: 'dia',
    required: false,
    enum: DiaSemana,
    description: 'Día de la semana para filtrar'
  })
  @ApiQuery({
    name: 'dias',
    required: false,
    type: [String],
    description: 'Lista de días para filtrar (separados por coma)'
  })
  @ApiQuery({
    name: 'horaMinima',
    required: false,
    type: String,
    description: 'Hora mínima de inicio (formato HH:MM)'
  })
  @ApiQuery({
    name: 'horaMaxima',
    required: false,
    type: String,
    description: 'Hora máxima de fin (formato HH:MM)'
  })
  @ApiQuery({
    name: 'soloActivas',
    required: false,
    type: Boolean,
    description: 'Solo usuarios activos (por defecto: true)'
  })
  @ApiQuery({
    name: 'incluirUsuario',
    required: false,
    type: Boolean,
    description: 'Incluir información del usuario (por defecto: false)'
  })
  @ApiQuery({
    name: 'página',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)'
  })
  @ApiQuery({
    name: 'límite',
    required: false,
    type: Number,
    description: 'Elementos por página (por defecto: 10, máximo: 100)'
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    enum: ['id', 'dia', 'horaInicio', 'horaFin', 'usuarioId'],
    description: 'Campo por el cual ordenar'
  })
  @ApiQuery({
    name: 'dirección',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento'
  })
  async listarDisponibilidades(
    @Query() filtros: FiltrosDisponibilidadDto,
    @Request() request: any
  ): Promise<RespuestaPaginadaDisponibilidadDto> {
    this.logger.log(`Solicitud para listar disponibilidades del usuario ${request.user.userId}`);
    
    return await this.disponibilidadService.obtenerDisponibilidades(
      filtros,
      request.user.userId
    );
  }

  /**
   * Obtener disponibilidad por ID
   * 
   * Endpoint para obtener una disponibilidad específica
   * con toda su información relacionada.
   * 
   * @param id - ID de la disponibilidad
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Disponibilidad completa
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener disponibilidad por ID',
    description: 'Obtiene una disponibilidad específica con información del usuario'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la disponibilidad'
  })
  @ApiOkResponse({
    description: 'Disponibilidad encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        dia: { type: 'string', example: 'LUNES' },
        horaInicio: { type: 'string', example: '08:00' },
        horaFin: { type: 'string', example: '12:00' },
        usuarioId: { type: 'number', example: 2 },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'García' },
            email: { type: 'string', example: 'maria@email.com' },
            telefono: { type: 'string', example: '0987654321' },
            activo: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Disponibilidad no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para acceder a esta disponibilidad'
  })
  async obtenerDisponibilidadPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para obtener disponibilidad ${id} del usuario ${request.user.userId}`);
    
    return await this.disponibilidadService.obtenerDisponibilidadPorId(
      id,
      request.user.userId
    );
  }

  /**
   * Actualizar disponibilidad horaria
   * 
   * Endpoint para modificar una disponibilidad existente,
   * validando conflictos de horario.
   * 
   * @param id - ID de la disponibilidad a actualizar
   * @param actualizarDisponibilidadDto - Datos a actualizar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Disponibilidad actualizada
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar disponibilidad horaria',
    description: 'Actualiza una disponibilidad existente validando conflictos de horario'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la disponibilidad a actualizar'
  })
  @ApiOkResponse({
    description: 'Disponibilidad actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        dia: { type: 'string', example: 'MARTES' },
        horaInicio: { type: 'string', example: '09:00' },
        horaFin: { type: 'string', example: '13:00' },
        usuarioId: { type: 'number', example: 2 }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Disponibilidad no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para editar esta disponibilidad'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o conflicto de horario'
  })
  async actualizarDisponibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDisponibilidadDto: ActualizarDisponibilidadDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para actualizar disponibilidad ${id} del usuario ${request.user.userId}`);
    
    return await this.disponibilidadService.actualizarDisponibilidad(
      id,
      actualizarDisponibilidadDto,
      request.user.userId
    );
  }

  /**
   * Eliminar disponibilidad horaria
   * 
   * Endpoint para eliminar una disponibilidad específica,
   * verificando que no tenga citas asociadas.
   * 
   * @param id - ID de la disponibilidad a eliminar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar disponibilidad horaria',
    description: 'Elimina una disponibilidad verificando que no tenga citas asociadas'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la disponibilidad a eliminar'
  })
  @ApiNoContentResponse({
    description: 'Disponibilidad eliminada exitosamente'
  })
  @ApiNotFoundResponse({
    description: 'Disponibilidad no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para eliminar esta disponibilidad'
  })
  @ApiBadRequestResponse({
    description: 'No se puede eliminar la disponibilidad porque tiene citas asociadas'
  })
  async eliminarDisponibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ): Promise<void> {
    this.logger.log(`Solicitud para eliminar disponibilidad ${id} del usuario ${request.user.userId}`);
    
    await this.disponibilidadService.eliminarDisponibilidad(
      id,
      request.user.userId
    );
  }

  /**
   * Crear múltiples disponibilidades
   * 
   * Endpoint para crear varias disponibilidades en una sola operación.
   * Útil para configurar horarios semanales completos.
   * 
   * @param crearMasivoDto - Datos para creación masiva
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Resultado detallado de la operación
   */
  @Post('masivo')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear disponibilidades masivas',
    description: 'Crea múltiples disponibilidades en una sola operación para configuración semanal'
  })
  @ApiCreatedResponse({
    description: 'Disponibilidades creadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalProcesadas: { type: 'number', example: 5 },
        creadasExitosamente: { type: 'number', example: 4 },
        fallos: { type: 'number', example: 1 },
        disponibilidadesCreadas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              dia: { type: 'string', example: 'LUNES' },
              horaInicio: { type: 'string', example: '08:00' },
              horaFin: { type: 'string', example: '12:00' },
              usuarioId: { type: 'number', example: 2 }
            }
          }
        },
        errores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dia: { type: 'string', example: 'MARTES' },
              horaInicio: { type: 'string', example: '08:00' },
              horaFin: { type: 'string', example: '12:00' },
              error: { type: 'string', example: 'Conflicto de horario detectado' }
            }
          }
        },
        advertencias: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  async crearDisponibilidadMasiva(
    @Body() crearMasivoDto: CrearDisponibilidadMasivaDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para crear disponibilidades masivas del usuario ${request.user.userId}`);
    
    return await this.disponibilidadService.crearDisponibilidadMasiva(
      crearMasivoDto,
      request.user.userId
    );
  }

  /**
   * Consultar disponibilidad específica
   * 
   * Endpoint para verificar si un estudiante está disponible
   * en una fecha y hora específica.
   * 
   * @param consultaDto - Parámetros de consulta
   * @returns Promise<any> - Información detallada de disponibilidad
   */
  @Post('consultar')
  @ApiOperation({
    summary: 'Consultar disponibilidad específica',
    description: 'Verifica si un estudiante está disponible en una fecha y hora específica'
  })
  @ApiOkResponse({
    description: 'Consulta de disponibilidad completada',
    schema: {
      type: 'object',
      properties: {
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'García' },
            email: { type: 'string', example: 'maria@email.com' }
          }
        },
        fecha: { type: 'string', example: '2025-01-15' },
        diaSemana: { type: 'string', example: 'LUNES' },
        horarioSolicitado: {
          type: 'object',
          properties: {
            horaInicio: { type: 'string', example: '09:00' },
            horaFin: { type: 'string', example: '10:00' }
          }
        },
        estaDisponible: { type: 'boolean', example: true },
        motivo: { type: 'string', example: 'Usuario disponible en el horario solicitado' },
        disponibilidadesConfiguradas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              horaInicio: { type: 'string', example: '08:00' },
              horaFin: { type: 'string', example: '12:00' }
            }
          }
        },
        citasExistentes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 5 },
              horaInicio: { type: 'string', example: '10:00' },
              horaFin: { type: 'string', example: '11:00' },
              estado: { type: 'string', example: 'RESERVADA' },
              paciente: { type: 'string', example: 'Juan Pérez' }
            }
          }
        },
        horariosAlternativos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              horaInicio: { type: 'string', example: '11:00' },
              horaFin: { type: 'string', example: '12:00' },
              disponible: { type: 'boolean', example: true }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado'
  })
  async consultarDisponibilidadEspecifica(
    @Body() consultaDto: ConsultarDisponibilidadEspecificaDto
  ) {
    this.logger.log(`Consultando disponibilidad específica para usuario ${consultaDto.usuarioId} en fecha ${consultaDto.fecha}`);
    
    return await this.disponibilidadService.consultarDisponibilidadEspecifica(consultaDto);
  }

  /**
   * Obtener slots disponibles
   * 
   * Endpoint para obtener una lista de slots de tiempo disponibles
   * para un usuario en una fecha específica.
   * 
   * @param usuarioId - ID del usuario
   * @param fecha - Fecha a consultar
   * @param duracion - Duración de cada slot en minutos (opcional)
   * @returns Promise<any> - Slots disponibles
   */
  @Get('slots/:usuarioId/:fecha')
  @ApiOperation({
    summary: 'Obtener slots disponibles',
    description: 'Obtiene una lista de slots de tiempo disponibles para un usuario en una fecha específica'
  })
  @ApiParam({
    name: 'usuarioId',
    type: Number,
    description: 'ID del usuario (estudiante)'
  })
  @ApiParam({
    name: 'fecha',
    type: String,
    description: 'Fecha a consultar (formato YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'duracion',
    required: false,
    type: Number,
    description: 'Duración de cada slot en minutos (por defecto: 60)'
  })
  @ApiOkResponse({
    description: 'Slots disponibles obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 2 },
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'García' }
          }
        },
        fecha: { type: 'string', example: '2025-01-15' },
        diaSemana: { type: 'string', example: 'LUNES' },
        slots: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              horaInicio: { type: 'string', example: '08:00' },
              horaFin: { type: 'string', example: '09:00' },
              duracion: { type: 'number', example: 60 },
              disponible: { type: 'boolean', example: true },
              motivo: { type: 'string', example: 'Ocupado por cita con Juan Pérez' },
              citaId: { type: 'number', example: 5 }
            }
          }
        },
        resumen: {
          type: 'object',
          properties: {
            totalSlots: { type: 'number', example: 8 },
            slotsDisponibles: { type: 'number', example: 6 },
            slotsOcupados: { type: 'number', example: 2 },
            porcentajeDisponibilidad: { type: 'number', example: 75.0 }
          }
        }
      }
    }
  })
  async obtenerSlotsDisponibles(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('fecha') fecha: string,
    @Query('duracion') duracion?: number
  ) {
    this.logger.log(`Obteniendo slots disponibles para usuario ${usuarioId} en fecha ${fecha}`);
    
    return await this.disponibilidadService.obtenerSlotsDisponibles(
      usuarioId,
      fecha,
      duracion || 60
    );
  }

  /**
   * Obtener estadísticas de disponibilidad
   * 
   * Endpoint para obtener métricas y estadísticas generales
   * del sistema de disponibilidad.
   * 
   * @returns Promise<EstadisticasDisponibilidadDto> - Estadísticas del sistema
   */
  @Get('estadisticas/basicas')
  @ApiOperation({
    summary: 'Obtener estadísticas de disponibilidad',
    description: 'Obtiene estadísticas generales del sistema de disponibilidad horaria'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    type: EstadisticasDisponibilidadDto
  })
  async obtenerEstadisticas(): Promise<EstadisticasDisponibilidadDto> {
    this.logger.log('Solicitud para obtener estadísticas de disponibilidad');
    
    return await this.disponibilidadService.obtenerEstadisticas();
  }

  /**
   * Obtener disponibilidades del usuario autenticado
   * 
   * Endpoint para obtener todas las disponibilidades donde el usuario
   * autenticado es el propietario.
   * 
   * @param filtros - Filtros opcionales para la consulta
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaDisponibilidadDto> - Disponibilidades del usuario
   */
  @Get('mis-horarios/usuario')
  @ApiOperation({
    summary: 'Obtener mis disponibilidades',
    description: 'Obtiene todas las disponibilidades del usuario autenticado'
  })
  @ApiOkResponse({
    description: 'Disponibilidades del usuario obtenidas exitosamente',
    type: RespuestaPaginadaDisponibilidadDto
  })
  @ApiQuery({
    name: 'dia',
    required: false,
    enum: DiaSemana,
    description: 'Filtrar por día específico'
  })
  @ApiQuery({
    name: 'incluirUsuario',
    required: false,
    type: Boolean,
    description: 'Incluir información del usuario'
  })
  @ApiQuery({
    name: 'página',
    required: false,
    type: Number,
    description: 'Número de página'
  })
  @ApiQuery({
    name: 'límite',
    required: false,
    type: Number,
    description: 'Elementos por página'
  })
  async obtenerMisDisponibilidades(
    @Query() filtros: Partial<FiltrosDisponibilidadDto>,
    @Request() request: any
  ): Promise<RespuestaPaginadaDisponibilidadDto> {
    this.logger.log(`Solicitud para obtener disponibilidades del usuario ${request.user.userId}`);
    
    // Agregar filtro del usuario actual
    const filtrosCompletos: FiltrosDisponibilidadDto = {
      ...filtros,
      usuarioId: request.user.userId
    };
    
    return await this.disponibilidadService.obtenerDisponibilidades(
      filtrosCompletos,
      request.user.userId
    );
  }

  /**
   * Obtener disponibilidades por estudiante
   * 
   * Endpoint para obtener todas las disponibilidades de un estudiante específico.
   * Útil para secretarios que necesitan consultar horarios para asignar citas.
   * 
   * @param estudianteId - ID del estudiante
   * @param filtros - Filtros adicionales opcionales
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaDisponibilidadDto> - Disponibilidades del estudiante
   */
  @Get('estudiante/:estudianteId/horarios')
  @ApiOperation({
    summary: 'Obtener disponibilidades por estudiante',
    description: 'Obtiene todas las disponibilidades de un estudiante específico'
  })
  @ApiParam({
    name: 'estudianteId',
    type: Number,
    description: 'ID del estudiante'
  })
  @ApiQuery({
    name: 'dia',
    required: false,
    enum: DiaSemana,
    description: 'Filtrar por día específico'
  })
  @ApiQuery({
    name: 'soloActivas',
    required: false,
    type: Boolean,
    description: 'Solo disponibilidades activas'
  })
  @ApiQuery({
    name: 'incluirUsuario',
    required: false,
    type: Boolean,
    description: 'Incluir información del usuario'
  })
  @ApiOkResponse({
    description: 'Disponibilidades del estudiante obtenidas exitosamente',
    type: RespuestaPaginadaDisponibilidadDto
  })
  async obtenerDisponibilidadesPorEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query() filtros: Partial<FiltrosDisponibilidadDto>,
    @Request() request: any
  ): Promise<RespuestaPaginadaDisponibilidadDto> {
    this.logger.log(`Solicitud para obtener disponibilidades del estudiante ${estudianteId} del usuario ${request.user.userId}`);
    
    const filtrosCompletos: FiltrosDisponibilidadDto = {
      ...filtros,
      usuarioId: estudianteId,
      incluirUsuario: true // Siempre incluir información del usuario para esta consulta
    };
    
    return await this.disponibilidadService.obtenerDisponibilidades(
      filtrosCompletos,
      request.user.userId
    );
  }

  /**
   * Verificar disponibilidad para cita
   * 
   * Endpoint optimizado para que los secretarios verifiquen rápidamente
   * si un estudiante está disponible para una cita específica.
   * 
   * @param estudianteId - ID del estudiante
   * @param fecha - Fecha de la cita
   * @param horaInicio - Hora de inicio de la cita
   * @param horaFin - Hora de fin de la cita
   * @returns Promise<any> - Resultado de la verificación
   */
  @Get('verificar/:estudianteId/:fecha/:horaInicio/:horaFin')
  @ApiOperation({
    summary: 'Verificar disponibilidad para cita',
    description: 'Verifica rápidamente si un estudiante está disponible para una cita específica'
  })
  @ApiParam({
    name: 'estudianteId',
    type: Number,
    description: 'ID del estudiante'
  })
  @ApiParam({
    name: 'fecha',
    type: String,
    description: 'Fecha de la cita (formato YYYY-MM-DD)'
  })
  @ApiParam({
    name: 'horaInicio',
    type: String,
    description: 'Hora de inicio (formato HH:MM)'
  })
  @ApiParam({
    name: 'horaFin',
    type: String,
    description: 'Hora de fin (formato HH:MM)'
  })
  @ApiOkResponse({
    description: 'Verificación de disponibilidad completada',
    schema: {
      type: 'object',
      properties: {
        disponible: { type: 'boolean', example: true },
        motivo: { type: 'string', example: 'Estudiante disponible en el horario solicitado' },
        estudiante: { type: 'string', example: 'María García' },
        fecha: { type: 'string', example: '2025-01-15' },
        horario: { type: 'string', example: '09:00 - 10:00' }
      }
    }
  })
  async verificarDisponibilidadParaCita(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('fecha') fecha: string,
    @Param('horaInicio') horaInicio: string,
    @Param('horaFin') horaFin: string
  ) {
    this.logger.log(`Verificando disponibilidad para cita: estudiante ${estudianteId}, fecha ${fecha}, horario ${horaInicio}-${horaFin}`);
    
    const consultaDto: ConsultarDisponibilidadEspecificaDto = {
      usuarioId: estudianteId,
      fecha,
      horaInicio,
      horaFin
    };
    
    const resultado = await this.disponibilidadService.consultarDisponibilidadEspecifica(consultaDto);
    
    return {
      disponible: resultado.estaDisponible,
      motivo: resultado.motivo || 'Estudiante disponible en el horario solicitado',
      estudiante: `${resultado.usuario.nombre} ${resultado.usuario.apellido}`,
      fecha: resultado.fecha,
      horario: `${horaInicio} - ${horaFin}`
    };
  }
}
