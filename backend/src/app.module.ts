import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { EspecialidadModule } from './modules/especialidades/especialidad.module';
import { UsuariosModule } from './modules/usuarios/usudarios.module';
import { RolesModule } from './modules/roles/roles.module';
import { PaisModule } from './modules/Pais/pais.module';
import { CantonModule } from './modules/Canton/canton.module';
import { ParroquiaModule } from './modules/Parroquia/parroquia.module';
import { ProvinciaModule } from './modules/Provincia/provincia.module';
import { AuthModule } from './modules/Auth/auth.module'; // Importamos el módulo de autenticación
import { PermisosUsuariosModule } from './modules/usuarios/permisos-usuarios.module';
import { PermisosInicializadorService } from './modules/permisos/permisos-inicializador.service';
import { PermisosModule } from './modules/permisos/permisos.module';
import { PrismaModule } from './prisma/prisma.module';
import { PacienteModule } from './modules/pacientes/paciente.module'; // Módulo de pacientes
import { EncuestaModule } from './modules/Encuesta/encuesta.module'; // Módulo de encuestas de tamizaje
import { TratamientoModule } from './modules/tratamientos/tratamiento.module'; // Módulo de tratamientos clínicos
import { PreguntasClinicasModule } from './modules/preguntasClinicas/preguntas-clinicas.module'; // Módulo de preguntas por especialidad
import { CasosClinicosModule } from './modules/CasosClinicos/casos-clinicos.module'; // Módulo de casos clínicos
import { PrescripcionModule } from './modules/Prescripciones/prescripcion.module'; // Módulo de prescripciones médicas
import { ObservacionModule } from './modules/Observaciones/observacion.module'; // Módulo de observaciones del sistema
import { SolicitudModule } from './modules/Solicitudes/solicitud.module'; // Módulo de solicitudes académicas
import { OdontogramaModule } from './modules/Odontograma/odontograma.module'; // Módulo de odontogramas
import { HallazgoClinicoModule } from './modules/HallazgosClinico/hallazgo-clinico.module'; // Módulo de hallazgos clínicos
import { CitaModule } from './modules/Citas/cita.module'; // Módulo de citas médicas
import { DisponibilidadModule } from './modules/Disponibilidad/disponibilidad.module'; // Módulo de disponibilidad horaria
import { ClinicaModule } from './modules/Clinica/clinica.module'; // Módulo de clínicas universitarias
import { PersonalClinicaModule } from './modules/PersonalClinica/personal-clinica.module'; // Módulo de personal de clínicas
import { HorarioClinicaModule } from './modules/HorarioClinica/horario-clinica.module'; // Módulo de horarios de clínicas
import { LogModule } from './modules/Log/log.module'; // Módulo de logs de auditoría del sistema


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
    PaisModule,
    CantonModule,
    ParroquiaModule,
    ProvinciaModule,
    RolesModule,           // ← IMPORTANTE: Debe estar antes que PermisosUsuariosModule
    PermisosModule,        // ← Módulo de gestión de permisos
    PermisosUsuariosModule,
    PacienteModule,        // ← Módulo de gestión de pacientes
    EncuestaModule,        // ← Módulo de encuestas de tamizaje
    TratamientoModule,     // ← Módulo de gestión de tratamientos clínicos
    PreguntasClinicasModule, // ← Módulo de preguntas clínicas por especialidad
    CasosClinicosModule,   // ← Módulo de gestión de casos clínicos odontológicos
    PrescripcionModule,    // ← Módulo de gestión de prescripciones médicas
    ObservacionModule,     // ← Módulo de observaciones para seguimiento y retroalimentación
    SolicitudModule,       // ← Módulo de solicitudes académicas para asignación estudiante-especialidad
    OdontogramaModule,     // ← Módulo de gestión de odontogramas (cartas dentales)
    HallazgoClinicoModule, // ← Módulo de gestión de hallazgos clínicos odontológicos
    CitaModule,            // ← Módulo de gestión de citas médicas y disponibilidad de estudiantes
    DisponibilidadModule,  // ← Módulo de gestión de horarios de disponibilidad de estudiantes
    ClinicaModule,         // ← Módulo de gestión de clínicas universitarias (móviles, fijas, temporales)
    PersonalClinicaModule, // ← Módulo de asignación de personal a clínicas
    HorarioClinicaModule,  // ← Módulo de horarios de atención de clínicas
    LogModule,             // ← Módulo de logs de auditoría del sistema (solo lectura para administradores)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PermisosInicializadorService, // Para inicializar permisos de usuario
  ],
})
export class AppModule {}
