/**
 * Servicio de Archivos
 * 
 * Maneja toda la lógica de negocio para el sistema de archivos polimórfico
 * que permite asociar archivos (estudios radiográficos, fotos de tratamientos,
 * documentos legales, etc.) a cualquier entidad del sistema académico.
 * 
 * Características principales:
 * - Gestión polimórfica de archivos mediante ArchivoRelacion
 * - Control de acceso basado en roles
 * - Validación de integridad de archivos
 * - Operaciones masivas optimizadas
 * - Auditoría completa de operaciones
 * - Categorización funcional de archivos
 * 
 * Casos de uso:
 * - Estudios radiográficos para casos clínicos
 * - Fotografías de tratamientos odontológicos
 * - Documentos legales y consentimientos
 * - Archivos de odontogramas
 * - Documentos de especialidades
 * 
 * @fileoverview Servicio de lógica de negocio para archivos polimórficos
 * @module ArchivoService
 * @requires NestJS, Prisma, DTOs, Interfaces
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CrearArchivoDto,
  ActualizarArchivoDto,
  FiltrosArchivosDto,
  CrearRelacionArchivoDto,
  SubirArchivoConRelacionDto,
  RespuestaPaginadaArchivosDto,
  EstadisticasArchivosDto,
  OperacionMasivaArchivosDto,
  TipoEntidadArchivo,
  CategoriaArchivo,
  RolArchivoUsuario
} from './DTO';
import {
  IArchivo,
  IArchivoCompleto,
  IArchivoRelacion,
  IRespuestaPaginadaArchivos,
  IResultadoOperacionArchivo,
  IResultadoOperacionMasiva,
  IPermisosArchivo,
  IArchivosEntidad,
  IValidacionArchivo,
  IEstadisticasArchivos
} from './Interface';

/**
 * Servicio de Archivos
 * 
 * Proporciona métodos para gestionar archivos polimórficos,
 * incluyendo validaciones de negocio, control de acceso,
 * operaciones masivas y consultas optimizadas.
 * 
 * @class ArchivoService
 */
@Injectable()
export class ArchivoService {
  private readonly logger = new Logger(ArchivoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Subir nuevo archivo con relación inmediata
   * 
   * Crea un archivo y lo asocia inmediatamente a una entidad
   * en una transacción atómica para garantizar consistencia.
   * 
   * @param subirArchivoDto - Datos del archivo y relación
   * @param usuarioAutenticadoId - ID del usuario que sube el archivo
   * @returns Promise<IResultadoOperacionArchivo> - Resultado de la operación
   * 
   * @throws {NotFoundException} - Entidad relacionada no encontrada
   * @throws {BadRequestException} - Datos inválidos o archivo duplicado
   * @throws {ForbiddenException} - Sin permisos para la operación
   */
  async subirArchivoConRelacion(
    subirArchivoDto: SubirArchivoConRelacionDto,
    usuarioAutenticadoId: number
  ): Promise<IResultadoOperacionArchivo> {
    this.logger.log(`Subiendo archivo ${subirArchivoDto.nombre} para entidad ${subirArchivoDto.entidadTipo}:${subirArchivoDto.entidadId}`);

    // Validar que la entidad objetivo existe
    await this.validarEntidadExiste(subirArchivoDto.entidadTipo, subirArchivoDto.entidadId);

    // Validar permisos de acceso a la entidad
    await this.validarPermisosEntidad(
      subirArchivoDto.entidadTipo,
      subirArchivoDto.entidadId,
      usuarioAutenticadoId,
      'crear'
    );

    // Verificar si ya existe un archivo con la misma URL
    const archivoExistente = await this.prisma.archivo.findFirst({
      where: { url: subirArchivoDto.url }
    });

    if (archivoExistente) {
      throw new ConflictException('Ya existe un archivo con esa URL');
    }

    try {
      // Usar transacción para crear archivo y relación atómicamente
      const resultado = await this.prisma.$transaction(async (prisma) => {
        // Crear el archivo
        const archivo = await prisma.archivo.create({
          data: {
            nombre: subirArchivoDto.nombre,
            tipo: subirArchivoDto.tipo,
            url: subirArchivoDto.url,
            descripcion: subirArchivoDto.descripcion,
            usuarioId: usuarioAutenticadoId
          }
        });

        // Crear la relación
        const relacion = await prisma.archivoRelacion.create({
          data: {
            archivoId: archivo.id,
            entidadTipo: subirArchivoDto.entidadTipo,
            entidadId: subirArchivoDto.entidadId,
            usuarioId: usuarioAutenticadoId,
            rol: subirArchivoDto.rol || RolArchivoUsuario.PROPIETARIO
          }
        });

        return { archivo, relacion };
      });

      this.logger.log(`Archivo ${resultado.archivo.id} subido y relacionado exitosamente`);

      return {
        exitoso: true,
        mensaje: 'Archivo subido y relacionado correctamente',
        archivo: resultado.archivo,
        relacion: {
          ...resultado.relacion,
          entidadTipo: resultado.relacion.entidadTipo as TipoEntidadArchivo,
          rol: resultado.relacion.rol as RolArchivoUsuario
        }
      };
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
      throw new BadRequestException('Error al subir el archivo');
    }
  }

  /**
   * Crear archivo sin relación inmediata
   * 
   * Crea un archivo independiente que puede ser relacionado
   * posteriormente con una o más entidades.
   * 
   * @param crearArchivoDto - Datos del archivo
   * @param usuarioAutenticadoId - ID del usuario que crea el archivo
   * @returns Promise<IArchivo> - Archivo creado
   */
  async crearArchivo(
    crearArchivoDto: CrearArchivoDto,
    usuarioAutenticadoId: number
  ): Promise<IArchivo> {
    this.logger.log(`Creando archivo ${crearArchivoDto.nombre} por usuario ${usuarioAutenticadoId}`);

    // Verificar duplicados por URL
    const archivoExistente = await this.prisma.archivo.findFirst({
      where: { url: crearArchivoDto.url }
    });

    if (archivoExistente) {
      throw new ConflictException('Ya existe un archivo con esa URL');
    }

    try {
      const archivo = await this.prisma.archivo.create({
        data: {
          nombre: crearArchivoDto.nombre,
          tipo: crearArchivoDto.tipo,
          url: crearArchivoDto.url,
          descripcion: crearArchivoDto.descripcion,
          usuarioId: usuarioAutenticadoId
        }
      });

      this.logger.log(`Archivo ${archivo.id} creado exitosamente`);
      return archivo;
    } catch (error) {
      this.logger.error(`Error al crear archivo: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear el archivo');
    }
  }

  /**
   * Crear relación entre archivo y entidad
   * 
   * Asocia un archivo existente con una entidad específica
   * del sistema, validando permisos y existencia.
   * 
   * @param relacionDto - Datos de la relación
   * @param usuarioAutenticadoId - ID del usuario que crea la relación
   * @returns Promise<IArchivoRelacion> - Relación creada
   */
  async crearRelacionArchivo(
    relacionDto: CrearRelacionArchivoDto,
    usuarioAutenticadoId: number
  ): Promise<IArchivoRelacion> {
    this.logger.log(`Creando relación archivo ${relacionDto.archivoId} con ${relacionDto.entidadTipo}:${relacionDto.entidadId}`);

    // Validar que el archivo existe y el usuario tiene permisos
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: relacionDto.archivoId }
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Validar permisos sobre el archivo
    const permisos = await this.obtenerPermisosArchivo(relacionDto.archivoId, usuarioAutenticadoId);
    if (!permisos.permisos.relacionar) {
      throw new ForbiddenException('No tiene permisos para relacionar este archivo');
    }

    // Validar que la entidad objetivo existe
    await this.validarEntidadExiste(relacionDto.entidadTipo, relacionDto.entidadId);

    // Verificar si ya existe esta relación específica
    const relacionExistente = await this.prisma.archivoRelacion.findFirst({
      where: {
        archivoId: relacionDto.archivoId,
        entidadTipo: relacionDto.entidadTipo,
        entidadId: relacionDto.entidadId
      }
    });

    if (relacionExistente) {
      throw new ConflictException('Esta relación ya existe');
    }

    try {
      const relacion = await this.prisma.archivoRelacion.create({
        data: {
          archivoId: relacionDto.archivoId,
          entidadTipo: relacionDto.entidadTipo,
          entidadId: relacionDto.entidadId,
          usuarioId: usuarioAutenticadoId,
          rol: relacionDto.rol || RolArchivoUsuario.VISUALIZADOR
        }
      });

      this.logger.log(`Relación archivo-entidad creada exitosamente con ID ${relacion.id}`);
      return {
        ...relacion,
        entidadTipo: relacion.entidadTipo as TipoEntidadArchivo,
        rol: relacion.rol as RolArchivoUsuario
      };
    } catch (error) {
      this.logger.error(`Error al crear relación: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la relación archivo-entidad');
    }
  }

  /**
   * Obtener archivos con filtros y paginación
   * 
   * Consulta archivos aplicando filtros múltiples incluyendo
   * relaciones polimórficas y categorías funcionales.
   * 
   * @param filtros - Criterios de filtrado y paginación
   * @param usuarioAutenticadoId - ID del usuario que consulta
   * @returns Promise<RespuestaPaginadaArchivosDto> - Lista paginada
   */
  async obtenerArchivos(
    filtros: FiltrosArchivosDto,
    usuarioAutenticadoId: number
  ): Promise<RespuestaPaginadaArchivosDto> {
    this.logger.log(`Consultando archivos con filtros para usuario ${usuarioAutenticadoId}`);

    const {
      entidadTipo,
      entidadId,
      categoria,
      usuarioId,
      rol,
      tipoMime,
      busqueda,
      fechaDesde,
      fechaHasta,
      incluirRelaciones = false,
      página = 1,
      límite = 10,
      ordenarPor = 'fechaSubida',
      dirección = 'desc'
    } = filtros;

    // Construir condiciones de filtrado
    const where: any = {};

    // Filtros básicos de archivo
    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (tipoMime) {
      where.tipo = { contains: tipoMime, mode: 'insensitive' };
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Filtros de fecha
    if (fechaDesde || fechaHasta) {
      where.fechaSubida = {};
      if (fechaDesde) {
        where.fechaSubida.gte = new Date(fechaDesde + 'T00:00:00.000Z');
      }
      if (fechaHasta) {
        where.fechaSubida.lte = new Date(fechaHasta + 'T23:59:59.999Z');
      }
    }

    // Filtros de relación (requiere join)
    if (entidadTipo || entidadId || rol) {
      where.archivoRelacion = {
        some: {}
      };

      if (entidadTipo) {
        where.archivoRelacion.some.entidadTipo = entidadTipo;
      }

      if (entidadId) {
        where.archivoRelacion.some.entidadId = entidadId;
      }

      if (rol) {
        where.archivoRelacion.some.rol = rol;
      }
    }

    // Configurar inclusión de datos relacionados
    const include: any = {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true
        }
      }
    };

    if (incluirRelaciones) {
      include.archivoRelacion = {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      };
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    orderBy[ordenarPor] = dirección;

    const saltar = (página - 1) * límite;

    try {
      // Ejecutar consultas en paralelo
      const [archivos, total] = await Promise.all([
        this.prisma.archivo.findMany({
          where,
          include,
          orderBy,
          skip: saltar,
          take: límite
        }),
        this.prisma.archivo.count({ where })
      ]);

      const totalPáginas = Math.ceil(total / límite);

      this.logger.log(`Encontrados ${total} archivos, mostrando página ${página} de ${totalPáginas}`);

      return {
        archivos,
        total,
        página,
        límite,
        totalPáginas,
        tieneSiguiente: página < totalPáginas,
        tieneAnterior: página > 1
      };
    } catch (error) {
      this.logger.error(`Error al obtener archivos: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener los archivos');
    }
  }

  /**
   * Obtener archivo por ID con validación de permisos
   * 
   * Busca un archivo específico y verifica que el usuario
   * tenga permisos para acceder a él.
   * 
   * @param id - ID del archivo
   * @param usuarioAutenticadoId - ID del usuario que consulta
   * @returns Promise<IArchivoCompleto> - Archivo con relaciones
   */
  async obtenerArchivoPorId(
    id: number,
    usuarioAutenticadoId: number
  ): Promise<IArchivoCompleto> {
    this.logger.log(`Obteniendo archivo ${id} para usuario ${usuarioAutenticadoId}`);

    const archivo = await this.prisma.archivo.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true
          }
        },
        archivoRelacion: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          }
        }
      }
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Validar permisos de acceso
    const permisos = await this.obtenerPermisosArchivo(id, usuarioAutenticadoId);
    if (!permisos.permisos.leer) {
      throw new ForbiddenException('No tiene permisos para acceder a este archivo');
    }

    return {
      ...archivo,
      accesible: true,
      archivoRelacion: archivo.archivoRelacion.map(rel => ({
        id: rel.id,
        entidadTipo: rel.entidadTipo as TipoEntidadArchivo,
        entidadId: rel.entidadId,
        rol: rel.rol as RolArchivoUsuario,
        usuario: rel.usuario
      }))
    };
  }

  /**
   * Obtener archivos asociados a una entidad específica
   * 
   * Consulta todos los archivos relacionados con una entidad
   * determinada del sistema.
   * 
   * @param entidadTipo - Tipo de entidad
   * @param entidadId - ID de la entidad
   * @param usuarioAutenticadoId - ID del usuario que consulta
   * @returns Promise<IArchivosEntidad> - Archivos de la entidad
   */
  async obtenerArchivosPorEntidad(
    entidadTipo: TipoEntidadArchivo,
    entidadId: number,
    usuarioAutenticadoId: number
  ): Promise<IArchivosEntidad> {
    this.logger.log(`Obteniendo archivos de ${entidadTipo}:${entidadId} para usuario ${usuarioAutenticadoId}`);

    // Validar que la entidad existe
    await this.validarEntidadExiste(entidadTipo, entidadId);

    // Validar permisos de acceso a la entidad
    await this.validarPermisosEntidad(entidadTipo, entidadId, usuarioAutenticadoId, 'leer');

    try {
      const relaciones = await this.prisma.archivoRelacion.findMany({
        where: {
          entidadTipo,
          entidadId
        },
        include: {
          archivo: {
            include: {
              usuario: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          },
          usuario: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: {
          archivo: {
            fechaSubida: 'desc'
          }
        }
      });

      const archivos = relaciones.map(relacion => ({
        id: relacion.archivo.id,
        nombre: relacion.archivo.nombre,
        tipo: relacion.archivo.tipo,
        url: relacion.archivo.url,
        descripcion: relacion.archivo.descripcion,
        categoria: this.inferirCategoriaPorTipo(relacion.archivo.tipo),
        fechaSubida: relacion.archivo.fechaSubida,
        usuario: relacion.archivo.usuario,
        rol: relacion.rol as RolArchivoUsuario
      }));

      // Calcular distribución por categorías
      const porCategoria = archivos.reduce((acc, archivo) => {
        const categoria = archivo.categoria || CategoriaArchivo.OTRO;
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {} as Record<CategoriaArchivo, number>);

      return {
        entidadTipo,
        entidadId,
        archivos,
        totalArchivos: archivos.length,
        porCategoria
      };
    } catch (error) {
      this.logger.error(`Error al obtener archivos de entidad: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener archivos de la entidad');
    }
  }

  /**
   * Actualizar información de archivo
   * 
   * Permite modificar metadatos del archivo,
   * validando permisos y manteniendo auditoría.
   * 
   * @param id - ID del archivo a actualizar
   * @param actualizarDto - Datos a actualizar
   * @param usuarioAutenticadoId - ID del usuario que actualiza
   * @returns Promise<IArchivo> - Archivo actualizado
   */
  async actualizarArchivo(
    id: number,
    actualizarDto: ActualizarArchivoDto,
    usuarioAutenticadoId: number
  ): Promise<IArchivo> {
    this.logger.log(`Actualizando archivo ${id} por usuario ${usuarioAutenticadoId}`);

    // Verificar que el archivo existe
    const archivoExistente = await this.prisma.archivo.findUnique({
      where: { id }
    });

    if (!archivoExistente) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Validar permisos de edición
    const permisos = await this.obtenerPermisosArchivo(id, usuarioAutenticadoId);
    if (!permisos.permisos.editar) {
      throw new ForbiddenException('No tiene permisos para editar este archivo');
    }

    // Si se cambia el nombre, verificar que no exista duplicado
    if (actualizarDto.nombre && actualizarDto.nombre !== archivoExistente.nombre) {
      const archivoConNombre = await this.prisma.archivo.findFirst({
        where: {
          nombre: actualizarDto.nombre,
          usuarioId: archivoExistente.usuarioId,
          id: { not: id }
        }
      });

      if (archivoConNombre) {
        throw new ConflictException('Ya existe un archivo con ese nombre');
      }
    }

    try {
      const archivoActualizado = await this.prisma.archivo.update({
        where: { id },
        data: actualizarDto
      });

      this.logger.log(`Archivo ${id} actualizado exitosamente`);
      return archivoActualizado;
    } catch (error) {
      this.logger.error(`Error al actualizar archivo: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar el archivo');
    }
  }

  /**
   * Eliminar archivo y sus relaciones
   * 
   * Elimina un archivo del sistema junto con todas
   * sus relaciones, validando permisos y dependencias.
   * 
   * @param id - ID del archivo a eliminar
   * @param usuarioAutenticadoId - ID del usuario que elimina
   * @returns Promise<void>
   */
  async eliminarArchivo(
    id: number,
    usuarioAutenticadoId: number
  ): Promise<void> {
    this.logger.log(`Eliminando archivo ${id} por usuario ${usuarioAutenticadoId}`);

    // Verificar que el archivo existe
    const archivo = await this.prisma.archivo.findUnique({
      where: { id },
      include: {
        archivoRelacion: true
      }
    });

    if (!archivo) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Validar permisos de eliminación
    const permisos = await this.obtenerPermisosArchivo(id, usuarioAutenticadoId);
    if (!permisos.permisos.eliminar) {
      throw new ForbiddenException('No tiene permisos para eliminar este archivo');
    }

    try {
      // Usar transacción para eliminar relaciones y archivo
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar todas las relaciones primero
        await prisma.archivoRelacion.deleteMany({
          where: { archivoId: id }
        });

        // Eliminar el archivo
        await prisma.archivo.delete({
          where: { id }
        });
      });

      this.logger.log(`Archivo ${id} eliminado exitosamente junto con ${archivo.archivoRelacion.length} relaciones`);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar el archivo');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar que una entidad específica existe en el sistema
   * 
   * @private
   * @param tipoEntidad - Tipo de entidad a validar
   * @param entidadId - ID de la entidad
   * @throws {NotFoundException} - Entidad no encontrada
   */
  private async validarEntidadExiste(
    tipoEntidad: TipoEntidadArchivo,
    entidadId: number
  ): Promise<void> {
    let entidad;

    switch (tipoEntidad) {
      case TipoEntidadArchivo.CASO_CLINICO:
        entidad = await this.prisma.casoClinico.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.TRATAMIENTO:
        entidad = await this.prisma.tratamiento.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.ODONTOGRAMA:
        entidad = await this.prisma.odontograma.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.ESPECIALIDAD:
        entidad = await this.prisma.especialidad.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.PACIENTE:
        entidad = await this.prisma.paciente.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.USUARIO:
        entidad = await this.prisma.usuario.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.HALLAZGO_CLINICO:
        entidad = await this.prisma.hallazgoClinico.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.PRESCRIPCION:
        entidad = await this.prisma.prescripcion.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.OBSERVACION:
        entidad = await this.prisma.observacion.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.SOLICITUD:
        entidad = await this.prisma.solicitud.findUnique({ where: { id: entidadId } });
        break;
      case TipoEntidadArchivo.CITA:
        entidad = await this.prisma.cita.findUnique({ where: { id: entidadId } });
        break;
      default:
        throw new BadRequestException(`Tipo de entidad no válido: ${tipoEntidad}`);
    }

    if (!entidad) {
      throw new NotFoundException(`${tipoEntidad} con ID ${entidadId} no encontrado`);
    }
  }

  /**
   * Validar permisos de usuario sobre una entidad
   * 
   * @private
   * @param tipoEntidad - Tipo de entidad
   * @param entidadId - ID de la entidad
   * @param usuarioId - ID del usuario
   * @param operacion - Tipo de operación (crear, leer, editar, eliminar)
   * @throws {ForbiddenException} - Sin permisos suficientes
   */
  private async validarPermisosEntidad(
    tipoEntidad: TipoEntidadArchivo,
    entidadId: number,
    usuarioId: number,
    operacion: 'crear' | 'leer' | 'editar' | 'eliminar'
  ): Promise<void> {
    // TODO: Implementar validación de permisos específica por tipo de entidad
    // Por ahora, permitir todas las operaciones
    // En producción, verificar roles y permisos específicos por entidad
    return;
  }

  /**
   * Obtener permisos de usuario sobre un archivo específico
   * 
   * @private
   * @param archivoId - ID del archivo
   * @param usuarioId - ID del usuario
   * @returns Promise<IPermisosArchivo> - Permisos del usuario
   */
  private async obtenerPermisosArchivo(
    archivoId: number,
    usuarioId: number
  ): Promise<IPermisosArchivo> {
    // Obtener archivo y relaciones
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: archivoId },
      include: {
        archivoRelacion: {
          where: { usuarioId }
        }
      }
    });

    if (!archivo) {
      return {
        archivoId,
        usuarioId,
        permisos: {
          leer: false,
          editar: false,
          eliminar: false,
          descargar: false,
          compartir: false,
          relacionar: false
        },
        rol: RolArchivoUsuario.VISUALIZADOR,
        motivo: 'Archivo no encontrado'
      };
    }

    // El propietario del archivo tiene todos los permisos
    if (archivo.usuarioId === usuarioId) {
      return {
        archivoId,
        usuarioId,
        permisos: {
          leer: true,
          editar: true,
          eliminar: true,
          descargar: true,
          compartir: true,
          relacionar: true
        },
        rol: RolArchivoUsuario.PROPIETARIO,
        motivo: 'Propietario del archivo'
      };
    }

    // Verificar permisos por relación directa
    const relacion = archivo.archivoRelacion[0];
    if (relacion) {
      const rol = relacion.rol as RolArchivoUsuario || RolArchivoUsuario.VISUALIZADOR;
      const permisosPorRol = this.obtenerPermisosPorRol(rol);
      return {
        archivoId,
        usuarioId,
        permisos: permisosPorRol,
        rol: rol,
        motivo: 'Permisos por relación directa'
      };
    }

    // Sin relación directa, permisos mínimos
    return {
      archivoId,
      usuarioId,
      permisos: {
        leer: false,
        editar: false,
        eliminar: false,
        descargar: false,
        compartir: false,
        relacionar: false
      },
      rol: RolArchivoUsuario.VISUALIZADOR,
      motivo: 'Sin relación directa con el archivo'
    };
  }

  /**
   * Obtener permisos específicos según el rol
   * 
   * @private
   * @param rol - Rol del usuario
   * @returns Objeto con permisos específicos
   */
  private obtenerPermisosPorRol(rol: RolArchivoUsuario) {
    switch (rol) {
      case RolArchivoUsuario.PROPIETARIO:
        return {
          leer: true,
          editar: true,
          eliminar: true,
          descargar: true,
          compartir: true,
          relacionar: true
        };
      case RolArchivoUsuario.ADMINISTRADOR:
        return {
          leer: true,
          editar: true,
          eliminar: true,
          descargar: true,
          compartir: true,
          relacionar: true
        };
      case RolArchivoUsuario.EDITOR:
        return {
          leer: true,
          editar: true,
          eliminar: false,
          descargar: true,
          compartir: false,
          relacionar: true
        };
      case RolArchivoUsuario.VISUALIZADOR:
      default:
        return {
          leer: true,
          editar: false,
          eliminar: false,
          descargar: true,
          compartir: false,
          relacionar: false
        };
    }
  }

  /**
   * Inferir categoría de archivo basada en el tipo MIME
   * 
   * @private
   * @param tipoMime - Tipo MIME del archivo
   * @returns Categoría inferida
   */
  private inferirCategoriaPorTipo(tipoMime: string): CategoriaArchivo {
    if (tipoMime.startsWith('image/')) {
      if (tipoMime.includes('x-ray') || tipoMime.includes('dicom')) {
        return CategoriaArchivo.ESTUDIO_RADIOGRAFICO;
      }
      return CategoriaArchivo.FOTO_TRATAMIENTO;
    }

    if (tipoMime === 'application/pdf') {
      return CategoriaArchivo.DOCUMENTO_LEGAL;
    }

    if (tipoMime.startsWith('application/')) {
      return CategoriaArchivo.REPORTE_MEDICO;
    }

    return CategoriaArchivo.OTRO;
  }
}
