import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global para el servicio de Prisma
 * 
 * Se marca como @Global() para que esté disponible en toda la aplicación
 * sin necesidad de importarlo en cada módulo que lo necesite
 * 
 * Proporciona acceso centralizado a la base de datos a través de PrismaService
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta PrismaService para que otros módulos puedan usarlo
})
export class PrismaModule {}