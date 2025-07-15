import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { AgregarEspecialidadDto } from "./DTO/agregar.dto";

@Injectable()
export class EspecialidadService {
  constructor(private prisma: PrismaService) {}

  async agregarEspecialidad(dto: AgregarEspecialidadDto) {
    const especialidad = await this.prisma.especialidad.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });
    return especialidad;
  }
  async obtenerTodasLasEspecialidades() {
    const especialidades = await this.prisma.especialidad.findMany();
    return especialidades;
  }
    async obtenerEspecialidadPorId(id: number) {
        const especialidad = await this.prisma.especialidad.findUnique({
        where: { id },
        });
        return especialidad;
    }

}
