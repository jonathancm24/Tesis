import {EspecialidadService} from "./especialidad.service";
import {Body, Controller, Get, Param, Post} from "@nestjs/common";

@Controller("especialidades")
export class EspecialidadController {
    constructor(private especialidadService: EspecialidadService) {
    }
    @Post()
    async agregarEspecialidad(@Body() dto: any) {
        return this.especialidadService.agregarEspecialidad(dto);
    }
    @Get()
    async obtenerEspecialidades() {
        return this.especialidadService.obtenerTodasLasEspecialidades();
    }
    @Get(":id")
    async obtenerEspecialidadPorId(@Param("id") id: number) {
        return this.especialidadService.obtenerEspecialidadPorId(id);
    }
}