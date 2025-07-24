import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EspecialidadModule } from './modules/especialidades/especialidad.module';
import { UsuariosModule } from './modules/usuarios/usudarios.module';
import { RolesModule } from './modules/Roles/roles.module';
import { PaisModule } from './modules/Pais/pais.module';
import { CantonModule } from './modules/Canton/canton.module';
import { ParroquiaModule } from './modules/Parroquia/parroquia.module';
import { ProvinciaModule } from './modules/Provincia/provincia.module';
import { AuthModule } from './modules/Auth/auth.module'; // Importamos el módulo de autenticación
import { PermisosUsuariosModule } from './modules/usuarios/permisos-usuarios.module';
import { PermisosInicializadorService } from './modules/permisos/permisos-inicializador.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Módulo principal de la aplicación
 * Configura todos los módulos necesarios para el funcionamiento del sistema
 */
@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la aplicación
    }),

    // Módulos existentes
    PrismaModule, // Módulo de Prisma para la base de datos
    AuthModule,
    UsuariosModule,
    EspecialidadModule,
    RolesModule,
    PaisModule,
    CantonModule,
    ParroquiaModule,
    ProvinciaModule,
    PermisosUsuariosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PermisosInicializadorService,
  ],
})
export class AppModule {}
