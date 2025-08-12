/**
 * Módulo de Odontogramas
 * 
 * Módulo principal que configura e integra todos los componentes
 * relacionados con la gestión de odontogramas en el sistema.
 * 
 * @fileoverview Módulo NestJS para odontogramas
 * @module OdontogramaModule
 * @requires NestJS Common, Service, Controller
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OdontogramaController } from './odontograma.controller';
import { OdontogramaService } from './odontograma.service';

/**
 * Módulo de Odontogramas
 * 
 * Configura e integra:
 * - Controlador REST para endpoints de odontogramas
 * - Servicio de lógica de negocio
 * - Integración con PrismaService para base de datos
 * - Exportación del servicio para uso en otros módulos
 * 
 * @example
 * // Importar en otro módulo
 * import { OdontogramaModule } from './modules/Odontograma/odontograma.module';
 * 
 * @Module({
 *   imports: [OdontogramaModule],
 *   // ...
 * })
 * export class OtroModule {}
 */
@Module({
  controllers: [OdontogramaController],
  providers: [
    OdontogramaService,
    PrismaService
  ],
  exports: [OdontogramaService],
})
export class OdontogramaModule {}
