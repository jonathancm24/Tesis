/**
 * Módulo de Hallazgos Clínicos
 * 
 * Módulo principal que configura e integra todos los componentes
 * relacionados con la gestión de hallazgos clínicos en el sistema.
 * 
 * @fileoverview Módulo NestJS para hallazgos clínicos
 * @module HallazgoClinicoModule
 * @requires NestJS Common, Service, Controller
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HallazgoClinicoController } from './hallazgo-clinico.controller';
import { HallazgoClinicoService } from './hallazgo-clinico.service';

/**
 * Módulo de Hallazgos Clínicos
 * 
 * Configura e integra:
 * - Controlador REST para endpoints de hallazgos clínicos
 * - Servicio de lógica de negocio
 * - Integración con PrismaService para base de datos
 * - Exportación del servicio para uso en otros módulos
 * 
 * @example
 * // Importar en otro módulo
 * import { HallazgoClinicoModule } from './modules/HallazgosClinico/hallazgo-clinico.module';
 * 
 * @Module({
 *   imports: [HallazgoClinicoModule],
 *   // ...
 * })
 * export class OtroModule {}
 */
@Module({
  controllers: [HallazgoClinicoController],
  providers: [
    HallazgoClinicoService,
    PrismaService
  ],
  exports: [HallazgoClinicoService],
})
export class HallazgoClinicoModule {}
