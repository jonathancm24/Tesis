import {ParroquiaService} from './parroquia.service';
import {Controller, Get, Post, Body, Query, Delete, Param} from '@nestjs/common';
import { Parroquia } from '@prisma/client';
import { ParroquiaResponse } from './DTO/parroquia-response.dto';

@Controller('parroquia')
export class ParroquiaController {
  constructor(private readonly parroquiaService: ParroquiaService) {}
  
    @Post()
    async createParroquia(@Body('name') name: string, @Body('cantonId') cantonId: number): Promise<Parroquia> {
        return this.parroquiaService.createParroquia(name, cantonId);
    }
    
    @Get('buscar')
    async buscarParroquias(@Query('q') query: string) {
        const data = await this.parroquiaService.buscarParroquias(query);
        return { data };
    }
    
    @Get()
    async getAllParroquias(): Promise<{ data: ParroquiaResponse[] }> {
        const data = await this.parroquiaService.getAllParroquias();
        return { data };
    }

    @Delete(':id')
    async deleteParroquia(@Param('id') id: number): Promise<void> {
        return this.parroquiaService.deleteParroquia(id);
    }
}