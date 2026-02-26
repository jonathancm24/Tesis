import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { PreguntasClinicasService } from './preguntas-clinicas.service'
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'

@Controller('preguntas-clinicas')
@UseGuards(JwtAuthGuard)
export class PreguntasClinicasController {
  constructor(private readonly preguntasService: PreguntasClinicasService) {}

  @Post()
  create(@Body() dto: CreatePreguntaDto) {
    return this.preguntasService.create(dto)
  }

  @Get()
  findAll(
    @Query('especialidadId', new ParseIntPipe({ optional: true })) especialidadId?: number,
    @Query('tipo') tipo?: string
  ) {
    return this.preguntasService.findAll({ especialidadId, tipo })
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.preguntasService.findOne(id)
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePreguntaDto) {
    return this.preguntasService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.preguntasService.remove(id)
  }
}
