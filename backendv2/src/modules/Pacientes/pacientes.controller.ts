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
  UseGuards,
  Req,
} from '@nestjs/common';
import { PacientesService, type HistorialActor } from './pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto, PacientesPaginatedResponseDto } from './dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';

const ROLES_CONSULTA_PACIENTES = [
  RoleEnum.ADMIN,
  RoleEnum.PROFESOR,
  RoleEnum.ESTUDIANTE,
];

/**
 * Controlador para manejar operaciones CRUD de pacientes
 */
@Controller('pacientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  /**
   * Crear un nuevo paciente
   * POST /pacientes
   */
  @Post()
  @Roles(...ROLES_CONSULTA_PACIENTES)
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
  @Roles(...ROLES_CONSULTA_PACIENTES)
  async findAll(
    @Query() query: any,
    @Req() request: { user: { id: number; role: { nombre: RoleEnum } } },
  ): Promise<PacientesPaginatedResponseDto> {
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

    return this.pacientesService.findAll(filters, request.user);
  }

  /**
   * Obtener historial completo de un paciente
   * GET /pacientes/:id/historial-completo
   */
  @Get(':id/historial-completo')
  @Roles(...ROLES_CONSULTA_PACIENTES)
  async getHistorialCompleto(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: { user: HistorialActor },
  ) {
    return this.pacientesService.getHistorialCompleto(id, request.user);
  }

  /**
   * Obtener un paciente por ID
   * GET /pacientes/:id
   */
  @Get(':id')
  @Roles(...ROLES_CONSULTA_PACIENTES)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: { user: { id: number; role: { nombre: RoleEnum } } },
  ): Promise<PacienteResponseDto> {
    return this.pacientesService.findOne(id, request.user);
  }

  /**
   * Actualizar un paciente existente
   * PATCH /pacientes/:id
   */
  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
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
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.pacientesService.remove(id);
  }

  /**
   * Activar un paciente
   * PATCH /pacientes/:id/activate
   */
  @Patch(':id/activate')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async activate(@Param('id', ParseIntPipe) id: number): Promise<PacienteResponseDto> {
    return this.pacientesService.activate(id);
  }
}
