import { ConflictException } from '@nestjs/common'
import { OdontogramaService } from './odontograma.service'
import { RoleEnum } from '../../common/enums/roles.enum'

describe('Odontograma transaction rollback', () => {
  it('propaga un conflicto y no confirma escrituras parciales', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ estudianteId: 11, profesorId: 21 }]),
      odontograma: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, diente: '16' }]),
        create: jest.fn(),
        update: jest.fn(),
      },
      observacion: { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() },
    }
    const prisma = {
      $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => {
        try {
          return await callback(tx)
        } catch (error) {
          throw error
        }
      }),
    }
    const service = new OdontogramaService(prisma as any)

    await expect(
      service.save(
        {
          casoClinicoId: 7,
          estudianteId: 11,
          docenteId: 21,
          dientes: [],
          observacionGeneral: '',
        },
        { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } },
      ),
    ).rejects.toThrow('Debe enviar al menos')

    expect(tx.odontograma.create).not.toHaveBeenCalled()
    expect(tx.odontograma.update).not.toHaveBeenCalled()
  })

  it('ejecuta las escrituras dentro de una única transacción', async () => {
    const transaction = jest.fn().mockRejectedValue(new ConflictException('conflicto'))
    const prisma = { $transaction: transaction }
    const service = new OdontogramaService(prisma as any)

    await expect(
      service.save(
        {
          casoClinicoId: 7,
          estudianteId: 11,
          dientes: [{ diente: '16', caras: [{ cara: 'M', condicion: 'CARIES' }] }],
        } as any,
        { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } },
      ),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
