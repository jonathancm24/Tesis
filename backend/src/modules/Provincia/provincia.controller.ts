import { ProvinciaService } from "./provincia.service";
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller("provincia")
export class ProvinciaController {
    constructor(private readonly userService: ProvinciaService) { }
    @Post()
    async createProvincia(@Body("name") name: string, @Body("paisId") paisId: number): Promise<any> {
        return this.userService.createProvincia(name, paisId);
    }
    @Get()
    async getAllProvincias(): Promise<any[]> {
        return this.userService.getAllProvincias();
    }
}
