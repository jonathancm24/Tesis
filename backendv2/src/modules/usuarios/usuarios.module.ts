import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

/**
 * Módulo de usuarios
 * Maneja toda la funcionalidad relacionada con la gestión de usuarios
 * 
 * Incluye:
 * - CRUD completo de usuarios
 * - Validaciones de negocio
 * - Manejo de relaciones (roles, especialidades, parroquias)
 * - Cambio de contraseñas
 * - Activación/desactivación de usuarios
 * 
 * Dependencias:
 * - PrismaService (para acceso a base de datos)
 * - bcrypt (para encriptación de contraseñas)
 * 
 * Seguridad:
 * - Los guards están comentados para facilitar pruebas
 * - En producción, descomentar los guards necesarios
 */
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Exportar el servicio para usar en otros módulos
})
export class UsuariosModule {}