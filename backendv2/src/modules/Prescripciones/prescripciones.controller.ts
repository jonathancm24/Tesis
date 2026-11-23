import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreatePrescripcionDto } from './dto';
import { PrescripcionesService } from './prescripciones.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';

@Controller('prescripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescripcionesController {
  constructor(private readonly prescripcionesService: PrescripcionesService) {}

  @Get('caso/:casoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async listByCaso(@Param('casoId', ParseIntPipe) casoId: number, @Req() req: Request) {
    return this.prescripcionesService.listByCaso(casoId, this.getActor(req));
  }

  @Post('caso/:casoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async createForCaso(
    @Param('casoId', ParseIntPipe) casoId: number,
    @Body() dto: CreatePrescripcionDto,
    @Req() req: Request,
  ) {
    return this.prescripcionesService.createForCaso(casoId, this.getActor(req), dto);
  }

  private getActor(req: Request): { id: number; role: { nombre: RoleEnum } } {
    const actor = req.user as any;
    if (typeof actor?.id !== 'number' || !actor?.role?.nombre) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return actor;
  }
}
