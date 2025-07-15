import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { RegisterDto } from './DTO/registro.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro')
  create(@Body() data: RegisterDto) {
    return this.usuariosService.register(data);
  }
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }
}