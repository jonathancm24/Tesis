import { Module } from '@nestjs/common'
import { PrismaModule } from '@/../prisma/prisma.module'
import { CasosClinicosController } from './casos-clinicos.controller'
import { CasosClinicosService } from './casos-clinicos.service'

@Module({
  imports: [PrismaModule],
  controllers: [CasosClinicosController],
  providers: [CasosClinicosService],
  exports: [CasosClinicosService]
})
export class CasosClinicosModule {}
