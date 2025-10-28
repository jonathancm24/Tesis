/**
 * Controlador de Odontogramas
 * 
 * Maneja las rutas HTTP para la gestión de odontogramas en el sistema.
 * Proporciona endpoints RESTful para operaciones CRUD y consultas
 * especializadas siguiendo el patrón establecido en el proyecto.
 * 
 * @fileoverview Controlador REST para odontogramas
 * @module OdontogramaController
 * @requires Guards, DTOs, Service
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
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OdontogramaService } from './odontograma.service';
import {
  CrearOdontogramaDto,
  ActualizarOdontogramaBasicoDto,
  FiltrosOdontogramasDto,
  RespuestaPaginadaOdontogramasDto
} from './DTO';
import {
  IOdontograma,
  IOdontogramaCompleto
} from './Interface';

/**
 * Controlador principal para endpoints de odontogramas
 * 
 * Gestiona todas las rutas relacionadas con odontogramas:
 * - CRUD básico de odontogramas
 * - Consultas con filtros y paginación
 * - Estadísticas básicas
 * - Validación de permisos por usuario
 */
@ApiTags('Odontogramas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('odontogramas')
export class OdontogramaController {
  constructor(private readonly odontogramaService: OdontogramaService) {}

  /**
   * Crear un nuevo odontograma
   * 
   * Endpoint para que los estudiantes creen odontogramas asociados
   * a sus casos clínicos. Valida permisos y evita duplicados.
   * 
   * @route POST /odontogramas
   * @access Estudiantes (propietarios del caso clínico)
   */
  @Post()
  @ApiOperation({ 
    summary: 'Crear nuevo odontograma', 
    description: 'Crea un odontograma asociado a un caso clínico específico. Solo el estudiante propietario del caso puede crear odontogramas.' 
  })
  @ApiBody({ 
    type: CrearOdontogramaDto,
    description: 'Datos del odontograma a crear'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Odontograma creado exitosamente',
    type: Object
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o ya existe un odontograma para ese diente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado o no pertenece al estudiante' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async crearOdontograma(
    @Body() crearOdontogramaDto: CrearOdontogramaDto,
    @Request() req: any
  ): Promise<IOdontograma> {
    try {
      return await this.odontogramaService.crearOdontograma(
        crearOdontogramaDto,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear odontograma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener odontogramas con filtros
   * 
   * Endpoint para consultar odontogramas con diferentes criterios
   * de filtrado, ordenamiento y paginación.
   * 
   * @route GET /odontogramas
   * @access Estudiantes y Docentes (según permisos)
   */
  @Get()
  @ApiOperation({ 
    summary: 'Obtener odontogramas con filtros', 
    description: 'Recupera una lista paginada de odontogramas aplicando filtros específicos. Los resultados se limitan según los permisos del usuario.' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número de página (por defecto: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Elementos por página (por defecto: 10, máximo: 100)' 
  })
  @ApiQuery({ 
    name: 'estudianteId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por ID del estudiante' 
  })
  @ApiQuery({ 
    name: 'docenteId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por ID del docente supervisor' 
  })
  @ApiQuery({ 
    name: 'casoClinicoId', 
    required: false, 
    type: Number, 
    description: 'Filtrar por ID del caso clínico' 
  })
  @ApiQuery({ 
    name: 'diente', 
    required: false, 
    type: String, 
    description: 'Filtrar por número específico de diente' 
  })
  @ApiQuery({ 
    name: 'busqueda', 
    required: false, 
    type: String, 
    description: 'Búsqueda de texto en conclusiones' 
  })
  @ApiQuery({ 
    name: 'fechaInicio', 
    required: false, 
    type: String, 
    description: 'Fecha de inicio para filtro de rango (formato: YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'fechaFin', 
    required: false, 
    type: String, 
    description: 'Fecha de fin para filtro de rango (formato: YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'ordenarPor', 
    required: false, 
    enum: ['fechaCreacion', 'diente', 'estudiante', 'docente'], 
    description: 'Campo por el cual ordenar' 
  })
  @ApiQuery({ 
    name: 'direccion', 
    required: false, 
    enum: ['asc', 'desc'], 
    description: 'Dirección del ordenamiento (por defecto: desc)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de odontogramas obtenida exitosamente',
    type: Object
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Parámetros de consulta inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async obtenerOdontogramas(
    @Query() filtros: FiltrosOdontogramasDto,
    @Request() req: any
  ): Promise<RespuestaPaginadaOdontogramasDto> {
    try {
      // Aplicar valores por defecto si no se proporcionan
      const filtrosConDefectos = {
        page: 1,
        limit: 10,
        direccion: 'desc' as const,
        ordenarPor: 'fechaCreacion',
        ...filtros
      };

      return await this.odontogramaService.obtenerOdontogramas(
        filtrosConDefectos,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener odontogramas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener odontogramas por caso clínico
   * 
   * Endpoint para obtener todos los odontogramas asociados
   * a un caso clínico específico.
   * 
   * @route GET /odontogramas/caso-clinico/:casoClinicoId
   * @access Estudiantes y Docentes (según permisos del caso)
   */
  @Get('caso-clinico/:casoClinicoId')
  @ApiOperation({ 
    summary: 'Obtener odontogramas por caso clínico', 
    description: 'Recupera todos los odontogramas asociados a un caso clínico específico. Solo accesible para el estudiante propietario y el docente supervisor.' 
  })
  @ApiParam({ 
    name: 'casoClinicoId', 
    type: Number, 
    description: 'ID único del caso clínico' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Odontogramas obtenidos exitosamente',
    type: [Object]
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Caso clínico no encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para acceder al caso clínico' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async obtenerOdontogramasPorCasoClinico(
    @Param('casoClinicoId', ParseIntPipe) casoClinicoId: number,
    @Request() req: any
  ): Promise<IOdontogramaCompleto[]> {
    try {
      return await this.odontogramaService.obtenerOdontogramasPorCasoClinico(
        casoClinicoId,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener odontogramas del caso clínico',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener un odontograma específico
   * 
   * Endpoint para recuperar un odontograma por su ID,
   * incluyendo toda la información relacionada.
   * 
   * @route GET /odontogramas/:id
   * @access Estudiante propietario o Docente asignado
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener odontograma por ID', 
    description: 'Recupera un odontograma específico con toda su información relacionada. Solo accesible para el estudiante propietario o docente asignado.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID único del odontograma' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Odontograma obtenido exitosamente',
    type: Object
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Odontograma no encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para acceder a este odontograma' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async obtenerOdontogramaPorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<IOdontogramaCompleto> {
    try {
      return await this.odontogramaService.obtenerOdontogramaPorId(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener odontograma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Actualizar un odontograma existente
   * 
   * Endpoint para actualizar los datos de un odontograma.
   * Solo el estudiante propietario o docente asignado pueden actualizar.
   * 
   * @route PUT /odontogramas/:id
   * @access Estudiante propietario o Docente asignado
   */
  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar odontograma', 
    description: 'Actualiza los datos de un odontograma existente. Solo el estudiante propietario o docente asignado pueden realizar actualizaciones.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID único del odontograma a actualizar' 
  })
  @ApiBody({ 
    type: ActualizarOdontogramaBasicoDto,
    description: 'Datos a actualizar del odontograma'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Odontograma actualizado exitosamente',
    type: Object
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Odontograma no encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para actualizar este odontograma' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de actualización inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async actualizarOdontograma(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarDto: ActualizarOdontogramaBasicoDto,
    @Request() req: any
  ): Promise<IOdontograma> {
    try {
      return await this.odontogramaService.actualizarOdontograma(
        id,
        actualizarDto,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar odontograma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Eliminar un odontograma
   * 
   * Endpoint para eliminar un odontograma del sistema.
   * Solo el estudiante propietario puede eliminar odontogramas.
   * 
   * @route DELETE /odontogramas/:id
   * @access Solo estudiante propietario
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Eliminar odontograma', 
    description: 'Elimina un odontograma del sistema. Solo el estudiante propietario del caso clínico puede eliminar odontogramas.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID único del odontograma a eliminar' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Odontograma eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Odontograma no encontrado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos para eliminar este odontograma' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async eliminarOdontograma(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ mensaje: string }> {
    try {
      await this.odontogramaService.eliminarOdontograma(id, req.user.id);
      return {
        mensaje: 'Odontograma eliminado exitosamente'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar odontograma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener estadísticas básicas de odontogramas
   * 
   * Endpoint para recuperar métricas y estadísticas básicas
   * de los odontogramas del usuario autenticado.
   * 
   * @route GET /odontogramas/estadisticas/basicas
   * @access Estudiantes y Docentes
   */
  @Get('estadisticas/basicas')
  @ApiOperation({ 
    summary: 'Obtener estadísticas básicas', 
    description: 'Recupera estadísticas básicas de odontogramas para el usuario autenticado, incluyendo totales, porcentajes de supervisión y dientes más frecuentes.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalOdontogramas: { type: 'number', description: 'Total de odontogramas del usuario' },
        odontogramasConDocente: { type: 'number', description: 'Odontogramas con docente asignado' },
        porcentajeSupervision: { type: 'number', description: 'Porcentaje de supervisión docente' },
        fechaGeneracion: { type: 'string', format: 'date-time', description: 'Fecha de generación de estadísticas' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async obtenerEstadisticasBasicas(@Request() req: any): Promise<any> {
    try {
      return await this.odontogramaService.obtenerEstadisticasBasicas(req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener estadísticas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtener odontogramas del usuario autenticado
   * 
   * Endpoint especializado para que el usuario obtenga
   * sus propios odontogramas (como estudiante) o asignados (como docente).
   * 
   * @route GET /odontogramas/mis-odontogramas
   * @access Estudiantes y Docentes
   */
  @Get('mis-odontogramas')
  @ApiOperation({ 
    summary: 'Obtener mis odontogramas', 
    description: 'Recupera los odontogramas del usuario autenticado. Para estudiantes: sus odontogramas creados. Para docentes: odontogramas asignados para supervisión.' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número de página (por defecto: 1)' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Elementos por página (por defecto: 10)' 
  })
  @ApiQuery({ 
    name: 'busqueda', 
    required: false, 
    type: String, 
    description: 'Búsqueda de texto en conclusiones' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Odontogramas del usuario obtenidos exitosamente',
    type: Object
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async obtenerMisOdontogramas(
    @Query() filtros: Partial<FiltrosOdontogramasDto>,
    @Request() req: any
  ): Promise<RespuestaPaginadaOdontogramasDto> {
    try {
      // Configurar filtros para el usuario autenticado
      const filtrosUsuario = {
        page: 1,
        limit: 10,
        direccion: 'desc' as const,
        ordenarPor: 'fechaCreacion',
        ...filtros,
        // Filtrar por el usuario autenticado (como estudiante o docente)
        estudianteId: req.user.id
      };

      return await this.odontogramaService.obtenerOdontogramas(
        filtrosUsuario,
        req.user.id
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener mis odontogramas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verificar acceso a odontograma
   * 
   * Endpoint de utilidad para verificar si el usuario
   * tiene permisos para acceder a un odontograma específico.
   * 
   * @route GET /odontogramas/:id/verificar-acceso
   * @access Estudiantes y Docentes
   */
  @Get(':id/verificar-acceso')
  @ApiOperation({ 
    summary: 'Verificar acceso a odontograma', 
    description: 'Verifica si el usuario autenticado tiene permisos para acceder a un odontograma específico. Útil para interfaces que necesitan validar permisos antes de mostrar contenido.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'ID único del odontograma' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación completada',
    schema: {
      type: 'object',
      properties: {
        tieneAcceso: { type: 'boolean', description: 'Indica si el usuario tiene acceso' },
        tipoAcceso: { type: 'string', enum: ['propietario', 'supervisor', 'sin_acceso'], description: 'Tipo de acceso del usuario' },
        mensaje: { type: 'string', description: 'Mensaje descriptivo del resultado' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Odontograma no encontrado' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado - Token inválido' 
  })
  async verificarAcceso(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ tieneAcceso: boolean; tipoAcceso: string; mensaje: string }> {
    try {
      const odontograma = await this.odontogramaService.obtenerOdontogramaPorId(id, req.user.id);
      
      let tipoAcceso = 'sin_acceso';
      let mensaje = 'Sin acceso al odontograma';

      if (odontograma.estudianteId === req.user.id) {
        tipoAcceso = 'propietario';
        mensaje = 'Usuario es propietario del odontograma';
      } else if (odontograma.docenteId === req.user.id) {
        tipoAcceso = 'supervisor';
        mensaje = 'Usuario es supervisor del odontograma';
      }

      return {
        tieneAcceso: tipoAcceso !== 'sin_acceso',
        tipoAcceso,
        mensaje
      };
    } catch (error) {
      if (error.status === 403) {
        return {
          tieneAcceso: false,
          tipoAcceso: 'sin_acceso',
          mensaje: 'Sin permisos para acceder al odontograma'
        };
      }
      
      throw new HttpException(
        error.message || 'Error al verificar acceso',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
