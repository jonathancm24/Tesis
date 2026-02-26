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

@Controller('tratamientos')
@UseGuards(JwtAuthGuard)
export class TratamientosController {
  constructor(private readonly tratamientosService: TratamientosService) {}

  @Get('caso/:casoId')
  async listByCaso(@Param('casoId', ParseIntPipe) casoId: number, @Req() req: Request) {
    const actorId = this.getActorId(req);
    return this.tratamientosService.listByCaso(casoId, actorId);
  }

  @Post('caso/:casoId')
  @HttpCode(HttpStatus.CREATED)
  async createForCaso(
    @Param('casoId', ParseIntPipe) casoId: number,
    @Body() dto: CreateTratamientoDto,
    @Req() req: Request,
  ) {
    const actorId = this.getActorId(req);
    return this.tratamientosService.createForCaso(casoId, actorId, dto);
  }

  private getActorId(req: Request): number {
    const actorId = (req.user as any)?.id;
    if (typeof actorId !== 'number') {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return actorId;
  }
}
