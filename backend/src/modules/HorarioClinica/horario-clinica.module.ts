/**
 * Módulo de horarios de clínica
 * 
 * Configura y exporta todos los componentes necesarios para
 * la gestión de horarios de atención de las clínicas del
 * sistema universitario.
 * 
 * @fileoverview Módulo de horarios de clínica
 * @module HorarioClinicaModule
 */

import { Module } from '@nestjs/common';
import { HorarioClinicaService } from './horario-clinica.service';
import { HorarioClinicaController } from './horario-clinica.controller';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de horarios de clínica
 * 
 * Agrupa el servicio, controlador y dependencias necesarias
 * para gestionar los horarios de atención de las clínicas.
 * 
 * Características principales:
 * - Gestión completa de horarios (CRUD)
 * - Validación de coherencia temporal
 * - Prevención de conflictos de horarios
 * - Estadísticas y reportes agrupados
 * - Filtros avanzados de consulta
 * - Control de estados activo/inactivo
 */
@Module({
  imports: [
    PrismaModule, // Acceso a base de datos
  ],
  controllers: [
    HorarioClinicaController, // Endpoints REST para horarios
  ],
  providers: [
    HorarioClinicaService, // Lógica de negocio para horarios
  ],
  exports: [
    HorarioClinicaService, // Exportar servicio para uso en otros módulos
  ],
})
export class HorarioClinicaModule {
  /**
   * Constructor del módulo de horarios de clínica
   * 
   * Este módulo proporciona funcionalidades para:
   * 
   * 1. **Gestión de Horarios**:
   *    - Crear horarios de atención para clínicas
   *    - Actualizar horarios existentes
   *    - Eliminar horarios obsoletos
   *    - Consultar horarios con filtros avanzados
   * 
   * 2. **Validaciones de Negocio**:
   *    - Coherencia entre hora de apertura y cierre
   *    - Prevención de conflictos de horarios duplicados
   *    - Validación de duración mínima y máxima
   *    - Verificación de existencia de clínicas
   * 
   * 3. **Consultas Especializadas**:
   *    - Horarios agrupados por clínica
   *    - Estadísticas del sistema de horarios
   *    - Filtros por día de la semana
   *    - Filtros por tipo y estado de clínica
   * 
   * 4. **Gestión de Estados**:
   *    - Activar/desactivar horarios
   *    - Control de disponibilidad por día
   *    - Gestión temporal de horarios especiales
   * 
   * 5. **Integraciones**:
   *    - Conexión con módulo de clínicas
   *    - Soporte para sistema de citas
   *    - Validación geográfica por parroquias
   *    - Seguimiento de logs y auditoría
   */
  constructor() {
    // Configuración inicial del módulo si es necesaria
    console.log('Módulo de Horarios de Clínica inicializado');
  }
}
