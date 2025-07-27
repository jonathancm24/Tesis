import { Controller, Post, Body, Get, UseGuards, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { RegisterDto } from './DTO/registro.dto';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './DTO/update-usuario.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermisoEnum } from 'src/common/enums/permisos.enum';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/guards/permissions.guard';


@Controller('auth') // Cambiamos la ruta base a 'auth' para unificar
//@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }


  @Post('registro')
  //@RequirePermissions(PermisoEnum.CREAR_USUARIOS)
  create(@Body() data: RegisterDto) {
    return this.usuariosService.register(data);
  }

  // Método para obtener todos los usuarios
  @Get('usuarios')
  @RequirePermissions(PermisoEnum.VER_USUARIOS)
  findAll() {
    return this.usuariosService.findAll();
  }

  // Método para actualizar un usuario
  @Patch('usuarios/porId/:id')
  @RequirePermissions(PermisoEnum.EDITAR_USUARIOS)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUsuarioDto
  ) {
    return this.usuariosService.update(id, data);
  }

  // Método para eliminar un usuario (soft delete - solo desactivar)
  @Delete('usuarios/porId/:id')
  @RequirePermissions(PermisoEnum.ELIMINAR_USUARIOS)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
    }

  // Método para activar/desactivar un usuario
  @Patch('usuarios/porId/:id/estado')
  @RequirePermissions(PermisoEnum.EDITAR_USUARIOS)
  async toggleEstado(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.toggleActive(id);
  }

  // Método para encontrar un usuario por email
  @Get('usuarios/porEmail/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usuariosService.findByEmail(email);
  }

  // Método para encontrar un usuario por ID
  @Get('usuarios/porId/:id')
  @RequirePermissions(PermisoEnum.VER_USUARIOS)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findById(id);
  
  }
}