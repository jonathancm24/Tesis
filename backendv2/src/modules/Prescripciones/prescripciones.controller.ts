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

@Controller('prescripciones')
@UseGuards(JwtAuthGuard)
export class PrescripcionesController {
  constructor(private readonly prescripcionesService: PrescripcionesService) {}

  @Get('caso/:casoId')
  async listByCaso(@Param('casoId', ParseIntPipe) casoId: number, @Req() req: Request) {
    const actorId = this.getActorId(req);
    return this.prescripcionesService.listByCaso(casoId, actorId);
  }

  @Post('caso/:casoId')
  @HttpCode(HttpStatus.CREATED)
  async createForCaso(
    @Param('casoId', ParseIntPipe) casoId: number,
    @Body() dto: CreatePrescripcionDto,
    @Req() req: Request,
  ) {
    const actorId = this.getActorId(req);
    return this.prescripcionesService.createForCaso(casoId, actorId, dto);
  }

  private getActorId(req: Request): number {
    const actorId = (req.user as any)?.id;
    if (typeof actorId !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return actorId;
  }
}
