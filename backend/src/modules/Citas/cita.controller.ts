/**
 * Controlador de Citas Médicas
 * 
 * Maneja las solicitudes HTTP para la gestión de citas médicas/odontológicas
 * en el sistema académico. Proporciona endpoints REST para operaciones CRUD,
 * verificación de disponibilidad, gestión de estados y estadísticas.
 * 
 * @fileoverview Controlador REST para citas médicas
 * @module CitaController
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
import { CitaService } from './cita.service';
import {
  CrearCitaDto,
  ActualizarCitaDto,
  FiltrosCitasDto,
  ConsultarDisponibilidadDto,
  RespuestaPaginadaCitasDto,
  EstadisticasCitasDto,
  CambiarEstadoMasivoCitasDto
} from './DTO';

/**
 * Controlador REST para Citas Médicas
 * 
 * Proporciona endpoints para gestionar citas médicas/odontológicas
 * con autenticación JWT, validación de datos y documentación Swagger.
 * 
 * @example
 * GET /citas
 * POST /citas
 * PUT /citas/:id
 * DELETE /citas/:id
 */
@ApiTags('Citas Médicas')
@Controller('citas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CitaController {
  private readonly logger = new Logger(CitaController.name);

  constructor(private readonly citaService: CitaService) {}

  /**
   * Crear una nueva cita médica
   * 
   * Endpoint para agendar una nueva cita, validando disponibilidad
   * del estudiante y verificando conflictos de horario.
   * 
   * @param crearCitaDto - Datos de la cita a crear
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Cita médica creada
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear cita médica',
    description: 'Crea una nueva cita médica validando disponibilidad y conflictos de horario'
  })
  @ApiCreatedResponse({
    description: 'Cita médica creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        fecha: { type: 'string', format: 'date-time', example: '2025-01-15T00:00:00Z' },
        estado: { type: 'string', example: 'RESERVADA' },
        observaciones: { type: 'string', example: 'Primera consulta', nullable: true },
        pacienteId: { type: 'number', example: 1 },
        especialidadId: { type: 'number', example: 1 },
        estudianteId: { type: 'number', example: 2 },
        docenteId: { type: 'number', example: 3, nullable: true },
        horainicio: { type: 'string', format: 'date-time' },
        horafin: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos, conflicto de horario o estudiante no disponible'
  })
  @ApiNotFoundResponse({
    description: 'Paciente, estudiante, especialidad o docente no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para crear citas'
  })
  async crearCita(
    @Body() crearCitaDto: CrearCitaDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para crear cita del usuario ${request.user.userId}`);
    
    return await this.citaService.crearCita(
      crearCitaDto,
      request.user.userId
    );
  }

  /**
   * Listar citas médicas con filtros
   * 
   * Endpoint para obtener una lista paginada de citas
   * con opciones de filtrado avanzado.
   * 
   * @param filtros - Parámetros de filtrado y paginación
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaCitasDto> - Lista paginada de citas
   */
  @Get()
  @ApiOperation({
    summary: 'Listar citas médicas',
    description: 'Obtiene una lista paginada de citas médicas con opciones de filtrado'
  })
  @ApiOkResponse({
    description: 'Lista de citas médicas obtenida exitosamente',
    type: RespuestaPaginadaCitasDto
  })
  @ApiQuery({
    name: 'pacienteId',
    required: false,
    type: Number,
    description: 'ID del paciente para filtrar'
  })
  @ApiQuery({
    name: 'estudianteId',
    required: false,
    type: Number,
    description: 'ID del estudiante para filtrar'
  })
  @ApiQuery({
    name: 'docenteId',
    required: false,
    type: Number,
    description: 'ID del docente para filtrar'
  })
  @ApiQuery({
    name: 'especialidadId',
    required: false,
    type: Number,
    description: 'ID de la especialidad para filtrar'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['DISPONIBLE', 'RESERVADA', 'CANCELADA', 'FINALIZADA', 'NO_ASISTIO'],
    description: 'Estado de la cita para filtrar'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha desde (formato YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha hasta (formato YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'horaDesde',
    required: false,
    type: String,
    description: 'Hora desde (formato HH:MM)'
  })
  @ApiQuery({
    name: 'horaHasta',
    required: false,
    type: String,
    description: 'Hora hasta (formato HH:MM)'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Término de búsqueda en observaciones'
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
    enum: ['id', 'fecha', 'horaInicio', 'estado', 'pacienteId', 'estudianteId'],
    description: 'Campo por el cual ordenar'
  })
  @ApiQuery({
    name: 'dirección',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento'
  })
  async listarCitas(
    @Query() filtros: FiltrosCitasDto,
    @Request() request: any
  ): Promise<RespuestaPaginadaCitasDto> {
    this.logger.log(`Solicitud para listar citas del usuario ${request.user.userId}`);
    
    return await this.citaService.obtenerCitas(
      filtros,
      request.user.userId
    );
  }

  /**
   * Obtener cita médica por ID
   * 
   * Endpoint para obtener una cita específica
   * con toda su información relacionada.
   * 
   * @param id - ID de la cita médica
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Cita médica con relaciones completas
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cita médica por ID',
    description: 'Obtiene una cita médica específica con toda su información relacionada'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la cita médica'
  })
  @ApiOkResponse({
    description: 'Cita médica encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        fecha: { type: 'string', format: 'date-time' },
        estado: { type: 'string', example: 'RESERVADA' },
        observaciones: { type: 'string', example: 'Primera consulta' },
        horainicio: { type: 'string', format: 'date-time' },
        horafin: { type: 'string', format: 'date-time' },
        paciente: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'juan@email.com' }
          }
        },
        estudiante: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'García' }
          }
        },
        especialidad: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Ortodoncia' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Cita médica no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para acceder a esta cita'
  })
  async obtenerCitaPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para obtener cita ${id} del usuario ${request.user.userId}`);
    
    return await this.citaService.obtenerCitaPorId(
      id,
      request.user.userId
    );
  }

  /**
   * Actualizar cita médica
   * 
   * Endpoint para modificar una cita existente,
   * incluyendo reagendamiento y cambio de estado.
   * 
   * @param id - ID de la cita a actualizar
   * @param actualizarCitaDto - Datos a actualizar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Cita médica actualizada
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar cita médica',
    description: 'Actualiza una cita médica existente con nuevos datos'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la cita médica a actualizar'
  })
  @ApiOkResponse({
    description: 'Cita médica actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        fecha: { type: 'string', format: 'date-time' },
        estado: { type: 'string', example: 'FINALIZADA' },
        observaciones: { type: 'string', example: 'Cita finalizada exitosamente' },
        horainicio: { type: 'string', format: 'date-time' },
        horafin: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Cita médica no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para editar esta cita'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o conflicto de horario'
  })
  async actualizarCita(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarCitaDto: ActualizarCitaDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para actualizar cita ${id} del usuario ${request.user.userId}`);
    
    return await this.citaService.actualizarCita(
      id,
      actualizarCitaDto,
      request.user.userId
    );
  }

  /**
   * Cancelar cita médica
   * 
   * Endpoint para cancelar una cita específica,
   * liberando el horario para nuevas citas.
   * 
   * @param id - ID de la cita a cancelar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Cita médica cancelada
   */
  @Patch(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar cita médica',
    description: 'Cancela una cita médica liberando el horario para nuevas citas'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la cita médica a cancelar'
  })
  @ApiOkResponse({
    description: 'Cita médica cancelada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        estado: { type: 'string', example: 'CANCELADA' },
        observaciones: { type: 'string', example: 'Cita cancelada por el usuario' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Cita médica no encontrada'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para cancelar esta cita'
  })
  async cancelarCita(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para cancelar cita ${id} del usuario ${request.user.userId}`);
    
    return await this.citaService.cancelarCita(
      id,
      motivo || 'Cita cancelada por el usuario',
      request.user.userId
    );
  }

  /**
   * Consultar disponibilidad de estudiante
   * 
   * Endpoint para verificar la disponibilidad de un estudiante
   * en una fecha específica.
   * 
   * @param consultarDisponibilidadDto - Parámetros de consulta
   * @returns Promise<any> - Información de disponibilidad
   */
  @Post('consultar-disponibilidad')
  @ApiOperation({
    summary: 'Consultar disponibilidad de estudiante',
    description: 'Verifica la disponibilidad de un estudiante en una fecha específica'
  })
  @ApiOkResponse({
    description: 'Información de disponibilidad obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        fecha: { type: 'string', example: '2025-01-15' },
        estudianteId: { type: 'number', example: 2 },
        estudiante: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'María' },
            apellido: { type: 'string', example: 'García' }
          }
        },
        diaSemana: { type: 'string', example: 'LUNES' },
        tieneDisponibilidad: { type: 'boolean', example: true },
        horariosConfigurados: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
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
              horaInicio: { type: 'string', example: '09:00' },
              horaFin: { type: 'string', example: '10:00' },
              estado: { type: 'string', example: 'RESERVADA' },
              paciente: { type: 'string', example: 'Juan Pérez' }
            }
          }
        },
        horariosDisponibles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              horaInicio: { type: 'string', example: '10:00' },
              horaFin: { type: 'string', example: '11:00' },
              disponible: { type: 'boolean', example: true }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Estudiante no encontrado'
  })
  async consultarDisponibilidad(
    @Body() consultarDisponibilidadDto: ConsultarDisponibilidadDto
  ) {
    this.logger.log(`Consultando disponibilidad del estudiante ${consultarDisponibilidadDto.estudianteId} para fecha ${consultarDisponibilidadDto.fecha}`);
    
    return await this.citaService.consultarDisponibilidad(consultarDisponibilidadDto);
  }

  /**
   * Obtener estadísticas básicas de citas
   * 
   * Endpoint para obtener métricas y estadísticas generales
   * del sistema de citas médicas.
   * 
   * @returns Promise<EstadisticasCitasDto> - Estadísticas del sistema
   */
  @Get('estadisticas/basicas')
  @ApiOperation({
    summary: 'Obtener estadísticas básicas',
    description: 'Obtiene estadísticas generales del sistema de citas médicas'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    type: EstadisticasCitasDto
  })
  async obtenerEstadisticasBasicas(): Promise<EstadisticasCitasDto> {
    this.logger.log('Solicitud para obtener estadísticas básicas de citas');
    
    return await this.citaService.obtenerEstadisticasBasicas();
  }

  /**
   * Obtener citas del usuario autenticado
   * 
   * Endpoint para obtener todas las citas donde participa
   * el usuario autenticado (como estudiante o docente).
   * 
   * @param filtros - Filtros opcionales para la consulta
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaCitasDto> - Citas del usuario
   */
  @Get('mis-citas/usuario')
  @ApiOperation({
    summary: 'Obtener mis citas médicas',
    description: 'Obtiene todas las citas donde el usuario autenticado participa como estudiante o docente'
  })
  @ApiOkResponse({
    description: 'Citas del usuario obtenidas exitosamente',
    type: RespuestaPaginadaCitasDto
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['DISPONIBLE', 'RESERVADA', 'CANCELADA', 'FINALIZADA', 'NO_ASISTIO'],
    description: 'Filtrar por estado de cita'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha'
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
  async obtenerMisCitas(
    @Query() filtros: Partial<FiltrosCitasDto>,
    @Request() request: any
  ): Promise<RespuestaPaginadaCitasDto> {
    this.logger.log(`Solicitud para obtener citas del usuario ${request.user.userId}`);
    
    // Agregar filtro del usuario actual
    const filtrosCompletos: FiltrosCitasDto = {
      ...filtros,
      estudianteId: request.user.userId // Asumiendo que el usuario es estudiante
    };
    
    return await this.citaService.obtenerCitas(
      filtrosCompletos,
      request.user.userId
    );
  }

  /**
   * Cambiar estado masivo de citas
   * 
   * Endpoint para cambiar el estado de múltiples citas
   * simultáneamente (operación administrativa).
   * 
   * @param cambiarEstadoDto - IDs de citas y nuevo estado
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Resultado del cambio masivo
   */
  @Patch('cambiar-estado-masivo')
  @ApiOperation({
    summary: 'Cambiar estado masivo de citas',
    description: 'Cambia el estado de múltiples citas simultáneamente'
  })
  @ApiOkResponse({
    description: 'Estado de citas cambiado exitosamente',
    schema: {
      type: 'object',
      properties: {
        citasActualizadas: { type: 'number', example: 5 },
        nuevoEstado: { type: 'string', example: 'CANCELADA' },
        motivo: { type: 'string', example: 'Cancelación masiva por emergencia' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para realizar cambios masivos'
  })
  async cambiarEstadoMasivo(
    @Body() cambiarEstadoDto: CambiarEstadoMasivoCitasDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para cambio masivo de estado por usuario ${request.user.userId}`);
    
    const citasActualizadas = await this.citaService.cambiarEstadoMasivo(
      cambiarEstadoDto,
      request.user.userId
    );
    
    return {
      citasActualizadas,
      nuevoEstado: cambiarEstadoDto.nuevoEstado,
      motivo: cambiarEstadoDto.motivo
    };
  }

  /**
   * Verificar acceso a cita médica
   * 
   * Endpoint para verificar si el usuario autenticado
   * tiene permisos para acceder a una cita específica.
   * 
   * @param id - ID de la cita médica
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Información de acceso y permisos
   */
  @Get(':id/verificar-acceso')
  @ApiOperation({
    summary: 'Verificar acceso a cita médica',
    description: 'Verifica si el usuario tiene permisos para acceder a una cita específica'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único de la cita médica'
  })
  @ApiOkResponse({
    description: 'Información de acceso obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        tieneAcceso: { type: 'boolean', example: true },
        motivo: { type: 'string', example: 'Acceso autorizado como estudiante' },
        rolEnCita: { type: 'string', enum: ['estudiante', 'docente', 'secretario'], example: 'estudiante' },
        permisos: {
          type: 'object',
          properties: {
            leer: { type: 'boolean', example: true },
            editar: { type: 'boolean', example: true },
            cancelar: { type: 'boolean', example: true },
            reagendar: { type: 'boolean', example: false },
            cambiarEstado: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  async verificarAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ) {
    this.logger.log(`Verificando acceso a la cita ${id} para usuario ${request.user.userId}`);
    
    // Obtener la cita y verificar permisos basados en la relación con el usuario
    try {
      const cita = await this.citaService.obtenerCitaPorId(id, request.user.userId);
      
      // Si puede obtener la cita, tiene acceso
      return {
        tieneAcceso: true,
        motivo: 'Acceso autorizado',
        rolEnCita: cita.estudianteId === request.user.userId ? 'estudiante' : 'docente',
        permisos: {
          leer: true,
          editar: true,
          cancelar: true,
          reagendar: cita.estudianteId === request.user.userId,
          cambiarEstado: cita.docenteId === request.user.userId
        }
      };
    } catch (error) {
      return {
        tieneAcceso: false,
        motivo: 'No tiene permisos para acceder a esta cita',
        rolEnCita: null,
        permisos: {
          leer: false,
          editar: false,
          cancelar: false,
          reagendar: false,
          cambiarEstado: false
        }
      };
    }
  }

  /**
   * Obtener citas por paciente
   * 
   * Endpoint para obtener todas las citas asociadas
   * a un paciente específico.
   * 
   * @param pacienteId - ID del paciente
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any[]> - Lista de citas del paciente
   */
  @Get('paciente/:pacienteId/citas')
  @ApiOperation({
    summary: 'Obtener citas por paciente',
    description: 'Obtiene todas las citas asociadas a un paciente específico'
  })
  @ApiParam({
    name: 'pacienteId',
    type: Number,
    description: 'ID del paciente'
  })
  @ApiOkResponse({
    description: 'Citas del paciente obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          fecha: { type: 'string', format: 'date-time' },
          estado: { type: 'string', example: 'RESERVADA' },
          horainicio: { type: 'string', format: 'date-time' },
          horafin: { type: 'string', format: 'date-time' },
          estudiante: {
            type: 'object',
            properties: {
              nombre: { type: 'string', example: 'María' },
              apellido: { type: 'string', example: 'García' }
            }
          },
          especialidad: {
            type: 'object',
            properties: {
              nombre: { type: 'string', example: 'Ortodoncia' }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Paciente no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para acceder a las citas de este paciente'
  })
  async obtenerCitasPorPaciente(
    @Param('pacienteId', ParseIntPipe) pacienteId: number,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para obtener citas del paciente ${pacienteId} del usuario ${request.user.userId}`);
    
    const filtros: FiltrosCitasDto = {
      pacienteId: pacienteId,
      límite: 100 // Obtener todas las citas del paciente
    };
    
    const resultado = await this.citaService.obtenerCitas(
      filtros,
      request.user.userId
    );
    
    return resultado.citas;
  }

  /**
   * Obtener citas por estudiante
   * 
   * Endpoint para obtener todas las citas donde participa
   * un estudiante específico.
   * 
   * @param estudianteId - ID del estudiante
   * @param filtros - Filtros adicionales opcionales
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaCitasDto> - Citas del estudiante
   */
  @Get('estudiante/:estudianteId/citas')
  @ApiOperation({
    summary: 'Obtener citas por estudiante',
    description: 'Obtiene todas las citas donde participa un estudiante específico'
  })
  @ApiParam({
    name: 'estudianteId',
    type: Number,
    description: 'ID del estudiante'
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['DISPONIBLE', 'RESERVADA', 'CANCELADA', 'FINALIZADA', 'NO_ASISTIO'],
    description: 'Filtrar por estado'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha'
  })
  @ApiOkResponse({
    description: 'Citas del estudiante obtenidas exitosamente',
    type: RespuestaPaginadaCitasDto
  })
  async obtenerCitasPorEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query() filtros: Partial<FiltrosCitasDto>,
    @Request() request: any
  ): Promise<RespuestaPaginadaCitasDto> {
    this.logger.log(`Solicitud para obtener citas del estudiante ${estudianteId} del usuario ${request.user.userId}`);
    
    const filtrosCompletos: FiltrosCitasDto = {
      ...filtros,
      estudianteId: estudianteId
    };
    
    return await this.citaService.obtenerCitas(
      filtrosCompletos,
      request.user.userId
    );
  }
}
