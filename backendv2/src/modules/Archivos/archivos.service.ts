import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { createReadStream, existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { CreateArchivoDto, ListArchivosDto } from './dto';

type Actor = {
  id: number;
  roleName: string;
};

@Injectable()
export class ArchivosService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'archivos');
  private readonly areaEstudiantesEntidadTipo = 'AREA_ESTUDIANTES';
  private readonly areaEstudiantesEntidadId = 1;
  private readonly mimeTypesPermitidos = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ]);

  constructor(private readonly prisma: PrismaService) {}

  async upload(
    actorId: number,
    dto: CreateArchivoDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo en el campo file');
    }

    if (!this.mimeTypesPermitidos.has(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    const actor = await this.getActor(actorId);
    const entidadTipo = this.normalizeEntityType(dto.entidadTipo);

    this.ensureCanUpload(actor, entidadTipo);
    await this.ensureAccessToContext(actor, entidadTipo, dto.entidadId);
    await this.ensureUploadDirExists();

    const extension = extname(file.originalname) || '';
    const storedFileName = `${Date.now()}-${randomUUID()}${extension}`;
    const rutaAbsoluta = join(this.uploadDir, storedFileName);
    await writeFile(rutaAbsoluta, file.buffer);

    const archivo = await this.prisma.archivo.create({
      data: {
        nombre: file.originalname,
        tipo: file.mimetype,
        url: storedFileName,
        descripcion: dto.descripcion,
        usuarioId: actorId,
      },
    });

    const relacion = await this.prisma.archivoRelacion.create({
      data: {
        archivoId: archivo.id,
        entidadTipo,
        entidadId: dto.entidadId,
        usuarioId: actorId,
        rol: dto.rol,
      },
    });

    return {
      id: archivo.id,
      nombre: archivo.nombre,
      tipo: archivo.tipo,
      descripcion: archivo.descripcion,
      fechaSubida: archivo.fechaSubida,
      entidadTipo: relacion.entidadTipo,
      entidadId: relacion.entidadId,
      subidoPor: actorId,
      downloadUrl: `/archivos/${archivo.id}/download`,
    };
  }

  async uploadAreaEstudiantes(
    actorId: number,
    file: Express.Multer.File,
    descripcion?: string,
  ) {
    const actor = await this.getActor(actorId);
    this.ensureCanUpload(actor, this.areaEstudiantesEntidadTipo);

    return this.upload(
      actorId,
      {
        entidadTipo: this.areaEstudiantesEntidadTipo,
        entidadId: this.areaEstudiantesEntidadId,
        descripcion,
      },
      file,
    );
  }

  async listAreaEstudiantes(actorId: number) {
    return this.listByEntity(
      actorId,
      this.areaEstudiantesEntidadTipo,
      this.areaEstudiantesEntidadId,
    );
  }

  async listByEntity(actorId: number, entidadTipoRaw: string, entidadId: number) {
    const actor = await this.getActor(actorId);
    const entidadTipo = this.normalizeEntityType(entidadTipoRaw);

    await this.ensureAccessToContext(actor, entidadTipo, entidadId);

    const relaciones = await this.prisma.archivoRelacion.findMany({
      where: {
        entidadTipo,
        entidadId,
      },
      include: {
        archivo: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        archivo: {
          fechaSubida: 'desc',
        },
      },
    });

    return relaciones.map((rel) => ({
      id: rel.archivo.id,
      nombre: rel.archivo.nombre,
      tipo: rel.archivo.tipo,
      descripcion: rel.archivo.descripcion,
      fechaSubida: rel.archivo.fechaSubida,
      entidadTipo: rel.entidadTipo,
      entidadId: rel.entidadId,
      subidoPor: rel.archivo.usuario,
      downloadUrl: `/archivos/${rel.archivo.id}/download`,
    }));
  }

  async listMyUploads(actorId: number, query: ListArchivosDto) {
    const where: any = {
      usuarioId: actorId,
    };

    if (query.entidadTipo || query.entidadId) {
      where.archivoRelacion = {
        some: {},
      };

      if (query.entidadTipo) {
        where.archivoRelacion.some.entidadTipo = this.normalizeEntityType(query.entidadTipo);
      }

      if (typeof query.entidadId === 'number') {
        where.archivoRelacion.some.entidadId = query.entidadId;
      }
    }

    const archivos = await this.prisma.archivo.findMany({
      where,
      include: {
        archivoRelacion: true,
      },
      orderBy: {
        fechaSubida: 'desc',
      },
    });

    return archivos.map((archivo) => ({
      id: archivo.id,
      nombre: archivo.nombre,
      tipo: archivo.tipo,
      descripcion: archivo.descripcion,
      fechaSubida: archivo.fechaSubida,
      relaciones: archivo.archivoRelacion.map((rel) => ({
        id: rel.id,
        entidadTipo: rel.entidadTipo,
        entidadId: rel.entidadId,
        rol: rel.rol,
      })),
      downloadUrl: `/archivos/${archivo.id}/download`,
    }));
  }

  async getDownloadPayload(actorId: number, archivoId: number) {
    const actor = await this.getActor(actorId);
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: archivoId },
      include: {
        archivoRelacion: true,
      },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo con ID ${archivoId} no encontrado`);
    }

    await this.ensureCanAccessFile(actor, archivo);

    const rutaAbsoluta = join(this.uploadDir, archivo.url);
    if (!existsSync(rutaAbsoluta)) {
      throw new NotFoundException('El archivo no existe en almacenamiento');
    }

    return {
      stream: createReadStream(rutaAbsoluta),
      mimeType: archivo.tipo,
      fileName: archivo.nombre,
    };
  }

  async remove(actorId: number, archivoId: number) {
    const actor = await this.getActor(actorId);
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: archivoId },
      include: {
        archivoRelacion: true,
      },
    });

    if (!archivo) {
      throw new NotFoundException(`Archivo con ID ${archivoId} no encontrado`);
    }

    if (this.isAdmin(actor.roleName)) {
      await this.deleteArchivo(archivoId, archivo.url);
      return { id: archivoId, eliminado: true };
    }

    if (this.isProfesor(actor.roleName) && archivo.usuarioId === actor.id) {
      await this.deleteArchivo(archivoId, archivo.url);
      return { id: archivoId, eliminado: true };
    }

    throw new ForbiddenException('No tiene permisos para eliminar este archivo');
  }

  private async ensureCanAccessFile(
    actor: Actor,
    archivo: {
      usuarioId: number;
      archivoRelacion: Array<{ entidadTipo: string; entidadId: number }>;
    },
  ) {
    if (this.isAdmin(actor.roleName) || actor.id === archivo.usuarioId) {
      return;
    }

    for (const rel of archivo.archivoRelacion) {
      const canAccess = await this.canAccessContext(actor, rel.entidadTipo, rel.entidadId);
      if (canAccess) {
        return;
      }
    }

    throw new ForbiddenException('No tiene permisos para descargar este archivo');
  }

  private async ensureAccessToContext(actor: Actor, entidadTipo: string, entidadId: number) {
    const canAccess = await this.canAccessContext(actor, entidadTipo, entidadId);
    if (!canAccess) {
      throw new ForbiddenException(
        'No tiene permisos para acceder a archivos de este contexto',
      );
    }
  }

  private async canAccessContext(actor: Actor, entidadTipo: string, entidadId: number) {
    if (this.isAdmin(actor.roleName)) {
      return true;
    }

    switch (entidadTipo) {
      case 'AREA_ESTUDIANTES':
        return true;

      case 'CASO_CLINICO': {
        const caso = await this.prisma.casoClinico.findUnique({
          where: { id: entidadId },
          select: { profesorId: true, estudianteId: true },
        });

        if (!caso) {
          throw new NotFoundException(`Caso clínico con ID ${entidadId} no encontrado`);
        }

        return caso.profesorId === actor.id || caso.estudianteId === actor.id;
      }

      case 'PACIENTE': {
        const paciente = await this.prisma.paciente.findUnique({
          where: { id: entidadId },
          select: { id: true },
        });

        if (!paciente) {
          throw new NotFoundException(`Paciente con ID ${entidadId} no encontrado`);
        }

        const casoAsociado = await this.prisma.casoClinico.findFirst({
          where: {
            pacienteId: entidadId,
            OR: [{ profesorId: actor.id }, { estudianteId: actor.id }],
          },
          select: { id: true },
        });

        return Boolean(casoAsociado);
      }

      case 'USUARIO': {
        const usuario = await this.prisma.usuario.findUnique({
          where: { id: entidadId },
          select: { id: true },
        });

        if (!usuario) {
          throw new NotFoundException(`Usuario con ID ${entidadId} no encontrado`);
        }

        return actor.id === entidadId;
      }

      case 'CITA': {
        const cita = await this.prisma.cita.findUnique({
          where: { id: entidadId },
          select: { docenteId: true, estudianteId: true },
        });

        if (!cita) {
          throw new NotFoundException(`Cita con ID ${entidadId} no encontrada`);
        }

        return cita.estudianteId === actor.id || cita.docenteId === actor.id;
      }

      case 'TRATAMIENTO': {
        const tratamiento = await this.prisma.tratamiento.findUnique({
          where: { id: entidadId },
          select: { docenteId: true, estudianteId: true },
        });

        if (!tratamiento) {
          throw new NotFoundException(`Tratamiento con ID ${entidadId} no encontrado`);
        }

        return (
          tratamiento.estudianteId === actor.id || tratamiento.docenteId === actor.id
        );
      }

      case 'ODONTOGRAMA': {
        const odontograma = await this.prisma.odontograma.findUnique({
          where: { id: entidadId },
          select: { docenteId: true, estudianteId: true },
        });

        if (!odontograma) {
          throw new NotFoundException(`Odontograma con ID ${entidadId} no encontrado`);
        }

        return (
          odontograma.estudianteId === actor.id || odontograma.docenteId === actor.id
        );
      }

      default:
        throw new BadRequestException(
          `Entidad no soportada para archivos: ${entidadTipo}`,
        );
    }
  }

  private async ensureUploadDirExists() {
    await mkdir(this.uploadDir, { recursive: true });
  }

  private normalizeEntityType(value: string): string {
    const normalized = value.trim().toUpperCase();

    const aliases: Record<string, string> = {
      AREA_ESTUDIANTES: 'AREA_ESTUDIANTES',
      AREAESTUDIANTES: 'AREA_ESTUDIANTES',
      BIBLIOTECA_ESTUDIANTES: 'AREA_ESTUDIANTES',
      CASO: 'CASO_CLINICO',
      CASOCLINICO: 'CASO_CLINICO',
      CASO_CLINICO: 'CASO_CLINICO',
      CASOS_CLINICOS: 'CASO_CLINICO',
      PACIENTE: 'PACIENTE',
      USUARIO: 'USUARIO',
      CITA: 'CITA',
      TRATAMIENTO: 'TRATAMIENTO',
      ODONTOGRAMA: 'ODONTOGRAMA',
    };

    const resolved = aliases[normalized];
    if (!resolved) {
      throw new BadRequestException(`Tipo de entidad inválido: ${value}`);
    }

    return resolved;
  }

  private async getActor(actorId: number): Promise<Actor> {
    const actor = await this.prisma.usuario.findUnique({
      where: { id: actorId },
      include: {
        role: true,
      },
    });

    if (!actor || !actor.activo) {
      throw new ForbiddenException('Usuario no autorizado o inactivo');
    }

    return {
      id: actor.id,
      roleName: actor.role?.nombre ?? '',
    };
  }

  private isAdmin(roleName: string): boolean {
    return roleName.trim().toLowerCase() === 'administrador';
  }

  private isProfesor(roleName: string): boolean {
    const normalized = roleName.trim().toLowerCase();
    return normalized === 'profesor' || normalized === 'docente';
  }

  private ensureCanUpload(actor: Actor, entidadTipo: string) {
    if (entidadTipo !== 'AREA_ESTUDIANTES') {
      return;
    }

    if (this.isAdmin(actor.roleName) || this.isProfesor(actor.roleName)) {
      return;
    }

    throw new ForbiddenException(
      'Solo administradores y profesores pueden subir archivos en esta área',
    );
  }

  private async deleteArchivo(archivoId: number, filePath: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.archivoRelacion.deleteMany({
        where: { archivoId },
      });

      await tx.hallazgoClinico.updateMany({
        where: { archivoId },
        data: { archivoId: null },
      });

      await tx.archivo.delete({
        where: { id: archivoId },
      });
    });

    const rutaAbsoluta = join(this.uploadDir, filePath);
    if (existsSync(rutaAbsoluta)) {
      await unlink(rutaAbsoluta);
    }
  }
}
