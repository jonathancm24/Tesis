import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rutas con autenticación JWT
 * 
 * Todas las rutas que usen este guard requieren:
 * 1. Token JWT válido en el header Authorization
 * 2. Usuario existente y activo en la base de datos
 * 
 * No hay rutas públicas en este sistema ya que toda la información
 * es confidencial y requiere autenticación
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // No necesita ninguna lógica adicional
  // Passport se encarga de toda la validación JWT
}
