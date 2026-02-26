import { Module } from '@nestjs/common'
import { PrismaModule } from '@/../prisma/prisma.module'
import { EncuestaTamizajeController } from './encuesta-tamizaje.controller'
import { EncuestaTamizajeService } from './encuesta-tamizaje.service'

@Module({
  imports: [PrismaModule],
  controllers: [EncuestaTamizajeController],
  providers: [EncuestaTamizajeService],
  exports: [EncuestaTamizajeService]
})
export class EncuestaTamizajeModule {}
