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
  UseGuards
} from '@nestjs/common'
import { CasosClinicosService } from './casos-clinicos.service'
import { CreateCasoClinicoDto, UpdateEstadoCasoDto, CreateObservacionDto } from './dto'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'

@Controller('casos-clinicos')
@UseGuards(JwtAuthGuard)
export class CasosClinicosController {
  constructor(private readonly service: CasosClinicosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCasoClinicoDto) {
    return this.service.create(dto)
  }

  @Get('profesor/:profesorId')
  async findByProfesor(
    @Param('profesorId', ParseIntPipe) profesorId: number,
    @Query('estado') estado?: string
  ) {
    return this.service.findByProfesor(profesorId, estado)
  }

  @Get('estudiante/:estudianteId')
  async findByEstudiante(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query('estado') estado?: string
  ) {
    return this.service.findByEstudiante(estudianteId, estado)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Get()
  async findAll(@Query('pacienteId') pacienteId?: string) {
    const parsedPacienteId = pacienteId ? Number.parseInt(pacienteId, 10) : undefined
    return this.service.findAll(parsedPacienteId)
  }

  @Patch(':id/estado')
  @HttpCode(HttpStatus.OK)
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoCasoDto
  ) {
    return this.service.updateEstado(id, dto)
  }

  @Post('observaciones')
  @HttpCode(HttpStatus.CREATED)
  async createObservacion(@Body() dto: CreateObservacionDto) {
    return this.service.createObservacion(dto)
  }
}
