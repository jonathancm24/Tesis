import { Module } from '@nestjs/common';
import { PermisosUsuariosController } from './permisos-usuarios.controller';
import { PermisosUsuariosService } from './permisos-usuarios.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo para la gestión de permisos individuales de usuarios
 * 
 * Proporciona funcionalidad para:
 * - Asignar permisos especiales a usuarios específicos
 * - Revocar permisos individuales
 * - Consultar permisos individuales de usuarios
 * - Gestionar permisos temporales con fechas de expiración
 */
@Module({
  imports: [PrismaModule],
  controllers: [PermisosUsuariosController],
  providers: [PermisosUsuariosService],
  exports: [PermisosUsuariosService], // Exportar para uso en otros módulos
})
export class PermisosUsuariosModule {}