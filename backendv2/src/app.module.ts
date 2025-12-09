import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { PermisosInicializadorService } from './modules/permisos/permisos-inicializador.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    PermisosModule,
    UsuariosModule,
  ],
  providers: [PermisosInicializadorService],
})
export class AppModule {}