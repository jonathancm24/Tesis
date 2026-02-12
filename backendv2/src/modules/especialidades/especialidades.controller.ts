import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EspecialidadesService } from './especialidades.service';
import {
  CreateEspecialidadDto,
  UpdateEspecialidadDto,
  EspecialidadResponseDto,
} from './especialidades.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

/**
 * Controlador para gestión de especialidades odontológicas
 */
@Controller('especialidades')
@UseGuards(JwtAuthGuard)
export class EspecialidadesController {
  constructor(private readonly especialidadesService: EspecialidadesService) {}

  /**
   * Crear una nueva especialidad
   * POST /especialidades
   */
  @Post()
  async create(@Body() createDto: CreateEspecialidadDto): Promise<EspecialidadResponseDto> {
    return this.especialidadesService.create(createDto);
  }

  /**
   * Obtener todas las especialidades
   * GET /especialidades
   */
  @Get()
  async findAll(): Promise<EspecialidadResponseDto[]> {
    return this.especialidadesService.findAll();
  }

  /**
   * Obtener una especialidad por ID
   * GET /especialidades/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EspecialidadResponseDto> {
    return this.especialidadesService.findOne(id);
  }

  /**
   * Actualizar una especialidad
   * PATCH /especialidades/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEspecialidadDto,
  ): Promise<EspecialidadResponseDto> {
    return this.especialidadesService.update(id, updateDto);
  }

  /**
   * Eliminar una especialidad
   * DELETE /especialidades/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.especialidadesService.remove(id);
  }
}
