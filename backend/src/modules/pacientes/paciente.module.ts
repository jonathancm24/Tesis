import { Module } from '@nestjs/common';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Módulo de Pacientes
 * Gestiona el registro, actualización y consulta de pacientes
 * Incluye historial médico completo
 */
@Module({
  imports: [PrismaModule],
  controllers: [PacienteController],
  providers: [PacienteService],
  exports: [PacienteService] // Exportamos el servicio para uso en otros módulos
})
export class PacienteModule {}
