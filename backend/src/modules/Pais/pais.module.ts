import { PaisService } from "./pais.service";
import { Module } from "@nestjs/common";
import { PaisController } from "./pais.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [PaisController],
    providers: [PaisService, PrismaService],
    exports: [PaisService],
})
export class PaisModule { }