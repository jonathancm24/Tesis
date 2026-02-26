import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { EstadoCita } from '@prisma/client';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  private combinarFechaYHora(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora}:00`);
  }

  async create(createCitaDto: CreateCitaDto) {
    // Validar paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: createCitaDto.pacienteId },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${createCitaDto.pacienteId} no encontrado`);
    }

    // Validar especialidad
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id: createCitaDto.especialidadId },
    });
    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${createCitaDto.especialidadId} no encontrada`);
    }

    // Validar estudiante
    const estudiante = await this.prisma.usuario.findUnique({
      where: { id: createCitaDto.estudianteId },
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${createCitaDto.estudianteId} no encontrado`);
    }

    // Validar docente si se proporciona
    if (createCitaDto.docenteId) {
      const docente = await this.prisma.usuario.findUnique({
        where: { id: createCitaDto.docenteId },
      });
      if (!docente) {
        throw new NotFoundException(`Docente con ID ${createCitaDto.docenteId} no encontrado`);
      }
    }

    // Validar que hora fin sea después de hora inicio
    if (createCitaDto.horainicio >= createCitaDto.horafin) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }

    const horaInicio = this.combinarFechaYHora(createCitaDto.fecha, createCitaDto.horainicio);
    const horaFin = this.combinarFechaYHora(createCitaDto.fecha, createCitaDto.horafin);

    // Crear la cita
    const cita = await this.prisma.cita.create({
      data: {
        fecha: new Date(createCitaDto.fecha),
        horainicio: horaInicio,
        horafin: horaFin,
        estado: EstadoCita.RESERVADA,
        observaciones: createCitaDto.observaciones,
        pacienteId: createCitaDto.pacienteId,
        especialidadId: createCitaDto.especialidadId,
        estudianteId: createCitaDto.estudianteId,
        docenteId: createCitaDto.docenteId,
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
          },
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return cita;
  }

  async findAll(pacienteId?: number, estudianteId?: number) {
    const where: any = {};
    
    if (pacienteId) {
      where.pacienteId = pacienteId;
    }
    
    if (estudianteId) {
      where.estudianteId = estudianteId;
    }

    const citas = await this.prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
          },
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [
        { fecha: 'desc' },
        { horainicio: 'desc' },
      ],
    });

    return citas;
  }

  async findOne(id: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
            telefono: true,
            email: true,
          },
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!cita) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    return cita;
  }

  async update(id: number, updateCitaDto: UpdateCitaDto) {
    // Verificar que existe
    const citaExistente = await this.findOne(id);

    // Validar horarios si se actualizan
    if (updateCitaDto.horainicio && updateCitaDto.horafin) {
      if (updateCitaDto.horainicio >= updateCitaDto.horafin) {
        throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
      }
    }

    const fechaBase = updateCitaDto.fecha
      ? updateCitaDto.fecha
      : citaExistente.fecha.toISOString().split('T')[0];

    const citaActualizada = await this.prisma.cita.update({
      where: { id },
      data: {
        ...(updateCitaDto.fecha && { fecha: new Date(updateCitaDto.fecha) }),
        ...(updateCitaDto.horainicio && {
          horainicio: this.combinarFechaYHora(fechaBase, updateCitaDto.horainicio),
        }),
        ...(updateCitaDto.horafin && {
          horafin: this.combinarFechaYHora(fechaBase, updateCitaDto.horafin),
        }),
        ...(updateCitaDto.estado && { estado: updateCitaDto.estado }),
        ...(updateCitaDto.observaciones !== undefined && { observaciones: updateCitaDto.observaciones }),
      },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numeroDocumento: true,
          },
        },
        especialidad: {
          select: {
            id: true,
            nombre: true,
          },
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return citaActualizada;
  }

  async cancelar(id: number) {
    return this.update(id, { estado: EstadoCita.CANCELADA });
  }
}
