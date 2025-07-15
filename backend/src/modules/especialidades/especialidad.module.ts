import { EspecialidadService } from "./especialidad.service";
import { Module } from "@nestjs/common";
import { EspecialidadController } from "./especialidad.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [EspecialidadController],
  providers: [EspecialidadService, PrismaService],
  exports: [EspecialidadService],
})
export class EspecialidadModule {}
