import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrescripcionController } from './prescripcion.controller';
import { PrescripcionService } from './prescripcion.service';

/**
 * Módulo de Prescripciones Médicas
 * 
 * Funcionalidades principales:
 * - Gestión completa de prescripciones farmacológicas
 * - Validación de interacciones medicamentosas
 * - Control de dosificación según parámetros del paciente
 * - Workflow de aprobación: PENDIENTE → APROBADO → EN_PROCESO → COMPLETADO
 * - Análisis estadístico y reportes de prescripciones
 * - Integración con sistema de observaciones para auditoría
 * 
 * Roles y permisos:
 * - ESTUDIANTE: Crear y editar prescripciones PENDIENTES, completar prescripciones
 * - PROFESOR: Todas las operaciones, aprobar/rechazar, actualizaciones completas
 * - ADMIN: Acceso completo al sistema
 * - SECRETARIO: Consulta de datos y estadísticas
 * 
 * Estados de prescripción:
 * - PENDIENTE: Recién creada, esperando revisión del profesor
 * - APROBADO: Validada por el profesor, lista para implementar
 * - RECHAZADO: No aprobada, requiere correcciones
 * - EN_PROCESO: Siendo administrada al paciente
 * - COMPLETADO: Tratamiento finalizado exitosamente
 * - INCOMPLETO: Tratamiento no completado por alguna razón
 * - CANCELADO: Prescripción cancelada o eliminada
 * 
 * Integración con otros módulos:
 * - CasosClinicos: Cada prescripción pertenece a un caso clínico
 * - Observaciones: Registro de cambios de estado y comentarios
 * - Usuarios: Control de acceso basado en roles
 * 
 * Validaciones especiales:
 * - Interacciones medicamentosas entre prescripciones activas
 * - Dosificación apropiada según edad, peso y condiciones del paciente
 * - Duplicación de medicamentos en el mismo caso clínico
 * - Transiciones de estado válidas según workflow establecido
 */
@Module({
  imports: [
    PrismaModule, // Acceso a la base de datos
  ],
  controllers: [PrescripcionController],
  providers: [PrescripcionService],
  exports: [PrescripcionService], // Exportar para uso en otros módulos
})
export class PrescripcionModule {}
