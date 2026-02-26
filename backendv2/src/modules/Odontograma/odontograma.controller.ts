import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { SaveOdontogramaDto } from './dto'
import { OdontogramaService } from './odontograma.service'

@Controller('odontograma')
@UseGuards(JwtAuthGuard)
export class OdontogramaController {
  constructor(private readonly service: OdontogramaService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async save(@Body() dto: SaveOdontogramaDto) {
    return this.service.save(dto)
  }

  @Get('caso/:casoClinicoId')
  async findByCaso(@Param('casoClinicoId', ParseIntPipe) casoClinicoId: number) {
    return this.service.findByCaso(casoClinicoId)
  }
}
