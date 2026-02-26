import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/../prisma/prisma.service'
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto'

@Injectable()
export class PreguntasClinicasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePreguntaDto) {
    if (dto.especialidadId) {
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id: dto.especialidadId }
      })
      if (!especialidad) {
        throw new NotFoundException('Especialidad no encontrada')
      }
    }

    return this.prisma.preguntaClinica.create({
      data: {
        texto: dto.texto,
        tipo: dto.tipo,
        obligatoria: dto.obligatoria,
        especialidadId: dto.especialidadId || null
      },
      include: {
        especialidad: true
      }
    })
  }

  async findAll(filters?: { especialidadId?: number; tipo?: string }) {
    const where: any = {}

    if (filters?.especialidadId) {
      where.especialidadId = filters.especialidadId
    }

    if (filters?.tipo) {
      where.tipo = filters.tipo
    }

    return this.prisma.preguntaClinica.findMany({
      where,
      include: {
        especialidad: true
      },
      orderBy: {
        id: 'desc'
      }
    })
  }

  async findOne(id: number) {
    const pregunta = await this.prisma.preguntaClinica.findUnique({
      where: { id },
      include: {
        especialidad: true
      }
    })

    if (!pregunta) {
      throw new NotFoundException('Pregunta no encontrada')
    }

    return pregunta
  }

  async update(id: number, dto: UpdatePreguntaDto) {
    await this.findOne(id)

    if (dto.especialidadId) {
      const especialidad = await this.prisma.especialidad.findUnique({
        where: { id: dto.especialidadId }
      })
      if (!especialidad) {
        throw new NotFoundException('Especialidad no encontrada')
      }
    }

    return this.prisma.preguntaClinica.update({
      where: { id },
      data: {
        texto: dto.texto,
        tipo: dto.tipo,
        obligatoria: dto.obligatoria,
        especialidadId: dto.especialidadId
      },
      include: {
        especialidad: true
      }
    })
  }

  async remove(id: number) {
    await this.findOne(id)

    return this.prisma.preguntaClinica.delete({
      where: { id }
    })
  }
}
