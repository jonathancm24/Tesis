import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { EstadoCita } from '@prisma/client';
import { RoleEnum } from '../../common/enums/roles.enum';

interface AuthenticatedUser {
  id: number;
  role: { nombre: RoleEnum };
}

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService) {}

  private combinarFechaYHora(fecha: string, hora: string): Date {
    return new Date(`${fecha}T${hora}:00`);
  }

  async create(createCitaDto: CreateCitaDto, requester: AuthenticatedUser) {
    // Validar paciente
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: createCitaDto.pacienteId },
      select: { id: true, activo: true },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${createCitaDto.pacienteId} no encontrado`);
    }
    if (!paciente.activo) {
      throw new BadRequestException('El paciente seleccionado está inactivo');
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
      include: { role: true },
    });
    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${createCitaDto.estudianteId} no encontrado`);
    }
    if (estudiante.role.nombre !== RoleEnum.ESTUDIANTE) {
      throw new BadRequestException('La persona asignada no tiene rol de estudiante');
    }
    if (!estudiante.activo) {
      throw new BadRequestException('El estudiante seleccionado está inactivo');
    }

    if (requester.role.nombre === RoleEnum.ESTUDIANTE) {
      if (createCitaDto.estudianteId !== requester.id) {
        throw new ForbiddenException('No puede crear citas para otro estudiante');
      }
    }

    const effectiveDocenteId =
      requester.role.nombre === RoleEnum.PROFESOR
        ? requester.id
        : createCitaDto.docenteId;

    // Validar docente si se proporciona y el actor no sustituye automáticamente su asignación
    if (effectiveDocenteId) {
      const docente = await this.prisma.usuario.findUnique({
        where: { id: effectiveDocenteId },
        include: { role: true },
      });
      if (!docente) {
        throw new NotFoundException(`Docente con ID ${effectiveDocenteId} no encontrado`);
      }
      if (!docente.activo) {
        throw new BadRequestException('El docente seleccionado está inactivo');
      }
      if (docente.role.nombre !== RoleEnum.PROFESOR) {
        throw new BadRequestException('La persona asignada no tiene rol de profesor');
      }
    }

    // Validar que hora fin sea después de hora inicio
    if (createCitaDto.horainicio >= createCitaDto.horafin) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }

    const horaInicio = this.combinarFechaYHora(createCitaDto.fecha, createCitaDto.horainicio);
    const horaFin = this.combinarFechaYHora(createCitaDto.fecha, createCitaDto.horafin);
    await this.ensureSinChoque({
      estudianteId: createCitaDto.estudianteId,
      docenteId: effectiveDocenteId,
      horaInicio,
      horaFin,
    });

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
        docenteId: effectiveDocenteId,
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

  async findAll(
    pacienteId?: number,
    estudianteId?: number,
    requester?: AuthenticatedUser,
  ) {
    const where: any = {};
    
    if (pacienteId) {
      where.pacienteId = pacienteId;
    }
    
    if (requester?.role.nombre === RoleEnum.ESTUDIANTE) {
      where.estudianteId = requester.id;
    } else if (estudianteId) {
      where.estudianteId = estudianteId;
    }
    if (requester?.role.nombre === RoleEnum.PROFESOR) {
      where.docenteId = requester.id;
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

  async findOne(id: number, requester?: AuthenticatedUser) {
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
    this.assertCanAccess(cita, requester);

    return cita;
  }

  async update(
    id: number,
    updateCitaDto: UpdateCitaDto,
    requester?: AuthenticatedUser,
  ) {
    // Verificar que existe
    const citaExistente = await this.findOne(id, requester);

    const fechaBase = updateCitaDto.fecha
      ? updateCitaDto.fecha
      : citaExistente.fecha.toISOString().split('T')[0];
    const horaInicio = updateCitaDto.horainicio
      ? this.combinarFechaYHora(fechaBase, updateCitaDto.horainicio)
      : citaExistente.horainicio;
    const horaFin = updateCitaDto.horafin
      ? this.combinarFechaYHora(fechaBase, updateCitaDto.horafin)
      : citaExistente.horafin;

    if (horaInicio >= horaFin) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }

    if (updateCitaDto.fecha || updateCitaDto.horainicio || updateCitaDto.horafin) {
      await this.ensureSinChoque({
        estudianteId: citaExistente.estudianteId,
        docenteId: citaExistente.docenteId,
        horaInicio,
        horaFin,
        excludeId: id,
      });
    }

    const citaActualizada = await this.prisma.cita.update({
      where: { id },
      data: {
        ...(updateCitaDto.fecha && { fecha: new Date(updateCitaDto.fecha) }),
        ...(updateCitaDto.horainicio && {
          horainicio: horaInicio,
        }),
        ...(updateCitaDto.horafin && {
          horafin: horaFin,
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

  async cancelar(id: number, requester?: AuthenticatedUser) {
    return this.update(id, { estado: EstadoCita.CANCELADA }, requester);
  }

  private async ensureSinChoque({
    estudianteId,
    docenteId,
    horaInicio,
    horaFin,
    excludeId,
  }: {
    estudianteId: number;
    docenteId: number | null | undefined;
    horaInicio: Date;
    horaFin: Date;
    excludeId?: number;
  }) {
    const condiciones = [
      { estudianteId },
      ...(docenteId ? [{ docenteId }] : []),
    ];

    const choque = await this.prisma.cita.findFirst({
      where: {
        ...(excludeId ? { id: { not: excludeId } } : {}),
        estado: { not: EstadoCita.CANCELADA },
        OR: condiciones,
        AND: [
          { horainicio: { lt: horaFin } },
          { horafin: { gt: horaInicio } },
        ],
      },
      select: { id: true },
    });

    if (choque) {
      throw new ConflictException(
        'Ya existe una cita que se solapa con el horario seleccionado',
      );
    }
  }

  private assertCanAccess(
    cita: { estudianteId: number; docenteId: number | null },
    requester?: AuthenticatedUser,
  ) {
    if (!requester) return;
    if (requester.role.nombre === RoleEnum.ADMIN) return;
    if (
      requester.role.nombre === RoleEnum.PROFESOR &&
      cita.docenteId === requester.id
    ) return;
    if (
      requester.role.nombre === RoleEnum.ESTUDIANTE &&
      cita.estudianteId === requester.id
    ) return;
    throw new ForbiddenException('No tiene acceso a esta cita');
  }
}
