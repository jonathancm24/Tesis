import { Module } from '@nestjs/common'
import { PreguntasClinicasController } from './preguntas-clinicas.controller'
import { PreguntasClinicasService } from './preguntas-clinicas.service'
import { PrismaModule } from '@/../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [PreguntasClinicasController],
  providers: [PreguntasClinicasService],
  exports: [PreguntasClinicasService]
})
export class PreguntasClinicasModule {}
