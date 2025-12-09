import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";

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
    // Nuevo método para obtener todos los cantones
    async getAllCantones(): Promise<any[]> {
        return this.prisma.canton.findMany();
    }
    // Nuevo método para eliminar un cantón por su ID
    async deleteCanton(id: number): Promise<void> {
        await this.prisma.canton.delete({
            where: { id },
        });
    }

}