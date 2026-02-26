import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TratamientosController } from './tratamientos.controller';
import { TratamientosService } from './tratamientos.service';

@Module({
  imports: [PrismaModule],
  controllers: [TratamientosController],
  providers: [TratamientosService],
  exports: [TratamientosService],
})
export class TratamientosModule {}
