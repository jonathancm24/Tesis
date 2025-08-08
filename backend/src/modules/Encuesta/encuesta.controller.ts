import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  ParseIntPipe, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { EncuestaService } from './encuesta.service';
import { CrearEncuestaTamizajeDto } from './DTO/crear-encuesta.dto';
import { CrearPreguntaTamizajeDto } from './DTO/crear-pregunta.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { PermisoEnum } from 'src/common/enums/permisos.enum';

/**
 * Controlador para encuestas de tamizaje médico
 * 
 * Gestiona dos funciones principales:
 * 1. Permite a estudiantes obtener preguntas y crear encuestas de tamizaje
 * 2. Permite a profesores/admin gestionar las preguntas del sistema
 * 
 * Las encuestas recopilan antecedentes médicos importantes para casos clínicos
 */
@Controller('encuestas-tamizaje')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EncuestaController {
  constructor(private readonly encuestaService: EncuestaService) {}

  // ===== RUTAS PRINCIPALES PARA ESTUDIANTES =====

  /**
   * 🎯 RUTA PRINCIPAL 1: Obtiene el formulario de tamizaje para un paciente
   * 
   * @param pacienteId - ID del paciente
   * @param genero - Género del paciente (query param opcional)
   * @returns Formulario con preguntas organizadas por categoría
   * 
   * Esta ruta es esencial para que el estudiante pueda:
   * - Ver todas las preguntas organizadas por categoría
   * - Obtener preguntas filtradas según el género del paciente
   * - Saber si el paciente ya tiene encuesta previa
   */
  @Get('formulario/:pacienteId')
  @RequirePermissions(PermisoEnum.VER_ENCUESTAS)
  async obtenerFormulario(
    @Param('pacienteId', ParseIntPipe) pacienteId: number,
    @Query('genero') genero?: string
  ) {
    try {
      const formulario = await this.encuestaService.obtenerFormularioTamizaje(pacienteId, genero);
      return {
        success: true,
        message: 'Formulario de tamizaje obtenido exitosamente',
        data: formulario
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🎯 RUTA PRINCIPAL 2: Crea una nueva encuesta con las respuestas del paciente
   * 
   * @param crearEncuestaDto - Datos de la encuesta y todas las respuestas
   * @returns La encuesta creada con confirmación
   * 
   * Esta ruta permite al estudiante:
   * - Guardar todas las respuestas recopiladas del paciente
   * - Crear el registro oficial de antecedentes médicos
   * - Tener base para armar el caso clínico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermisoEnum.CREAR_ENCUESTAS)
  async crearEncuesta(@Body() crearEncuestaDto: CrearEncuestaTamizajeDto) {
    try {
      const encuesta = await this.encuestaService.crearEncuestaTamizaje(crearEncuestaDto);
      return {
        success: true,
        message: 'Encuesta de tamizaje creada exitosamente',
        data: encuesta
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🎯 RUTA PRINCIPAL 3: Obtiene antecedentes médicos organizados del paciente
   * 
   * @param pacienteId - ID del paciente
   * @returns Antecedentes médicos organizados por categoría
   * 
   * Esta ruta es fundamental para:
   * - Ver los antecedentes médicos del paciente organizados
   * - Facilitar la creación del caso clínico
   * - Consultar información médica relevante durante el tratamiento
   */
  @Get('antecedentes/:pacienteId')
  @RequirePermissions(PermisoEnum.VER_ENCUESTAS)
  async obtenerAntecedentes(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    try {
      const antecedentes = await this.encuestaService.obtenerAntecedentesMedicos(pacienteId);
      return {
        success: true,
        message: 'Antecedentes médicos obtenidos exitosamente',
        data: antecedentes
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica si un paciente ya tiene encuesta de tamizaje
   * 
   * @param pacienteId - ID del paciente
   * @returns Boolean indicando si tiene encuesta
   * 
   * Útil para validaciones antes de mostrar el formulario
   */
  @Get('verificar/:pacienteId')
  @RequirePermissions(PermisoEnum.VER_ENCUESTAS)
  async verificarEncuesta(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    try {
      const tieneEncuesta = await this.encuestaService.pacienteTieneEncuesta(pacienteId);
      return {
        success: true,
        message: tieneEncuesta 
          ? 'El paciente ya tiene encuesta de tamizaje' 
          : 'El paciente no tiene encuesta de tamizaje',
        data: {
          tieneEncuesta,
          puedeCrearNueva: !tieneEncuesta
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // ===== RUTAS DE ADMINISTRACIÓN (SOLO PROFESORES/ADMIN) =====

  /**
   * Obtiene todas las preguntas organizadas (para administración)
   * 
   * @returns Preguntas organizadas por categoría
   * 
   * Solo profesores y administradores pueden ver esta información
   * para gestionar las preguntas del sistema
   */
  @Get('admin/preguntas')
  @RequirePermissions(PermisoEnum.VER_CONFIGURACION)
  async obtenerTodasLasPreguntas() {
    try {
      const preguntas = await this.encuestaService.obtenerTodasLasPreguntas();
      return {
        success: true,
        message: 'Preguntas de tamizaje obtenidas exitosamente',
        data: preguntas
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crea una nueva pregunta de tamizaje (solo profesores/admin)
   * 
   * @param crearPreguntaDto - Datos de la nueva pregunta
   * @returns La pregunta creada
   * 
   * Permite a profesores agregar nuevas preguntas cuando sea necesario
   */
  @Post('admin/preguntas')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES) // Solo admin puede crear preguntas
  async crearPregunta(@Body() crearPreguntaDto: CrearPreguntaTamizajeDto) {
    try {
      const pregunta = await this.encuestaService.crearPregunta(crearPreguntaDto);
      return {
        success: true,
        message: 'Pregunta de tamizaje creada exitosamente',
        data: pregunta
      };
    } catch (error) {
      throw error;
    }
  }
}