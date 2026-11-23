import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCasoClinico } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoleEnum } from '../../common/enums/roles.enum';
import { CreateCasoClinicoDto, UpdateEstadoCasoDto, CreateObservacionDto } from './dto';

interface AuthenticatedUser {
  id: number;
  role: { nombre: RoleEnum };
}

@Injectable()
export class CasosClinicosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCasoClinicoDto, requester: AuthenticatedUser) {
    const estudianteId = requester.role.nombre === RoleEnum.ESTUDIANTE
      ? requester.id
      : dto.estudianteId;

    await this.ensurePaciente(dto.pacienteId);
    await this.ensureUsuarioConRol(dto.profesorId, RoleEnum.PROFESOR, 'Profesor');
    await this.ensureUsuarioConRol(estudianteId, RoleEnum.ESTUDIANTE, 'Estudiante');
    await this.ensureEspecialidad(dto.especialidadId);

    const asignacionEspecialidad = await this.prisma.usuarioEspecialidad.findFirst({
      where: { usuarioId: dto.profesorId, especialidadId: dto.especialidadId },
      select: { id: true },
    });
    if (!asignacionEspecialidad) {
      throw new ForbiddenException('El profesor no tiene asignada la especialidad del caso');
    }

    return this.prisma.$transaction(async (tx) => {
      const caso = await tx.casoClinico.create({
        data: {
          pacienteId: dto.pacienteId,
          profesorId: dto.profesorId,
          estudianteId,
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
          talla: dto.talla,
        },
        include: {
          paciente: { select: { id: true, nombre: true, apellido: true } },
          profesor: { select: { id: true, nombre: true, apellido: true } },
          estudiante: { select: { id: true, nombre: true, apellido: true } },
          especialidad: { select: { id: true, nombre: true } },
        },
      });

      if (dto.respuestas?.length) {
        await tx.respuestaClinica.createMany({
          data: dto.respuestas.map((respuesta) => ({
            casoClinicoId: caso.id,
            preguntaId: respuesta.preguntaId,
            respuesta: respuesta.respuesta,
          })),
        });
      }

      return caso;
    });
  }

  async findOne(id: number, requester: AuthenticatedUser) {
    const caso = await this.getCasoOrFail(id);
    this.assertCanAccess(caso, requester);
    return this.prisma.casoClinico.findUnique({
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
            tipoDocumento: true,
          },
        },
        profesor: { select: { id: true, nombre: true, apellido: true, email: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true, email: true, telefono: true } },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: {
          include: { docente: { select: { id: true, nombre: true, apellido: true } } },
          orderBy: { fecha: 'desc' },
        },
        RespuestaClinica: { include: { pregunta: true } },
      },
    });
  }

  async findAll(pacienteId: number | undefined, requester: AuthenticatedUser) {
    const where: Record<string, unknown> = {};
    if (pacienteId !== undefined) where.pacienteId = pacienteId;
    if (requester.role.nombre === RoleEnum.PROFESOR) where.profesorId = requester.id;
    if (requester.role.nombre === RoleEnum.ESTUDIANTE) where.estudianteId = requester.id;

    return this.prisma.casoClinico.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true } },
        especialidad: { select: { id: true, nombre: true } },
      },
    });
  }

  async findByProfesor(profesorId: number, estado: string | undefined, requester: AuthenticatedUser) {
    const effectiveProfesorId = requester.role.nombre === RoleEnum.PROFESOR
      ? requester.id
      : profesorId;
    const where: Record<string, unknown> = { profesorId: effectiveProfesorId };
    if (estado) where.estado = estado;

    return this.prisma.casoClinico.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true, numeroDocumento: true, tipoDocumento: true },
        },
        estudiante: { select: { id: true, nombre: true, apellido: true, email: true } },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: { select: { id: true } },
      },
    });
  }

  async findByEstudiante(estudianteId: number, estado: string | undefined, requester: AuthenticatedUser) {
    const where: Record<string, unknown> = {};
    if (requester.role.nombre === RoleEnum.ESTUDIANTE) {
      where.estudianteId = requester.id;
    } else {
      where.estudianteId = estudianteId;
    }
    if (requester.role.nombre === RoleEnum.PROFESOR) where.profesorId = requester.id;
    if (estado) where.estado = estado;

    return this.prisma.casoClinico.findMany({
      where,
      orderBy: { fechaCreacion: 'desc' },
      include: {
        paciente: {
          select: { id: true, nombre: true, apellido: true, numeroDocumento: true, tipoDocumento: true },
        },
        profesor: { select: { id: true, nombre: true, apellido: true, email: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true, email: true } },
        especialidad: { select: { id: true, nombre: true } },
        observaciones: { select: { id: true } },
        tratamientos: { select: { id: true } },
        prescripciones: { select: { id: true } },
      },
    });
  }

  async updateEstado(id: number, dto: UpdateEstadoCasoDto, requester: AuthenticatedUser) {
    const caso = await this.getCasoOrFail(id);
    const role = requester.role.nombre;

    if (role === RoleEnum.ADMIN) {
      // El administrador conserva la gestión completa de estados.
    } else if (role === RoleEnum.PROFESOR) {
      this.assertCanReview(caso, requester);
      if (
        dto.estado !== EstadoCasoClinico.APROBADO &&
        dto.estado !== EstadoCasoClinico.RECHAZADO
      ) {
        throw new ForbiddenException('El profesor solo puede aprobar o rechazar casos asignados');
      }
      if (caso.estado !== EstadoCasoClinico.EN_REVISION) {
        throw new BadRequestException('Solo se pueden revisar casos que estén en revisión');
      }
    } else if (role === RoleEnum.ESTUDIANTE) {
      if (caso.estudianteId !== requester.id) {
        throw new ForbiddenException('Solo puede finalizar sus propios casos clínicos');
      }
      if (dto.estado !== EstadoCasoClinico.FINALIZADO) {
        throw new ForbiddenException('El estudiante solo puede finalizar casos en tratamiento');
      }
      if (dto.calificacion !== undefined) {
        throw new ForbiddenException('El estudiante no puede asignar calificaciones');
      }
      if (
        caso.estado !== EstadoCasoClinico.EN_TRATAMIENTO &&
        caso.estado !== EstadoCasoClinico.APROBADO
      ) {
        throw new BadRequestException('El caso no está en una etapa que permita finalizar el tratamiento');
      }
      const cantidadTratamientos = await this.prisma.tratamiento.count({
        where: { casoClinicoId: id },
      });
      if (cantidadTratamientos === 0) {
        throw new BadRequestException('No se puede finalizar un caso sin tratamientos registrados');
      }
    } else {
      throw new ForbiddenException('No tiene permisos para cambiar el estado del caso');
    }

    return this.prisma.casoClinico.update({
      where: { id },
      data: {
        estado: dto.estado,
        ...(dto.calificacion !== undefined && { calificacion: dto.calificacion }),
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellido: true } },
        profesor: { select: { id: true, nombre: true, apellido: true } },
        estudiante: { select: { id: true, nombre: true, apellido: true } },
        especialidad: { select: { id: true, nombre: true } },
      },
    });
  }

  async createObservacion(dto: CreateObservacionDto, requester: AuthenticatedUser) {
    const caso = await this.getCasoOrFail(dto.casoClinicoId);
    if (requester.role.nombre !== RoleEnum.PROFESOR) {
      throw new ForbiddenException('Solo un profesor puede registrar observaciones');
    }
    if (caso.profesorId !== requester.id) {
      throw new ForbiddenException('Solo el profesor asignado puede registrar observaciones');
    }

    return this.prisma.observacion.create({
      data: {
        titulo: 'Observación del docente',
        descripcion: dto.contenido,
        contenidoDocente: dto.contenido,
        estudianteId: caso.estudianteId,
        docenteId: requester.id,
        casoClinicoId: caso.id,
        estado: 'PENDIENTE',
      },
      include: {
        docente: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  private async getCasoOrFail(id: number) {
    const caso = await this.prisma.casoClinico.findUnique({ where: { id } });
    if (!caso) throw new NotFoundException(`Caso clínico con ID ${id} no encontrado`);
    return caso;
  }

  private assertCanAccess(caso: { estudianteId: number; profesorId: number }, requester: AuthenticatedUser) {
    if (requester.role.nombre === RoleEnum.ADMIN) return;
    if (requester.role.nombre === RoleEnum.PROFESOR && caso.profesorId === requester.id) return;
    if (requester.role.nombre === RoleEnum.ESTUDIANTE && caso.estudianteId === requester.id) return;
    throw new ForbiddenException('No tiene acceso a este caso clínico');
  }

  private assertCanReview(caso: { profesorId: number }, requester: AuthenticatedUser) {
    if (requester.role.nombre === RoleEnum.ADMIN) return;
    if (requester.role.nombre === RoleEnum.PROFESOR && caso.profesorId === requester.id) return;
    throw new ForbiddenException('Solo el profesor asignado puede revisar este caso clínico');
  }

  private async ensurePaciente(id: number) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
      select: { id: true, activo: true },
    });
    if (!paciente) throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    if (paciente.activo === false) throw new ForbiddenException('El paciente seleccionado está inactivo');
  }

  private async ensureUsuarioConRol(id: number, rol: RoleEnum, etiqueta: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, activo: true, role: { select: { nombre: true } } },
    });
    if (!usuario) throw new NotFoundException(`${etiqueta} con ID ${id} no encontrado`);
    if (usuario.activo === false) throw new ForbiddenException(`${etiqueta} inactivo no puede asignarse al caso`);
    if (usuario.role.nombre !== rol) {
      throw new ForbiddenException(`El usuario indicado no tiene rol de ${etiqueta}`);
    }
  }

  private async ensureEspecialidad(id: number) {
    const especialidad = await this.prisma.especialidad.findUnique({ where: { id }, select: { id: true } });
    if (!especialidad) throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
  }
}
