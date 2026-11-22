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
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RoleEnum } from '../../common/enums/roles.enum'
import { SaveOdontogramaDto } from './dto'
import { OdontogramaService } from './odontograma.service'

interface AuthenticatedRequest {
  user: {
    id: number
    role: {
      nombre: RoleEnum
    }
  }
}

@Controller('odontograma')
@UseGuards(JwtAuthGuard)
export class OdontogramaController {
  constructor(private readonly service: OdontogramaService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async save(@Body() dto: SaveOdontogramaDto, @Req() request: AuthenticatedRequest) {
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
