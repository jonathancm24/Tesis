import { ProvinciaService } from "./provincia.service";
import { Controller, Get, Post, Body, Delete, Param } from "@nestjs/common";
import { Provincia } from "@prisma/client";

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
    @Delete(':id')
    async deleteProvincia(@Param('id') id: number): Promise<void>{
        return this.userService.deleteProvincia(id);
    }
}
