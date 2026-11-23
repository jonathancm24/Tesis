import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import type { PrismaService } from '../../../prisma/prisma.service'
import { RoleEnum } from '../../common/enums/roles.enum'
import { OdontogramaService } from './odontograma.service'

describe('OdontogramaService: acceso por caso', () => {
  const caso = { estudianteId: 11, profesorId: 21 }

  const estudiante = {
    id: 11,
    role: { nombre: RoleEnum.ESTUDIANTE },
  }

  const profesor = {
    id: 21,
    role: { nombre: RoleEnum.PROFESOR },
  }

  const administrador = {
    id: 31,
    role: { nombre: RoleEnum.ADMIN },
  }

  const dto = {
    casoClinicoId: 7,
    estudianteId: 11,
    docenteId: 21,
    dientes: [
      {
        diente: '16',
        caras: [{ cara: 'M', condicion: 'CARIES' }],
      },
    ],
  }

  function crearServicio() {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([caso]),
      odontograma: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
      observacion: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      },
    }

    const prisma = {
      casoClinico: {
        findUnique: jest.fn().mockResolvedValue(caso),
      },
      odontograma: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      observacion: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn(
        (run: (client: typeof tx) => unknown) => run(tx),
      ),
    }

    return {
      servicio: new OdontogramaService(
        prisma as unknown as PrismaService,
      ),
      tx,
      prisma,
    }
  }

  it.each([estudiante, profesor, administrador])(
    'permite consultar al actor autorizado $id',
    async (actor) => {
      const { servicio } = crearServicio()

      await expect(
        servicio.findByCaso(7, actor),
      ).resolves.toMatchObject({ casoClinicoId: 7 })
    },
  )

  it.each([
    { ...estudiante, id: 12 },
    { ...profesor, id: 22 },
    { id: 11, role: { nombre: RoleEnum.SECRETARIO } },
  ])(
    'deniega la consulta ajena antes de leer datos clínicos para el actor $id',
    async (actor) => {
      const { servicio, prisma } = crearServicio()

      await expect(
        servicio.findByCaso(7, actor),
      ).rejects.toBeInstanceOf(ForbiddenException)

      expect(prisma.odontograma.findMany).not.toHaveBeenCalled()
    },
  )

  it.each([estudiante, administrador])(
    'permite guardar al actor autorizado $id',
    async (actor) => {
      const { servicio, tx } = crearServicio()

      await servicio.save(dto, actor)

      expect(tx.odontograma.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          casoClinicoId: 7,
          estudianteId: 11,
          docenteId: 21,
          diente: '16',
        }),
      })
    },
  )

  it.each([profesor, { ...estudiante, id: 12 }])(
    'impide escribir al actor $id',
    async (actor) => {
      const { servicio, tx } = crearServicio()

      await expect(
        servicio.save(dto, actor),
      ).rejects.toBeInstanceOf(ForbiddenException)

      expect(tx.odontograma.findMany).not.toHaveBeenCalled()
    },
  )

  it('rechaza un estudianteId que no coincide con el caso', async () => {
    const { servicio, tx } = crearServicio()

    await expect(
      servicio.save({ ...dto, estudianteId: 12 }, administrador),
    ).rejects.toBeInstanceOf(BadRequestException)

    expect(tx.odontograma.findMany).not.toHaveBeenCalled()
  })

  it('utiliza el profesor asignado al caso e ignora el docenteId enviado por el cliente', async () => {
    const { servicio, tx } = crearServicio()

    await servicio.save(
      {
        ...dto,
        docenteId: 998,
        observacionGeneral: 'Sin hallazgos',
      },
      estudiante,
    )

    expect(tx.odontograma.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          casoClinicoId: 7,
          estudianteId: 11,
          docenteId: 21,
        }),
      }),
    )
  })

  it('deniega a un estudiante el acceso al caso de otro estudiante', async () => {
    const { servicio } = crearServicio()

    // El caso pertenece al estudiante 12, no al autenticado (11).
    const { servicio: servicioAjeno } = (() => {
      const { servicio, prisma } = crearServicio()
      prisma.casoClinico.findUnique.mockResolvedValue({
        estudianteId: 12,
        profesorId: 21,
      })
      return { servicio }
    })()

    await expect(
      servicioAjeno.findByCaso(7, estudiante),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('devuelve 404 si el caso no existe', async () => {
    const { servicio, prisma } = crearServicio()

    prisma.casoClinico.findUnique.mockResolvedValue(null)

    await expect(
      servicio.findByCaso(7, estudiante),
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(prisma.odontograma.findMany).not.toHaveBeenCalled()
  })
})
