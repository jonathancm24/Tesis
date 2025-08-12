/**
 * Controlador de Hallazgos Clínicos
 * 
 * Maneja las solicitudes HTTP para la gestión de hallazgos clínicos
 * en el sistema académico odontológico. Proporciona endpoints REST
 * para operaciones CRUD, filtrado, estadísticas y control de acceso.
 * 
 * @fileoverview Controlador REST para hallazgos clínicos
 * @module HallazgoClinicoController
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
  Logger
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
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { HallazgoClinicoService } from './hallazgo-clinico.service';
import {
  CrearHallazgoClinicoDto,
  ActualizarHallazgoClinicoDto,
  FiltrosHallazgosClinicosDto,
  RespuestaPaginadaHallazgosDto,
  EstadisticasHallazgosDto
} from './DTO';

/**
 * Controlador REST para Hallazgos Clínicos
 * 
 * Proporciona endpoints para gestionar hallazgos clínicos odontológicos
 * con autenticación JWT, validación de datos y documentación Swagger.
 * 
 * @example
 * GET /hallazgos-clinicos
 * POST /hallazgos-clinicos
 * PUT /hallazgos-clinicos/:id
 * DELETE /hallazgos-clinicos/:id
 */
@ApiTags('Hallazgos Clínicos')
@Controller('hallazgos-clinicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HallazgoClinicoController {
  private readonly logger = new Logger(HallazgoClinicoController.name);

  constructor(private readonly hallazgoClinicoService: HallazgoClinicoService) {}

  /**
   * Crear un nuevo hallazgo clínico
   * 
   * Endpoint para registrar un hallazgo clínico encontrado
   * durante el examen de un paciente.
   * 
   * @param crearHallazgoDto - Datos del hallazgo a crear
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Hallazgo clínico creado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear hallazgo clínico',
    description: 'Crea un nuevo hallazgo clínico asociado a un caso clínico específico'
  })
  @ApiCreatedResponse({
    description: 'Hallazgo clínico creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        casoClinicoId: { type: 'number', example: 1 },
        tipo: { type: 'string', example: 'Caries' },
        codigoZona: { type: 'string', example: 'D-16' },
        descripcion: { type: 'string', example: 'Caries profunda en cara oclusal' },
        archivoId: { type: 'number', example: 5, nullable: true }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o hallazgo duplicado'
  })
  @ApiNotFoundResponse({
    description: 'Caso clínico no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para crear hallazgos en este caso clínico'
  })
  async crearHallazgo(
    @Body() crearHallazgoDto: CrearHallazgoClinicoDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para crear hallazgo clínico del usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.crearHallazgo(
      crearHallazgoDto,
      request.user.userId
    );
  }

  /**
   * Listar hallazgos clínicos con filtros
   * 
   * Endpoint para obtener una lista paginada de hallazgos clínicos
   * con opciones de filtrado avanzado.
   * 
   * @param filtros - Parámetros de filtrado y paginación
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaHallazgosDto> - Lista paginada de hallazgos
   */
  @Get()
  @ApiOperation({
    summary: 'Listar hallazgos clínicos',
    description: 'Obtiene una lista paginada de hallazgos clínicos con opciones de filtrado'
  })
  @ApiOkResponse({
    description: 'Lista de hallazgos clínicos obtenida exitosamente',
    type: RespuestaPaginadaHallazgosDto
  })
  @ApiQuery({
    name: 'casoClinicoId',
    required: false,
    type: Number,
    description: 'ID del caso clínico para filtrar'
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    type: String,
    description: 'Tipo de hallazgo para filtrar'
  })
  @ApiQuery({
    name: 'codigoZona',
    required: false,
    type: String,
    description: 'Código de zona anatómica para filtrar'
  })
  @ApiQuery({
    name: 'conArchivos',
    required: false,
    type: Boolean,
    description: 'Filtrar hallazgos con/sin archivos adjuntos'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Término de búsqueda en descripción'
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
    enum: ['id', 'tipo', 'codigoZona', 'casoClinicoId'],
    description: 'Campo por el cual ordenar'
  })
  @ApiQuery({
    name: 'dirección',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento'
  })
  async listarHallazgos(
    @Query() filtros: FiltrosHallazgosClinicosDto,
    @Request() request: any
  ): Promise<RespuestaPaginadaHallazgosDto> {
    this.logger.log(`Solicitud para listar hallazgos clínicos del usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.obtenerHallazgos(
      filtros,
      request.user.userId
    );
  }

  /**
   * Obtener hallazgo clínico por ID
   * 
   * Endpoint para obtener un hallazgo clínico específico
   * con toda su información relacionada.
   * 
   * @param id - ID del hallazgo clínico
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Hallazgo clínico con relaciones completas
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener hallazgo clínico por ID',
    description: 'Obtiene un hallazgo clínico específico con toda su información relacionada'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del hallazgo clínico'
  })
  @ApiOkResponse({
    description: 'Hallazgo clínico encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        casoClinicoId: { type: 'number', example: 1 },
        tipo: { type: 'string', example: 'Caries' },
        codigoZona: { type: 'string', example: 'D-16' },
        descripcion: { type: 'string', example: 'Caries profunda en cara oclusal' },
        archivoId: { type: 'number', example: 5, nullable: true },
        casoClinico: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            fechaCreacion: { type: 'string', format: 'date-time' },
            paciente: {
              type: 'object',
              properties: {
                nombre: { type: 'string', example: 'Juan' },
                apellido: { type: 'string', example: 'Pérez' }
              }
            }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Hallazgo clínico no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para acceder a este hallazgo clínico'
  })
  async obtenerHallazgoPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para obtener hallazgo clínico ${id} del usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.obtenerHallazgoPorId(
      id,
      request.user.userId
    );
  }

  /**
   * Actualizar hallazgo clínico
   * 
   * Endpoint para modificar un hallazgo clínico existente
   * con validación de permisos de edición.
   * 
   * @param id - ID del hallazgo clínico a actualizar
   * @param actualizarHallazgoDto - Datos a actualizar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Hallazgo clínico actualizado
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar hallazgo clínico',
    description: 'Actualiza un hallazgo clínico existente con nuevos datos'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del hallazgo clínico a actualizar'
  })
  @ApiOkResponse({
    description: 'Hallazgo clínico actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        casoClinicoId: { type: 'number', example: 1 },
        tipo: { type: 'string', example: 'Caries' },
        codigoZona: { type: 'string', example: 'D-16' },
        descripcion: { type: 'string', example: 'Descripción actualizada' },
        archivoId: { type: 'number', example: 5, nullable: true }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Hallazgo clínico no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para editar este hallazgo clínico'
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o conflicto de duplicados'
  })
  async actualizarHallazgo(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarHallazgoDto: ActualizarHallazgoClinicoDto,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para actualizar hallazgo clínico ${id} del usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.actualizarHallazgo(
      id,
      actualizarHallazgoDto,
      request.user.userId
    );
  }

  /**
   * Eliminar hallazgo clínico
   * 
   * Endpoint para eliminar permanentemente un hallazgo clínico
   * con validación de permisos de eliminación.
   * 
   * @param id - ID del hallazgo clínico a eliminar
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<void>
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar hallazgo clínico',
    description: 'Elimina permanentemente un hallazgo clínico del sistema'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del hallazgo clínico a eliminar'
  })
  @ApiOkResponse({
    description: 'Hallazgo clínico eliminado exitosamente'
  })
  @ApiNotFoundResponse({
    description: 'Hallazgo clínico no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para eliminar este hallazgo clínico'
  })
  async eliminarHallazgo(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ): Promise<void> {
    this.logger.log(`Solicitud para eliminar hallazgo clínico ${id} del usuario ${request.user.userId}`);
    
    await this.hallazgoClinicoService.eliminarHallazgo(
      id,
      request.user.userId
    );
  }

  /**
   * Obtener estadísticas básicas de hallazgos clínicos
   * 
   * Endpoint para obtener métricas y estadísticas generales
   * del sistema de hallazgos clínicos.
   * 
   * @returns Promise<EstadisticasHallazgosDto> - Estadísticas del sistema
   */
  @Get('estadisticas/basicas')
  @ApiOperation({
    summary: 'Obtener estadísticas básicas',
    description: 'Obtiene estadísticas generales del sistema de hallazgos clínicos'
  })
  @ApiOkResponse({
    description: 'Estadísticas obtenidas exitosamente',
    type: EstadisticasHallazgosDto
  })
  async obtenerEstadisticasBasicas(): Promise<EstadisticasHallazgosDto> {
    this.logger.log('Solicitud para obtener estadísticas básicas de hallazgos clínicos');
    
    return await this.hallazgoClinicoService.obtenerEstadisticasBasicas();
  }

  /**
   * Obtener hallazgos clínicos del usuario autenticado
   * 
   * Endpoint para obtener todos los hallazgos relacionados
   * con los casos donde participa el usuario autenticado.
   * 
   * @param filtros - Filtros opcionales para la consulta
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<RespuestaPaginadaHallazgosDto> - Hallazgos del usuario
   */
  @Get('mis-hallazgos/usuario')
  @ApiOperation({
    summary: 'Obtener mis hallazgos clínicos',
    description: 'Obtiene todos los hallazgos clínicos donde el usuario autenticado participa como estudiante o docente'
  })
  @ApiOkResponse({
    description: 'Hallazgos del usuario obtenidos exitosamente',
    type: RespuestaPaginadaHallazgosDto
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    type: String,
    description: 'Filtrar por tipo de hallazgo'
  })
  @ApiQuery({
    name: 'codigoZona',
    required: false,
    type: String,
    description: 'Filtrar por código de zona'
  })
  @ApiQuery({
    name: 'conArchivos',
    required: false,
    type: Boolean,
    description: 'Filtrar hallazgos con/sin archivos'
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
  async obtenerMisHallazgos(
    @Query() filtros: Partial<FiltrosHallazgosClinicosDto>,
    @Request() request: any
  ): Promise<RespuestaPaginadaHallazgosDto> {
    this.logger.log(`Solicitud para obtener hallazgos del usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.obtenerHallazgosUsuario(
      request.user.userId,
      filtros
    );
  }

  /**
   * Verificar acceso a hallazgo clínico
   * 
   * Endpoint para verificar si el usuario autenticado
   * tiene permisos para acceder a un hallazgo específico.
   * 
   * @param id - ID del hallazgo clínico
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any> - Información de acceso y permisos
   */
  @Get(':id/verificar-acceso')
  @ApiOperation({
    summary: 'Verificar acceso a hallazgo clínico',
    description: 'Verifica si el usuario tiene permisos para acceder a un hallazgo específico'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del hallazgo clínico'
  })
  @ApiOkResponse({
    description: 'Información de acceso obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        tieneAcceso: { type: 'boolean', example: true },
        motivo: { type: 'string', example: 'Acceso autorizado como docente' },
        rolEnCaso: { type: 'string', enum: ['estudiante', 'docente'], example: 'docente' },
        permisos: {
          type: 'object',
          properties: {
            leer: { type: 'boolean', example: true },
            editar: { type: 'boolean', example: true },
            eliminar: { type: 'boolean', example: true },
            verArchivos: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  async verificarAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: any
  ) {
    this.logger.log(`Verificando acceso al hallazgo clínico ${id} para usuario ${request.user.userId}`);
    
    return await this.hallazgoClinicoService.verificarAccesoHallazgo(
      id,
      request.user.userId
    );
  }

  /**
   * Obtener hallazgos por caso clínico
   * 
   * Endpoint para obtener todos los hallazgos asociados
   * a un caso clínico específico.
   * 
   * @param casoId - ID del caso clínico
   * @param request - Request object con información del usuario autenticado
   * @returns Promise<any[]> - Lista de hallazgos del caso
   */
  @Get('caso/:casoId/hallazgos')
  @ApiOperation({
    summary: 'Obtener hallazgos por caso clínico',
    description: 'Obtiene todos los hallazgos asociados a un caso clínico específico'
  })
  @ApiParam({
    name: 'casoId',
    type: Number,
    description: 'ID del caso clínico'
  })
  @ApiOkResponse({
    description: 'Hallazgos del caso obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          tipo: { type: 'string', example: 'Caries' },
          codigoZona: { type: 'string', example: 'D-16' },
          descripcion: { type: 'string', example: 'Descripción del hallazgo' },
          archivoId: { type: 'number', example: 5, nullable: true }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'Caso clínico no encontrado'
  })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para acceder a este caso clínico'
  })
  async obtenerHallazgosPorCaso(
    @Param('casoId', ParseIntPipe) casoId: number,
    @Request() request: any
  ) {
    this.logger.log(`Solicitud para obtener hallazgos del caso ${casoId} del usuario ${request.user.userId}`);
    
    const filtros: FiltrosHallazgosClinicosDto = {
      casoClinicoId: casoId,
      límite: 100 // Obtener todos los hallazgos del caso
    };
    
    const resultado = await this.hallazgoClinicoService.obtenerHallazgos(
      filtros,
      request.user.userId
    );
    
    return resultado.hallazgos;
  }
}
