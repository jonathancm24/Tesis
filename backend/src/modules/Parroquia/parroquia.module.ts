import { ParroquiaService } from "./parroquia.service";
import { Module } from "@nestjs/common";
import { ParroquiaController } from "./parroquia.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [ParroquiaController],
    providers: [ParroquiaService, PrismaService],
    exports: [ParroquiaService],
})
export class ParroquiaModule { }
