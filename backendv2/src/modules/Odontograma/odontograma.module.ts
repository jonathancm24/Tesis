import { Module } from '@nestjs/common'
import { PrismaModule } from '@/../prisma/prisma.module'
import { OdontogramaController } from './odontograma.controller'
import { OdontogramaService } from './odontograma.service'

@Module({
  imports: [PrismaModule],
  controllers: [OdontogramaController],
  providers: [OdontogramaService],
  exports: [OdontogramaService]
})
export class OdontogramaModule {}
