import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CasosClinicosService } from './casos-clinicos.service';
import { CreateCasoClinicoDto, UpdateEstadoCasoDto, CreateObservacionDto } from './dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';

interface AuthenticatedRequest {
  user: {
    id: number;
    role: { nombre: RoleEnum };
  };
}

@Controller('casos-clinicos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasosClinicosController {
  constructor(private readonly service: CasosClinicosService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCasoClinicoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.create(dto, request.user);
  }

  @Get('profesor/:profesorId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR)
  async findByProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Query('estado') estado: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findByProfesor(profesorId, estado, request.user);
  }

  @Get('estudiante/:estudianteId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async findByEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query('estado') estado: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findByEstudiante(estudianteId, estado, request.user);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findOne(id, request.user);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async findAll(
    @Query('pacienteId') pacienteId: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    const parsedPacienteId = pacienteId ? Number.parseInt(pacienteId, 10) : undefined;
    return this.service.findAll(parsedPacienteId, request.user);
  }

  @Patch(':id/estado')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.OK)
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCasoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.updateEstado(id, dto, request.user);
  }

  @Post('observaciones')
  @Roles(RoleEnum.PROFESOR)
  @HttpCode(HttpStatus.CREATED)
  async createObservacion(
    @Body() dto: CreateObservacionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.createObservacion(dto, request.user);
  }
}
