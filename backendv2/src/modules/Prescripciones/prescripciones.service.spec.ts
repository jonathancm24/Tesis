import { ForbiddenException } from '@nestjs/common';
import { PrescripcionesService } from './prescripciones.service';
import { RoleEnum } from '../../common/enums/roles.enum';

const student = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } };

describe('PrescripcionesService access control', () => {
  it('denies access to prescriptions for another student case', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 12,
          profesorId: 21,
          estado: 'EN_TRATAMIENTO',
        }),
      },
    };
    const service = new PrescripcionesService(prisma as any);

    await expect(service.listByCaso(7, student)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows access to prescriptions for the owner student case', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: 21,
          estado: 'EN_TRATAMIENTO',
        }),
      },
      prescripcion: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new PrescripcionesService(prisma as any);

    await expect(service.listByCaso(7, student)).resolves.toEqual([]);
  });
});
