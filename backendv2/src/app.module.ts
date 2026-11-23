import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { EspecialidadesModule } from './modules/especialidades/especialidades.module';
import { PermisosInicializadorService } from './modules/permisos/permisos-inicializador.service';
import { PaisModule } from './modules/Pais/pais.module';
import { ParroquiaModule } from './modules/Parroquia/parroquia.module';
import { ProvinciaModule } from './modules/Provincia/provincia.module';
import { CantonModule } from './modules/Canton/canton.module';
import { PacientesModule } from './modules/Pacientes/pacientes.module';
import { EncuestaTamizajeModule } from './modules/EncuestaTamizaje/encuesta-tamizaje.module';
import { CasosClinicosModule } from './modules/CasosClinicos/casos-clinicos.module';
import { CitasModule } from './modules/Citas/citas.module';
import { OdontogramaModule } from './modules/Odontograma/odontograma.module';
import { PreguntasClinicasModule } from './modules/PreguntasClinicas/preguntas-clinicas.module';
import { ArchivosModule } from './modules/Archivos/archivos.module';
import { Cie10Module } from './modules/CIE10/cie10.module';
import { TratamientosModule } from './modules/Tratamientos/tratamientos.module';
import { PrescripcionesModule } from './modules/Prescripciones/prescripciones.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

function validateEnv(config: Record<string, unknown>) {
  const databaseUrl = String(config.DATABASE_URL || '').trim();
  const jwtSecret = String(config.JWT_SECRET || '').trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL es obligatoria');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    RolesModule,
    PermisosModule,
    UsuariosModule,
    EspecialidadesModule,
    PaisModule,
    ParroquiaModule,
    ProvinciaModule,
    CantonModule,
    PacientesModule,
    EncuestaTamizajeModule,
    CasosClinicosModule,
    CitasModule,
    OdontogramaModule,
    PreguntasClinicasModule,
    ArchivosModule,
    Cie10Module,
    TratamientosModule,
    PrescripcionesModule,
  ],
  providers: [
    PermisosInicializadorService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}