import { CantonService } from "./canton.service";
import{ Module } from "@nestjs/common";
import { CantonController } from "./canton.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
    controllers: [CantonController],
    providers: [CantonService, PrismaService],
    exports: [CantonService],
})
export class CantonModule { }
