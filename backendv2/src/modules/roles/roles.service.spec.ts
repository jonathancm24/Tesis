import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../../prisma/prisma.service';
import { RolesService } from './roles.service';

describe('RolesService: lecturas transaccionales', () => {
  const rol = { id: 7, nombre: 'Rol de prueba', description: 'Descripción' };
  const consulta = {
    where: { id: rol.id },
    include: {
      permisos: { include: { permiso: true } },
      _count: { select: { usuarios: true } },
    },
  };

  function preparar(existente = false) {
    let rolTransaccional = existente ? rol : null;
    let permisos = existente ? [1] : [];
    const tx = {
      role: {
        create: jest.fn().mockImplementation(async () => (rolTransaccional = rol)),
        findUnique: jest.fn().mockImplementation(async () => ({
          ...rolTransaccional,
          permisos: permisos.map((id) => ({ permisoId: id, permiso: { id } })),
          _count: { usuarios: 0 },
        })),
      },
      permiso: { findMany: jest.fn().mockResolvedValue([{ id: 2 }, { id: 3 }]) },
      rolePermiso: {
        deleteMany: jest.fn().mockImplementation(async () => { permisos = []; }),
        createMany: jest.fn().mockImplementation(async ({ data }: { data: { permisoId: number }[] }) => {
          permisos.push(...data.map(({ permisoId }) => permisoId));
        }),
      },
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockImplementation(async (args) => {
          if (args.include) throw new Error('La lectura posterior no debe usar el cliente general');
          return existente ? rol : null;
        }),
      },
      permiso: { findMany: jest.fn().mockResolvedValue([{ id: 2 }, { id: 3 }]) },
      $transaction: jest.fn(async (run: (cliente: typeof tx) => Promise<unknown>) => run(tx)),
    };
    return { servicio: new RolesService(prisma as unknown as PrismaService), prisma, tx };
  }

  const respuesta = (ids: number[]) => ({
    ...rol,
    permisos: ids.map((id) => ({ permisoId: id, permiso: { id } })),
    _count: { usuarios: 0 },
  });

  it('lee dentro de la transacción el rol recién creado con sus permisos', async () => {
    const { servicio, prisma, tx } = preparar();
    await expect(servicio.crearRol({
      nombre: rol.nombre, descripcion: rol.description, permisos: [2, 3],
    })).resolves.toEqual(respuesta([2, 3]));
    expect(tx.role.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.role.findUnique).toHaveBeenCalledWith(consulta);
    expect(prisma.role.findUnique.mock.calls).toEqual([[{ where: { nombre: rol.nombre } }]]);
    expect(tx.rolePermiso.createMany).toHaveBeenCalledWith({
      data: [{ roleId: rol.id, permisoId: 2 }, { roleId: rol.id, permisoId: 3 }],
    });
  });

  it('conserva el alta sin permisos', async () => {
    const { servicio, tx } = preparar();
    await expect(servicio.crearRol({ nombre: rol.nombre })).resolves.toEqual(respuesta([]));
    expect(tx.permiso.findMany).not.toHaveBeenCalled();
    expect(tx.rolePermiso.createMany).not.toHaveBeenCalled();
  });

  it('rechaza un nombre existente antes de iniciar la transacción', async () => {
    const { servicio, prisma } = preparar(true);
    await expect(servicio.crearRol({ nombre: rol.nombre })).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('propaga un permiso inexistente durante el alta', async () => {
    const { servicio, tx } = preparar();
    tx.permiso.findMany.mockResolvedValueOnce([]);
    await expect(servicio.crearRol({ nombre: rol.nombre, permisos: [2] })).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.rolePermiso.createMany).not.toHaveBeenCalled();
    expect(tx.role.findUnique).not.toHaveBeenCalled();
  });

  it('lee el conjunto de permisos reemplazado usando el cliente transaccional', async () => {
    const { servicio, prisma, tx } = preparar(true);
    await expect(servicio.asignarPermisos(rol.id, { permisos: [2, 3] })).resolves.toEqual(respuesta([2, 3]));
    expect(tx.role.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.role.findUnique).toHaveBeenCalledWith(consulta);
    expect(prisma.role.findUnique.mock.calls).toEqual([[{ where: { id: rol.id } }]]);
    expect(tx.rolePermiso.deleteMany).toHaveBeenCalledWith({ where: { roleId: rol.id } });
  });

  it('conserva el reemplazo por una lista de permisos vacía', async () => {
    const { servicio, prisma, tx } = preparar(true);
    await expect(servicio.asignarPermisos(rol.id, { permisos: [] })).resolves.toEqual(respuesta([]));
    expect(prisma.permiso.findMany).not.toHaveBeenCalled();
    expect(tx.rolePermiso.createMany).not.toHaveBeenCalled();
  });

  it('rechaza un rol inexistente antes de iniciar el reemplazo', async () => {
    const { servicio, prisma } = preparar();
    await expect(servicio.asignarPermisos(rol.id, { permisos: [] })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each(['crearRol', 'asignarPermisos'] as const)('propaga un fallo de inserción en %s', async (operacion) => {
    const { servicio, tx } = preparar(operacion === 'asignarPermisos');
    const fallo = new Error('Falló createMany dentro de la transacción');
    tx.rolePermiso.createMany.mockRejectedValueOnce(fallo);
    const resultado = operacion === 'crearRol'
      ? servicio.crearRol({ nombre: rol.nombre, permisos: [2, 3] })
      : servicio.asignarPermisos(rol.id, { permisos: [2, 3] });
    await expect(resultado).rejects.toBe(fallo);
    expect(tx.role.findUnique).not.toHaveBeenCalled();
  });

  it.each(['crearRol', 'asignarPermisos'] as const)('propaga el fallo de la lectura final en %s sin reintentar con Prisma general', async (operacion) => {
    const esAlta = operacion === 'crearRol';
    const { servicio, prisma, tx } = preparar(!esAlta);
    const fallo = new Error('Falló la lectura final dentro de la transacción');
    tx.role.findUnique.mockRejectedValueOnce(fallo);

    const resultado = esAlta
      ? servicio.crearRol({ nombre: rol.nombre, permisos: [2, 3] })
      : servicio.asignarPermisos(rol.id, { permisos: [2, 3] });

    await expect(resultado).rejects.toBe(fallo);
    expect(tx.role.findUnique).toHaveBeenCalledTimes(1);
    expect(tx.role.findUnique).toHaveBeenCalledWith(consulta);
    expect(tx.rolePermiso.createMany.mock.invocationCallOrder[0]).toBeLessThan(
      tx.role.findUnique.mock.invocationCallOrder[0],
    );
    expect(prisma.role.findUnique.mock.calls).toEqual([[
      { where: esAlta ? { nombre: rol.nombre } : { id: rol.id } },
    ]]);
  });
});
