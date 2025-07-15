import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { NuevoRoleDto } from "./DTO/nuevo.dto";

@Injectable()
export class RolService {
  constructor(private prisma: PrismaService) {}
  async agregarRol(dto: NuevoRoleDto) {
    const rol = await this.prisma.role.create({
      data: {
        nombre: dto.nombre,
        description: dto.descripcion,
      },
    });
    return rol;
  }
    async obtenerTodosLosRoles() {
        const roles = await this.prisma.role.findMany();
        return roles;
    }

}