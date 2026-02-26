import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrescripcionesController } from './prescripciones.controller';
import { PrescripcionesService } from './prescripciones.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrescripcionesController],
  providers: [PrescripcionesService],
  exports: [PrescripcionesService],
})
export class PrescripcionesModule {}
