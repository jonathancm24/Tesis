/**
 * Módulo de Personal de Clínica
 * 
 * Módulo NestJS para la gestión de asignaciones de personal a clínicas
 * del sistema universitario. Maneja la relación entre usuarios
 * (docentes, estudiantes, coordinadores) y las diferentes clínicas
 * donde prestan servicios.
 * 
 * Funcionalidades incluidas:
 * - Asignación de personal a clínicas específicas
 * - Gestión de responsabilidades de clínica
 * - Control de períodos de asignación (inicio/fin)
 * - Consultas de personal por clínica y clínicas por usuario
 * - Estadísticas de distribución de personal
 * - Validaciones de conflictos y disponibilidad
 * 
 * Casos de uso principales:
 * - Asignar docentes como responsables de clínicas móviles
 * - Asignar estudiantes a prácticas en consultorios específicos
 * - Asignar coordinadores a múltiples clínicas
 * - Gestionar rotaciones de personal entre clínicas
 * - Controlar carga de trabajo por usuario
 * - Generar reportes de personal activo por instalación
 * 
 * Tipos de personal que maneja:
 * - Docentes: Supervisores y responsables de clínicas
 * - Estudiantes: Practicantes asignados a clínicas específicas
 * - Coordinadores: Personal administrativo de múltiples clínicas
 * - Personal de apoyo: Asistentes y técnicos
 * 
 * @fileoverview Módulo principal del sistema de personal de clínica
 * @module PersonalClinicaModule
 */

import { Module } from '@nestjs/common';
import { PersonalClinicaController } from './personal-clinica.controller';
import { PersonalClinicaService } from './personal-clinica.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Personal de Clínica
 * 
 * Configura e integra todos los componentes necesarios para
 * el funcionamiento del sistema de gestión de personal de clínicas,
 * incluyendo servicios, controladores y dependencias.
 */
@Module({
  imports: [
    PrismaModule // Acceso a la base de datos mediante Prisma ORM
  ],
  controllers: [
    PersonalClinicaController // Controlador REST para endpoints de personal de clínica
  ],
  providers: [
    PersonalClinicaService // Servicio de lógica de negocio para personal de clínica
  ],
  exports: [
    PersonalClinicaService // Exportar servicio para uso en otros módulos
  ]
})
export class PersonalClinicaModule {
  /**
   * Constructor del módulo
   * 
   * Inicializa el módulo de personal de clínica y registra todos los
   * componentes necesarios en el contenedor de dependencias.
   */
  constructor() {
    // El módulo está listo para gestionar asignaciones de personal
    // No requiere configuración adicional en el constructor
  }
}

/**
 * Casos de uso detallados del módulo:
 * 
 * 1. Gestión de Responsables de Clínica:
 *    - Asignar docentes como responsables únicos de clínicas
 *    - Validar que solo haya un responsable activo por clínica
 *    - Controlar transferencia de responsabilidades
 *    - Generar reportes de responsabilidades por período
 * 
 * 2. Asignación de Estudiantes para Prácticas:
 *    - Asignar estudiantes a clínicas específicas para rotaciones
 *    - Controlar períodos de práctica con fechas de inicio/fin
 *    - Gestionar múltiples asignaciones simultáneas si es necesario
 *    - Validar disponibilidad de cupos por clínica
 * 
 * 3. Gestión de Personal de Apoyo:
 *    - Asignar coordinadores a múltiples clínicas
 *    - Gestionar personal técnico y administrativo
 *    - Controlar horarios y disponibilidad
 *    - Manejar reemplazos temporales
 * 
 * 4. Control de Rotaciones:
 *    - Programar rotaciones de estudiantes entre clínicas
 *    - Gestionar calendarios de asignaciones
 *    - Validar solapamientos y conflictos
 *    - Generar reportes de rotaciones planificadas
 * 
 * 5. Reportes y Estadísticas:
 *    - Personal activo por clínica y período
 *    - Distribución de carga de trabajo
 *    - Clínicas con mayor/menor personal asignado
 *    - Estadísticas por tipo de usuario y clínica
 * 
 * Integración con otros módulos:
 * - Clinica: Valida existencia y estado de clínicas
 * - Usuario: Valida usuarios activos y sus roles
 * - HorarioClinica: Coordina horarios de personal con horarios de clínica
 * - Cita: Considera personal disponible para programación
 * - CasoClinico: Relaciona casos con personal asignado a clínicas
 * 
 * Validaciones de negocio implementadas:
 * - Solo un responsable activo por clínica
 * - No asignar personal a clínicas inactivas
 * - No duplicar asignaciones activas usuario-clínica
 * - Validar usuarios activos antes de asignación
 * - Control de fechas de inicio/fin lógicas
 * 
 * El módulo está diseñado para ser flexible y escalable,
 * permitiendo diferentes tipos de asignaciones según las
 * necesidades específicas de cada clínica y programa académico.
 */
