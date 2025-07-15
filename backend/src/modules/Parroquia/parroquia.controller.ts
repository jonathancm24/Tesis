import {ParroquiaService} from './parroquia.service';
import {Controller, Get, Post, Body} from '@nestjs/common';

@Controller('parroquia')
export class ParroquiaController {
  constructor(private readonly parroquiaService: ParroquiaService) {}
    @Post()
    async createParroquia(@Body('name') name: string, @Body('cantonId') cantonId: number): Promise<any> {
        return this.parroquiaService.createParroquia(name, cantonId);
    }
    @Get()
    async getAllParroquias(): Promise<any[]> {
        return this.parroquiaService.getAllParroquias();
    }
}