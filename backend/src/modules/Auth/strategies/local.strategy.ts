import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Le decimos a passport que use 'email' como username
  }

  async validate(email: string, password: string): Promise<any> {// Método que valida las credenciales del usuario
    // Llamamos al servicio de autenticación para validar el usuario
    const user = await this.authService.validateUser(email, password); // Validamos el usuario con el servicio de autenticación
    // Si no se encuentra el usuario o las credenciales son incorrectas, lanzamos una excepción
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return user; // Si las credenciales son correctas, retornamos el usuario
    // Este usuario será adjuntado a request.user por Passport
  }
}
