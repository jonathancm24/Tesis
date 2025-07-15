import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CantonService {
    constructor(private prisma: PrismaService) { }
    async createCanton(name: string, provinciaId: number): Promise<any> {
        return this.prisma.canton.create({
            data: {
                nombre: name,
                provinciaId: provinciaId,
            },
        });
    }
    async getAllCantones(): Promise<any[]> {
        return this.prisma.canton.findMany();
    }
}