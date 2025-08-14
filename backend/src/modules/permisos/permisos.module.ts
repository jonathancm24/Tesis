import { Module } from '@nestjs/common';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Permisos
 * 
 * Gestiona toda la funcionalidad relacionada con:
 * - Consulta de permisos disponibles
 * - Organización de permisos por módulos
 * 
 * Nota: PermisosInicializadorService se encuentra en AppModule para evitar dependencias circulares
 */
@Module({
  controllers: [PermisosController],
  providers: [
    PermisosService,
    PrismaService
  ],
  exports: [
    PermisosService
  ]
})
export class PermisosModule {}
