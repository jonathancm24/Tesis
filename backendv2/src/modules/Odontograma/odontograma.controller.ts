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
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { SaveOdontogramaDto } from './dto'
import { OdontogramaService } from './odontograma.service'
import type { OdontogramaActor } from './odontograma.service'
import { RolesGuard } from '../../guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { RoleEnum } from '../../common/enums/roles.enum'

interface AuthenticatedRequest {
  user: OdontogramaActor
}

@Controller('odontograma')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OdontogramaController {
  constructor(private readonly service: OdontogramaService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.ESTUDIANTE)
  @HttpCode(HttpStatus.OK)
  async save(
    @Body() dto: SaveOdontogramaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.save(dto, request.user)
  }

  @Get('caso/:casoClinicoId')
  async findByCaso(
    @Param('casoClinicoId', ParseIntPipe) casoClinicoId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.findByCaso(casoClinicoId, request.user)
  }
}
