import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/../prisma/prisma.service'
import { CreateCasoClinicoDto, UpdateEstadoCasoDto, CreateObservacionDto } from './dto'

@Injectable()
export class CasosClinicosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCasoClinicoDto) {
    await this.ensurePaciente(dto.pacienteId)
    await this.ensureUsuario(dto.profesorId, 'Profesor')
    await this.ensureUsuario(dto.estudianteId, 'Estudiante')
    await this.ensureEspecialidad(dto.especialidadId)

    return this.prisma.$transaction(async (tx) => {
      const caso = await tx.casoClinico.create({
        data: {
          pacienteId: dto.pacienteId,
          profesorId: dto.profesorId,
          estudianteId: dto.estudianteId,
          especialidadId: dto.especialidadId,
          ATM: dto.ATM,
          CarayCuello: dto.CarayCuello,
          PielyMucosa: dto.PielyMucosa,
          craneo: dto.craneo,
          enfermedadActual: dto.enfermedadActual,
          facies: dto.facies,
          marcha: dto.marcha,
          motivoConsulta: dto.motivoConsulta,
          peso: dto.peso,
          talla: dto.talla
        },
        include: {
          paciente: { select: { id: true, nombre: true, apellido: true } },
          profesor: { select: { id: true, nombre: true, apellido: true } },
          estudiante: { select: { id: true, nombre: true, apellido: true } },
          especialidad: { select: { id: true, nombre: true } }
        }
      })

      if (dto.respuestas && dto.respuestas.length > 0) {
        await tx.respuestaClinica.createMany({
          data: dto.respuestas.map((resp) => ({
            casoClinicoId: caso.id,
            preguntaId: resp.preguntaId,
            respuesta: resp.respuesta
          }))
        })
      }

      return caso
    })
  }

  async findOne(id: number) {
    const caso = await this.prisma.casoClinico.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            fechaNacimiento: true,
            genero: true,
            numeroDocumento: true,
            tipoDocumento: true
          }
        },
        profesor: { select: { id: true, nombre: true, apellido: true, email: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true, email: true, telefono: true } },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: {
          include: {
            docente: { select: { id: true, nombre: true, apellido: true } }
          },
          orderBy: { fecha: 'desc' }
        },
        RespuestaClinica: {
          include: {
            pregunta: true
          }
        }
      }
    })

    if (!caso) {
      throw new NotFoundException(`Caso clinico con ID ${id} no encontrado`)
    }

    return caso
  }

  async findAll(pacienteId?: number) {
    return this.prisma.casoClinico.findMany({
      where: pacienteId ? { pacienteId } : undefined,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true } },
        especialidad: { select: { id: true, nombre: true } }
      }
    })
  }

  async findByProfesor(profesorId: number, estado?: string) {
    const where: any = { profesorId }
    
    if (estado) {
      where.estado = estado
    }

    return this.prisma.casoClinico.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
            tipoDocumento: true
          }
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: {
          select: { id: true },
        }
      }
    })
  }

  async findByEstudiante(estudianteId: number, estado?: string) {
    const where: any = { estudianteId }

    if (estado) {
      where.estado = estado
    }

    return this.prisma.casoClinico.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
            tipoDocumento: true
          }
        },
        profesor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: {
          select: { id: true }
        },
        tratamientos: {
          select: { id: true }
        },
        prescripciones: {
          select: { id: true }
        }
      }
    })
  }

  async updateEstado(id: number, dto: UpdateEstadoCasoDto) {
    const caso = await this.prisma.casoClinico.findUnique({ where: { id } })
    
    if (!caso) {
      throw new NotFoundException(`Caso clinico con ID ${id} no encontrado`)
    }

    return this.prisma.casoClinico.update({
      where: { id },
      data: {
        estado: dto.estado as any,
        ...(dto.calificacion !== undefined && { calificacion: dto.calificacion })
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true } },
        especialidad: { select: { id: true, nombre: true } }
      }
    })
  }

  async createObservacion(dto: CreateObservacionDto) {
    // Verificar que el caso exista
    const caso = await this.prisma.casoClinico.findUnique({
      where: { id: dto.casoClinicoId }
    })

    if (!caso) {
      throw new NotFoundException(`Caso clinico con ID ${dto.casoClinicoId} no encontrado`)
    }

    // Verificar que el docente exista
    await this.ensureUsuario(dto.docenteId, 'Docente')

    return this.prisma.observacion.create({
      data: {
        titulo: 'Observación del docente',
        descripcion: dto.contenido,
        contenidoDocente: dto.contenido,
        estudianteId: caso.estudianteId,
        docenteId: dto.docenteId,
        casoClinicoId: dto.casoClinicoId,
        estado: 'PENDIENTE'
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true
          }
        }
      }
    })
  }

  private async ensurePaciente(id: number) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } })
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`)
    }
  }

  private async ensureUsuario(id: number, etiqueta: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } })
    if (!usuario) {
      throw new NotFoundException(`${etiqueta} con ID ${id} no encontrado`)
    }
  }

  private async ensureEspecialidad(id: number) {
    const especialidad = await this.prisma.especialidad.findUnique({ where: { id } })
    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`)
    }
  }
}
