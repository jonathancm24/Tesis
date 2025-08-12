/**
 * Módulo de Disponibilidad Horaria
 * 
 * Define el módulo NestJS para la gestión de disponibilidad horaria
 * de estudiantes en el sistema académico. Configura el servicio, controlador
 * y dependencias necesarias para que los estudiantes puedan definir sus
 * horarios de atención y los secretarios consulten disponibilidad.
 * 
 * @fileoverview Módulo principal para gestión de disponibilidad horaria
 * @module DisponibilidadModule
 * @requires NestJS Common, PrismaService, DisponibilidadController, DisponibilidadService
 */

import { Module } from '@nestjs/common';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Disponibilidad Horaria
 * 
 * Encapsula toda la funcionalidad relacionada con la gestión de horarios
 * de disponibilidad de estudiantes, incluyendo creación, modificación,
 * consultas y validaciones de conflictos.
 * 
 * @description
 * Este módulo proporciona:
 * - CRUD completo de disponibilidades horarias
 * - Validación de conflictos de horario
 * - Consultas de disponibilidad específica para asignación de citas
 * - Creación masiva de horarios semanales
 * - Generación de slots de tiempo disponibles
 * - Endpoints RESTful documentados con Swagger
 * - Autenticación y autorización integrada
 * - Control de acceso basado en roles
 * 
 * @functionality
 * ### Para Estudiantes:
 * - Definir horarios de disponibilidad por día de la semana
 * - Configurar múltiples horarios para el mismo día
 * - Actualizar y eliminar disponibilidades propias
 * - Ver resumen de su disponibilidad semanal
 * 
 * ### Para Secretarios:
 * - Consultar disponibilidad de estudiantes para asignar citas
 * - Verificar rapidamente si un horario está disponible
 * - Ver slots de tiempo libres para una fecha específica
 * - Obtener horarios alternativos cuando no hay disponibilidad
 * 
 * ### Para Docentes/Administradores:
 * - Ver estadísticas de disponibilidad del sistema
 * - Monitorear configuración de horarios por estudiante
 * - Generar reportes de disponibilidad
 * 
 * @validation
 * - Formato de horarios (HH:MM en 24 horas)
 * - Hora de inicio anterior a hora de fin
 * - Duración mínima de 15 minutos, máxima de 12 horas
 * - No solapamiento de horarios para el mismo día y usuario
 * - Validación de existencia y estado activo del usuario
 * 
 * @security
 * - Autenticación JWT requerida en todos los endpoints
 * - Los usuarios solo pueden gestionar su propia disponibilidad
 * - Secretarios y docentes pueden consultar disponibilidad de estudiantes
 * - Validación de permisos antes de operaciones sensibles
 * 
 * @dependencies
 * - PrismaService: Para operaciones de base de datos
 * - JwtAuthGuard: Para autenticación de endpoints
 * - class-validator: Para validación de DTOs
 * - @nestjs/swagger: Para documentación automática
 * 
 * @database_relations
 * ```sql
 * Disponibilidad {
 *   id: number (PK)
 *   dia: DiaSemana (ENUM)
 *   horaInicio: string
 *   horaFin: string
 *   usuarioId: number (FK -> Usuario.id)
 * }
 * ```
 * 
 * @exports
 * - DisponibilidadService: Para uso en otros módulos (ej: CitaModule)
 * 
 * @integration_example
 * ```typescript
 * // En CitaService para verificar disponibilidad antes de crear cita
 * const disponible = await this.disponibilidadService.consultarDisponibilidadEspecifica({
 *   usuarioId: estudianteId,
 *   fecha: '2025-01-15',
 *   horaInicio: '09:00',
 *   horaFin: '10:00'
 * });
 * 
 * if (!disponible.estaDisponible) {
 *   throw new BadRequestException('Estudiante no disponible en ese horario');
 * }
 * ```
 * 
 * @example
 * ```typescript
 * import { DisponibilidadModule } from './modules/Disponibilidad/disponibilidad.module';
 * 
 * @Module({
 *   imports: [DisponibilidadModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  controllers: [DisponibilidadController],
  providers: [DisponibilidadService, PrismaService],
  exports: [DisponibilidadService], // Exportar para uso en otros módulos como CitaModule
})
export class DisponibilidadModule {}
