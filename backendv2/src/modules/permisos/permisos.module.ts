import { Module } from '@nestjs/common';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';

@Module({
  controllers: [PermisosController],
  providers: [PermisosService],
  exports: [PermisosService]
})
export class PermisosModule {}