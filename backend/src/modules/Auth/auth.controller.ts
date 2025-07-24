// src/modules/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard'; // Crearemos este guard
import { Public } from '../../common/decorators/permisos.decorator'; // Y este decorador
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Hacemos este endpoint público
  @UseGuards(LocalAuthGuard) // Usará un guard local para validar email/pass
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
