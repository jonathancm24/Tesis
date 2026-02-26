import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/../prisma/prisma.service'
import { SaveOdontogramaDto } from './dto'

@Injectable()
export class OdontogramaService {
  constructor(private readonly prisma: PrismaService) {}

  async save(dto: SaveOdontogramaDto) {
    await this.ensureCaso(dto.casoClinicoId)
    await this.ensureUsuario(dto.estudianteId, 'Estudiante')

    if (dto.docenteId) {
      await this.ensureUsuario(dto.docenteId, 'Docente')
    }

    const dientesNormalizados = (dto.dientes || [])
      .map((item) => ({
        diente: String(item.diente || '').trim(),
        caras: (item.caras || [])
          .map((cara) => ({
            cara: String(cara.cara || '').trim().toUpperCase(),
            observacion: cara.observacion?.trim() || null,
            condicion: cara.condicion?.trim() || null
          }))
          .filter((cara) => cara.cara.length > 0)
      }))
      .filter((item) => item.diente.length > 0 && item.caras.length > 0)

    if (dientesNormalizados.length === 0 && !dto.observacionGeneral?.trim()) {
      throw new BadRequestException('Debe enviar al menos una cara dental u observación general')
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.odontograma.deleteMany({
        where: {
          casoClinicoId: dto.casoClinicoId,
          estudianteId: dto.estudianteId
        }
      })

      for (const item of dientesNormalizados) {
        await tx.odontograma.create({
          data: {
            casoClinicoId: dto.casoClinicoId,
            estudianteId: dto.estudianteId,
            docenteId: dto.docenteId ?? null,
            diente: item.diente,
            conclusion: dto.conclusion?.trim() || null,
            condicion: {
              caras: item.caras
            }
          }
        })
      }

      const observacionGeneral = dto.observacionGeneral?.trim()
      await tx.observacion.deleteMany({
        where: {
          casoClinicoId: dto.casoClinicoId,
          estudianteId: dto.estudianteId,
          titulo: 'Observación general odontograma'
        }
      })

      if (observacionGeneral) {
        await tx.observacion.create({
          data: {
            titulo: 'Observación general odontograma',
            descripcion: observacionGeneral,
            contenidoEstudiante: observacionGeneral,
            estudianteId: dto.estudianteId,
            docenteId: dto.docenteId ?? null,
            casoClinicoId: dto.casoClinicoId,
            estado: 'PENDIENTE'
          }
        })
      }
    })

    return this.findByCaso(dto.casoClinicoId)
  }

  async findByCaso(casoClinicoId: number) {
    await this.ensureCaso(casoClinicoId)

    const registros = await this.prisma.odontograma.findMany({
      where: { casoClinicoId },
      orderBy: [{ diente: 'asc' }, { id: 'asc' }]
    })

    const observacionGeneral = await this.prisma.observacion.findFirst({
      where: {
        casoClinicoId,
        titulo: 'Observación general odontograma'
      },
      orderBy: {
        fecha: 'desc'
      },
      select: {
        id: true,
        descripcion: true,
        contenidoEstudiante: true,
        contenidoDocente: true,
        fecha: true,
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    })

    return {
      casoClinicoId,
      registros,
      observacionGeneral: observacionGeneral
        ? {
            id: observacionGeneral.id,
            descripcion: observacionGeneral.descripcion,
            contenidoEstudiante: observacionGeneral.contenidoEstudiante,
            contenidoDocente: observacionGeneral.contenidoDocente,
            fecha: observacionGeneral.fecha,
            docente: observacionGeneral.docente
          }
        : null
    }
  }

  private async ensureCaso(id: number) {
    const caso = await this.prisma.casoClinico.findUnique({ where: { id } })
    if (!caso) {
      throw new NotFoundException(`Caso clínico con ID ${id} no encontrado`)
    }
  }

  private async ensureUsuario(id: number, etiqueta: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } })
    if (!usuario) {
      throw new NotFoundException(`${etiqueta} con ID ${id} no encontrado`)
    }
  }
}
