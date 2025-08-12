/**
 * Data Transfer Objects (DTOs) para el módulo de Archivos
 * 
 * Este módulo maneja el sistema de archivos polimórfico que permite
 * asociar archivos (estudios, radiografías, fotos, documentos legales, etc.)
 * a cualquier entidad del sistema mediante la tabla ArchivoRelacion.
 * 
 * Casos de uso:
 * - Estudios radiográficos para casos clínicos
 * - Fotos de tratamientos odontológicos
 * - Documentos de odontogramas
 * - Archivos de especialidades
 * - Documentos legales y consentimientos
 * - Cualquier archivo relacionado con entidades del sistema
 * 
 * @fileoverview DTOs para gestión polimórfica de archivos
 * @module ArchivosDTOs
 * @requires class-validator, class-transformer, swagger
 */

import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsEnum,
  Length,
  IsUrl,
  ArrayNotEmpty,
  IsBoolean,
  IsIn,
  Matches
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType
} from '@nestjs/swagger';

/**
 * Tipos de entidades que pueden tener archivos asociados
 * Enum que define las entidades polimórficas válidas
 */
export enum TipoEntidadArchivo {
  CASO_CLINICO = 'CasoClinico',
  TRATAMIENTO = 'Tratamiento',
  ODONTOGRAMA = 'Odontograma',
  ESPECIALIDAD = 'Especialidad',
  PACIENTE = 'Paciente',
  USUARIO = 'Usuario',
  HALLAZGO_CLINICO = 'HallazgoClinico',
  PRESCRIPCION = 'Prescripcion',
  OBSERVACION = 'Observacion',
  SOLICITUD = 'Solicitud',
  CITA = 'Cita'
}

/**
 * Tipos de archivos según su categoría funcional
 * Facilita la organización y filtrado de archivos
 */
export enum CategoriaArchivo {
  ESTUDIO_RADIOGRAFICO = 'ESTUDIO_RADIOGRAFICO',
  FOTO_TRATAMIENTO = 'FOTO_TRATAMIENTO',
  DOCUMENTO_ODONTOGRAMA = 'DOCUMENTO_ODONTOGRAMA',
  DOCUMENTO_LEGAL = 'DOCUMENTO_LEGAL',
  CONSENTIMIENTO = 'CONSENTIMIENTO',
  ARCHIVO_ESPECIALIDAD = 'ARCHIVO_ESPECIALIDAD',
  FOTO_PACIENTE = 'FOTO_PACIENTE',
  DOCUMENTO_IDENTIFICACION = 'DOCUMENTO_IDENTIFICACION',
  REPORTE_MEDICO = 'REPORTE_MEDICO',
  RECETA_MEDICA = 'RECETA_MEDICA',
  OTRO = 'OTRO'
}

/**
 * Roles que puede tener un usuario respecto a un archivo
 * Define los permisos y relación del usuario con el archivo
 */
export enum RolArchivoUsuario {
  PROPIETARIO = 'PROPIETARIO',
  EDITOR = 'EDITOR',
  VISUALIZADOR = 'VISUALIZADOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

/**
 * DTO para subir/crear un nuevo archivo
 * 
 * Valida los datos necesarios para registrar un archivo
 * en el sistema con sus metadatos correspondientes.
 * 
 * @example
 * {
 *   "nombre": "radiografia_paciente_123.jpg",
 *   "tipo": "image/jpeg",
 *   "url": "https://storage.example.com/files/radiografia_paciente_123.jpg",
 *   "descripcion": "Radiografía panorámica inicial",
 *   "categoria": "ESTUDIO_RADIOGRAFICO"
 * }
 */
export class CrearArchivoDto {
  @ApiProperty({
    description: 'Nombre del archivo con extensión',
    example: 'radiografia_paciente_123.jpg',
    maxLength: 255
  })
  @IsNotEmpty({ message: 'El nombre del archivo es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'image/jpeg',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'El tipo de archivo es obligatorio' })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @Length(1, 100, { message: 'El tipo debe tener entre 1 y 100 caracteres' })
  @Matches(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/, {
    message: 'El tipo debe ser un MIME type válido (ej: image/jpeg, application/pdf)'
  })
  tipo: string;

  @ApiProperty({
    description: 'URL donde está almacenado el archivo',
    example: 'https://storage.example.com/files/radiografia_paciente_123.jpg'
  })
  @IsNotEmpty({ message: 'La URL del archivo es obligatoria' })
  @IsString({ message: 'La URL debe ser una cadena de texto' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  url: string;

  @ApiPropertyOptional({
    description: 'Descripción del contenido del archivo',
    example: 'Radiografía panorámica inicial del paciente',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Categoría funcional del archivo',
    enum: CategoriaArchivo,
    example: CategoriaArchivo.ESTUDIO_RADIOGRAFICO
  })
  @IsOptional()
  @IsEnum(CategoriaArchivo, { message: 'Categoría de archivo no válida' })
  categoria?: CategoriaArchivo;
}

/**
 * DTO para crear relación entre archivo y entidad
 * 
 * Establece la asociación polimórfica entre un archivo
 * y cualquier entidad del sistema.
 * 
 * @example
 * {
 *   "archivoId": 1,
 *   "entidadTipo": "CasoClinico",
 *   "entidadId": 25,
 *   "rol": "PROPIETARIO"
 * }
 */
export class CrearRelacionArchivoDto {
  @ApiProperty({
    description: 'ID del archivo a relacionar',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID del archivo es obligatorio' })
  @IsInt({ message: 'El ID del archivo debe ser un número entero' })
  @Min(1, { message: 'El ID del archivo debe ser mayor a 0' })
  archivoId: number;

  @ApiProperty({
    description: 'Tipo de entidad a la que se asocia el archivo',
    enum: TipoEntidadArchivo,
    example: TipoEntidadArchivo.CASO_CLINICO
  })
  @IsNotEmpty({ message: 'El tipo de entidad es obligatorio' })
  @IsEnum(TipoEntidadArchivo, { message: 'Tipo de entidad no válido' })
  entidadTipo: TipoEntidadArchivo;

  @ApiProperty({
    description: 'ID de la entidad específica',
    example: 25,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID de la entidad es obligatorio' })
  @IsInt({ message: 'El ID de la entidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la entidad debe ser mayor a 0' })
  entidadId: number;

  @ApiPropertyOptional({
    description: 'Rol del usuario respecto al archivo',
    enum: RolArchivoUsuario,
    example: RolArchivoUsuario.PROPIETARIO
  })
  @IsOptional()
  @IsEnum(RolArchivoUsuario, { message: 'Rol de archivo no válido' })
  rol?: RolArchivoUsuario;
}

/**
 * DTO para subir archivo con relación inmediata
 * 
 * Combina la creación del archivo y su relación
 * con una entidad en una sola operación.
 * 
 * @example
 * {
 *   "nombre": "consentimiento_firmado.pdf",
 *   "tipo": "application/pdf",
 *   "url": "https://storage.example.com/legal/consentimiento_123.pdf",
 *   "descripcion": "Consentimiento informado firmado por el paciente",
 *   "categoria": "DOCUMENTO_LEGAL",
 *   "entidadTipo": "Paciente",
 *   "entidadId": 15,
 *   "rol": "PROPIETARIO"
 * }
 */
export class SubirArchivoConRelacionDto extends CrearArchivoDto {
  @ApiProperty({
    description: 'Tipo de entidad a la que se asocia el archivo',
    enum: TipoEntidadArchivo,
    example: TipoEntidadArchivo.PACIENTE
  })
  @IsNotEmpty({ message: 'El tipo de entidad es obligatorio' })
  @IsEnum(TipoEntidadArchivo, { message: 'Tipo de entidad no válido' })
  entidadTipo: TipoEntidadArchivo;

  @ApiProperty({
    description: 'ID de la entidad específica',
    example: 15,
    minimum: 1
  })
  @IsNotEmpty({ message: 'El ID de la entidad es obligatorio' })
  @IsInt({ message: 'El ID de la entidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la entidad debe ser mayor a 0' })
  entidadId: number;

  @ApiPropertyOptional({
    description: 'Rol del usuario respecto al archivo',
    enum: RolArchivoUsuario,
    example: RolArchivoUsuario.PROPIETARIO,
    default: RolArchivoUsuario.PROPIETARIO
  })
  @IsOptional()
  @IsEnum(RolArchivoUsuario, { message: 'Rol de archivo no válido' })
  rol?: RolArchivoUsuario = RolArchivoUsuario.PROPIETARIO;
}

/**
 * DTO para actualizar información de un archivo
 * 
 * Permite modificar metadatos del archivo,
 * pero no la URL (que requiere nueva subida).
 */
export class ActualizarArchivoDto extends PartialType(
  class {
    nombre: string;
    descripcion?: string;
    categoria?: CategoriaArchivo;
  }
) {
  @ApiPropertyOptional({
    description: 'Nuevo nombre del archivo',
    example: 'radiografia_actualizada.jpg'
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(1, 255, { message: 'El nombre debe tener entre 1 y 255 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nueva descripción del archivo',
    example: 'Radiografía de control post-tratamiento'
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Nueva categoría del archivo',
    enum: CategoriaArchivo
  })
  @IsOptional()
  @IsEnum(CategoriaArchivo, { message: 'Categoría de archivo no válida' })
  categoria?: CategoriaArchivo;
}

/**
 * DTO para filtros de búsqueda de archivos
 * 
 * Permite filtrar archivos por múltiples criterios
 * incluyendo relaciones polimórficas.
 * 
 * @example
 * {
 *   "entidadTipo": "CasoClinico",
 *   "entidadId": 25,
 *   "categoria": "ESTUDIO_RADIOGRAFICO",
 *   "usuarioId": 10,
 *   "página": 1,
 *   "límite": 10
 * }
 */
export class FiltrosArchivosDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de entidad relacionada',
    enum: TipoEntidadArchivo,
    example: TipoEntidadArchivo.CASO_CLINICO
  })
  @IsOptional()
  @IsEnum(TipoEntidadArchivo, { message: 'Tipo de entidad no válido' })
  entidadTipo?: TipoEntidadArchivo;

  @ApiPropertyOptional({
    description: 'ID específico de la entidad',
    example: 25,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la entidad debe ser un número entero' })
  @Min(1, { message: 'El ID de la entidad debe ser mayor a 0' })
  entidadId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría de archivo',
    enum: CategoriaArchivo,
    example: CategoriaArchivo.ESTUDIO_RADIOGRAFICO
  })
  @IsOptional()
  @IsEnum(CategoriaArchivo, { message: 'Categoría de archivo no válida' })
  categoria?: CategoriaArchivo;

  @ApiPropertyOptional({
    description: 'Filtrar por usuario propietario',
    example: 10,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por rol del usuario en el archivo',
    enum: RolArchivoUsuario,
    example: RolArchivoUsuario.PROPIETARIO
  })
  @IsOptional()
  @IsEnum(RolArchivoUsuario, { message: 'Rol de archivo no válido' })
  rol?: RolArchivoUsuario;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo MIME',
    example: 'image/jpeg'
  })
  @IsOptional()
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  tipoMime?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda en nombre o descripción',
    example: 'radiografía'
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  @Length(2, 100, { message: 'El término debe tener entre 2 y 100 caracteres' })
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato de fecha inválido (YYYY-MM-DD)' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (YYYY-MM-DD)',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato de fecha inválido (YYYY-MM-DD)' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Incluir relaciones en la respuesta',
    example: true,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  incluirRelaciones?: boolean = false;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  página?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Min(100, { message: 'El límite no puede ser mayor a 100' })
  límite?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    enum: ['id', 'nombre', 'fechaSubida', 'tipo', 'categoria'],
    example: 'fechaSubida',
    default: 'fechaSubida'
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena' })
  @IsIn(['id', 'nombre', 'fechaSubida', 'tipo', 'categoria'], {
    message: 'Campo de ordenamiento no válido'
  })
  ordenarPor?: string = 'fechaSubida';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc'
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena' })
  @IsEnum(['asc', 'desc'], { message: 'Dirección de ordenamiento no válida' })
  dirección?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para respuesta paginada de archivos
 * 
 * Estructura estándar para respuestas de listas paginadas
 * de archivos con metadatos de paginación.
 */
export class RespuestaPaginadaArchivosDto {
  @ApiProperty({
    description: 'Lista de archivos',
    type: 'array'
  })
  archivos: any[];

  @ApiProperty({
    description: 'Número total de registros',
    example: 50
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1
  })
  página: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10
  })
  límite: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 5
  })
  totalPáginas: number;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true
  })
  tieneSiguiente: boolean;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false
  })
  tieneAnterior: boolean;
}

/**
 * DTO para estadísticas de archivos
 * 
 * Proporciona métricas del sistema de archivos
 * para dashboards y reportes administrativos.
 */
export class EstadisticasArchivosDto {
  @ApiProperty({
    description: 'Total de archivos en el sistema',
    example: 1250
  })
  totalArchivos: number;

  @ApiProperty({
    description: 'Distribución por categoría',
    example: {
      'ESTUDIO_RADIOGRAFICO': 450,
      'FOTO_TRATAMIENTO': 320,
      'DOCUMENTO_LEGAL': 280,
      'DOCUMENTO_ODONTOGRAMA': 200
    }
  })
  porCategoria: Record<string, number>;

  @ApiProperty({
    description: 'Distribución por tipo de entidad',
    example: {
      'CasoClinico': 600,
      'Tratamiento': 350,
      'Paciente': 200,
      'Odontograma': 100
    }
  })
  porEntidad: Record<string, number>;

  @ApiProperty({
    description: 'Distribución por tipo MIME',
    example: {
      'image/jpeg': 680,
      'application/pdf': 420,
      'image/png': 150
    }
  })
  porTipoMime: Record<string, number>;

  @ApiProperty({
    description: 'Tamaño total estimado en MB',
    example: 2048.5
  })
  tamañoTotalMB: number;

  @ApiProperty({
    description: 'Promedio de archivos por entidad',
    example: 2.8
  })
  promedioArchivosPorEntidad: number;
}

/**
 * DTO para operaciones masivas en archivos
 * 
 * Permite realizar operaciones sobre múltiples archivos
 * simultáneamente para eficiencia administrativa.
 * 
 * @example
 * {
 *   "archivoIds": [1, 2, 3, 4],
 *   "operacion": "eliminar",
 *   "motivo": "Archivos duplicados eliminados en limpieza mensual"
 * }
 */
export class OperacionMasivaArchivosDto {
  @ApiProperty({
    description: 'Lista de IDs de archivos para la operación',
    example: [1, 2, 3, 4],
    type: 'array',
    items: { type: 'number' }
  })
  @IsArray({ message: 'Los IDs de archivos deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un ID de archivo' })
  @IsInt({ each: true, message: 'Todos los IDs deben ser números enteros' })
  @Min(1, { each: true, message: 'Todos los IDs deben ser mayor a 0' })
  archivoIds: number[];

  @ApiProperty({
    description: 'Tipo de operación a realizar',
    enum: ['eliminar', 'mover', 'actualizar_categoria'],
    example: 'eliminar'
  })
  @IsNotEmpty({ message: 'La operación es obligatoria' })
  @IsString({ message: 'La operación debe ser una cadena' })
  @IsIn(['eliminar', 'mover', 'actualizar_categoria'], {
    message: 'Operación no válida'
  })
  operacion: string;

  @ApiPropertyOptional({
    description: 'Nueva categoría (para operación actualizar_categoria)',
    enum: CategoriaArchivo
  })
  @IsOptional()
  @IsEnum(CategoriaArchivo, { message: 'Categoría no válida' })
  nuevaCategoria?: CategoriaArchivo;

  @ApiPropertyOptional({
    description: 'Motivo de la operación',
    example: 'Limpieza mensual de archivos duplicados',
    maxLength: 300
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @Length(0, 300, { message: 'El motivo no puede exceder 300 caracteres' })
  motivo?: string;
}
