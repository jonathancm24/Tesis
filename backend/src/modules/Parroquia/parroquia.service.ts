import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ParroquiaService {
    constructor(private prisma: PrismaService) { }
    // Método para crear una nueva parroquia
    async createParroquia(name: string, cantonId: number): Promise<any> {
        return this.prisma.parroquia.create({
            data: {
                nombre: name,
                cantonId: cantonId,
            },
        });
    }
    // Método para obtener todas las parroquias con sus cantones y provincias
    async getAllParroquias(): Promise<any[]> {
        return this.prisma.parroquia.findMany({
            include: {
                canton: {
                    include: {
                        provincia: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            }
        });
    }

    // Metodo para obtener una parroquia por nombre 
    // Ademas incluye canton, provincia y país
    async buscarParroquias(query: string): Promise<any[]> {
        if (!query || query.length < 2) {// Si la consulta es muy corta, no buscar
            return [];
        }

        return this.prisma.parroquia.findMany({
            where: {
                OR: [
                    {
                        nombre: {
                            contains: query,
                            mode: 'insensitive' // Búsqueda insensible a mayúsculas/minúsculas
                        }
                    },
                    {
                        canton: {
                            nombre: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        canton: {
                            provincia: {
                                nombre: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                canton: {
                    include: {
                        provincia: {
                            include: {
                                pais: true
                            }
                        }
                    }
                }
            },
            take: 10 // Limitar resultados para evitar demasiados datos
        });
    }
}