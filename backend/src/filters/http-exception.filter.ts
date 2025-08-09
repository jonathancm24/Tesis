import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(HttpException, PrismaClientKnownRequestError)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Manejo de errores de Prisma (BD)
    if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception, response);
    }

    // Manejo de errores HTTP estándar
    if (exception instanceof HttpException) {
      return this.handleHttpError(exception, response, request);
    }
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError, response: any) {
    let mensaje = 'Error en la base de datos';
    let codigo = 'DATABASE_ERROR';
    let status = 400;

    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        const campo = exception.meta?.target as string[];
        mensaje = `Ya existe un registro con ${campo ? campo.join(', ') : 'estos datos'}`;
        codigo = 'DUPLICATE_ENTRY';
        status = 409;
        break;
      
      case 'P2025': // Record not found
        mensaje = 'El registro solicitado no existe';
        codigo = 'NOT_FOUND';
        status = 404;
        break;
      
      case 'P2003': // Foreign key constraint
        mensaje = 'Error de referencia: verifique los datos relacionados';
        codigo = 'FOREIGN_KEY_ERROR';
        break;
    }

    return response.status(status).json({
      success: false,
      mensaje,
      codigo,
      timestamp: new Date().toISOString()
    });
  }

  private handleHttpError(exception: HttpException, response: any, request: any) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    return response.status(status).json({
      success: false,
      mensaje: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse,
      codigo: exception.constructor.name.replace('Exception', '').toUpperCase(),
      path: request.url,
      timestamp: new Date().toISOString()
    });
  }
}