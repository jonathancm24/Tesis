import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePrescripcionDto } from './dto';

@Injectable()
export class PrescripcionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listByCaso(casoClinicoId: number, actorId: number) {
    await this.ensureCasoDisponibleParaEstudiante(casoClinicoId, actorId, false);

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

  async createForCaso(casoClinicoId: number, actorId: number, dto: CreatePrescripcionDto) {
    const caso = await this.ensureCasoDisponibleParaEstudiante(casoClinicoId, actorId, true);

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

  private async ensureCasoDisponibleParaEstudiante(
    casoClinicoId: number,
    actorId: number,
    rejectIfRejected: boolean,
  ) {
    const caso = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId },
      select: {
        id: true,
        estudianteId: true,
        estado: true,
      },
    });

    if (!caso) {
      throw new NotFoundException(`Caso clínico con ID ${casoClinicoId} no encontrado`);
    }

    if (caso.estudianteId !== actorId) {
      throw new ForbiddenException('No tienes permisos para operar sobre este caso clínico');
    }

    if (rejectIfRejected && caso.estado === 'CANCELADO') {
      throw new BadRequestException(
        'No puedes registrar prescripciones en un caso clínico rechazado',
      );
    }

    return caso;
  }
}
