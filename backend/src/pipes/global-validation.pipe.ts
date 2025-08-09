import { ValidationPipe, BadRequestException } from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Rechaza propiedades extra
      transform: true, // Transforma tipos automáticamente
      exceptionFactory: (errors) => {
        const messages = errors.map(error => ({
          campo: error.property,
          errores: Object.values(error.constraints || {}),
          valor: error.value
        }));
        
        return new BadRequestException({
          mensaje: 'Datos de entrada inválidos',
          errores: messages,
          codigo: 'VALIDATION_ERROR'
        });
      }
    });
  }
}