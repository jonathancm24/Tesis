import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EspecialidadModule } from './modules/especialidades/especialidad.module';
import { UsuariosModule } from './modules/usuarios/usudarios.module';
import { RolModule } from './modules/roles/rol.module';
import { PaisModule } from './modules/Pais/pais.module';
import { CantonModule } from './modules/Canton/canton.module';
import { ParroquiaModule } from './modules/Parroquia/parroquia.module';
import { ProvinciaModule } from './modules/Provincia/provincia.module';

@Module({
  imports: [EspecialidadModule, UsuariosModule, RolModule, PaisModule, CantonModule, ParroquiaModule, ProvinciaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService ],
  
})
export class AppModule {}
