import { Module } from '@nestjs/common'
import { PrismaModule } from '@/../prisma/prisma.module'
import { CasosClinicosController } from './casos-clinicos.controller'
import { CasosClinicosService } from './casos-clinicos.service'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { RolesGuard } from '../../guards/roles.guard'

@Module({
  imports: [PrismaModule],
  controllers: [CasosClinicosController],
  providers: [CasosClinicosService, JwtAuthGuard, RolesGuard],
  exports: [CasosClinicosService]
})
export class CasosClinicosModule {}
