import { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { RoleEnum } from '../common/enums/roles.enum';
jest.mock('../modules/Pacientes/pacientes.service', () => ({
  PacientesService: class PacientesService {},
}));
import { PacientesController } from '../modules/Pacientes/pacientes.controller';

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  const contextFor = (method: string, roleName?: string): ExecutionContext => {
    const handler = (PacientesController.prototype as any)[method];

    return {
      getHandler: () => handler,
      getClass: () => PacientesController,
      switchToHttp: () => ({
        getRequest: () => roleName ? { user: { role: { nombre: roleName } } } : { user: {} },
      }),
    } as unknown as ExecutionContext;
  };

  it.each([RoleEnum.ADMIN, RoleEnum.PROFESOR, RoleEnum.ESTUDIANTE])(
    'allows %s to create and consult patients',
    (role) => {
      expect(guard.canActivate(contextFor('create', role))).toBe(true);
      expect(guard.canActivate(contextFor('findAll', role))).toBe(true);
      expect(guard.canActivate(contextFor('findOne', role))).toBe(true);
      expect(guard.canActivate(contextFor('getHistorialCompleto', role))).toBe(true);
    },
  );

  it('denies Secretary from every patient endpoint', () => {
    for (const method of ['create', 'findAll', 'findOne', 'getHistorialCompleto', 'update', 'remove', 'activate']) {
      expect(guard.canActivate(contextFor(method, RoleEnum.SECRETARIO))).toBe(false);
    }
  });

  it('allows only the administrator to update, deactivate, or reactivate patients', () => {
    for (const method of ['update', 'remove', 'activate']) {
      expect(guard.canActivate(contextFor(method, RoleEnum.ADMIN))).toBe(true);
      expect(guard.canActivate(contextFor(method, RoleEnum.PROFESOR))).toBe(false);
      expect(guard.canActivate(contextFor(method, RoleEnum.ESTUDIANTE))).toBe(false);
    }
  });

  it('denies a request without an authenticated role', () => {
    expect(guard.canActivate(contextFor('findAll'))).toBe(false);
  });

  it('registers JWT authentication and role authorization on the controller', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, PacientesController) as Function[];

    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(RolesGuard);
  });
});
