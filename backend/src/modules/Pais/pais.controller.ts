import { PaisService } from "./pais.service"; 
import { Controller, Get, Post, Body } from "@nestjs/common";

@Controller("pais")
export class PaisController {
    constructor(private readonly userService: PaisService) { }
    @Post()
    async createCountry(@Body("name") name: string): Promise<any> {
        return this.userService.createCountry(name);
    }
    @Get()
    async getAllCountries(): Promise<any[]> {
        return this.userService.getAllCountries();
    }
}
