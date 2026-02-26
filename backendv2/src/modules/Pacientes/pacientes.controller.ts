import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto, PacientesPaginatedResponseDto } from './dto';

/**
 * Controlador para manejar operaciones CRUD de pacientes
 */
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  /**
   * Crear un nuevo paciente
   * POST /pacientes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    return this.pacientesService.create(createPacienteDto);
  }

  /**
   * Obtener todos los pacientes con filtros y paginación
   * GET /pacientes
   * 
   * Query params:
   * - nombre: string (filtro por nombre)
   * - apellido: string (filtro por apellido)
   * - email: string (filtro por email)
   * - activo: boolean (filtro por estado)
   * - parroquiaId: number (filtro por parroquia)
   * - tipoDocumento: enum (filtro por tipo de documento)
   * - page: number (página, default: 1)
   * - limit: number (elementos por página, default: 10)
   * - orderBy: string (campo de ordenamiento, default: 'fechaRegistro')
   * - orderDirection: string ('asc' | 'desc', default: 'desc')
   */
  @Get()
  async findAll(@Query() query: any): Promise<PacientesPaginatedResponseDto> {
    const filters = {
      nombre: query.nombre,
      apellido: query.apellido,
      email: query.email,
      activo: query.activo ? query.activo === 'true' : undefined,
      parroquiaId: query.parroquiaId ? parseInt(query.parroquiaId) : undefined,
      tipoDocumento: query.tipoDocumento,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      orderBy: query.orderBy || 'fechaRegistro',
      orderDirection: query.orderDirection || 'desc',
    };

    return this.pacientesService.findAll(filters);
  }

  /**
   * Obtener historial completo de un paciente
   * GET /pacientes/:id/historial-completo
   */
  @Get(':id/historial-completo')
  async getHistorialCompleto(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.getHistorialCompleto(id);
  }

  /**
   * Obtener un paciente por ID
   * GET /pacientes/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PacienteResponseDto> {
    return this.pacientesService.findOne(id);
  }

  /**
   * Actualizar un paciente existente
   * PATCH /pacientes/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ): Promise<PacienteResponseDto> {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  /**
   * Eliminar un paciente (soft delete - lo desactiva)
   * DELETE /pacientes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.pacientesService.remove(id);
  }

  /**
   * Activar un paciente
   * PATCH /pacientes/:id/activate
   */
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id', ParseIntPipe) id: number): Promise<PacienteResponseDto> {
    return this.pacientesService.activate(id);
  }
}
