import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RegisterDto } from './DTO/registro.dto';
import { UsuariosService } from './usuarios.service';

@Controller('auth') // Cambiamos la ruta base a 'auth' para unificar
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }


  @Post('registro')
  create(@Body() data: RegisterDto) {
    return this.usuariosService.register(data);
  }

  @Get('usuarios')
  findAll() {
    return this.usuariosService.findAll();
  }
}