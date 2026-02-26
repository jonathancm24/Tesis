import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { Cie10Controller } from './cie10.controller';
import { Cie10Service } from './cie10.service';

@Module({
  imports: [PrismaModule],
  controllers: [Cie10Controller],
  providers: [Cie10Service],
  exports: [Cie10Service],
})
export class Cie10Module {}
