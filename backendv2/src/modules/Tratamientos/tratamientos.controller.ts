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
import { CreateTratamientoDto } from './dto';
import { TratamientosService } from './tratamientos.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../../common/enums/roles.enum';

@Controller('tratamientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Get('caso/:casoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  async listByCaso(@Param('casoId', ParseIntPipe) casoId: number, @Req() req: Request) {
    return this.tratamientosService.listByCaso(casoId, this.getActor(req));
  }

  @Post('caso/:casoId')
  @Roles(RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.CREATED)
  async createForCaso(
    @Param('casoId', ParseIntPipe) casoId: number,
    @Body() dto: CreateTratamientoDto,
    @Req() req: Request,
  ) {
    return this.tratamientosService.createForCaso(casoId, this.getActor(req), dto);
  }

  private getActor(req: Request): { id: number; role: { nombre: RoleEnum } } {
    const actor = req.user as any;
    if (typeof actor?.id !== 'number' || !actor?.role?.nombre) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return actor;
  }
}
