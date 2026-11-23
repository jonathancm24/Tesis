import { ForbiddenException } from '@nestjs/common';
import { TratamientosService } from './tratamientos.service';
import { RoleEnum } from '../../common/enums/roles.enum';

const student = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } };
const otherStudent = { id: 12, role: { nombre: RoleEnum.ESTUDIANTE } };

describe('TratamientosService access control', () => {
  it('denies access to treatments for a case owned by another student', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 13,
          profesorId: 21,
          estado: 'EN_TRATAMIENTO',
        }),
      },
    };
    const service = new TratamientosService(prisma as any);

    await expect(service.listByCaso(7, student)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the owner student to read their case treatments', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: 21,
          estado: 'EN_TRATAMIENTO',
        }),
      },
      tratamiento: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new TratamientosService(prisma as any);

    await expect(service.listByCaso(7, student)).resolves.toEqual([]);
  });

  it('does not treat an arbitrary user id as the case owner', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 13,
          profesorId: 21,
          estado: 'EN_TRATAMIENTO',
        }),
      },
    };
    const service = new TratamientosService(prisma as any);

    await expect(service.listByCaso(7, otherStudent)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
