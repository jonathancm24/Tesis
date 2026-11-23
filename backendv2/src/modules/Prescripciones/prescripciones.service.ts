import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePrescripcionDto } from './dto';
import { RoleEnum } from '../../common/enums/roles.enum';

interface AuthenticatedUser {
  id: number;
  role: { nombre: RoleEnum };
}

@Injectable()
export class PrescripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByCaso(casoClinicoId: number, actor: AuthenticatedUser) {
    await this.ensureCasoDisponible(casoClinicoId, actor, false);

    return this.prisma.prescripcion.findMany({
      where: { casoClinicoId },
      orderBy: { fechaCreacion: 'desc' },
      include: {
        observaciones: {
          orderBy: { fecha: 'desc' },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            fecha: true,
            estado: true,
          },
        },
      },
    });
  }

  async createForCaso(
    casoClinicoId: number,
    actor: AuthenticatedUser,
    dto: CreatePrescripcionDto,
  ) {
    const caso = await this.ensureCasoDisponible(casoClinicoId, actor, true);

    const prescripcion = await this.prisma.prescripcion.create({
      data: {
        casoClinicoId,
        medicamento: dto.medicamento.trim(),
        dosis: dto.dosis.trim(),
        frecuencia: dto.frecuencia.trim(),
        duracion: dto.duracion.trim(),
        concentracion: dto.concentracion.trim(),
        Nrodefarmacos: dto.Nrodefarmacos,
        presentacion: dto.presentacion.trim(),
        viadeadministracion: dto.viadeadministracion.trim(),
        estado: 'PENDIENTE',
      },
    });

    if (caso.estado === 'EN_REVISION') {
      await this.prisma.casoClinico.update({
        where: { id: casoClinicoId },
        data: { estado: 'EN_TRATAMIENTO' },
      });
    }

    return prescripcion;
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
        'No puedes registrar prescripciones en un caso clínico cancelado',
      );
    }

    return caso;
  }
}
