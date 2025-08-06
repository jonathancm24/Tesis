import {ParroquiaService} from './parroquia.service';
import {Controller, Get, Post, Body, Query} from '@nestjs/common';
import { Parroquia } from '@prisma/client';
import { ParroquiaResponse } from './DTO/parroquia-response.dto';

@Controller('parroquia')
export class ParroquiaController {
  constructor(private readonly parroquiaService: ParroquiaService) {}
    @Post()
    async createParroquia(@Body('name') name: string, @Body('cantonId') cantonId: number): Promise<Parroquia> {
        return this.parroquiaService.createParroquia(name, cantonId);
    }
    @Get()
    async getAllParroquias(): Promise<ParroquiaResponse[]> {
        return this.parroquiaService.getAllParroquias();
    }

    @Get('buscar')
    async buscarParroquias(@Query('q') query: string): Promise<ParroquiaResponse[]> {
        return this.parroquiaService.buscarParroquias(query);
    }
}