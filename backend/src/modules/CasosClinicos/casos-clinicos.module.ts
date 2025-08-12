import { Module } from '@nestjs/common';
import { CasoClinicoService } from './caso.service';
import { CasoClinicoController } from './caso.controller';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Casos Clínicos
 * 
 * Funcionalidades principales:
 * - CRUD completo de casos clínicos odontológicos
 * - Gestión de estados con validaciones de transición
 * - Sistema de permisos basado en roles
 * - Validación de finalización basada en estado de tratamientos
 * - Estadísticas y reportes de casos clínicos
 * - Filtrado avanzado y paginación
 * 
 * Integración con:
 * - Sistema de autenticación y autorización existente
 * - Pipes de validación global
 * - Filtros de excepciones global
 * - Módulo de Tratamientos (relación uno a muchos)
 * - Módulo de Pacientes, Usuarios, Especialidades
 * 
 * Estados del caso clínico:
 * - EN_REVISION: Estado inicial, caso creado por estudiante, requiere aprobación del profesor
 * - APROBADO: Caso aprobado por profesor, puede proceder a estudios o tratamiento
 * - PENDIENTE_ESTUDIOS: Caso requiere estudios adicionales antes del tratamiento
 * - EN_TRATAMIENTO: Caso activo con tratamientos en curso
 * - FINALIZADO: Caso completado, todos los tratamientos finalizados
 * - CANCELADO: Caso cancelado por motivos diversos
 * 
 * Permisos por rol:
 * - ESTUDIANTE: Crear casos, ver sus casos, editar casos EN_REVISION
 * - PROFESOR: Ver todos, aprobar/rechazar, cambiar estados, calificar
 * - ADMIN: Control total sobre casos clínicos
 * - SECRETARIO: Solo lectura para reportes y estadísticas
 */
@Module({
  imports: [PrismaModule],
  controllers: [CasoClinicoController],
  providers: [CasoClinicoService],
  exports: [CasoClinicoService], // Exportar para uso en otros módulos si es necesario
})
export class CasosClinicosModule {}
