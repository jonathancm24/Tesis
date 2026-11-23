import { ForbiddenException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto, UsuarioFiltersDto } from './dto';
import { RoleEnum } from '../../common/enums/roles.enum';

describe('UsuariosService access control', () => {
  it('allows a professor to create a student and ignores a requested inactive state', async () => {
    const transaction = {
      usuario: { create: jest.fn().mockResolvedValue({ id: 7 }) },
      usuarioEspecialidad: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const prisma = {
      role: {
        findUnique: jest.fn().mockResolvedValue({ id: 3, nombre: RoleEnum.ESTUDIANTE }),
      },
      usuario: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue({
          id: 7,
          nombre: 'Estudiante',
          apellido: 'Prueba',
          email: 'estudiante@example.test',
          activo: true,
          roleId: 3,
          role: { id: 3, nombre: RoleEnum.ESTUDIANTE, description: null },
          parroquia: null,
          especialidades: [],
        }),
      },
      especialidad: { findMany: jest.fn().mockResolvedValue([{ id: 1 }]) },
      $transaction: jest.fn((callback) => callback(transaction)),
    };
    const service = new UsuariosService(prisma as any);
    const dto = {
      nombre: 'Estudiante',
      apellido: 'Prueba',
      email: 'estudiante@example.test',
      fechaNacimiento: '2000-01-01',
      password: 'password-segura',
      roleId: 3,
      activo: false,
      tipoDocumento: 'CEDULA',
      numeroDocumento: '12345678',
      especialidadIds: [1],
    } as CreateUsuarioDto;

    await service.create(dto, RoleEnum.PROFESOR);

    expect(transaction.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ roleId: 3, activo: true }) }),
    );
  });

  it.each([RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.SECRETARIO])(
    'rejects a professor attempting to create role %s',
    async (targetRole) => {
      const prisma = {
        role: { findUnique: jest.fn().mockResolvedValue({ id: 1, nombre: targetRole }) },
      };
      const service = new UsuariosService(prisma as any);

      await expect(
        service.create({ roleId: 1 } as CreateUsuarioDto, RoleEnum.PROFESOR),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.role.findUnique).toHaveBeenCalledTimes(1);
    },
  );

  it('forces professor user listings to the Estudiante role regardless of roleId filter', async () => {
    const prisma = {
      role: { findUnique: jest.fn().mockResolvedValue({ id: 3 }) },
      usuario: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new UsuariosService(prisma as any);

    await service.findAll(
      new UsuarioFiltersDto({ roleId: 1, page: 1, limit: 10 }),
      RoleEnum.PROFESOR,
    );

    expect(prisma.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ roleId: 3 }) }),
    );
  });

  it('rejects a professor changing protected fields on their own profile', async () => {
    const service = new UsuariosService({} as any);

    await expect(
      service.update(10, { roleId: 1 } as any, RoleEnum.PROFESOR, 10),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update(11, {} as any, RoleEnum.PROFESOR, 10),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
