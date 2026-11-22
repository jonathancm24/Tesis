import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service';
import { RoleEnum } from '../../common/enums/roles.enum';
import { OdontogramaService } from './odontograma.service';

describe('OdontogramaService: acceso por caso', () => {
  const caso = { estudianteId: 11, profesorId: 21 };
  const estudiante = { id: 11, role: { nombre: RoleEnum.ESTUDIANTE } };
  const profesor = { id: 21, role: { nombre: RoleEnum.PROFESOR } };
  const administrador = { id: 31, role: { nombre: RoleEnum.ADMIN } };
  const dto = {
    casoClinicoId: 7,
    estudianteId: 11,
    dientes: [{ diente: '16', caras: [{ cara: 'M', condicion: 'CARIES' }] }],
  };

  function crearServicio() {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([caso]),
      casoClinico: { findUnique: jest.fn().mockResolvedValue(caso) },
      odontograma: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({}),
      },
      observacion: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const prisma = {
      ...tx,
      $transaction: jest.fn((run: (client: typeof tx) => unknown) => run(tx)),
    };
    return { servicio: new OdontogramaService(prisma as unknown as PrismaService), tx };
  }

  it.each([estudiante, profesor, administrador])('permite consultar al actor autorizado $id', async (actor) => {
    const { servicio } = crearServicio();
    await expect(servicio.findByCaso(7, actor)).resolves.toMatchObject({ casoClinicoId: 7 });
  });

  it.each([
    { ...estudiante, id: 12 },
    { ...profesor, id: 22 },
    { id: 11, role: { nombre: RoleEnum.SECRETARIO } },
  ])('deniega la consulta ajena antes de leer datos clínicos para el actor $id', async (actor) => {
    const { servicio, tx } = crearServicio();
    await expect(servicio.findByCaso(7, actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.odontograma.findMany).not.toHaveBeenCalled();
  });

  it.each([estudiante, administrador])('permite guardar al actor autorizado $id', async (actor) => {
    const { servicio, tx } = crearServicio();
    await servicio.save(dto, actor);
    expect(tx.odontograma.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ casoClinicoId: 7, estudianteId: 11, diente: '16' }),
    });
  });

  it.each([profesor, { ...estudiante, id: 12 }])('impide escribir al actor $id', async (actor) => {
    const { servicio, tx } = crearServicio();
    await expect(servicio.save(dto, actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(tx.odontograma.findMany).not.toHaveBeenCalled();
  });

  it.each([{ estudianteId: 12 }, { docenteId: 22 }])('rechaza participantes que no coinciden: %j', async (cambio) => {
    const { servicio, tx } = crearServicio();
    await expect(servicio.save({ ...dto, ...cambio }, administrador)).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.odontograma.findMany).not.toHaveBeenCalled();
  });

  it('devuelve 404 antes de leer el odontograma si el caso no existe', async () => {
    const { servicio, tx } = crearServicio();
    tx.casoClinico.findUnique.mockResolvedValue(null);
    await expect(servicio.findByCaso(7, estudiante)).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.odontograma.findMany).not.toHaveBeenCalled();
  });
});
