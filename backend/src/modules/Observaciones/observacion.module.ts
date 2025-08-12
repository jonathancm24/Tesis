import { Module } from '@nestjs/common';
import { ObservacionController } from './observacion.controller';
import { ObservacionService } from './observacion.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Observaciones del Sistema
 * 
 * Funcionalidades principales:
 * - Seguimiento de tratamientos para estudiantes
 * - Retroalimentación docente para profesores
 * - Observaciones polimórficas para múltiples entidades
 * - Sistema de estados y transiciones
 * - Notificaciones y recordatorios
 * - Reportes y estadísticas
 * 
 * Entidades relacionadas:
 * - CasoClinico: Observaciones generales de casos
 * - Tratamiento: Seguimiento de tratamientos y retroalimentación
 * - Prescripcion: Observaciones sobre prescripciones
 * - Odontograma: Observaciones sobre odontogramas
 * 
 * Estados disponibles:
 * - PENDIENTE: Observación creada, esperando revisión
 * - REVISADO: Observación revisada por docente/responsable
 * - FINALIZADO: Observación completada y cerrada
 * - INCOMPLETO: Observación que requiere información adicional
 * 
 * Roles de acceso:
 * - ESTUDIANTE: Crear seguimientos de tratamiento, ver sus observaciones
 * - PROFESOR: Crear retroalimentación, gestionar estados, ver todas las observaciones
 * - ADMIN: Acceso completo a todas las funcionalidades
 * - SECRETARIO: Acceso a reportes y estadísticas
 */
@Module({
  imports: [PrismaModule],
  controllers: [ObservacionController],
  providers: [ObservacionService],
  exports: [ObservacionService]
})
export class ObservacionModule {}
