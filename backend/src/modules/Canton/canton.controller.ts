import { CantonService } from "./canton.service";
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller("canton")
export class CantonController {
    constructor(private readonly userService: CantonService) { }
    @Post()
    async createCanton(@Body("name") name: string, @Body("provinciaId") provinciaId: number): Promise<any> {
        return this.userService.createCanton(name, provinciaId);
    }
    @Get()
    async getAllCantones(): Promise<any[]> {
        return this.userService.getAllCantones();
    }
}