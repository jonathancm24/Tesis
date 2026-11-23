import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { RoleEnum } from '../../common/enums/roles.enum';

const student = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } };
const professor = { id: 21, role: { nombre: RoleEnum.PROFESOR } };

describe('CitasService access control', () => {
  it('denies a student access to another student appointment', async () => {
    const prisma = {
      cita: {
        findUnique: jest.fn().mockResolvedValue({
          id: 5,
          estudianteId: 12,
          docenteId: professor.id,
        }),
      },
    };
    const service = new CitasService(prisma as any);

    await expect(service.findOne(5, student)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not allow a student to create an appointment for another student', async () => {
    const prisma = {
      paciente: { findUnique: jest.fn().mockResolvedValue({ id: 8, activo: true }) },
      especialidad: { findUnique: jest.fn().mockResolvedValue({ id: 3 }) },
      usuario: {
        findUnique: jest.fn().mockResolvedValue({
          id: 12,
          activo: true,
          role: { nombre: RoleEnum.ESTUDIANTE },
        }),
      },
    };
    const service = new CitasService(prisma as any);

    await expect(
      service.create(
        {
          fecha: '2026-12-01',
          horainicio: '09:00',
          horafin: '09:30',
          pacienteId: 8,
          especialidadId: 3,
          estudianteId: 12,
        } as any,
        student,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('scopes appointment lists to the authenticated student', async () => {
    const prisma = { cita: { findMany: jest.fn().mockResolvedValue([]) } };
    const service = new CitasService(prisma as any);

    await service.findAll(999, 999, student);

    expect(prisma.cita.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ estudianteId: student.id }) }),
    );
  });

  it('rejects an appointment whose end time is before its start time', async () => {
    const prisma = {
      paciente: { findUnique: jest.fn().mockResolvedValue({ id: 8, activo: true }) },
      especialidad: { findUnique: jest.fn().mockResolvedValue({ id: 3 }) },
      usuario: {
        findUnique: jest.fn(({ where }: any) => Promise.resolve(
          where.id === student.id
            ? { id: student.id, activo: true, role: { nombre: RoleEnum.ESTUDIANTE } }
            : { id: where.id, activo: true, role: { nombre: RoleEnum.PROFESOR } },
        )),
      },
      cita: { findFirst: jest.fn(), create: jest.fn() },
    };
    const service = new CitasService(prisma as any);

    await expect(
      service.create(
        {
          fecha: '2026-12-01',
          horainicio: '10:00',
          horafin: '09:30',
          pacienteId: 8,
          especialidadId: 3,
          estudianteId: student.id,
          docenteId: professor.id,
        } as any,
        student,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects an overlapping appointment', async () => {
    const prisma = {
      paciente: { findUnique: jest.fn().mockResolvedValue({ id: 8, activo: true }) },
      especialidad: { findUnique: jest.fn().mockResolvedValue({ id: 3 }) },
      usuario: {
        findUnique: jest.fn(({ where }: any) => Promise.resolve(
          where.id === student.id
            ? { id: student.id, activo: true, role: { nombre: RoleEnum.ESTUDIANTE } }
            : { id: where.id, activo: true, role: { nombre: RoleEnum.PROFESOR } },
        )),
      },
      cita: {
        findFirst: jest.fn().mockResolvedValue({ id: 99 }),
        create: jest.fn(),
      },
    };
    const service = new CitasService(prisma as any);

    await expect(
      service.create(
        {
          fecha: '2026-12-01',
          horainicio: '09:00',
          horafin: '09:30',
          pacienteId: 8,
          especialidadId: 3,
          estudianteId: student.id,
          docenteId: professor.id,
        } as any,
        student,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
