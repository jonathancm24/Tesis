import { SetMetadata } from '@nestjs/common';
import { PermisoEnum } from '../enums/permisos.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermisoEnum[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);