import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { EncuestaTamizajeService } from './encuesta-tamizaje.service'
import { CreatePreguntaTamizajeDto, GuardarEncuestaDto } from './dto'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'

@Controller('encuesta-tamizaje')
export class EncuestaTamizajeController {
  constructor(private service: EncuestaTamizajeService) {}

  /**
   * GET /encuesta-tamizaje/preguntas
   * Obtener todas las preguntas agrupadas por categoría
   */
  @Get('preguntas')
  async obtenerTodasLasPreguntas() {
    const preguntas = await this.service.obtenerTodasLasPreguntas()
    return {
      success: true,
      data: preguntas,
      message: 'Preguntas obtenidas exitosamente'
    }
  }

  /**
   * GET /encuesta-tamizaje/preguntas/:categoria
   * Obtener preguntas por categoría específica
   */
  @Get('preguntas/:categoria')
  async obtenerPreguntasPorCategoria(@Param('categoria') categoria: string) {
    const preguntas = await this.service.obtenerPreguntasPorCategoria(categoria)
    return {
      success: true,
      data: preguntas,
      category: categoria,
      count: preguntas.length
    }
  }

  /**
   * GET /encuesta-tamizaje/pacientes/:pacienteId/progreso
   * Obtener solo el progreso de la encuesta (endpoint ligero para widgets)
   */
  @Get('pacientes/:pacienteId/progreso')
  @UseGuards(JwtAuthGuard)
  async obtenerProgresoEncuesta(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    const progreso = await this.service.obtenerProgresoEncuesta(pacienteId)

    if (!progreso) {
      return {
        success: true,
        data: null,
        message: 'El paciente no tiene encuesta registrada'
      }
    }

    return {
      success: true,
      data: progreso
    }
  }

  /**
   * GET /encuesta-tamizaje/pacientes/:pacienteId
   * Obtener la encuesta de un paciente específico (última versión)
   */
  @Get('pacientes/:pacienteId')
  @UseGuards(JwtAuthGuard)
  async obtenerEncuestaPaciente(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    const encuesta = await this.service.obtenerEncuestaPaciente(pacienteId)

    if (!encuesta) {
      return {
        success: true,
        data: null,
        message: 'El paciente no tiene encuesta registrada'
      }
    }

    return {
      success: true,
      data: encuesta
    }
  }

  /**
   * GET /encuesta-tamizaje/pacientes/:pacienteId/historial
   * Obtener el historial completo de encuestas de un paciente
   */
  @Get('pacientes/:pacienteId/historial')
  @UseGuards(JwtAuthGuard)
  async obtenerHistorialEncuestas(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    const historial = await this.service.obtenerHistorialEncuestas(pacienteId)

    return {
      success: true,
      data: historial,
      message: historial.length === 0 ? 'No hay encuestas registradas' : 'Historial obtenido exitosamente'
    }
  }

  /**
   * POST /encuesta-tamizaje/pacientes/:pacienteId/nueva-version
   * Crear una nueva versión de la encuesta para un paciente
   */
  @Post('pacientes/:pacienteId/nueva-version')
  @UseGuards(JwtAuthGuard)
  async crearNuevaVersion(@Param('pacienteId', ParseIntPipe) pacienteId: number) {
    const nuevaEncuesta = await this.service.crearNuevaVersion(pacienteId)

    return {
      success: true,
      message: 'Nueva versión de encuesta creada exitosamente',
      data: nuevaEncuesta
    }
  }

  /**
   * POST /encuesta-tamizaje/respuestas
   * Guardar respuestas de la encuesta
   */
  @Post('respuestas')
  @UseGuards(JwtAuthGuard)
  async guardarEncuesta(@Body() dto: GuardarEncuestaDto) {
    const resultado = await this.service.guardarEncuesta(dto)

    return {
      success: true,
      message: 'Encuesta guardada exitosamente',
      data: resultado
    }
  }

  /**
   * GET /encuesta-tamizaje/estadisticas
   * Obtener estadísticas generales de las encuestas
   */
  @Get('admin/estadisticas')
  @UseGuards(JwtAuthGuard)
  async obtenerEstadisticas() {
    const stats = await this.service.obtenerEstadisticas()

    return {
      success: true,
      data: stats
    }
  }

  /**
   * POST /encuesta-tamizaje/admin/preguntas
   * Crear nueva pregunta (Solo Admin)
   */
  @Post('admin/preguntas')
  @UseGuards(JwtAuthGuard)
  async crearPregunta(@Body() dto: CreatePreguntaTamizajeDto) {
    const pregunta = await this.service.crearPregunta(dto)

    return {
      success: true,
      message: 'Pregunta creada exitosamente',
      data: pregunta
    }
  }

  /**
   * GET /encuesta-tamizaje/admin/preguntas/:id
   * Obtener una pregunta específica
   */
  @Get('admin/preguntas/:id')
  @UseGuards(JwtAuthGuard)
  async obtenerPregunta(@Param('id', ParseIntPipe) id: number) {
    const pregunta = await this.service.obtenerPregunta(id)

    return {
      success: true,
      data: pregunta
    }
  }

  /**
   * DELETE /encuesta-tamizaje/admin/preguntas/:id
   * Eliminar una pregunta (Solo Admin)
   */
  @Get('admin/preguntas/:id/delete')
  @UseGuards(JwtAuthGuard)
  async eliminarPregunta(@Param('id', ParseIntPipe) id: number) {
    await this.service.eliminarPregunta(id)

    return {
      success: true,
      message: 'Pregunta eliminada exitosamente'
    }
  }
}
