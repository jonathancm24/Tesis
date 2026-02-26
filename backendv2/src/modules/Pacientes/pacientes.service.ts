import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/../prisma/prisma.service';
import {
  CreatePacienteDto,
  UpdatePacienteDto,
  PacienteResponseDto,
  PacientesPaginatedResponseDto,
} from './dto';

interface PacienteFiltersDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  activo?: boolean;
  parroquiaId?: number;
  tipoDocumento?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Servicio para manejar operaciones CRUD de pacientes.
 */
@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parsear una fecha en formato YYYY-MM-DD sin problema de timezone
   */
  private parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Crear un nuevo paciente
   */
  async create(createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    await this.validateUniqueEmail(createPacienteDto.email);
    await this.validateUniqueDocument(
      createPacienteDto.tipoDocumento,
      createPacienteDto.numeroDocumento,
    );
    await this.validateParroquiaExists(createPacienteDto.parroquiaId);

    const paciente = await this.prisma.paciente.create({
      data: {
        nombre: createPacienteDto.nombre,
        apellido: createPacienteDto.apellido,
        email: createPacienteDto.email || null,
        fechaNacimiento: this.parseDateString(createPacienteDto.fechaNacimiento),
        telefono: createPacienteDto.telefono || null,
        direccion: createPacienteDto.direccion || null,
        genero: createPacienteDto.genero || null,
        Nacionalidad: createPacienteDto.Nacionalidad || null,
        parroquiaId: createPacienteDto.parroquiaId,
        tipoDocumento: createPacienteDto.tipoDocumento,
        numeroDocumento: createPacienteDto.numeroDocumento,
        EmpresaLaboral: createPacienteDto.EmpresaLaboral || null,
        estadoCivil: createPacienteDto.estadoCivil || null,
        ocupacion: createPacienteDto.ocupacion || null,
        relacionRep: createPacienteDto.relacionRep || null,
        representante: createPacienteDto.representante || null,
        telefonoRep: createPacienteDto.telefonoRep || null,
        numero_documento_rep: createPacienteDto.numero_documento_rep || null,
        tipoDocumentoRep: createPacienteDto.tipoDocumentoRep || null,
        activo: true,
      },
      include: {
        parroquia: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return this.transformToResponseDto(paciente);
  }

  /**
   * Obtener todos los pacientes con filtros y paginación
   */
  async findAll(filters: PacienteFiltersDto = {}): Promise<PacientesPaginatedResponseDto> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'fechaRegistro',
      orderDirection = 'desc',
    } = filters;

    const where = this.buildWhereConditions(filters);

    const [pacientes, total] = await Promise.all([
      this.prisma.paciente.findMany({
        where,
        include: {
          parroquia: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.paciente.count({ where }),
    ]);

    const pacientesResponse = pacientes.map(p => this.transformToResponseDto(p));
    return new PacientesPaginatedResponseDto(pacientesResponse, total, page, limit);
  }

  /**
   * Obtener un paciente por ID
   */
  async findOne(id: number): Promise<PacienteResponseDto> {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id },
      include: {
        parroquia: {
          select: { id: true, nombre: true },
        },
      },
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(paciente);
  }

  /**
   * Actualizar un paciente existente
   */
  async update(id: number, updatePacienteDto: UpdatePacienteDto): Promise<PacienteResponseDto> {
    // Verificar que el paciente existe
    await this.findOne(id);

    // Validaciones
    if (updatePacienteDto.email) {
      await this.validateUniqueEmail(updatePacienteDto.email, id);
    }

    if (updatePacienteDto.tipoDocumento && updatePacienteDto.numeroDocumento) {
      await this.validateUniqueDocument(
        updatePacienteDto.tipoDocumento,
        updatePacienteDto.numeroDocumento,
        id,
      );
    }

    if (updatePacienteDto.parroquiaId) {
      await this.validateParroquiaExists(updatePacienteDto.parroquiaId);
    }

    const paciente = await this.prisma.paciente.update({
      where: { id },
      data: {
        nombre: updatePacienteDto.nombre,
        apellido: updatePacienteDto.apellido,
        email: updatePacienteDto.email,
        fechaNacimiento: updatePacienteDto.fechaNacimiento
          ? this.parseDateString(updatePacienteDto.fechaNacimiento)
          : undefined,
        telefono: updatePacienteDto.telefono,
        direccion: updatePacienteDto.direccion,
        genero: updatePacienteDto.genero,
        Nacionalidad: updatePacienteDto.Nacionalidad,
        parroquiaId: updatePacienteDto.parroquiaId,
        tipoDocumento: updatePacienteDto.tipoDocumento,
        numeroDocumento: updatePacienteDto.numeroDocumento,
        EmpresaLaboral: updatePacienteDto.EmpresaLaboral,
        estadoCivil: updatePacienteDto.estadoCivil,
        ocupacion: updatePacienteDto.ocupacion,
        relacionRep: updatePacienteDto.relacionRep,
        representante: updatePacienteDto.representante,
        telefonoRep: updatePacienteDto.telefonoRep,
        numero_documento_rep: updatePacienteDto.numero_documento_rep,
        tipoDocumentoRep: updatePacienteDto.tipoDocumentoRep,
        activo: updatePacienteDto.activo,
      },
      include: {
        parroquia: {
          select: { id: true, nombre: true },
        },
      },
    });

    return this.transformToResponseDto(paciente);
  }

  /**
   * Eliminar un paciente (soft delete)
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.paciente.update({
      where: { id },
      data: { activo: false },
    });

    return { message: `Paciente con ID ${id} inactivado exitosamente` };
  }

  /**
   * Activar un paciente
   */
  async activate(id: number): Promise<PacienteResponseDto> {
    await this.findOne(id);
    const paciente = await this.prisma.paciente.update({
      where: { id },
      data: { activo: true },
      include: {
        parroquia: {
          select: { id: true, nombre: true },
        },
      },
    });
    return this.transformToResponseDto(paciente);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers privados
  // ────────────────────────────────────────────────────────────────────────

  private buildWhereConditions(filters: PacienteFiltersDto): Prisma.PacienteWhereInput {
    const where: Prisma.PacienteWhereInput = {};

    if (filters.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }

    if (filters.apellido) {
      where.apellido = { contains: filters.apellido, mode: 'insensitive' };
    }

    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters.parroquiaId) {
      where.parroquiaId = filters.parroquiaId;
    }

    if (filters.tipoDocumento) {
      where.tipoDocumento = filters.tipoDocumento as any;
    }

    return where;
  }

  private transformToResponseDto(paciente: any): PacienteResponseDto {
    const dto = new PacienteResponseDto();
    Object.assign(dto, paciente);
    return dto;
  }

  private async validateUniqueEmail(email?: string, excludeId?: number): Promise<void> {
    if (!email) return;

    const existingPaciente = await this.prisma.paciente.findFirst({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (existingPaciente) {
      throw new ConflictException(`El email ${email} ya está en uso`);
    }
  }

  private async validateUniqueDocument(
    tipoDocumento: string,
    numeroDocumento: string,
    excludeId?: number,
  ): Promise<void> {
    const existingPaciente = await this.prisma.paciente.findFirst({
      where: {
        tipoDocumento: tipoDocumento as any,
        numeroDocumento,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (existingPaciente) {
      throw new ConflictException(
        `Un paciente con ${tipoDocumento} ${numeroDocumento} ya existe`,
      );
    }
  }

  private async validateParroquiaExists(parroquiaId: number): Promise<void> {
    const parroquia = await this.prisma.parroquia.findUnique({
      where: { id: parroquiaId },
    });

    if (!parroquia) {
      throw new BadRequestException(`La parroquia con ID ${parroquiaId} no existe`);
    }
  }
}
