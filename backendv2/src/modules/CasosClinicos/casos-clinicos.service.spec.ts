import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { EstadoCasoClinico } from '@prisma/client';
import { CasosClinicosService } from './casos-clinicos.service';
import { UpdateEstadoCasoDto } from './dto';
import { RoleEnum } from '../../common/enums/roles.enum';

const student = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } };
const professor = { id: 21, role: { nombre: RoleEnum.PROFESOR } };
const admin = { id: 1, role: { nombre: RoleEnum.ADMIN } };

describe('CasosClinicosService access and workflow', () => {
  it('accepts exactly the Prisma case status enum values in the DTO', async () => {
    for (const estado of Object.values(EstadoCasoClinico)) {
      const dto = Object.assign(new UpdateEstadoCasoDto(), { estado });
      expect(await validate(dto)).toHaveLength(0);
    }
  });

  it('creates a student case using the authenticated student id', async () => {
    const tx = {
      casoClinico: { create: jest.fn().mockResolvedValue({ id: 71, estudianteId: student.id }) },
      respuestaClinica: { createMany: jest.fn() },
    };
    const prisma = {
      paciente: { findUnique: jest.fn().mockResolvedValue({ id: 8 }) },
      usuario: {
        findUnique: jest.fn(async ({ where }: any) => ({
          id: where.id,
          role: { nombre: where.id === professor.id ? RoleEnum.PROFESOR : RoleEnum.ESTUDIANTE },
        })),
      },
      especialidad: { findUnique: jest.fn().mockResolvedValue({ id: 5 }) },
      usuarioEspecialidad: { findFirst: jest.fn().mockResolvedValue({ id: 2 }) },
      $transaction: jest.fn((callback: any) => callback(tx)),
    };
    const service = new CasosClinicosService(prisma as any);
    const dto = {
      pacienteId: 8,
      profesorId: professor.id,
      estudianteId: 999,
      especialidadId: 5,
      ATM: 'normal',
      CarayCuello: 'normal',
      PielyMucosa: 'normal',
      craneo: 'normal',
      enfermedadActual: 'sin datos',
      facies: 'normal',
      marcha: 'normal',
      motivoConsulta: 'consulta',
      peso: 60,
      talla: 160,
    };

    await service.create(dto as any, student);

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: student.id } }),
    );
    expect(tx.casoClinico.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estudianteId: student.id }) }),
    );
  });

  it('denies a student access to another student case', async () => {
    const prisma = {
      casoClinico: { findUnique: jest.fn().mockResolvedValue({ id: 7, estudianteId: 12, profesorId: 21 }) },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(service.findOne(7, student)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the assigned professor to update review state, but denies a different professor', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 11,
          profesorId: professor.id,
          estado: 'EN_REVISION',
        }),
        update: jest.fn().mockResolvedValue({ id: 7, estado: 'APROBADO' }),
      },
    };
    const service = new CasosClinicosService(prisma as any);

    await service.updateEstado(7, { estado: 'APROBADO' } as any, professor);
    await service.updateEstado(7, { estado: 'RECHAZADO' } as any, professor);
    expect(prisma.casoClinico.update).toHaveBeenCalledTimes(2);

    await expect(
      service.updateEstado(7, { estado: 'APROBADO' } as any, { ...professor, id: 22 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.casoClinico.update).toHaveBeenCalledTimes(2);
  });

  it('preserves administrator access to all Prisma case statuses', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
          estado: 'EN_REVISION',
        }),
        update: jest.fn().mockResolvedValue({ id: 7, estado: 'PENDIENTE_ESTUDIOS' }),
      },
    };
    const service = new CasosClinicosService(prisma as any);

    await service.updateEstado(7, { estado: 'PENDIENTE_ESTUDIOS' } as any, admin);
    expect(prisma.casoClinico.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'PENDIENTE_ESTUDIOS' }) }),
    );
  });

  it('lets a student finalize their own case after it enters treatment', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
          estado: 'EN_TRATAMIENTO',
        }),
        update: jest.fn().mockResolvedValue({ id: 7, estado: 'FINALIZADO' }),
      },
      tratamiento: { count: jest.fn().mockResolvedValue(1) },
    };
    const service = new CasosClinicosService(prisma as any);

    await service.updateEstado(7, { estado: 'FINALIZADO' } as any, student);
    expect(prisma.casoClinico.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'FINALIZADO' }) }),
    );
  });

  it('allows finalization from an approved case after a treatment was recorded', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
          estado: 'APROBADO',
        }),
        update: jest.fn().mockResolvedValue({ id: 7, estado: 'FINALIZADO' }),
      },
      tratamiento: { count: jest.fn().mockResolvedValue(1) },
    };
    const service = new CasosClinicosService(prisma as any);

    await service.updateEstado(7, { estado: 'FINALIZADO' } as any, student);
    expect(prisma.tratamiento.count).toHaveBeenCalledWith({ where: { casoClinicoId: 7 } });
    expect(prisma.casoClinico.update).toHaveBeenCalledTimes(1);
  });

  it.each(['APROBADO', 'RECHAZADO', 'CANCELADO', 'EN_REVISION', 'EN_TRATAMIENTO'])(
    'blocks a student from setting %s',
    async (estado) => {
      const prisma = {
        casoClinico: {
          findUnique: jest.fn().mockResolvedValue({
            id: 7,
            estudianteId: student.id,
            profesorId: professor.id,
            estado: 'EN_TRATAMIENTO',
          }),
          update: jest.fn(),
        },
      };
      const service = new CasosClinicosService(prisma as any);

      await expect(service.updateEstado(7, { estado } as any, student)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.casoClinico.update).not.toHaveBeenCalled();
    },
  );

  it('blocks students from finalizing another student case or assigning a grade', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ id: 7, estudianteId: 12, profesorId: professor.id, estado: 'EN_TRATAMIENTO' })
          .mockResolvedValueOnce({ id: 7, estudianteId: student.id, profesorId: professor.id, estado: 'EN_TRATAMIENTO' }),
        update: jest.fn(),
      },
      tratamiento: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(service.updateEstado(7, { estado: 'FINALIZADO' } as any, student)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      service.updateEstado(7, { estado: 'FINALIZADO', calificacion: 10 } as any, student),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.casoClinico.update).not.toHaveBeenCalled();
  });

  it('requires a treatment-flow state before a student can finalize the case', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
          estado: 'EN_REVISION',
        }),
        update: jest.fn(),
      },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(service.updateEstado(7, { estado: 'FINALIZADO' } as any, student)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.casoClinico.update).not.toHaveBeenCalled();
  });

  it('requires at least one treatment record before student finalization', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
          estado: 'EN_TRATAMIENTO',
        }),
        update: jest.fn(),
      },
      tratamiento: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(service.updateEstado(7, { estado: 'FINALIZADO' } as any, student)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.casoClinico.update).not.toHaveBeenCalled();
  });

  it('blocks professors from assigning non-review states', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 11,
          profesorId: professor.id,
          estado: 'EN_REVISION',
        }),
        update: jest.fn(),
      },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(
      service.updateEstado(7, { estado: 'CANCELADO' } as any, professor),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.casoClinico.update).not.toHaveBeenCalled();
  });

  it('does not let a professor reopen or reverse a case after review', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 11,
          profesorId: professor.id,
          estado: 'APROBADO',
        }),
        update: jest.fn(),
      },
    };
    const service = new CasosClinicosService(prisma as any);

    await expect(
      service.updateEstado(7, { estado: 'RECHAZADO' } as any, professor),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.casoClinico.update).not.toHaveBeenCalled();
  });

  it('appends multiple observations and uses the authenticated professor id', async () => {
    const prisma = {
      casoClinico: { findUnique: jest.fn().mockResolvedValue({ id: 7, estudianteId: 11, profesorId: professor.id }) },
      observacion: { create: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    const service = new CasosClinicosService(prisma as any);
    const dto = { casoClinicoId: 7, docenteId: 999, contenido: 'Revisar hallazgo' };

    await service.createObservacion(dto as any, professor);
    await service.createObservacion({ ...dto, contenido: 'Añadir detalle' } as any, professor);

    expect(prisma.observacion.create).toHaveBeenCalledTimes(2);
    expect(prisma.observacion.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({ docenteId: professor.id, casoClinicoId: 7, estudianteId: 11 }),
      }),
    );
  });

  it('scopes professor lists to the authenticated professor even if the URL contains another id', async () => {
    const prisma = { casoClinico: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new CasosClinicosService(prisma as any);

    await service.findByProfesor(999, undefined, professor);

    expect(prisma.casoClinico.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { profesorId: professor.id } }),
    );
  });
});
