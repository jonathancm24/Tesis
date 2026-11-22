import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/../prisma/prisma.service'
import { SaveOdontogramaDto } from './dto'

@Injectable()
export class OdontogramaService {
  constructor(private readonly prisma: PrismaService) {}

  async save(dto: SaveOdontogramaDto) {
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

    const dientesRecibidos = new Set(dientesNormalizados.map(({ diente }) => diente))
    if (dientesRecibidos.size !== dientesNormalizados.length ||
        dientesNormalizados.some(({ caras }) => new Set(caras.map(({ cara }) => cara)).size !== caras.length)) {
      throw new BadRequestException('El odontograma contiene piezas o caras repetidas')
    }

    return this.prisma.$transaction(async (tx) => {
      // Serializa los guardados del caso aunque las filas dentales aún no existan.
      const casos = await tx.$queryRaw<Array<{ id: number }>>`
        SELECT id FROM "CasosClinicos" WHERE id = ${dto.casoClinicoId} FOR UPDATE
      `
      if (!casos.length) {
        throw new NotFoundException(`Caso clínico con ID ${dto.casoClinicoId} no encontrado`)
      }

      const alcance = { casoClinicoId: dto.casoClinicoId, estudianteId: dto.estudianteId }
      const registros = await tx.odontograma.findMany({
        where: alcance,
        select: { id: true, diente: true },
      })
      const idsPorDiente = new Map(registros.map(({ id, diente }) => [diente.trim(), id]))
      if (idsPorDiente.size !== registros.length) {
        throw new ConflictException('El odontograma contiene piezas duplicadas en el historial')
      }
      if (registros.some(({ diente }) => !dientesRecibidos.has(diente.trim()))) {
        throw new ConflictException('El guardado no puede omitir piezas previamente registradas')
      }

      const conclusion = dto.conclusion?.trim() || null
      for (const { diente, caras } of dientesNormalizados) {
        const id = idsPorDiente.get(diente)
        const condicion = { caras }
        if (id !== undefined) {
          await tx.odontograma.update({
            where: { id },
            data: {
              condicion,
              ...(dto.conclusion !== undefined && { conclusion }),
              ...(dto.docenteId !== undefined && { docenteId: dto.docenteId }),
            },
          })
        } else {
          await tx.odontograma.create({
            data: { ...alcance, diente, condicion, conclusion, docenteId: dto.docenteId ?? null },
          })
        }
      }

      const observacionGeneral = dto.observacionGeneral?.trim()
      if (observacionGeneral) {
        const titulo = 'Observación general odontograma'
        const notas = await tx.observacion.findMany({
          where: { ...alcance, titulo },
          select: { id: true },
        })
        if (notas.length > 1) {
          throw new ConflictException('El odontograma contiene observaciones generales duplicadas en el historial')
        }
        const nota = { descripcion: observacionGeneral, contenidoEstudiante: observacionGeneral }
        if (notas[0]) {
          await tx.observacion.update({ where: { id: notas[0].id }, data: nota })
        } else {
          await tx.observacion.create({
            data: { ...alcance, ...nota, titulo, docenteId: dto.docenteId ?? null, estado: 'PENDIENTE' },
          })
        }
      }

      return this.leerPorCaso(tx, dto.casoClinicoId)
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })
  }

  async findByCaso(casoClinicoId: number) {
    await this.ensureCaso(casoClinicoId)
    return this.leerPorCaso(this.prisma, casoClinicoId)
  }

  private async leerPorCaso(prisma: Prisma.TransactionClient, casoClinicoId: number) {
    const registros = await prisma.odontograma.findMany({
      where: { casoClinicoId },
      orderBy: [{ diente: 'asc' }, { id: 'asc' }]
    })

    const observacionGeneral = await prisma.observacion.findFirst({
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
