/**
 * DTOs para el módulo de Logs del sistema
 * 
 * Define los objetos de transferencia de datos para
 * la consulta y visualización de logs de auditoría.
 * Estos DTOs son exclusivamente para operaciones de
 * lectura ya que los logs no se modifican manualmente.
 * 
 * @fileoverview DTOs del módulo de logs
 * @module LogDTO
 */

import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  Min,
  Max,
  IsEmail
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { 
  FiltrosLog, 
  OpcionesPaginacion, 
  UsuarioLog, 
  DetallesLog,
  EstadisticasLog,
  MetricasActividad
} from './interfaces/log.interface';

/**
 * DTO para filtros de búsqueda de logs
 * 
 * Permite aplicar filtros específicos para consultar
 * logs del sistema con criterios de búsqueda avanzados.
 */
export class FiltrosLogDto implements FiltrosLog {
  @ApiPropertyOptional({
    description: 'ID del usuario que realizó la acción',
    example: 1
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  @Type(() => Number)
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Nombre del usuario (búsqueda parcial)',
    example: 'Juan'
  })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  nombreUsuario?: string;

  @ApiPropertyOptional({
    description: 'Email del usuario (búsqueda parcial)',
    example: 'juan@universidad.edu.ec'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  emailUsuario?: string;

  @ApiPropertyOptional({
    description: 'Acción realizada en el sistema',
    example: 'CREAR_PACIENTE',
    enum: [
      'LOGIN', 'LOGOUT', 'CREAR_PACIENTE', 'ACTUALIZAR_PACIENTE', 'ELIMINAR_PACIENTE',
      'CREAR_CASO_CLINICO', 'ACTUALIZAR_CASO_CLINICO', 'APROBAR_CASO_CLINICO',
      'CREAR_CITA', 'CANCELAR_CITA', 'CREAR_TRATAMIENTO', 'CREAR_PRESCRIPCION',
      'SUBIR_ARCHIVO', 'ELIMINAR_ARCHIVO', 'CREAR_USUARIO', 'ACTUALIZAR_USUARIO',
      'CAMBIAR_ROL', 'ASIGNAR_PERMISO', 'CREAR_CLINICA', 'ASIGNAR_PERSONAL'
    ]
  })
  @IsOptional()
  @IsString({ message: 'La acción debe ser una cadena de texto' })
  accion?: string;

  @ApiPropertyOptional({
    description: 'Tabla afectada por la acción',
    example: 'Pacientes',
    enum: [
      'Usuarios', 'Pacientes', 'CasosClinicos', 'Citas', 'Tratamientos',
      'Prescripciones', 'Archivos', 'Clinicas', 'PersonalClinicas',
      'HorariosClinicas', 'Observaciones', 'Odontogramas'
    ]
  })
  @IsOptional()
  @IsString({ message: 'La tabla debe ser una cadena de texto' })
  tabla?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango de búsqueda (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe estar en formato ISO 8601' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha final del rango de búsqueda (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha final debe estar en formato ISO 8601' })
  @Transform(({ value }) => value ? new Date(value) : undefined)
  fechaFin?: Date;

  @ApiPropertyOptional({
    description: 'Texto a buscar en los detalles JSON del log',
    example: 'email'
  })
  @IsOptional()
  @IsString({ message: 'El texto de búsqueda debe ser una cadena' })
  buscarEnDetalles?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por rol del usuario',
    example: 'Administrador',
    enum: ['Administrador', 'Docente', 'Estudiante', 'Secretario']
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  rolUsuario?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo usuarios activos',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El filtro de usuario activo debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  usuarioActivo?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir información detallada del usuario en la respuesta',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'El flag incluir usuario debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  incluirUsuario?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir detalles JSON parseados en la respuesta',
    example: false
  })
  @IsOptional()
  @IsBoolean({ message: 'El flag incluir detalles debe ser verdadero o falso' })
  @Transform(({ value }) => value === 'true' || value === true)
  incluirDetalles?: boolean;
}

/**
 * DTO para opciones de paginación
 * 
 * Define parámetros para controlar la paginación
 * y ordenamiento de resultados de logs.
 */
export class PaginacionLogDto implements OpcionesPaginacion {
  @ApiProperty({
    description: 'Número de página (empezando desde 1)',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  @Type(() => Number)
  pagina: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 20,
    minimum: 1,
    maximum: 100
  })
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  @Type(() => Number)
  limite: number;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar los resultados',
    example: 'fecha',
    enum: ['fecha', 'usuarioId', 'accion', 'tabla']
  })
  @IsOptional()
  @IsIn(['fecha', 'usuarioId', 'accion', 'tabla'], {
    message: 'El campo de ordenamiento debe ser fecha, usuarioId, accion o tabla'
  })
  ordenarPor?: 'fecha' | 'usuarioId' | 'accion' | 'tabla';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'La dirección debe ser asc o desc'
  })
  direccion?: 'asc' | 'desc';
}

/**
 * DTO para respuesta de usuario en logs
 * 
 * Información básica del usuario para mostrar
 * en el contexto de logs de auditoría.
 */
export class UsuarioLogDto implements UsuarioLog {
  @ApiProperty({ description: 'ID único del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario', example: 'Pérez' })
  apellido: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan.perez@universidad.edu.ec' })
  email: string;

  @ApiProperty({ description: 'Rol del usuario', example: 'Administrador' })
  rol: string;

  @ApiProperty({ description: 'Estado activo del usuario', example: true })
  activo: boolean;

  @ApiProperty({ description: 'Tipo de documento', example: 'CEDULA' })
  tipoDocumento: string;

  @ApiProperty({ description: 'Número de documento', example: '1234567890' })
  numeroDocumento: string;
}

/**
 * DTO para detalles de log
 * 
 * Estructura flexible para mostrar información
 * detallada de las acciones registradas.
 */
export class DetallesLogDto implements DetallesLog {
  @ApiPropertyOptional({
    description: 'Datos anteriores antes de la modificación'
  })
  datosAnteriores?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Datos nuevos después de la modificación'
  })
  datosNuevos?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID del registro afectado',
    example: 123
  })
  registroId?: number;

  @ApiPropertyOptional({
    description: 'Lista de campos que fueron modificados',
    example: ['nombre', 'email', 'telefono']
  })
  camposModificados?: string[];

  @ApiPropertyOptional({
    description: 'Información adicional de contexto'
  })
  contexto?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Dirección IP del usuario',
    example: '192.168.1.100'
  })
  ipUsuario?: string;

  @ApiPropertyOptional({
    description: 'User Agent del navegador'
  })
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Duración de la operación en milisegundos',
    example: 245
  })
  duracionMs?: number;

  @ApiPropertyOptional({
    description: 'Resultado de la operación',
    example: 'exito',
    enum: ['exito', 'error', 'advertencia']
  })
  resultado?: 'exito' | 'error' | 'advertencia';

  @ApiPropertyOptional({
    description: 'Mensaje adicional descriptivo',
    example: 'Paciente creado exitosamente'
  })
  mensaje?: string;
}

/**
 * DTO para respuesta de log individual
 * 
 * Estructura completa de un log con toda la información
 * disponible para visualización.
 */
export class LogRespuestaDto {
  @ApiProperty({ description: 'ID único del log', example: 1 })
  id: number;

  @ApiProperty({ 
    description: 'Fecha y hora de la acción',
    example: '2025-08-12T14:30:00.000Z'
  })
  fecha: Date;

  @ApiProperty({ description: 'ID del usuario que realizó la acción', example: 1 })
  usuarioId: number;

  @ApiProperty({ 
    description: 'Acción realizada',
    example: 'CREAR_PACIENTE'
  })
  accion: string;

  @ApiProperty({ 
    description: 'Tabla afectada',
    example: 'Pacientes'
  })
  tabla: string;

  @ApiPropertyOptional({
    description: 'Información del usuario (si se solicita)',
    type: UsuarioLogDto
  })
  usuario?: UsuarioLogDto;

  @ApiPropertyOptional({
    description: 'Detalles de la acción (si se solicita)',
    type: DetallesLogDto
  })
  detalle?: DetallesLogDto;

  // Campos calculados adicionales
  @ApiProperty({
    description: 'Tiempo transcurrido desde la acción',
    example: '2 horas ago'
  })
  tiempoTranscurrido: string;

  @ApiProperty({
    description: 'Tipo de acción categorizada',
    example: 'Creación',
    enum: ['Creación', 'Actualización', 'Eliminación', 'Consulta', 'Autenticación', 'Configuración']
  })
  tipoAccion: string;

  @ApiProperty({
    description: 'Severidad del evento',
    example: 'INFO',
    enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
  })
  severidad: string;

  @ApiProperty({
    description: 'Indica si la acción fue exitosa',
    example: true
  })
  exitosa: boolean;
}

/**
 * DTO para respuesta paginada de logs
 * 
 * Estructura que incluye los logs encontrados
 * junto con información de paginación.
 */
export class LogsPaginadosDto {
  @ApiProperty({
    description: 'Lista de logs encontrados',
    type: [LogRespuestaDto]
  })
  logs: LogRespuestaDto[];

  @ApiProperty({
    description: 'Información de paginación'
  })
  paginacion: {
    /** Página actual */
    paginaActual: number;
    /** Total de páginas */
    totalPaginas: number;
    /** Total de elementos */
    totalElementos: number;
    /** Elementos por página */
    elementosPorPagina: number;
    /** Indica si hay página siguiente */
    tieneSiguiente: boolean;
    /** Indica si hay página anterior */
    tieneAnterior: boolean;
  };

  @ApiProperty({
    description: 'Filtros aplicados en la consulta'
  })
  filtrosAplicados: FiltrosLogDto;

  @ApiProperty({
    description: 'Resumen de la consulta'
  })
  resumen: {
    /** Total de logs en el rango consultado */
    totalLogsRango: number;
    /** Acciones más frecuentes en los resultados */
    accionesFrecuentes: Array<{
      accion: string;
      cantidad: number;
    }>;
    /** Usuarios más activos en los resultados */
    usuariosActivos: Array<{
      usuarioId: number;
      nombreUsuario: string;
      cantidad: number;
    }>;
  };
}

/**
 * DTO para estadísticas de logs
 * 
 * Métricas y análisis estadístico de la actividad
 * del sistema basada en los logs.
 */
export class EstadisticasLogDto implements EstadisticasLog {
  @ApiProperty({ description: 'Total de logs en el sistema', example: 15423 })
  totalLogs: number;

  @ApiProperty({ description: 'Logs registrados hoy', example: 124 })
  logsHoy: number;

  @ApiProperty({ description: 'Logs de la semana actual', example: 892 })
  logsSemana: number;

  @ApiProperty({ description: 'Logs del mes actual', example: 3421 })
  logsMes: number;

  @ApiProperty({
    description: 'Distribución de logs por tipo de acción'
  })
  porAccion: Array<{
    accion: string;
    cantidad: number;
    porcentaje: number;
  }>;

  @ApiProperty({
    description: 'Distribución de logs por tabla afectada'
  })
  porTabla: Array<{
    tabla: string;
    cantidad: number;
    porcentaje: number;
  }>;

  @ApiProperty({
    description: 'Usuarios con mayor actividad'
  })
  usuariosMasActivos: Array<{
    usuario: UsuarioLogDto;
    cantidadAcciones: number;
    ultimaActividad: Date;
  }>;

  @ApiProperty({
    description: 'Distribución de actividad por hora del día'
  })
  actividadPorHora: Array<{
    hora: number;
    cantidad: number;
  }>;

  @ApiProperty({
    description: 'Distribución de actividad por día de la semana'
  })
  actividadPorDia: Array<{
    dia: string;
    cantidad: number;
  }>;

  @ApiProperty({
    description: 'Tipos de documento más frecuentes'
  })
  tiposDocumentoFrecuentes: Array<{
    tipoDocumento: string;
    cantidad: number;
  }>;

  @ApiProperty({
    description: 'Acciones realizadas por cada rol'
  })
  accionesPorRol: Array<{
    rol: string;
    acciones: Array<{
      accion: string;
      cantidad: number;
    }>;
  }>;
}

/**
 * DTO para métricas de actividad en tiempo real
 * 
 * Información para dashboard de monitoreo del sistema.
 */
export class MetricasActividadDto implements MetricasActividad {
  @ApiProperty({ 
    description: 'Timestamp de la métrica',
    example: '2025-08-12T14:30:00.000Z'
  })
  timestamp: Date;

  @ApiProperty({ description: 'Usuarios conectados actualmente', example: 45 })
  usuariosConectados: number;

  @ApiProperty({ description: 'Acciones en la última hora', example: 234 })
  accionesUltimaHora: number;

  @ApiProperty({ description: 'Errores en la última hora', example: 3 })
  erroresUltimaHora: number;

  @ApiProperty({ description: 'Promedio de acciones por minuto', example: 3.9 })
  accionesPorMinuto: number;

  @ApiProperty({
    description: 'Tablas más consultadas en el día'
  })
  tablasMasConsultadas: Array<{
    tabla: string;
    consultas: number;
  }>;

  @ApiProperty({
    description: 'Alertas de seguridad detectadas'
  })
  alertasSeguridad: Array<{
    tipo: string;
    descripcion: string;
    gravedad: 'baja' | 'media' | 'alta' | 'critica';
    fecha: Date;
  }>;
}

/**
 * DTO para opciones de exportación de logs
 * 
 * Parámetros para generar reportes de logs
 * en diferentes formatos.
 */
export class ExportacionLogDto {
  @ApiProperty({
    description: 'Formato de exportación deseado',
    example: 'excel',
    enum: ['csv', 'excel', 'json', 'pdf']
  })
  @IsIn(['csv', 'excel', 'json', 'pdf'], {
    message: 'El formato debe ser csv, excel, json o pdf'
  })
  formato: 'csv' | 'excel' | 'json' | 'pdf';

  @ApiProperty({
    description: 'Incluir detalles JSON en la exportación',
    example: false
  })
  @IsBoolean({ message: 'Incluir detalles debe ser verdadero o falso' })
  incluirDetalles: boolean;

  @ApiProperty({
    description: 'Incluir información completa del usuario',
    example: true
  })
  @IsBoolean({ message: 'Incluir usuario debe ser verdadero o falso' })
  incluirUsuario: boolean;

  @ApiPropertyOptional({
    description: 'Filtros a aplicar en la exportación',
    type: FiltrosLogDto
  })
  @IsOptional()
  filtros?: FiltrosLogDto;

  @ApiPropertyOptional({
    description: 'Nombre personalizado del archivo',
    example: 'logs_actividad_agosto_2025'
  })
  @IsOptional()
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  nombreArchivo?: string;
}
