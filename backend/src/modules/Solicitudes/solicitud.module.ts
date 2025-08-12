import { Module } from '@nestjs/common';
import { SolicitudController } from './solicitud.controller';
import { SolicitudService } from './solicitud.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Solicitudes
 * 
 * Gestiona todas las funcionalidades relacionadas con:
 * - Solicitudes de estudiantes para asignación a especialidades
 * - Proceso de aprobación por parte de docentes
 * - Seguimiento y estadísticas de solicitudes
 * - Dashboard y reportes del sistema académico
 * 
 * Incluye validaciones de permisos por rol:
 * - ESTUDIANTE: Crear, consultar sus solicitudes, cancelar
 * - PROFESOR: Procesar solicitudes de sus especialidades, responder
 * - ADMIN/SECRETARIO: Gestión completa, reportes, configuración
 * 
 * Dependencias:
 * - PrismaModule para acceso a base de datos
 * - Guards JWT para autenticación
 * - Decoradores de roles para autorización
 */
@Module({
  imports: [PrismaModule],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [SolicitudService]
})
export class SolicitudModule {}
