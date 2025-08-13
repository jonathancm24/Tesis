import { Module } from "@nestjs/common";
import { UsuariosController } from "./usuario.controller";
import { UsuariosService } from "./usuarios.service";
import { BulkUsuariosController } from "./bulk-usuarios.controller";
import { BulkUsuariosService } from "./bulk-usuarios.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [],
  controllers: [UsuariosController, BulkUsuariosController],
  providers: [UsuariosService, BulkUsuariosService, PrismaService],
  exports: [UsuariosService, BulkUsuariosService],
})
export class UsuariosModule {}