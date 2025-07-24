import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service'; // Asegúrate de que la ruta sea la correcta
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // Aquí extendemos la estrategia JWT
  constructor(
    private configService: ConfigService, // Inyectamos ConfigService para acceder a las variables de entorno
    private authService: AuthService, // Inyectamos AuthService
  ) {
    // Configuramos la estrategia JWT
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // No ignoramos la expiración del token
      // Usamos la clave secreta desde las variables de entorno
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // NestJS adjuntará este retorno a request.user
  async validate(payload: any) { // Método que valida el token JWT
    const usuario = await this.authService.obtenerUsuarioCompleto(payload.email);
    if (!usuario) {
      throw new UnauthorizedException();
    }
    return usuario; // Ahora incluye permisos completos
  }
}
