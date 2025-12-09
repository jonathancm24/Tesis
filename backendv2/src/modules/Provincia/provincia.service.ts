import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { promises } from "dns";

@Injectable()
export class ProvinciaService {
    constructor(private prisma: PrismaService) { }

    async createProvincia(name: string, paisId: number): Promise<any> {
        return this.prisma.provincia.create({
            data: {
                nombre: name,
                paisId: paisId,
            },
        });
    }

    async getAllProvincias(): Promise<any[]> {
        return this.prisma.provincia.findMany();
    }
    // Metodo para eliminar 
    async deleteProvincia(provinciaId: number): Promise<any>{
        return this.prisma.provincia.delete({
            where:{
                id: provinciaId,
            },
        });
    }
}