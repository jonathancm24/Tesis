import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PaisService {
    constructor(private prisma: PrismaService) { }
    async createCountry(name: string): Promise<any> {
        return this.prisma.pais.create({
            data: {
                nombre: name,
            },
        });
    }
    async getAllCountries(): Promise<any[]> {
        return this.prisma.pais.findMany();
    }
}