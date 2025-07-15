import { RolController } from "./rol.controller";
import { RolService } from "./rol.service";
import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
  controllers: [RolController],
  providers: [RolService, PrismaService],
  exports: [RolService],
})
export class RolModule {}