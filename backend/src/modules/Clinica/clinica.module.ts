/**
 * Módulo de Clínicas
 * 
 * Módulo NestJS para la gestión de clínicas móviles y consultorios
 * de la universidad. Proporciona funcionalidades básicas de CRUD
 * para administrar las instalaciones donde se prestan servicios
 * odontológicos.
 * 
 * Funcionalidades incluidas:
 * - Gestión de clínicas fijas (consultorios universitarios)
 * - Gestión de clínicas móviles (unidades que se desplazan)
 * - Gestión de clínicas temporales (para eventos especiales)
 * - Control de estados operativos
 * - Validaciones de datos específicas por tipo
 * - Estadísticas del sistema de clínicas
 * 
 * Tipos de clínica soportados:
 * - FIJA: Consultorios permanentes en el campus universitario
 * - MOVIL: Unidades móviles para atención en comunidades
 * - TEMPORAL: Instalaciones temporales para eventos o emergencias
 * 
 * Estados operativos:
 * - ACTIVA: Clínica operativa y disponible
 * - INACTIVA: Clínica temporalmente cerrada
 * - MANTENIMIENTO: En proceso de mantenimiento
 * - EN_RUTA: Clínica móvil en desplazamiento
 * - FUERA_SERVICIO: Clínica fuera de servicio
 * 
 * @fileoverview Módulo principal del sistema de clínicas
 * @module ClinicaModule
 */

import { Module } from '@nestjs/common';
import { ClinicaController } from './clinica.controller';
import { ClinicaService } from './clinica.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Clínicas
 * 
 * Configura e integra todos los componentes necesarios para
 * el funcionamiento del sistema de gestión de clínicas,
 * incluyendo servicios, controladores y dependencias.
 */
@Module({
  imports: [
    PrismaModule // Acceso a la base de datos mediante Prisma ORM
  ],
  controllers: [
    ClinicaController // Controlador REST para endpoints de clínicas
  ],
  providers: [
    ClinicaService // Servicio de lógica de negocio para clínicas
  ],
  exports: [
    ClinicaService // Exportar servicio para uso en otros módulos
  ]
})
export class ClinicaModule {
  /**
   * Constructor del módulo
   * 
   * Inicializa el módulo de clínicas y registra todos los
   * componentes necesarios en el contenedor de dependencias.
   */
  constructor() {
    // El módulo está listo para gestionar clínicas universitarias
    // No requiere configuración adicional en el constructor
  }
}

/**
 * Casos de uso del módulo de clínicas:
 * 
 * 1. Gestión de Consultorios Universitarios (FIJA):
 *    - Registro de consultorios en el campus
 *    - Asignación de ubicaciones específicas
 *    - Control de capacidad de pacientes
 *    - Gestión de horarios de atención
 * 
 * 2. Gestión de Clínicas Móviles (MOVIL):
 *    - Registro de unidades móviles
 *    - Control de información del vehículo
 *    - Seguimiento de rutas y ubicaciones
 *    - Gestión de estados EN_RUTA
 * 
 * 3. Gestión de Instalaciones Temporales (TEMPORAL):
 *    - Clínicas para eventos especiales
 *    - Instalaciones de emergencia
 *    - Servicios en ferias de salud
 *    - Atención en comunidades específicas
 * 
 * 4. Control Operativo:
 *    - Activación/desactivación de clínicas
 *    - Programación de mantenimientos
 *    - Seguimiento de estados operativos
 *    - Reportes de disponibilidad
 * 
 * 5. Estadísticas y Reportes:
 *    - Distribución por tipos de clínica
 *    - Estados operativos actuales
 *    - Clínicas con personal asignado
 *    - Clínicas con horarios activos
 * 
 * Integración con otros módulos:
 * - PersonalClinica: Asignación de usuarios a clínicas
 * - HorarioClinica: Gestión de horarios de atención
 * - CasoClinico: Asociación de casos a clínicas específicas
 * - Cita: Programación de citas en clínicas disponibles
 * - Parroquia: Ubicación geográfica de clínicas base
 * 
 * El diseño modular permite fácil extensión para nuevos tipos
 * de clínica y estados operativos según las necesidades
 * específicas de la universidad.
 */
