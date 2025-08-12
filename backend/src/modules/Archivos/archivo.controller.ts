/**
 * Controlador de Archivos
 * 
 * Proporciona endpoints REST para la gestión polimórfica de archivos
 * en el sistema académico de odontología. Permite subir, descargar,
 * asociar y gestionar archivos de estudios radiográficos, fotografías
 * de tratamientos, documentos legales y otros tipos de documentación.
 * 
 * Rutas principales:
 * - POST /archivos - Subir archivo con relación inmediata
 * - POST /archivos/solo-archivo - Crear archivo sin relación
 * - POST /archivos/relacion - Crear relación archivo-entidad
 * - GET /archivos - Consultar archivos con filtros
 * - GET /archivos/:id - Obtener archivo específico
 * - GET /archivos/entidad/:tipo/:id - Archivos de una entidad
 * - PUT /archivos/:id - Actualizar metadatos
 * - DELETE /archivos/:id - Eliminar archivo
 * 
 * Características:
 * - Validación de datos con DTOs
 * - Control de acceso basado en roles
 * - Paginación eficiente
 * - Filtrado avanzado
 * - Manejo de errores HTTP estándar
 * - Logging completo de operaciones
 * 
 * @fileoverview Controlador REST para archivos polimórficos
 * @module ArchivoController
 * @requires NestJS, JWT Guard, DTOs, Service
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
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  Logger,
  Request
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ArchivoService } from './archivo.service';
import {
  CrearArchivoDto,
  ActualizarArchivoDto,
  FiltrosArchivosDto,
  CrearRelacionArchivoDto,
  SubirArchivoConRelacionDto,
  RespuestaPaginadaArchivosDto,
  TipoEntidadArchivo
} from './DTO';
import {
  IArchivo,
  IArchivoCompleto,
  IArchivoRelacion,
  IResultadoOperacionArchivo,
  IArchivosEntidad
} from './Interface';

/**
 * Controlador de Archivos
 * 
 * Maneja todas las operaciones HTTP relacionadas con el sistema
 * de archivos polimórfico, incluyendo validación de entrada,
 * autenticación, autorización y formateo de respuestas.
 * 
 * @class ArchivoController
 */
@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archivos')
export class ArchivoController {
  private readonly logger = new Logger(ArchivoController.name);

  constructor(private readonly archivoService: ArchivoService) {}

  /**
   * Subir archivo con relación inmediata a entidad
   * 
   * Permite subir un archivo y asociarlo inmediatamente a una entidad
   * específica del sistema en una sola operación atómica.
   * 
   * @route POST /archivos
   * @param subirArchivoDto - Datos del archivo y relación
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IResultadoOperacionArchivo> - Resultado de la operación
   */
  @Post()
  @ApiOperation({
    summary: 'Subir archivo con relación',
    description: 'Sube un archivo y lo asocia inmediatamente a una entidad específica del sistema'
  })
  @ApiBody({
    type: SubirArchivoConRelacionDto,
    description: 'Datos del archivo y la entidad a relacionar'
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo subido y relacionado exitosamente',
    schema: {
      type: 'object',
      properties: {
        exitoso: { type: 'boolean', example: true },
        mensaje: { type: 'string', example: 'Archivo subido y relacionado correctamente' },
        archivo: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            nombre: { type: 'string', example: 'radiografia_paciente_001.jpg' },
            tipo: { type: 'string', example: 'image/jpeg' },
            url: { type: 'string', example: '/uploads/archivos/radiografia_paciente_001.jpg' },
            descripcion: { type: 'string', example: 'Radiografía panorámica del paciente' },
            fechaSubida: { type: 'string', format: 'date-time' },
            usuarioId: { type: 'number', example: 5 }
          }
        },
        relacion: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            archivoId: { type: 'number', example: 1 },
            entidadTipo: { type: 'string', example: 'CASO_CLINICO' },
            entidadId: { type: 'number', example: 3 },
            rol: { type: 'string', example: 'PROPIETARIO' },
            usuarioId: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o archivo duplicado'
  })
  @ApiResponse({
    status: 404,
    description: 'Entidad relacionada no encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para la operación'
  })
  async subirArchivoConRelacion(
    @Body() subirArchivoDto: SubirArchivoConRelacionDto,
    @Request() req: any
  ): Promise<IResultadoOperacionArchivo> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} subiendo archivo ${subirArchivoDto.nombre} para ${subirArchivoDto.entidadTipo}:${subirArchivoDto.entidadId}`);

    try {
      const resultado = await this.archivoService.subirArchivoConRelacion(subirArchivoDto, usuarioId);
      this.logger.log(`Archivo ${resultado.archivo.id} subido exitosamente por usuario ${usuarioId}`);
      return resultado;
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crear archivo sin relación inmediata
   * 
   * Crea un archivo independiente que puede ser relacionado
   * posteriormente con una o más entidades.
   * 
   * @route POST /archivos/solo-archivo
   * @param crearArchivoDto - Datos del archivo
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IArchivo> - Archivo creado
   */
  @Post('solo-archivo')
  @ApiOperation({
    summary: 'Crear archivo independiente',
    description: 'Crea un archivo sin asociarlo inmediatamente a ninguna entidad'
  })
  @ApiBody({
    type: CrearArchivoDto,
    description: 'Datos del archivo a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Archivo creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        nombre: { type: 'string', example: 'documento_legal.pdf' },
        tipo: { type: 'string', example: 'application/pdf' },
        url: { type: 'string', example: '/uploads/archivos/documento_legal.pdf' },
        descripcion: { type: 'string', example: 'Documento de consentimiento informado' },
        fechaSubida: { type: 'string', format: 'date-time' },
        usuarioId: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o archivo duplicado'
  })
  async crearArchivo(
    @Body() crearArchivoDto: CrearArchivoDto,
    @Request() req: any
  ): Promise<IArchivo> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} creando archivo ${crearArchivoDto.nombre}`);

    try {
      const archivo = await this.archivoService.crearArchivo(crearArchivoDto, usuarioId);
      this.logger.log(`Archivo ${archivo.id} creado exitosamente por usuario ${usuarioId}`);
      return archivo;
    } catch (error) {
      this.logger.error(`Error al crear archivo: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Crear relación entre archivo y entidad
   * 
   * Asocia un archivo existente con una entidad específica del sistema.
   * 
   * @route POST /archivos/relacion
   * @param relacionDto - Datos de la relación
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IArchivoRelacion> - Relación creada
   */
  @Post('relacion')
  @ApiOperation({
    summary: 'Crear relación archivo-entidad',
    description: 'Asocia un archivo existente con una entidad específica del sistema'
  })
  @ApiBody({
    type: CrearRelacionArchivoDto,
    description: 'Datos de la relación a crear'
  })
  @ApiResponse({
    status: 201,
    description: 'Relación creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        archivoId: { type: 'number', example: 1 },
        entidadTipo: { type: 'string', example: 'TRATAMIENTO' },
        entidadId: { type: 'number', example: 7 },
        rol: { type: 'string', example: 'EDITOR' },
        usuarioId: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo o entidad no encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para relacionar el archivo'
  })
  @ApiResponse({
    status: 409,
    description: 'La relación ya existe'
  })
  async crearRelacionArchivo(
    @Body() relacionDto: CrearRelacionArchivoDto,
    @Request() req: any
  ): Promise<IArchivoRelacion> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} creando relación archivo ${relacionDto.archivoId} con ${relacionDto.entidadTipo}:${relacionDto.entidadId}`);

    try {
      const relacion = await this.archivoService.crearRelacionArchivo(relacionDto, usuarioId);
      this.logger.log(`Relación ${relacion.id} creada exitosamente por usuario ${usuarioId}`);
      return relacion;
    } catch (error) {
      this.logger.error(`Error al crear relación: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener archivos con filtros y paginación
   * 
   * Consulta archivos aplicando filtros múltiples y paginación
   * para mostrar resultados organizados.
   * 
   * @route GET /archivos
   * @param filtros - Parámetros de consulta y filtrado
   * @param req - Objeto de request con información de usuario
   * @returns Promise<RespuestaPaginadaArchivosDto> - Lista paginada
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener archivos con filtros',
    description: 'Consulta archivos aplicando filtros múltiples y paginación'
  })
  @ApiQuery({
    name: 'entidadTipo',
    required: false,
    enum: TipoEntidadArchivo,
    description: 'Filtrar por tipo de entidad relacionada'
  })
  @ApiQuery({
    name: 'entidadId',
    required: false,
    type: Number,
    description: 'Filtrar por ID de entidad específica'
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    type: String,
    description: 'Filtrar por categoría de archivo'
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por usuario que subió el archivo'
  })
  @ApiQuery({
    name: 'tipoMime',
    required: false,
    type: String,
    description: 'Filtrar por tipo MIME'
  })
  @ApiQuery({
    name: 'busqueda',
    required: false,
    type: String,
    description: 'Búsqueda en nombre y descripción'
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha desde (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha hasta (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'incluirRelaciones',
    required: false,
    type: Boolean,
    description: 'Incluir datos de relaciones en la respuesta'
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
    description: 'Registros por página (por defecto: 10)'
  })
  @ApiQuery({
    name: 'ordenarPor',
    required: false,
    type: String,
    description: 'Campo para ordenar (por defecto: fechaSubida)'
  })
  @ApiQuery({
    name: 'dirección',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento (por defecto: desc)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de archivos obtenida exitosamente',
    type: RespuestaPaginadaArchivosDto
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos'
  })
  async obtenerArchivos(
    @Query() filtros: FiltrosArchivosDto,
    @Request() req: any
  ): Promise<RespuestaPaginadaArchivosDto> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} consultando archivos con filtros`);

    try {
      const resultado = await this.archivoService.obtenerArchivos(filtros, usuarioId);
      this.logger.log(`Consulta de archivos exitosa: ${resultado.total} registros encontrados`);
      return resultado;
    } catch (error) {
      this.logger.error(`Error al obtener archivos: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener archivo por ID
   * 
   * Busca un archivo específico por su ID, incluyendo
   * sus relaciones y validando permisos de acceso.
   * 
   * @route GET /archivos/:id
   * @param id - ID del archivo
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IArchivoCompleto> - Archivo con relaciones
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener archivo por ID',
    description: 'Busca un archivo específico por su ID con todas sus relaciones'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del archivo'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo encontrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        nombre: { type: 'string', example: 'estudio_radiografico.jpg' },
        tipo: { type: 'string', example: 'image/jpeg' },
        url: { type: 'string', example: '/uploads/archivos/estudio_radiografico.jpg' },
        descripcion: { type: 'string', example: 'Estudio radiográfico para caso clínico' },
        fechaSubida: { type: 'string', format: 'date-time' },
        usuarioId: { type: 'number', example: 5 },
        accesible: { type: 'boolean', example: true },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 5 },
            nombre: { type: 'string', example: 'Dr. Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'juan.perez@universidad.edu' }
          }
        },
        archivoRelacion: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              entidadTipo: { type: 'string', example: 'CASO_CLINICO' },
              entidadId: { type: 'number', example: 3 },
              rol: { type: 'string', example: 'PROPIETARIO' },
              usuario: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 5 },
                  nombre: { type: 'string', example: 'Dr. Juan' },
                  apellido: { type: 'string', example: 'Pérez' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para acceder al archivo'
  })
  async obtenerArchivoPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<IArchivoCompleto> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} consultando archivo ${id}`);

    try {
      const archivo = await this.archivoService.obtenerArchivoPorId(id, usuarioId);
      this.logger.log(`Archivo ${id} consultado exitosamente por usuario ${usuarioId}`);
      return archivo;
    } catch (error) {
      this.logger.error(`Error al obtener archivo ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener archivos de una entidad específica
   * 
   * Consulta todos los archivos relacionados con una entidad
   * determinada del sistema académico.
   * 
   * @route GET /archivos/entidad/:tipo/:id
   * @param tipo - Tipo de entidad
   * @param id - ID de la entidad
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IArchivosEntidad> - Archivos de la entidad
   */
  @Get('entidad/:tipo/:id')
  @ApiOperation({
    summary: 'Obtener archivos de una entidad',
    description: 'Consulta todos los archivos relacionados con una entidad específica'
  })
  @ApiParam({
    name: 'tipo',
    enum: TipoEntidadArchivo,
    description: 'Tipo de entidad (CASO_CLINICO, TRATAMIENTO, etc.)'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la entidad'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivos de la entidad obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        entidadTipo: { type: 'string', example: 'CASO_CLINICO' },
        entidadId: { type: 'number', example: 3 },
        totalArchivos: { type: 'number', example: 5 },
        archivos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              nombre: { type: 'string', example: 'radiografia_panoramica.jpg' },
              tipo: { type: 'string', example: 'image/jpeg' },
              url: { type: 'string', example: '/uploads/archivos/radiografia_panoramica.jpg' },
              descripcion: { type: 'string', example: 'Radiografía panorámica inicial' },
              categoria: { type: 'string', example: 'ESTUDIO_RADIOGRAFICO' },
              fechaSubida: { type: 'string', format: 'date-time' },
              rol: { type: 'string', example: 'PROPIETARIO' },
              usuario: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Dr. Juan' },
                  apellido: { type: 'string', example: 'Pérez' }
                }
              }
            }
          }
        },
        porCategoria: {
          type: 'object',
          example: {
            'ESTUDIO_RADIOGRAFICO': 3,
            'FOTO_TRATAMIENTO': 1,
            'DOCUMENTO_LEGAL': 1
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Entidad no encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para acceder a la entidad'
  })
  async obtenerArchivosPorEntidad(
    @Param('tipo') tipo: TipoEntidadArchivo,
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<IArchivosEntidad> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} consultando archivos de ${tipo}:${id}`);

    try {
      const archivos = await this.archivoService.obtenerArchivosPorEntidad(tipo, id, usuarioId);
      this.logger.log(`Archivos de ${tipo}:${id} consultados exitosamente: ${archivos.totalArchivos} archivos`);
      return archivos;
    } catch (error) {
      this.logger.error(`Error al obtener archivos de ${tipo}:${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualizar metadatos de archivo
   * 
   * Permite modificar información descriptiva del archivo
   * como nombre, descripción, etc.
   * 
   * @route PUT /archivos/:id
   * @param id - ID del archivo a actualizar
   * @param actualizarDto - Datos a actualizar
   * @param req - Objeto de request con información de usuario
   * @returns Promise<IArchivo> - Archivo actualizado
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar archivo',
    description: 'Actualiza los metadatos de un archivo existente'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del archivo a actualizar'
  })
  @ApiBody({
    type: ActualizarArchivoDto,
    description: 'Datos a actualizar del archivo'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        nombre: { type: 'string', example: 'radiografia_actualizada.jpg' },
        tipo: { type: 'string', example: 'image/jpeg' },
        url: { type: 'string', example: '/uploads/archivos/radiografia_actualizada.jpg' },
        descripcion: { type: 'string', example: 'Radiografía panorámica actualizada' },
        fechaSubida: { type: 'string', format: 'date-time' },
        usuarioId: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para editar el archivo'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con nombre duplicado'
  })
  async actualizarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarArchivoDto,
    @Request() req: any
  ): Promise<IArchivo> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} actualizando archivo ${id}`);

    try {
      const archivo = await this.archivoService.actualizarArchivo(id, actualizarDto, usuarioId);
      this.logger.log(`Archivo ${id} actualizado exitosamente por usuario ${usuarioId}`);
      return archivo;
    } catch (error) {
      this.logger.error(`Error al actualizar archivo ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar archivo
   * 
   * Elimina un archivo del sistema junto con todas sus relaciones,
   * validando permisos de eliminación.
   * 
   * @route DELETE /archivos/:id
   * @param id - ID del archivo a eliminar
   * @param req - Objeto de request con información de usuario
   * @returns Promise<{ mensaje: string }> - Confirmación de eliminación
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar archivo',
    description: 'Elimina un archivo del sistema junto con todas sus relaciones'
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID único del archivo a eliminar'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        mensaje: {
          type: 'string',
          example: 'Archivo eliminado exitosamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado'
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para eliminar el archivo'
  })
  async eliminarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ mensaje: string }> {
    const usuarioId = req.user.id;
    this.logger.log(`Usuario ${usuarioId} eliminando archivo ${id}`);

    try {
      await this.archivoService.eliminarArchivo(id, usuarioId);
      this.logger.log(`Archivo ${id} eliminado exitosamente por usuario ${usuarioId}`);
      return { mensaje: 'Archivo eliminado exitosamente' };
    } catch (error) {
      this.logger.error(`Error al eliminar archivo ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
