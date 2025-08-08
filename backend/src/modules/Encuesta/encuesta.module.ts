import { Module } from '@nestjs/common';
import { EncuestaController } from './encuesta.controller';
import { EncuestaService } from './encuesta.service';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * Módulo de Encuestas de Tamizaje
 * 
 * Este módulo maneja toda la funcionalidad relacionada con las encuestas de tamizaje:
 * - Creación de nuevas encuestas
 * - Consulta de encuestas existentes
 * - Gestión de preguntas de tamizaje
 * - Estadísticas de encuestas
 * 
 * Características principales:
 * - Una encuesta por paciente por día
 * - Las encuestas no se pueden editar una vez guardadas
 * - Soporte para preguntas específicas por género
 * - Preguntas con detalles opcionales
 * - Validación de integridad de datos
 */
@Module({
  imports: [
    PrismaModule, // Importa el módulo de Prisma para acceso a la base de datos
  ],
  controllers: [
    EncuestaController, // Controlador que maneja las rutas HTTP
  ],
  providers: [
    EncuestaService, // Servicio que contiene la lógica de negocio
  ],
  exports: [
    EncuestaService, // Exporta el servicio para uso en otros módulos
  ],
})
export class EncuestaModule {}