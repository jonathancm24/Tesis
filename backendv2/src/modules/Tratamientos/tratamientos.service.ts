import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTratamientoDto } from './dto';
import { RoleEnum } from '../../common/enums/roles.enum';

interface AuthenticatedUser {
  id: number;
  role: { nombre: RoleEnum };
}

@Injectable()
export class TratamientosService {
  constructor(private readonly prisma: PrismaService) {}

  async listByCaso(casoClinicoId: number, actor: AuthenticatedUser) {
    const caso = await this.ensureCasoDisponible(casoClinicoId, actor, false);

    return this.prisma.tratamiento.findMany({
      where: { casoClinicoId: caso.id },
      orderBy: { fechaCreacion: 'desc' },
      include: {
        cie10: {
          select: { codigo: true, descripcion: true, tipo: true },
        },
        procedimiento: {
          select: { codigo: true, descripcion: true, tipo: true },
        },
        docente: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        estudiante: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        observaciones: {
          select: { id: true, titulo: true,  fecha: true,  descripcion: true, estado: true, contenidoEstudiante: true, contenidoDocente: true, fechaActualizacion: true },
        },
      },
    });
  }

  async createForCaso(
    casoClinicoId: number,
    actor: AuthenticatedUser,
    dto: CreateTratamientoDto,
  ) {
    const caso = await this.ensureCasoDisponible(casoClinicoId, actor, true);
    await this.ensureCatalogoCodigos(dto.cie10Codigo, dto.procedimientoCodigo);

    return this.prisma.$transaction(async (tx) => {
      const tratamiento = await tx.tratamiento.create({
        data: {
          casoClinicoId,
          estudianteId: caso.estudianteId,
          docenteId: caso.profesorId,
          descripcion: dto.descripcion.trim(),
          frecuenciaCardiaca: dto.frecuenciaCardiaca.trim(),
          presArterial: dto.presArterial.trim(),
          saturacionOxigeno: dto.saturacionOxigeno.trim(),
          temperatura: dto.temperatura.trim(),
          tipoDiagnostico: dto.tipoDiagnostico || 'Presuntivo',
          ...(dto.cie10Codigo ? { cie10Codigo: dto.cie10Codigo.trim() } : {}),
          ...(dto.procedimientoCodigo
            ? { procedimientoCodigo: dto.procedimientoCodigo.trim() }
            : {}),
          estado: 'PENDIENTE',
        },
        include: {
          cie10: {
            select: { codigo: true, descripcion: true, tipo: true },
          },
          procedimiento: {
            select: { codigo: true, descripcion: true, tipo: true },
          },
        },
      });

      let prescripcion = null;
      if (dto.crearPrescripcion && dto.prescripcion) {
        prescripcion = await tx.prescripcion.create({
          data: {
            casoClinicoId,
            medicamento: dto.prescripcion.medicamento.trim(),
            dosis: dto.prescripcion.dosis.trim(),
            frecuencia: dto.prescripcion.frecuencia.trim(),
            duracion: dto.prescripcion.duracion.trim(),
            concentracion: dto.prescripcion.concentracion.trim(),
            Nrodefarmacos: dto.prescripcion.Nrodefarmacos,
            presentacion: dto.prescripcion.presentacion.trim(),
            viadeadministracion: dto.prescripcion.viadeadministracion.trim(),
            estado: 'PENDIENTE',
          },
        });
      }

      await tx.casoClinico.update({
        where: { id: casoClinicoId },
        data: {
          estado: caso.estado === 'EN_REVISION' ? 'EN_TRATAMIENTO' : caso.estado,
        },
      });

      return {
        tratamiento,
        prescripcion,
      };
    });
  }

  private async ensureCatalogoCodigos(cie10Codigo?: string, procedimientoCodigo?: string) {
    if (cie10Codigo?.trim()) {
      const cie10 = await this.prisma.cIE10yOtrasClasificaciones.findUnique({
        where: { codigo: cie10Codigo.trim().toUpperCase() },
      });

      if (!cie10) {
        throw new BadRequestException(`El código CIE10 ${cie10Codigo} no existe`);
      }
    }

    if (procedimientoCodigo?.trim()) {
      const procedimiento = await this.prisma.cIE10yOtrasClasificaciones.findUnique({
        where: { codigo: procedimientoCodigo.trim().toUpperCase() },
      });

      if (!procedimiento) {
        throw new BadRequestException(
          `El código de procedimiento ${procedimientoCodigo} no existe`,
        );
      }
    }
  }

  private async ensureCasoDisponible(
    casoClinicoId: number,
    actor: AuthenticatedUser,
    rejectIfRejected: boolean,
  ) {
    const caso = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId },
      select: {
        id: true,
        estudianteId: true,
        profesorId: true,
        estado: true,
      },
    });

    if (!caso) {
      throw new NotFoundException(`Caso clínico con ID ${casoClinicoId} no encontrado`);
    }

    if (actor.role.nombre === RoleEnum.ADMIN) {
      // El administrador conserva acceso administrativo.
    } else if (
      actor.role.nombre === RoleEnum.PROFESOR &&
      caso.profesorId === actor.id
    ) {
      // Profesor asignado.
    } else if (
      actor.role.nombre === RoleEnum.ESTUDIANTE &&
      caso.estudianteId === actor.id
    ) {
      // Estudiante propietario.
    } else {
      throw new ForbiddenException('No tienes permisos para operar sobre este caso clínico');
    }

    if (rejectIfRejected && caso.estado === 'CANCELADO') {
      throw new BadRequestException(
        'No puedes registrar tratamientos en un caso clínico cancelado',
      );
    }

    return caso;
  }
}
