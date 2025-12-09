import { CantonService } from "./canton.service";
import { Controller, Get, Post, Body, Delete, Param} from "@nestjs/common";

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
    @Delete(':id')
    async deleteCanton(@Param('id') id: number): Promise<void> {
        return this.userService.deleteCanton(id);
    }

}