import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
  UsuarioResponseDto,
  UsuariosPaginatedResponseDto,
  UsuarioFiltersDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import { Prisma, TipoDocumento } from '@prisma/client';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos para el procesamiento del Excel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Representa una fila leída directamente del Excel (todo como string / undefined).
 * Los nombres de las columnas deben coincidir exactamente con el header del template.
 */
interface ExcelRow {
  nombre?: string;
  apellido?: string;
  email?: string;
  fechaNacimiento?: string; // YYYY-MM-DD
  password?: string;
  telefono?: string;
  direccion?: string;
  tipoDocumento?: string; // CEDULA | PASAPORTE | RUC | OTRO
  numeroDocumento?: string;
  roleId?: string | number;
  parroquiaId?: string | number;
  activo?: string | boolean;
  NotasAdicionales?: string;
  /**
   * Nombres de especialidades separados por coma.
   * Ejemplo: "Ortodoncia, Endodoncia"
   * El service resuelve los nombres a IDs consultando la BD.
   */
  especialidades?: string;
}

/**
 * Resultado por fila del procesamiento masivo.
 */
export interface ImportRowResult {
  fila: number;
  estado: 'creado' | 'actualizado' | 'error';
  email?: string;
  mensaje: string;
}

/**
 * Resumen final devuelto al controlador.
 */
export interface ImportExcelResult {
  total: number;
  creados: number;
  actualizados: number;
  errores: number;
  detalles: ImportRowResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de validación
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_DOCUMENTO_VALIDOS = Object.values(TipoDocumento);

const COLUMNAS_REQUERIDAS: (keyof ExcelRow)[] = [
  'nombre',
  'apellido',
  'email',
  'fechaNacimiento',
  'password',
  'tipoDocumento',
  'numeroDocumento',
  'roleId',
];

// ─────────────────────────────────────────────────────────────────────────────
// Servicio
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Servicio para manejar operaciones CRUD de usuarios.
 * Incluye validaciones de negocio, transformaciones de datos
 * e importación masiva desde archivos Excel.
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  // ───────────────────────────────────────────────────────────────────────────
  // CRUD estándar
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Crear un nuevo usuario en el sistema.
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    await this.validateUniqueEmail(createUsuarioDto.email);
    await this.validateUniqueDocument(
      createUsuarioDto.tipoDocumento,
      createUsuarioDto.numeroDocumento,
    );
    await this.validateRoleExists(createUsuarioDto.roleId);

    if (createUsuarioDto.parroquiaId) {
      await this.validateParroquiaExists(createUsuarioDto.parroquiaId);
    }

    if (createUsuarioDto.especialidadIds?.length) {
      await this.validateEspecialidadesExist(createUsuarioDto.especialidadIds);
    }

    const hashedPassword = await this.hashPassword(createUsuarioDto.password);

    try {
      const usuario = await this.prisma.$transaction(async (prisma) => {
        const newUsuario = await prisma.usuario.create({
          data: {
            nombre: createUsuarioDto.nombre,
            apellido: createUsuarioDto.apellido,
            email: createUsuarioDto.email,
            password: hashedPassword,
            fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
            telefono: createUsuarioDto.telefono,
            direccion: createUsuarioDto.direccion,
            NotasAdicionales: createUsuarioDto.NotasAdicionales,
            parroquiaId: createUsuarioDto.parroquiaId,
            roleId: createUsuarioDto.roleId,
            activo: createUsuarioDto.activo ?? true,
            tipoDocumento: createUsuarioDto.tipoDocumento,
            numeroDocumento: createUsuarioDto.numeroDocumento,
          },
        });

        if (createUsuarioDto.especialidadIds?.length) {
          await prisma.usuarioEspecialidad.createMany({
            data: createUsuarioDto.especialidadIds.map((especialidadId) => ({
              usuarioId: newUsuario.id,
              especialidadId,
            })),
          });
        }

        return newUsuario;
      });

      return this.findOneWithRelations(usuario.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario con estos datos únicos');
      }
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con filtros y paginación.
   */
  async findAll(filters: UsuarioFiltersDto): Promise<UsuariosPaginatedResponseDto> {
    const { page = 1, limit = 10, orderBy = 'fechaRegistro', orderDirection = 'desc' } = filters;

    const where = this.buildWhereConditions(filters);

    const include = {
      role: { select: { id: true, nombre: true, description: true } },
      parroquia: {
        select: {
          id: true,
          nombre: true,
          canton: {
            select: {
              id: true,
              nombre: true,
              provincia: { select: { id: true, nombre: true } },
            },
          },
        },
      },
      especialidades: {
        select: {
          especialidad: { select: { id: true, nombre: true, descripcion: true } },
        },
      },
    };

    const [usuarios, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        include,
        orderBy: { [orderBy]: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.usuario.count({ where }),
    ]);

    const usuariosResponse = usuarios.map((u) => this.transformToResponseDto(u));
    return new UsuariosPaginatedResponseDto(usuariosResponse, total, page, limit);
  }

  /**
   * Obtener un usuario por ID.
   */
  async findOne(id: number): Promise<UsuarioResponseDto> {
    return this.findOneWithRelations(id);
  }

  /**
   * Actualizar un usuario existente.
   */
  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    await this.findOneWithRelations(id);

    if (updateUsuarioDto.email) {
      await this.validateUniqueEmail(updateUsuarioDto.email, id);
    }

    if (updateUsuarioDto.tipoDocumento && updateUsuarioDto.numeroDocumento) {
      await this.validateUniqueDocument(
        updateUsuarioDto.tipoDocumento,
        updateUsuarioDto.numeroDocumento,
        id,
      );
    }

    if (updateUsuarioDto.roleId) {
      await this.validateRoleExists(updateUsuarioDto.roleId);
    }

    if (updateUsuarioDto.parroquiaId) {
      await this.validateParroquiaExists(updateUsuarioDto.parroquiaId);
    }

    try {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.usuario.update({
          where: { id },
          data: {
            ...updateUsuarioDto,
            fechaNacimiento: updateUsuarioDto.fechaNacimiento
              ? new Date(updateUsuarioDto.fechaNacimiento)
              : undefined,
          },
        });

        if (updateUsuarioDto.especialidadIds !== undefined) {
          await prisma.usuarioEspecialidad.deleteMany({ where: { usuarioId: id } });

          if (updateUsuarioDto.especialidadIds.length > 0) {
            await this.validateEspecialidadesExist(updateUsuarioDto.especialidadIds);
            await prisma.usuarioEspecialidad.createMany({
              data: updateUsuarioDto.especialidadIds.map((especialidadId) => ({
                usuarioId: id,
                especialidadId,
              })),
            });
          }
        }
      });

      return this.findOneWithRelations(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario con estos datos únicos');
      }
      throw error;
    }
  }

  /**
   * Cambiar la contraseña de un usuario.
   */
  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, password: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      usuario.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const hashedNewPassword = await this.hashPassword(changePasswordDto.newPassword);

    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  /**
   * Activar o desactivar un usuario.
   */
  async toggleActive(id: number, activo: boolean): Promise<UsuarioResponseDto> {
    await this.findOneWithRelations(id);
    await this.prisma.usuario.update({ where: { id }, data: { activo } });
    return this.findOneWithRelations(id);
  }

  /**
   * Eliminar un usuario (soft delete → desactiva).
   */
  async remove(id: number): Promise<{ message: string }> {
    await this.findOneWithRelations(id);
    await this.prisma.usuario.update({ where: { id }, data: { activo: false } });
    return { message: `Usuario con ID ${id} desactivado exitosamente` };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // IMPORTACIÓN MASIVA DESDE EXCEL
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Procesa un archivo Excel (.xlsx / .xls) para crear o actualizar usuarios en bloque.
   *
   * Estrategia de upsert:
   *  - Si ya existe un usuario con el mismo `email` → se actualiza.
   *  - Si ya existe un usuario con el mismo `numeroDocumento` → se actualiza.
   *  - En caso contrario → se crea.
   *
   * Columnas esperadas en la primera hoja del Excel (el orden no importa):
   * ┌──────────────────┬───────────────────────────────────────────────────────┐
   * │ Columna          │ Descripción / Valores aceptados                       │
   * ├──────────────────┼───────────────────────────────────────────────────────┤
   * │ nombre           │ Texto (2–50 caracteres). REQUERIDO                    │
   * │ apellido         │ Texto (2–50 caracteres). REQUERIDO                    │
   * │ email            │ Correo electrónico válido. REQUERIDO                  │
   * │ fechaNacimiento  │ Fecha en formato YYYY-MM-DD. REQUERIDO                │
   * │ password         │ Mínimo 8 caracteres. REQUERIDO solo al crear          │
   * │ tipoDocumento    │ CEDULA | PASAPORTE | RUC | OTRO. REQUERIDO            │
   * │ numeroDocumento  │ Texto (8–20 caracteres). REQUERIDO                    │
   * │ roleId           │ Número entero (ID del rol). REQUERIDO                 │
   * │ telefono         │ Texto. Opcional                                       │
   * │ direccion        │ Texto (máx. 200 caracteres). Opcional                 │
   * │ parroquiaId      │ Número entero. Opcional                               │
   * │ activo           │ true | false | 1 | 0. Opcional (defecto: true)        │
   * │ NotasAdicionales │ Texto (máx. 500 caracteres). Opcional                 │
   * │ especialidades   │ Nombres separados por coma. Ej: "Ortodoncia,Cirugía"  │
   * │                  │ Opcional. Se resuelven por nombre en la BD.           │
   * └──────────────────┴───────────────────────────────────────────────────────┘
   *
   * @param fileBuffer Buffer del archivo Excel recibido (Multer / Fastify).
   * @returns Resumen del procesamiento con el detalle fila por fila.
   */
  async importFromExcel(fileBuffer: Buffer): Promise<ImportExcelResult> {
    // 1. Parsear el archivo
    const rows = this.parseExcelBuffer(fileBuffer);

    if (rows.length === 0) {
      throw new BadRequestException(
        'El archivo Excel está vacío o no contiene filas de datos',
      );
    }

    // 2. Pre-cargar el catálogo de especialidades para resolver nombres → IDs
    //    en una sola consulta (evita N+1 queries)
    const catalogoEspecialidades = await this.buildEspecialidadesCatalog();

    // 3. Procesar cada fila de forma independiente (errores no detienen el proceso)
    const detalles: ImportRowResult[] = [];
    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    for (let i = 0; i < rows.length; i++) {
      const numeroFila = i + 2; // +2 porque la fila 1 es el header
      const row = rows[i];

      const resultado = await this.processExcelRow(
        row,
        numeroFila,
        catalogoEspecialidades,
      );

      detalles.push(resultado);

      if (resultado.estado === 'creado') creados++;
      else if (resultado.estado === 'actualizado') actualizados++;
      else errores++;
    }

    return {
      total: rows.length,
      creados,
      actualizados,
      errores,
      detalles,
    };
  }

  /**
   * Genera y retorna el buffer de un archivo Excel de plantilla (.xlsx)
   * que el usuario puede descargar para completar y subir.
   *
   * El archivo incluye:
   *  - Una hoja "Usuarios" con las cabeceras y una fila de ejemplo.
   *  - Una hoja "Instrucciones" con la descripción de cada columna
   *    y la lista actualizada de especialidades disponibles en la BD.
   */
  async generateImportTemplate(): Promise<Buffer> {
    // Obtener catálogos actualizados de la BD
    const [especialidades, roles] = await Promise.all([
      this.prisma.especialidad.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.role.findMany({
        select: { id: true, nombre: true },
        orderBy: { nombre: 'asc' },
      }),
    ]);

    const wb = XLSX.utils.book_new();

    // ── Hoja 1: Plantilla de datos ──────────────────────────────────────────
    const headers = [
      'nombre',
      'apellido',
      'email',
      'fechaNacimiento',
      'password',
      'tipoDocumento',
      'numeroDocumento',
      'roleId',
      'telefono',
      'direccion',
      'parroquiaId',
      'activo',
      'NotasAdicionales',
      'especialidades',
    ];

    const exampleRow = [
      'Juan',
      'Pérez',
      'juan.perez@ejemplo.com',
      '1990-05-15',
      'Contraseña123',
      'CEDULA',
      '1712345678',
      roles[0]?.id ?? 1,
      '0999999999',
      'Av. Principal 123',
      '',
      'true',
      '',
      especialidades.slice(0, 2).map((e) => e.nombre).join(', '),
    ];

    const wsData = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

    // Anchos de columna para mejor lectura
    wsData['!cols'] = headers.map(() => ({ wch: 22 }));

    XLSX.utils.book_append_sheet(wb, wsData, 'Usuarios');

    // ── Hoja 2: Instrucciones ────────────────────────────────────────────────
    const instruccionesData: (string | number)[][] = [
      ['INSTRUCCIONES DE USO'],
      [''],
      ['• Complete la hoja "Usuarios" a partir de la fila 2 (la fila 1 son los encabezados).'],
      ['• Si un usuario ya existe (mismo email o documento), sus datos serán ACTUALIZADOS.'],
      ['• Si el usuario no existe, será CREADO.'],
      ['• No elimine ni cambie los nombres de los encabezados.'],
      ['• El campo "password" solo es obligatorio para usuarios nuevos.'],
      ['  Para usuarios existentes déjelo vacío para no modificar la contraseña.'],
      [''],
      ['DESCRIPCIÓN DE COLUMNAS'],
      ['Columna', 'Obligatorio', 'Valores aceptados / Notas'],
      ['nombre', 'SÍ', 'Texto, entre 2 y 50 caracteres'],
      ['apellido', 'SÍ', 'Texto, entre 2 y 50 caracteres'],
      ['email', 'SÍ', 'Correo electrónico válido'],
      ['fechaNacimiento', 'SÍ', 'Formato: YYYY-MM-DD  (ej: 1990-05-15)'],
      ['password', 'Solo al crear', 'Mínimo 8 caracteres'],
      ['tipoDocumento', 'SÍ', 'CEDULA  |  PASAPORTE  |  RUC  |  OTRO'],
      ['numeroDocumento', 'SÍ', 'Texto, entre 8 y 20 caracteres'],
      ['roleId', 'SÍ', 'Ver tabla de roles más abajo'],
      ['telefono', 'No', 'Número de teléfono'],
      ['direccion', 'No', 'Texto, máximo 200 caracteres'],
      ['parroquiaId', 'No', 'ID numérico de la parroquia'],
      ['activo', 'No', 'true  o  false  (por defecto: true)'],
      ['NotasAdicionales', 'No', 'Texto, máximo 500 caracteres'],
      [
        'especialidades',
        'No',
        'Nombres separados por coma  (ej: Ortodoncia, Endodoncia)',
      ],
      [''],
      ['ROLES DISPONIBLES'],
      ['ID', 'Nombre'],
      ...roles.map((r) => [r.id, r.nombre]),
      [''],
      ['ESPECIALIDADES DISPONIBLES'],
      ['Nombre (escribir exactamente como aparece aquí)'],
      ...especialidades.map((e) => [e.nombre]),
    ];

    const wsInstrucciones = XLSX.utils.aoa_to_sheet(instruccionesData);
    wsInstrucciones['!cols'] = [{ wch: 40 }, { wch: 18 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstrucciones, 'Instrucciones');

    // Escribir a buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return Buffer.from(buffer);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HELPERS PRIVADOS — IMPORTACIÓN
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Lee el buffer del Excel y devuelve las filas como objetos planos.
   */
  private parseExcelBuffer(buffer: Buffer): ExcelRow[] {
    let workbook: XLSX.WorkBook;

    try {
      workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    } catch {
      throw new BadRequestException(
        'No se pudo leer el archivo. Asegúrese de subir un archivo Excel (.xlsx o .xls).',
      );
    }

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new BadRequestException('El archivo Excel no contiene hojas de datos');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // header: 1 → usa la primera fila como cabecera de los objetos
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      header: undefined,
      defval: undefined,
      raw: false, // Convierte fechas y números a string para manejarlos uniformemente
    });

    return rows;
  }

  /**
   * Construye un mapa nombre_normalizado → id con todas las especialidades de la BD.
   * La normalización (minúsculas + trim) permite tolerancia a mayúsculas/espacios.
   */
  private async buildEspecialidadesCatalog(): Promise<Map<string, number>> {
    const especialidades = await this.prisma.especialidad.findMany({
      select: { id: true, nombre: true },
    });

    const catalog = new Map<string, number>();
    for (const esp of especialidades) {
      catalog.set(esp.nombre.toLowerCase().trim(), esp.id);
    }
    return catalog;
  }

  /**
   * Procesa una sola fila del Excel:
   * valida, decide si crear o actualizar, persiste y devuelve el resultado.
   */
  private async processExcelRow(
    row: ExcelRow,
    numeroFila: number,
    catalogoEspecialidades: Map<string, number>,
  ): Promise<ImportRowResult> {
    try {
      // ── 1. Normalizar y limpiar los datos de la fila ──────────────────────
      const datos = this.normalizeRow(row);

      // ── 2. Validar campos obligatorios ────────────────────────────────────
      const errorValidacion = this.validateRequiredFields(datos);
      if (errorValidacion) {
        return {
          fila: numeroFila,
          estado: 'error',
          email: datos.email,
          mensaje: errorValidacion,
        };
      }

      // ── 3. Resolver especialidades (nombres → IDs) ────────────────────────
      const especialidadIds = this.resolveEspecialidades(
        datos.especialidades,
        catalogoEspecialidades,
      );

      if (especialidadIds.error) {
        return {
          fila: numeroFila,
          estado: 'error',
          email: datos.email,
          mensaje: especialidadIds.error,
        };
      }

      // ── 4. Buscar si el usuario ya existe (por email o documento) ─────────
      const usuarioExistente = await this.findExistingUserForImport(
        datos.email!,
        datos.numeroDocumento!,
      );

      // ── 5. Crear o actualizar ─────────────────────────────────────────────
      if (usuarioExistente) {
        await this.updateUserFromExcel(usuarioExistente.id, datos, especialidadIds.ids!);
        return {
          fila: numeroFila,
          estado: 'actualizado',
          email: datos.email,
          mensaje: `Usuario actualizado correctamente (ID: ${usuarioExistente.id})`,
        };
      } else {
        // Para crear se requiere contraseña
        if (!datos.password) {
          return {
            fila: numeroFila,
            estado: 'error',
            email: datos.email,
            mensaje:
              'El campo "password" es obligatorio para usuarios nuevos',
          };
        }

        const nuevoUsuario = await this.createUserFromExcel(
          datos,
          especialidadIds.ids!,
        );
        return {
          fila: numeroFila,
          estado: 'creado',
          email: datos.email,
          mensaje: `Usuario creado correctamente (ID: ${nuevoUsuario.id})`,
        };
      }
    } catch (error) {
      // Captura errores inesperados por fila para que el resto siga procesándose
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido al procesar la fila';
      return {
        fila: numeroFila,
        estado: 'error',
        email: row.email?.toString().trim(),
        mensaje,
      };
    }
  }

  /**
   * Normaliza y limpia los valores de una fila del Excel.
   */
  private normalizeRow(row: ExcelRow): ExcelRow {
    return {
      nombre: row.nombre?.toString().trim(),
      apellido: row.apellido?.toString().trim(),
      email: row.email?.toString().toLowerCase().trim(),
      fechaNacimiento: this.normalizeDateString(row.fechaNacimiento),
      password: row.password?.toString().trim() || undefined,
      tipoDocumento: row.tipoDocumento?.toString().toUpperCase().trim(),
      numeroDocumento: row.numeroDocumento?.toString().trim(),
      roleId: row.roleId !== undefined ? Number(row.roleId) : undefined,
      telefono: row.telefono?.toString().trim() || undefined,
      direccion: row.direccion?.toString().trim() || undefined,
      parroquiaId:
        row.parroquiaId !== undefined && row.parroquiaId !== ''
          ? Number(row.parroquiaId)
          : undefined,
      activo: this.normalizeBoolean(row.activo),
      NotasAdicionales: row.NotasAdicionales?.toString().trim() || undefined,
      especialidades: row.especialidades?.toString().trim() || undefined,
    };
  }

  /**
   * Normaliza una cadena de fecha a formato YYYY-MM-DD.
   * Acepta Date objects (cuando cellDates:true), strings ISO y strings con /.
   */
  private normalizeDateString(value: unknown): string | undefined {
    if (!value) return undefined;

    // XLSX con cellDates: true puede entregar un objeto Date
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    const str = String(value).trim();
    if (!str) return undefined;

    // Formato con barras: DD/MM/YYYY o MM/DD/YYYY → convertir a YYYY-MM-DD
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const parts = str.split('/');
      // Asumimos DD/MM/YYYY (formato hispanohablante)
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    // Ya en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    return str; // Devolver tal cual; la validación posterior informará el error
  }

  /**
   * Convierte distintas representaciones de booleano a boolean.
   */
  private normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    const str = String(value).toLowerCase().trim();
    if (str === 'false' || str === '0' || str === 'no') return false;
    return true; // default activo
  }

  /**
   * Valida que todos los campos obligatorios estén presentes y sean correctos.
   * Retorna un string con el primer error encontrado, o null si todo está bien.
   */
  private validateRequiredFields(datos: ExcelRow): string | null {
    for (const campo of COLUMNAS_REQUERIDAS) {
      if (campo === 'password') continue; // Se valida por separado (no requerida al actualizar)
      if (!datos[campo]) {
        return `El campo "${campo}" es obligatorio y está vacío`;
      }
    }

    // Validar tipo de documento
    if (!TIPOS_DOCUMENTO_VALIDOS.includes(datos.tipoDocumento as TipoDocumento)) {
      return `Tipo de documento inválido: "${datos.tipoDocumento}". Use: ${TIPOS_DOCUMENTO_VALIDOS.join(' | ')}`;
    }

    // Validar formato de fecha
    const fecha = new Date(datos.fechaNacimiento!);
    if (isNaN(fecha.getTime())) {
      return `Fecha de nacimiento inválida: "${datos.fechaNacimiento}". Use el formato YYYY-MM-DD`;
    }

    // Validar roleId
    if (isNaN(Number(datos.roleId))) {
      return `roleId debe ser un número entero válido`;
    }

    // Validar longitud mínima del documento
    const doc = datos.numeroDocumento ?? '';
    if (doc.length < 8 || doc.length > 20) {
      return `El número de documento debe tener entre 8 y 20 caracteres (actual: ${doc.length})`;
    }

    return null;
  }

  /**
   * Resuelve los nombres de especialidades a sus IDs usando el catálogo pre-cargado.
   * La resolución es tolerante a mayúsculas/minúsculas y espacios extra.
   */
  private resolveEspecialidades(
    especialidadesStr: string | undefined,
    catalogo: Map<string, number>,
  ): { ids?: number[]; error?: string } {
    if (!especialidadesStr) {
      return { ids: [] };
    }

    const nombres = especialidadesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ids: number[] = [];
    const noEncontrados: string[] = [];

    for (const nombre of nombres) {
      const id = catalogo.get(nombre.toLowerCase().trim());
      if (id !== undefined) {
        ids.push(id);
      } else {
        noEncontrados.push(nombre);
      }
    }

    if (noEncontrados.length > 0) {
      return {
        error: `Las siguientes especialidades no existen en el sistema: "${noEncontrados.join('", "')}"`,
      };
    }

    return { ids };
  }

  /**
   * Busca un usuario existente por email o número de documento.
   * Retorna el primero encontrado o null.
   */
  private async findExistingUserForImport(
    email: string,
    numeroDocumento: string,
  ): Promise<{ id: number } | null> {
    return this.prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { numeroDocumento }],
      },
      select: { id: true },
    });
  }

  /**
   * Crea un nuevo usuario a partir de los datos normalizados del Excel.
   */
  private async createUserFromExcel(
    datos: ExcelRow,
    especialidadIds: number[],
  ): Promise<{ id: number }> {
    const hashedPassword = await this.hashPassword(datos.password!);

    return this.prisma.$transaction(async (prisma) => {
      const usuario = await prisma.usuario.create({
        data: {
          nombre: datos.nombre!,
          apellido: datos.apellido!,
          email: datos.email!,
          password: hashedPassword,
          fechaNacimiento: new Date(datos.fechaNacimiento!),
          tipoDocumento: datos.tipoDocumento as TipoDocumento,
          numeroDocumento: datos.numeroDocumento!,
          roleId: Number(datos.roleId),
          telefono: datos.telefono,
          direccion: datos.direccion,
          parroquiaId: datos.parroquiaId ? Number(datos.parroquiaId) : undefined,
          activo: datos.activo as boolean,
          NotasAdicionales: datos.NotasAdicionales,
        },
        select: { id: true },
      });

      if (especialidadIds.length > 0) {
        await prisma.usuarioEspecialidad.createMany({
          data: especialidadIds.map((especialidadId) => ({
            usuarioId: usuario.id,
            especialidadId,
          })),
        });
      }

      return usuario;
    });
  }

  /**
   * Actualiza un usuario existente a partir de los datos normalizados del Excel.
   * Solo actualiza los campos que vienen con valor; los vacíos se ignoran.
   * Las especialidades siempre se reemplazan completamente si la columna tiene datos.
   */
  private async updateUserFromExcel(
    id: number,
    datos: ExcelRow,
    especialidadIds: number[],
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      // Construir el objeto de actualización solo con los campos presentes
      const updateData: Prisma.UsuarioUpdateInput = {};

      if (datos.nombre) updateData.nombre = datos.nombre;
      if (datos.apellido) updateData.apellido = datos.apellido;
      if (datos.email) updateData.email = datos.email;
      if (datos.fechaNacimiento) updateData.fechaNacimiento = new Date(datos.fechaNacimiento);
      if (datos.tipoDocumento) updateData.tipoDocumento = datos.tipoDocumento as TipoDocumento;
      if (datos.numeroDocumento) updateData.numeroDocumento = datos.numeroDocumento;
      if (datos.roleId) updateData.role = { connect: { id: Number(datos.roleId) } };
      if (datos.telefono !== undefined) updateData.telefono = datos.telefono;
      if (datos.direccion !== undefined) updateData.direccion = datos.direccion;
      if (datos.parroquiaId)
        updateData.parroquia = { connect: { id: Number(datos.parroquiaId) } };
      if (datos.activo !== undefined) updateData.activo = datos.activo as boolean;
      if (datos.NotasAdicionales !== undefined)
        updateData.NotasAdicionales = datos.NotasAdicionales;

      // Solo actualiza la contraseña si viene explícitamente en el Excel
      if (datos.password) {
        updateData.password = await this.hashPassword(datos.password);
      }

      await prisma.usuario.update({ where: { id }, data: updateData });

      // Actualizar especialidades si la columna tenía algún dato (incluso vacío = limpiar)
      // Se reemplaza el listado completo para mantener consistencia
      await prisma.usuarioEspecialidad.deleteMany({ where: { usuarioId: id } });

      if (especialidadIds.length > 0) {
        await prisma.usuarioEspecialidad.createMany({
          data: especialidadIds.map((especialidadId) => ({
            usuarioId: id,
            especialidadId,
          })),
        });
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HELPERS PRIVADOS — CRUD
  // ───────────────────────────────────────────────────────────────────────────

  private async findOneWithRelations(id: number): Promise<UsuarioResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, nombre: true, description: true } },
        parroquia: {
          select: {
            id: true,
            nombre: true,
            canton: {
              select: {
                id: true,
                nombre: true,
                provincia: { select: { id: true, nombre: true } },
              },
            },
          },
        },
        especialidades: {
          select: {
            especialidad: { select: { id: true, nombre: true, descripcion: true } },
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.transformToResponseDto(usuario);
  }

  private buildWhereConditions(filters: UsuarioFiltersDto): Prisma.UsuarioWhereInput {
    const where: Prisma.UsuarioWhereInput = {};

    if (filters.nombre) where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    if (filters.apellido) where.apellido = { contains: filters.apellido, mode: 'insensitive' };
    if (filters.email) where.email = { contains: filters.email, mode: 'insensitive' };
    if (filters.activo !== undefined) where.activo = filters.activo;
    if (filters.roleId) where.roleId = filters.roleId;
    if (filters.parroquiaId) where.parroquiaId = filters.parroquiaId;
    if (filters.tipoDocumento) where.tipoDocumento = filters.tipoDocumento;

    if (filters.fechaNacimientoDesde || filters.fechaNacimientoHasta) {
      where.fechaNacimiento = {};
      if (filters.fechaNacimientoDesde)
        where.fechaNacimiento.gte = new Date(filters.fechaNacimientoDesde);
      if (filters.fechaNacimientoHasta)
        where.fechaNacimiento.lte = new Date(filters.fechaNacimientoHasta);
    }

    if (filters.fechaCreacionDesde || filters.fechaCreacionHasta) {
      where.fechaRegistro = {};
      if (filters.fechaCreacionDesde)
        where.fechaRegistro.gte = new Date(filters.fechaCreacionDesde);
      if (filters.fechaCreacionHasta)
        where.fechaRegistro.lte = new Date(filters.fechaCreacionHasta);
    }

    return where;
  }

  private transformToResponseDto(usuario: any): UsuarioResponseDto {
    return new UsuarioResponseDto({
      ...usuario,
      especialidades: usuario.especialidades?.map((ue: any) => ue.especialidad) ?? [],
    });
  }

  private async validateUniqueEmail(email: string, excludeId?: number): Promise<void> {
    const where: Prisma.UsuarioWhereInput = { email };
    if (excludeId) where.NOT = { id: excludeId };

    const existingUser = await this.prisma.usuario.findFirst({ where });
    if (existingUser) {
      throw new ConflictException(`Ya existe un usuario con el email: ${email}`);
    }
  }

  private async validateUniqueDocument(
    tipoDocumento: any,
    numeroDocumento: string,
    excludeId?: number,
  ): Promise<void> {
    const where: Prisma.UsuarioWhereInput = { tipoDocumento, numeroDocumento };
    if (excludeId) where.NOT = { id: excludeId };

    const existingUser = await this.prisma.usuario.findFirst({ where });
    if (existingUser) {
      throw new ConflictException(
        `Ya existe un usuario con el documento ${tipoDocumento}: ${numeroDocumento}`,
      );
    }
  }

  private async validateRoleExists(roleId: number): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
  }

  private async validateParroquiaExists(parroquiaId: number): Promise<void> {
    const parroquia = await this.prisma.parroquia.findUnique({ where: { id: parroquiaId } });
    if (!parroquia)
      throw new NotFoundException(`Parroquia con ID ${parroquiaId} no encontrada`);
  }

  private async validateEspecialidadesExist(especialidadIds: number[]): Promise<void> {
    const especialidades = await this.prisma.especialidad.findMany({
      where: { id: { in: especialidadIds } },
    });

    const foundIds = especialidades.map((e) => e.id);
    const missingIds = especialidadIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Especialidades no encontradas con IDs: ${missingIds.join(', ')}`,
      );
    }
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Exportar usuarios a Excel
   * Genera un archivo Excel con todos los usuarios que coincidan con los filtros
   *
   * @param filters Filtros para seleccionar qué usuarios exportar
   * @returns Buffer del archivo Excel generado
   */
  async exportToExcel(filters: UsuarioFiltersDto): Promise<Buffer> {
    // Obtener usuarios con los filtros aplicados
    const where = this.buildWhereConditions(filters);
    const orderBy = filters.orderBy || 'fechaRegistro';
    const orderDirection = filters.orderDirection || 'desc';

    const usuarios = await this.prisma.usuario.findMany({
      where,
      include: {
        role: { select: { nombre: true } },
        parroquia: {
          select: {
            nombre: true,
            canton: {
              select: {
                nombre: true,
                provincia: { select: { nombre: true } },
              },
            },
          },
        },
        especialidades: {
          select: {
            especialidad: { select: { nombre: true } },
          },
        },
      },
      orderBy: { [orderBy]: orderDirection },
    });

    // Preparar datos para el Excel
    const excelData = usuarios.map((usuario) => ({
      ID: usuario.id,
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      Email: usuario.email,
      'Tipo Documento': usuario.tipoDocumento,
      'Número Documento': usuario.numeroDocumento,
      Teléfono: usuario.telefono || '',
      Dirección: usuario.direccion || '',
      'Fecha Nacimiento': usuario.fechaNacimiento
        ? new Date(usuario.fechaNacimiento).toISOString().split('T')[0]
        : '',
      Rol: usuario.role?.nombre || '',
      Parroquia: usuario.parroquia?.nombre || '',
      Cantón: usuario.parroquia?.canton?.nombre || '',
      Provincia: usuario.parroquia?.canton?.provincia?.nombre || '',
      Especialidades: usuario.especialidades
        .map((e) => e.especialidad.nombre)
        .join(', '),
      Activo: usuario.activo ? 'Sí' : 'No',
      'Fecha Registro': usuario.fechaRegistro
        ? new Date(usuario.fechaRegistro).toISOString().split('T')[0]
        : '',
      'Notas Adicionales': usuario.NotasAdicionales || '',
    }));

    // Crear el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 30 }, // Email
      { wch: 15 }, // Tipo Documento
      { wch: 15 }, // Número Documento
      { wch: 15 }, // Teléfono
      { wch: 30 }, // Dirección
      { wch: 15 }, // Fecha Nacimiento
      { wch: 20 }, // Rol
      { wch: 20 }, // Parroquia
      { wch: 20 }, // Cantón
      { wch: 20 }, // Provincia
      { wch: 30 }, // Especialidades
      { wch: 10 }, // Activo
      { wch: 15 }, // Fecha Registro
      { wch: 40 }, // Notas Adicionales
    ];
    worksheet['!cols'] = columnWidths;

    // Generar el buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}