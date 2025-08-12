import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PreguntasClinicasController } from './preguntas-clinicas.controller';
import { PreguntasClinicasService } from './preguntas-clinicas.service';
import { RespuestasClinicasService } from './respuestas-clinicas.service';

/**
 * Módulo de Preguntas Clínicas
 * 
 * Este módulo maneja toda la funcionalidad relacionada con:
 * - Gestión de preguntas clínicas por especialidad
 * - Gestión de respuestas a preguntas clínicas
 * - Validación de tipos de respuesta según pregunta
 * - Estadísticas y reportes de preguntas y respuestas
 * 
 * Funcionalidades principales:
 * - CRUD completo para preguntas clínicas
 * - CRUD completo para respuestas clínicas
 * - Filtrado y búsqueda avanzada
 * - Operaciones en lote
 * - Validación automática de formatos de respuesta
 * - Estadísticas por especialidad
 * 
 * Dependencias:
 * - PrismaModule: Para acceso a la base de datos
 * - Especialidades: Las preguntas están asociadas a especialidades
 * - Casos Clínicos: Las respuestas están asociadas a casos clínicos
 */
@Module({
  imports: [
    PrismaModule, // Importamos el módulo de Prisma para acceso a BD
  ],
  controllers: [
    PreguntasClinicasController, // Controlador principal para endpoints
  ],
  providers: [
    PreguntasClinicasService,    // Servicio para gestión de preguntas
    RespuestasClinicasService,   // Servicio para gestión de respuestas
  ],
  exports: [
    PreguntasClinicasService,    // Exportamos para uso en otros módulos
    RespuestasClinicasService,   // Exportamos para uso en otros módulos
  ],
})
export class PreguntasClinicasModule {
  constructor() {
    console.log('✅ PreguntasClinicasModule inicializado correctamente');
    console.log('📋 Funcionalidades disponibles:');
    console.log('   - Gestión de preguntas clínicas por especialidad');
    console.log('   - Gestión de respuestas con validación automática');
    console.log('   - Operaciones CRUD completas');
    console.log('   - Filtrado y búsqueda avanzada');
    console.log('   - Operaciones en lote');
    console.log('   - Estadísticas y reportes');
  }
}
