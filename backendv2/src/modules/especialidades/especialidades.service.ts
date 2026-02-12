import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateEspecialidadDto,
  UpdateEspecialidadDto,
  EspecialidadResponseDto,
} from './especialidades.dto';

/**
 * Servicio para gestión de especialidades odontológicas
 */
@Injectable()
export class EspecialidadesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva especialidad
   */
  async create(createDto: CreateEspecialidadDto): Promise<EspecialidadResponseDto> {
    // Verificar que no exista una especialidad con el mismo nombre
    const existente = await this.prisma.especialidad.findUnique({
      where: { nombre: createDto.nombre },
    });

    if (existente) {
      throw new ConflictException('Ya existe una especialidad con ese nombre');
    }

    try {
      const especialidad = await this.prisma.especialidad.create({
        data: {
          nombre: createDto.nombre,
          descripcion: createDto.descripcion,
        },
      });

      return this.transformToResponse(especialidad);
    } catch (error) {
      throw new BadRequestException('Error al crear la especialidad');
    }
  }

  /**
   * Obtener todas las especialidades
   */
  async findAll(): Promise<EspecialidadResponseDto[]> {
    const especialidades = await this.prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' },
    });

    return especialidades.map(this.transformToResponse);
  }

  /**
   * Obtener una especialidad por ID
   */
  async findOne(id: number): Promise<EspecialidadResponseDto> {
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id },
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${id} no encontrada`);
    }

    return this.transformToResponse(especialidad);
  }

  /**
   * Actualizar una especialidad
   */
  async update(id: number, updateDto: UpdateEspecialidadDto): Promise<EspecialidadResponseDto> {
    // Verificar que la especialidad exista
    await this.findOne(id);

    // Si se actualiza el nombre, verificar que no exista otra con ese nombre
    if (updateDto.nombre) {
      const existente = await this.prisma.especialidad.findFirst({
        where: {
          nombre: updateDto.nombre,
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException('Ya existe otra especialidad con ese nombre');
      }
    }

    try {
      const especialidad = await this.prisma.especialidad.update({
        where: { id },
        data: updateDto,
      });

      return this.transformToResponse(especialidad);
    } catch (error) {
      throw new BadRequestException('Error al actualizar la especialidad');
    }
  }

  /**
   * Eliminar una especialidad
   */
  async remove(id: number): Promise<{ message: string }> {
    // Verificar que la especialidad exista
    await this.findOne(id);

    // Verificar que no tenga relaciones activas
    const relacionesActivas = await this.prisma.usuarioEspecialidad.count({
      where: { especialidadId: id },
    });

    if (relacionesActivas > 0) {
      throw new ConflictException(
        'No se puede eliminar la especialidad porque tiene usuarios asignados',
      );
    }

    try {
      await this.prisma.especialidad.delete({
        where: { id },
      });

      return { message: 'Especialidad eliminada correctamente' };
    } catch (error) {
      throw new BadRequestException('Error al eliminar la especialidad');
    }
  }

  /**
   * Transforma el modelo de Prisma a DTO de respuesta
   */
  private transformToResponse(especialidad: any): EspecialidadResponseDto {
    return {
      id: especialidad.id,
      nombre: especialidad.nombre,
      descripcion: especialidad.descripcion,
    };
  }
}
