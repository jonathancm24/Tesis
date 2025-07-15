import { Module } from "@nestjs/common";
import { UsuariosController } from "./usuario.controller";
import { UsuariosService } from "./usuarios.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [],
  controllers: [UsuariosController],
  providers: [UsuariosService, PrismaService],
  exports: [UsuariosService],
})
export class UsuariosModule {}