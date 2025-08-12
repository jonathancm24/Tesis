/**
 * Módulo de Citas Médicas
 * 
 * Define el módulo NestJS para la gestión de citas médicas/odontológicas
 * en el sistema académico. Configura el servicio, controlador y
 * dependencias necesarias para el funcionamiento completo del módulo.
 * 
 * @fileoverview Módulo principal para la gestión de citas médicas
 * @module CitaModule
 * @requires NestJS Common, PrismaService, CitaController, CitaService
 */

import { Module } from '@nestjs/common';
import { CitaController } from './cita.controller';
import { CitaService } from './cita.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Citas Médicas
 * 
 * Encapsula toda la funcionalidad relacionada con citas médicas,
 * incluyendo creación, modificación, cancelación, consulta de disponibilidad
 * y gestión de estados.
 * 
 * @description
 * Este módulo proporciona:
 * - CRUD completo de citas médicas
 * - Verificación de disponibilidad de estudiantes
 * - Detección de conflictos de horario
 * - Gestión de estados de citas
 * - Endpoints RESTful documentados con Swagger
 * - Autenticación y autorización integrada
 * 
 * @dependencies
 * - PrismaService: Para operaciones de base de datos
 * - JwtAuthGuard: Para autenticación de endpoints
 * 
 * @exports
 * - CitaService: Para uso en otros módulos
 * 
 * @example
 * ```typescript
 * import { CitaModule } from './modules/Citas/cita.module';
 * 
 * @Module({
 *   imports: [CitaModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  controllers: [CitaController],
  providers: [CitaService, PrismaService],
  exports: [CitaService],
})
export class CitaModule {}
