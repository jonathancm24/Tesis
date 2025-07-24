import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo para la gestión de roles del sistema
 * 
 * Proporciona funcionalidad para:
 * - Crear roles dinámicamente
 * - Asignar permisos a roles
 * - Consultar roles existentes
 * - Inicializar roles predefinidos del sistema
 */
@Module({
  imports: [PrismaModule], // Importar PrismaModule para acceso a la base de datos
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Exportar el servicio para uso en otros módulos
})
export class RolesModule {}