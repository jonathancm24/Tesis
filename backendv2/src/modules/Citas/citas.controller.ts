import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
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

@Controller('citas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  create(
    @Body() createCitaDto: CreateCitaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.citasService.create(createCitaDto, request.user);
  }

  @Get()
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  findAll(
    @Query('pacienteId') pacienteId?: string,
    @Query('estudianteId') estudianteId?: string,
    @Req() request?: AuthenticatedRequest,
  ) {
    const pacienteIdNum = pacienteId ? parseInt(pacienteId, 10) : undefined;
    const estudianteIdNum = estudianteId ? parseInt(estudianteId, 10) : undefined;
    
    return this.citasService.findAll(pacienteIdNum, estudianteIdNum, request!.user);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.citasService.findOne(id, request.user);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCitaDto: UpdateCitaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.citasService.update(id, updateCitaDto, request.user);
  }

  @Patch(':id/cancelar')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.citasService.cancelar(id, request.user);
  }
}
