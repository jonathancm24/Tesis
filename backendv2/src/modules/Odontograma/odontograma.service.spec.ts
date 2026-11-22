import { ForbiddenException } from '@nestjs/common'
import { OdontogramaService } from './odontograma.service'
import { RoleEnum } from '../../common/enums/roles.enum'

const student = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } }
const professor = { id: 21, role: { nombre: RoleEnum.PROFESOR } }

const saveDto = {
  casoClinicoId: 7,
  estudianteId: student.id,
  docenteId: professor.id,
  dientes: [{ diente: '11', caras: [{ cara: 'VESTIBULAR' }] }],
}

describe('OdontogramaService access control', () => {
  it('rejects a student trying to access another student case', async () => {
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: 12,
          profesorId: professor.id,
        }),
      },
    }
    const service = new OdontogramaService(prisma as any)

    await expect(service.findByCaso(7, student)).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('uses the case assignment instead of a spoofed professor id when saving', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 7 }]),
      odontograma: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn(),
      },
      observacion: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
    }
    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          estudianteId: student.id,
          profesorId: professor.id,
        }),
      },
      odontograma: { findMany: jest.fn().mockResolvedValue([]) },
      observacion: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    }
    const service = new OdontogramaService(prisma as any)

    await service.save(
      { ...saveDto, docenteId: 998, observacionGeneral: 'Sin hallazgos' },
      student,
    )

    expect(tx.odontograma.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          casoClinicoId: 7,
          estudianteId: student.id,
          docenteId: professor.id,
        }),
      }),
    )
  })
})
