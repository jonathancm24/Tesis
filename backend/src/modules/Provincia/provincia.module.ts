import { ProvinciaService } from "./provincia.service";
import{ Module } from "@nestjs/common";
import { ProvinciaController } from "./provincia.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [ProvinciaController],
    providers: [ProvinciaService, PrismaService],
    exports: [ProvinciaService],
})
export class ProvinciaModule { }