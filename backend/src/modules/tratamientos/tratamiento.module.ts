import { Module } from '@nestjs/common';
import { TratamientoController } from './tratamiento.controller';
import { TratamientoService } from './tratamiento.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de tratamientos clínicos
 * 
 * Este módulo encapsula toda la funcionalidad relacionada con la gestión
 * de tratamientos médicos dentro del sistema de casos clínicos.
 * 
 * Funcionalidades incluidas:
 * - CRUD completo de tratamientos
 * - Gestión de estados con validaciones específicas
 * - Control de permisos diferenciado por roles
 * - Filtrado y búsqueda avanzada
 * - Estadísticas y reportes
 * - Validaciones médicas (códigos CIE-10, procedimientos)
 * 
 * Permisos por rol:
 * - ESTUDIANTE: Crear y editar (solo si RECHAZADO)
 * - PROFESOR: Control completo incluyendo cambios de estado
 * - ADMIN: Control completo
 * - SECRETARIO: Solo lectura y estadísticas
 */
@Module({
  imports: [
    PrismaModule, // Para acceso a la base de datos
  ],
  controllers: [
    TratamientoController, // Maneja todas las rutas HTTP
  ],
  providers: [
    TratamientoService, // Lógica de negocio principal
  ],
  exports: [
    TratamientoService, // Permite que otros módulos usen el servicio
  ],
})
export class TratamientoModule {
  constructor() {
    // Log de inicialización del módulo
    console.log('✅ TratamientoModule inicializado correctamente');
  }
}
