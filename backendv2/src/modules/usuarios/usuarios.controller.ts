import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UsuariosService } from './usuarios.service';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioResponseDto,
  UsuariosPaginatedResponseDto,
  UsuarioFiltersDto,
} from './dto';

/**
 * Controlador para manejar operaciones CRUD de usuarios
 * Incluye endpoints para gestión completa de usuarios del sistema
 * 
 * NOTA: Los guards están comentados para facilitar las pruebas.
 * En producción, descomentar los guards correspondientes.
 */
@Controller('usuarios')
// @UseGuards(JwtAuthGuard) // Descomenta para proteger todas las rutas con JWT
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Crear un nuevo usuario
   * POST /usuarios
   * Requiere permisos: CREAR_USUARIOS
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.CREAR_USUARIOS) // Descomenta para requerir permiso específico
  async create(@Body() createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.usuariosService.create(createUsuarioDto);
  }

  /**
   * Obtener todos los usuarios con filtros y paginación
   * GET /usuarios
   * Requiere permisos: VER_USUARIOS
   * 
   * Query params disponibles:
   * - nombre: string (filtro por nombre)
   * - apellido: string (filtro por apellido)
   * - email: string (filtro por email)
   * - activo: boolean (filtro por estado)
   * - roleId: number (filtro por rol)
   * - parroquiaId: number (filtro por parroquia)
   * - tipoDocumento: enum (filtro por tipo de documento)
   * - fechaNacimientoDesde: string (fecha YYYY-MM-DD)
   * - fechaNacimientoHasta: string (fecha YYYY-MM-DD)
   * - fechaCreacionDesde: string (fecha YYYY-MM-DD)
   * - fechaCreacionHasta: string (fecha YYYY-MM-DD)
   * - page: number (página, default: 1)
   * - limit: number (elementos por página, default: 10)
   * - orderBy: string (campo de ordenamiento, default: 'fechaRegistro')
   * - orderDirection: string ('asc' | 'desc', default: 'desc')
   */
  @Get()
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async findAll(@Query() query: any): Promise<UsuariosPaginatedResponseDto> {
    // Construir filtros desde query params
    const filters = new UsuarioFiltersDto({
      nombre: query.nombre,
      apellido: query.apellido,
      email: query.email,
      activo: query.activo ? query.activo === 'true' : undefined,
      roleId: query.roleId ? parseInt(query.roleId) : undefined,
      parroquiaId: query.parroquiaId ? parseInt(query.parroquiaId) : undefined,
      tipoDocumento: query.tipoDocumento,
      fechaNacimientoDesde: query.fechaNacimientoDesde,
      fechaNacimientoHasta: query.fechaNacimientoHasta,
      fechaCreacionDesde: query.fechaCreacionDesde,
      fechaCreacionHasta: query.fechaCreacionHasta,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      orderBy: query.orderBy || 'fechaRegistro',
      orderDirection: query.orderDirection || 'desc',
    });

    return this.usuariosService.findAll(filters);
  }

    /**
   * Descargar plantilla de importación de usuarios
   * GET /usuarios/template
   * Requiere permisos: VER_USUARIOS
   *
   * Genera y descarga un archivo Excel de plantilla con instrucciones y ejemplos
   */
  @Get('template')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async downloadTemplate(
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.usuariosService.generateImportTemplate();

    // Configurar headers para descarga de archivo
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="plantilla_usuarios.xlsx"`,
    });

    return new StreamableFile(buffer);
  }

  /**
   * Importar usuarios desde archivo Excel
   * POST /usuarios/import
   * Requiere permisos: CREAR_USUARIOS
   *
   * Acepta un archivo Excel con las columnas especificadas en la documentación del servicio
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.CREAR_USUARIOS) // Descomenta para requerir permiso específico
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imported: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const result = await this.usuariosService.importFromExcel(file.buffer);
    
    // Transformar el resultado al formato esperado por el frontend
    const errors = result.detalles
      .filter(d => d.estado === 'error')
      .map(d => `Fila ${d.fila}: ${d.mensaje}`);

    return {
      imported: result.creados + result.actualizados,
      errors: errors,
    };
  }

  /**
   * Exportar usuarios a Excel
   * GET /usuarios/export
   * Requiere permisos: VER_USUARIOS
   *
   * Exporta todos los usuarios (con filtros opcionales) a un archivo Excel
   */
  @Get('export')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async exportToExcel(
    @Query() query: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // Construir filtros desde query params (similar a findAll)
    const filters = new UsuarioFiltersDto({
      nombre: query.nombre,
      apellido: query.apellido,
      email: query.email,
      activo: query.activo ? query.activo === 'true' : undefined,
      roleId: query.roleId ? parseInt(query.roleId) : undefined,
      parroquiaId: query.parroquiaId ? parseInt(query.parroquiaId) : undefined,
      tipoDocumento: query.tipoDocumento,
      fechaNacimientoDesde: query.fechaNacimientoDesde,
      fechaNacimientoHasta: query.fechaNacimientoHasta,
      fechaCreacionDesde: query.fechaCreacionDesde,
      fechaCreacionHasta: query.fechaCreacionHasta,
      // Para exportar, no usar paginación (o usar límites muy altos)
      page: 1,
      limit: 10000,
      orderBy: query.orderBy || 'fechaRegistro',
      orderDirection: query.orderDirection || 'desc',
    });

    const buffer = await this.usuariosService.exportToExcel(filters);

    // Configurar headers para descarga de archivo
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="usuarios_${new Date().toISOString().split('T')[0]}.xlsx"`,
    });

    return new StreamableFile(buffer);
  }
  
  /**
   * Obtener un usuario por ID
   * GET /usuarios/:id
   * Requiere permisos: VER_USUARIOS
   */
  @Get(':id')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UsuarioResponseDto> {
    return this.usuariosService.findOne(id);
  }

  /**
   * Actualizar un usuario existente
   * PATCH /usuarios/:id
   * Requiere permisos: EDITAR_USUARIOS
   */
  @Patch(':id')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.EDITAR_USUARIOS) // Descomenta para requerir permiso específico
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  /**
   * Cambiar la contraseña de un usuario
   * PATCH /usuarios/:id/change-password
   * Requiere permisos: EDITAR_USUARIOS o ser el propio usuario
   */
  @Patch(':id/change-password')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.EDITAR_USUARIOS) // Descomenta para requerir permiso específico
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usuariosService.changePassword(id, changePasswordDto);
  }

  /**
   * Activar un usuario
   * PATCH /usuarios/:id/activate
   * Requiere permisos: EDITAR_USUARIOS
   */
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.EDITAR_USUARIOS) // Descomenta para requerir permiso específico
  async activate(@Param('id', ParseIntPipe) id: number): Promise<UsuarioResponseDto> {
    return this.usuariosService.toggleActive(id, true);
  }

  /**
   * Desactivar un usuario
   * PATCH /usuarios/:id/deactivate
   * Requiere permisos: EDITAR_USUARIOS
   */
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.EDITAR_USUARIOS) // Descomenta para requerir permiso específico
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<UsuarioResponseDto> {
    return this.usuariosService.toggleActive(id, false);
  }

  /**
   * Eliminar un usuario (soft delete - lo desactiva)
   * DELETE /usuarios/:id
   * Requiere permisos: ELIMINAR_USUARIOS
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.ELIMINAR_USUARIOS) // Descomenta para requerir permiso específico
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.usuariosService.remove(id);
  }

  /**
   * Obtener estadísticas básicas de usuarios
   * GET /usuarios/stats/overview
   * Requiere permisos: VER_USUARIOS
   */
  @Get('stats/overview')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async getStats() {
    // Esta funcionalidad se puede implementar posteriormente
    return {
      message: 'Endpoint de estadísticas - pendiente de implementación',
      // Ejemplo de lo que podría devolver:
      // totalUsuarios: number,
      // usuariosActivos: number,
      // usuariosInactivos: number,
      // usuariosPorRol: Array<{roleId: number, roleName: string, count: number}>,
      // registrosUltimos30Dias: number
    };
  }

  /**
   * Buscar usuarios por texto libre
   * GET /usuarios/search/:searchTerm
   * Requiere permisos: VER_USUARIOS
   *
   * Busca en nombre, apellido y email
   */
  @Get('search/:searchTerm')
  // @UseGuards(PermissionsGuard) // Descomenta para verificar permisos
  // @RequirePermissions(Permisos.VER_USUARIOS) // Descomenta para requerir permiso específico
  async search(
    @Param('searchTerm') searchTerm: string,
    @Query() query: any,
  ): Promise<UsuariosPaginatedResponseDto> {
    const filters = new UsuarioFiltersDto({
      // Buscar en múltiples campos (esto se puede mejorar con búsqueda full-text)
      nombre: searchTerm,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
    });

    return this.usuariosService.findAll(filters);
  }


}