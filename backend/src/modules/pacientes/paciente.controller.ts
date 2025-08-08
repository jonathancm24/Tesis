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
  HttpCode
} from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { RegistroPacienteDto, ActualizarPacienteDto } from './DTO/registro.dto';

/**
 * Controlador para la gestión de pacientes
 * Endpoints para CRUD básico y consulta de historial médico
 */
@Controller('pacientes')
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  /**
   * Crear un nuevo paciente
   * POST /pacientes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPaciente(@Body() data: RegistroPacienteDto) {
    return await this.pacienteService.crearPaciente(data);
  }

  /**
   * Obtener lista de todos los pacientes activos
   * GET /pacientes
   */
  @Get()
  async obtenerPacientes() {
    return await this.pacienteService.obtenerListaPacientes();
  }

  /**
   * Buscar pacientes por término de búsqueda
   * GET /pacientes/buscar?termino=...
   */
  @Get('buscar')
  async buscarPacientes(@Query('termino') termino: string) {
    if (!termino || termino.trim().length < 2) {
      return [];
    }
    return await this.pacienteService.buscarPacientes(termino.trim());
  }

  /**
   * Obtener el historial completo de un paciente
   * GET /pacientes/:id/historial
   */
  @Get(':id/historial')
  async obtenerHistorial(@Param('id', ParseIntPipe) pacienteId: number) {
    return await this.pacienteService.obtenerHistorialCompleto(pacienteId);
  }

  /**
   * Obtener información básica de un paciente por ID
   * GET /pacientes/:id
   */
  @Get(':id')
  async obtenerPaciente(@Param('id', ParseIntPipe) pacienteId: number) {
    const historial = await this.pacienteService.obtenerHistorialCompleto(pacienteId);
    return historial.paciente;
  }

  /**
   * Actualizar datos de un paciente
   * PUT /pacientes/:id
   */
  @Put(':id')
  async actualizarPaciente(
    @Param('id', ParseIntPipe) pacienteId: number,
    @Body() data: ActualizarPacienteDto
  ) {
    return await this.pacienteService.actualizarPaciente(pacienteId, data);
  }

  /**
   * Desactivar un paciente (borrado suave)
   * DELETE /pacientes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desactivarPaciente(@Param('id', ParseIntPipe) pacienteId: number) {
    await this.pacienteService.desactivarPaciente(pacienteId);
  }

  // TODO: Endpoints adicionales que se pueden implementar más adelante
  
  /**
   * Obtener encuestas de tamizaje de un paciente
   * GET /pacientes/:id/encuestas-tamizaje
   */
  @Get(':id/encuestas-tamizaje')
  async obtenerEncuestasTamizaje(@Param('id', ParseIntPipe) pacienteId: number) {
    const historial = await this.pacienteService.obtenerHistorialCompleto(pacienteId);
    return historial.encuestasTamizaje;
  }

  /**
   * Obtener casos clínicos de un paciente
   * GET /pacientes/:id/casos-clinicos
   */
  @Get(':id/casos-clinicos')
  async obtenerCasosClinicos(@Param('id', ParseIntPipe) pacienteId: number) {
    const historial = await this.pacienteService.obtenerHistorialCompleto(pacienteId);
    return historial.casosClinicos;
  }

  /**
   * Obtener citas de un paciente
   * GET /pacientes/:id/citas
   */
  @Get(':id/citas')
  async obtenerCitas(@Param('id', ParseIntPipe) pacienteId: number) {
    const historial = await this.pacienteService.obtenerHistorialCompleto(pacienteId);
    return historial.citas;
  }
}
