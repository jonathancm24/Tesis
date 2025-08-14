import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalValidationPipe } from './pipes/global-validation.pipe';
import { GlobalExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ CONFIGURACIÓN CORS PARA DESARROLLO
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global
  //app.useGlobalPipes(new GlobalValidationPipe());
  
  // Manejo global de errores
  //app.useGlobalFilters(new GlobalExceptionFilter());
  
  await app.listen(3000);
  console.log('🚀 Servidor iniciado en http://localhost:3000');
  console.log('✅ CORS habilitado para frontend en puerto 5173');
}
bootstrap();
