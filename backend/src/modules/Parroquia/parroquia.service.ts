import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ParroquiaService {
    constructor(private prisma: PrismaService) { }
    async createParroquia(name: string, cantonId: number): Promise<any> {
        return this.prisma.parroquia.create({
            data: {
                nombre: name,
                cantonId: cantonId,
            },
        });
    }
    async getAllParroquias(): Promise<any[]> {
        return this.prisma.parroquia.findMany();
    }
}