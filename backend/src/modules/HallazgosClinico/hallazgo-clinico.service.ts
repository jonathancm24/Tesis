/**
 * Servicio de Hallazgos Clínicos
 * 
 * Contiene toda la lógica de negocio para la gestión de hallazgos clínicos
 * en el sistema académico odontológico. Maneja operaciones CRUD, validaciones,
 * filtrado, paginación y estadísticas.
 * 
 * @fileoverview Servicio para la gestión de hallazgos clínicos
 * @module HallazgoClinicoService
 * @requires Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException
 */

import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearHallazgoClinicoDto, 
  ActualizarHallazgoClinicoDto, 
  FiltrosHallazgosClinicosDto,
  EstadisticasHallazgosDto 
} from './DTO';
import { 
  IHallazgoClinico, 
  IHallazgoClinicoCompleto, 
  IRespuestaPaginadaHallazgos, 
  IEstadisticasHallazgos,
  IAccesoHallazgoClinico 
} from './Interface';

/**
 * Servicio para gestión de hallazgos clínicos
 * 
 * Proporciona métodos para crear, leer, actualizar y eliminar hallazgos clínicos,
 * así como funcionalidades avanzadas de filtrado, estadísticas y control de acceso.
 * 
 * @example
 * ```typescript
 * const hallazgo = await hallazgoService.crearHallazgo({
 *   casoClinicoId: 1,
 *   tipo: 'Caries',
 *   codigoZona: 'D-16',
 *   descripcion: 'Caries profunda en cara oclusal'
 * });
 * ```
 */
@Injectable()
export class HallazgoClinicoService {
  private readonly logger = new Logger(HallazgoClinicoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo hallazgo clínico
   * 
   * Valida la existencia del caso clínico y del archivo (si se proporciona)
   * antes de crear el hallazgo.
   * 
   * @param datos - Datos del hallazgo a crear
   * @param usuarioId - ID del usuario que crea el hallazgo
   * @returns Promise<IHallazgoClinico> - Hallazgo creado
   * @throws NotFoundException - Si el caso clínico no existe
   * @throws BadRequestException - Si el archivo no existe o datos inválidos
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async crearHallazgo(
    datos: CrearHallazgoClinicoDto, 
    usuarioId: number
  ): Promise<IHallazgoClinico> {
    this.logger.log(`Creando hallazgo clínico para caso ${datos.casoClinicoId} por usuario ${usuarioId}`);

    // Validar que el caso clínico existe y el usuario tiene acceso
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: datos.casoClinicoId },
      include: {
        estudiante: true,
        profesor: true
      }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico con ID ${datos.casoClinicoId} no encontrado`);
    }

    // Verificar permisos del usuario (estudiante del caso o profesor)
    const tienePermiso = casoClinico.estudianteId === usuarioId || 
                        casoClinico.profesorId === usuarioId;
    
    if (!tienePermiso) {
      throw new ForbiddenException('No tiene permisos para crear hallazgos en este caso clínico');
    }

    // Validar archivo si se proporciona
    if (datos.archivoId) {
      const archivo = await this.prisma.archivo.findUnique({
        where: { id: datos.archivoId }
      });

      if (!archivo) {
        throw new BadRequestException(`Archivo con ID ${datos.archivoId} no encontrado`);
      }
    }

    // Validar que no exista un hallazgo duplicado (mismo tipo y zona en el mismo caso)
    const hallazgoExistente = await this.prisma.hallazgoClinico.findFirst({
      where: {
        casoClinicoId: datos.casoClinicoId,
        tipo: datos.tipo,
        codigoZona: datos.codigoZona
      }
    });

    if (hallazgoExistente) {
      throw new BadRequestException(
        `Ya existe un hallazgo de tipo "${datos.tipo}" en la zona "${datos.codigoZona}" para este caso clínico`
      );
    }

    try {
      const nuevoHallazgo = await this.prisma.hallazgoClinico.create({
        data: {
          casoClinicoId: datos.casoClinicoId,
          tipo: datos.tipo,
          codigoZona: datos.codigoZona,
          descripcion: datos.descripcion,
          archivoId: datos.archivoId
        }
      });

      this.logger.log(`Hallazgo clínico creado exitosamente con ID: ${nuevoHallazgo.id}`);
      return nuevoHallazgo;
    } catch (error) {
      this.logger.error(`Error al crear hallazgo clínico: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear el hallazgo clínico');
    }
  }

  /**
   * Obtener hallazgos clínicos con filtros y paginación
   * 
   * Permite filtrar por caso clínico, tipo, zona, etc. y
   * devuelve resultados paginados.
   * 
   * @param filtros - Criterios de filtrado y paginación
   * @param usuarioId - ID del usuario que consulta
   * @returns Promise<IRespuestaPaginadaHallazgos> - Resultados paginados
   */
  async obtenerHallazgos(
    filtros: FiltrosHallazgosClinicosDto,
    usuarioId: number
  ): Promise<IRespuestaPaginadaHallazgos> {
    this.logger.log(`Obteniendo hallazgos clínicos con filtros para usuario ${usuarioId}`);

    const página = filtros.página || 1;
    const límite = Math.min(filtros.límite || 10, 100);
    const saltar = (página - 1) * límite;

    // Construir condiciones WHERE
    const where: any = {};

    if (filtros.casoClinicoId) {
      where.casoClinicoId = filtros.casoClinicoId;
    }

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.codigoZona) {
      where.codigoZona = filtros.codigoZona;
    }

    if (filtros.conArchivos !== undefined) {
      if (filtros.conArchivos) {
        where.archivoId = { not: null };
      } else {
        where.archivoId = null;
      }
    }

    if (filtros.busqueda) {
      where.OR = [
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
        { tipo: { contains: filtros.busqueda, mode: 'insensitive' } },
        { codigoZona: { contains: filtros.busqueda, mode: 'insensitive' } }
      ];
    }

    // Configurar ordenamiento
    const orderBy: any = {};
    const campo = filtros.ordenarPor || 'id';
    const dirección = filtros.dirección || 'desc';
    orderBy[campo] = dirección;

    try {
      // Ejecutar consultas en paralelo
      const [hallazgos, total] = await Promise.all([
        this.prisma.hallazgoClinico.findMany({
          where,
          include: {
            casoClinico: {
              include: {
                paciente: {
                  select: { id: true, nombre: true, apellido: true }
                },
                estudiante: {
                  select: { id: true, nombre: true, apellido: true, email: true }
                },
                profesor: {
                  select: { id: true, nombre: true, apellido: true, email: true }
                },
                especialidad: {
                  select: { id: true, nombre: true, descripcion: true }
                }
              }
            },
            archivo: {
              select: { 
                id: true, 
                nombre: true, 
                tipo: true, 
                url: true, 
                fechaSubida: true, 
                descripcion: true 
              }
            }
          },
          orderBy,
          skip: saltar,
          take: límite
        }),
        this.prisma.hallazgoClinico.count({ where })
      ]);

      const totalPáginas = Math.ceil(total / límite);

      this.logger.log(`Encontrados ${total} hallazgos, mostrando página ${página} de ${totalPáginas}`);

      return {
        hallazgos,
        paginación: {
          total,
          página,
          límite,
          totalPáginas
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener hallazgos clínicos: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener los hallazgos clínicos');
    }
  }

  /**
   * Obtener hallazgos clínicos por caso clínico
   * 
   * Busca todos los hallazgos asociados a un caso clínico específico
   * y verifica permisos de acceso.
   * 
   * @param casoClinicoId - ID del caso clínico
   * @param usuarioId - ID del usuario que consulta
   * @returns Promise<IHallazgoClinicoCompleto[]> - Lista de hallazgos con relaciones
   * @throws NotFoundException - Si el caso clínico no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async obtenerHallazgosPorCasoClinico(
    casoClinicoId: number,
    usuarioId: number
  ): Promise<IHallazgoClinicoCompleto[]> {
    this.logger.log(`Obteniendo hallazgos del caso clínico ${casoClinicoId} para usuario ${usuarioId}`);

    // Verificar que el caso clínico existe y el usuario tiene acceso
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId },
      select: { 
        id: true, 
        estudianteId: true, 
        profesorId: true 
      }
    });

    if (!casoClinico) {
      throw new NotFoundException('Caso clínico no encontrado');
    }

    // Verificar permisos de acceso
    if (casoClinico.estudianteId !== usuarioId && casoClinico.profesorId !== usuarioId) {
      throw new ForbiddenException('No tiene permisos para acceder a este caso clínico');
    }

    const hallazgos = await this.prisma.hallazgoClinico.findMany({
      where: { casoClinicoId },
      include: {
        casoClinico: {
          include: {
            paciente: {
              select: { id: true, nombre: true, apellido: true, numeroDocumento: true }
            },
            estudiante: {
              select: { id: true, nombre: true, apellido: true, email: true }
            },
            profesor: {
              select: { id: true, nombre: true, apellido: true, email: true }
            },
            especialidad: {
              select: { id: true, nombre: true, descripcion: true }
            }
          }
        },
        archivo: {
          select: { 
            id: true, 
            nombre: true, 
            tipo: true, 
            url: true, 
            fechaSubida: true, 
            descripcion: true 
          }
        }
      },
      orderBy: [
        { codigoZona: 'asc' },
        { tipo: 'asc' }
      ]
    });

    return hallazgos;
  }

  /**
   * Obtener un hallazgo clínico por ID
   * 
   * Busca un hallazgo específico por su ID y verifica permisos de acceso.
   * 
   * @param id - ID del hallazgo a buscar
   * @param usuarioId - ID del usuario que consulta
   * @returns Promise<IHallazgoClinicoCompleto> - Hallazgo con relaciones
   * @throws NotFoundException - Si el hallazgo no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async obtenerHallazgoPorId(
    id: number, 
    usuarioId: number
  ): Promise<IHallazgoClinicoCompleto> {
    this.logger.log(`Obteniendo hallazgo clínico ${id} para usuario ${usuarioId}`);

    const hallazgo = await this.prisma.hallazgoClinico.findUnique({
      where: { id },
      include: {
        casoClinico: {
          include: {
            paciente: {
              select: { id: true, nombre: true, apellido: true, numeroDocumento: true }
            },
            estudiante: {
              select: { id: true, nombre: true, apellido: true, email: true }
            },
            profesor: {
              select: { id: true, nombre: true, apellido: true, email: true }
            },
            especialidad: {
              select: { id: true, nombre: true, descripcion: true }
            }
          }
        },
        archivo: {
          select: { 
            id: true, 
            nombre: true, 
            tipo: true, 
            url: true, 
            fechaSubida: true, 
            descripcion: true 
          }
        }
      }
    });

    if (!hallazgo) {
      throw new NotFoundException(`Hallazgo clínico con ID ${id} no encontrado`);
    }

    // Verificar permisos de acceso
    const tieneAcceso = await this.verificarAccesoHallazgo(id, usuarioId);
    if (!tieneAcceso.tieneAcceso) {
      throw new ForbiddenException(tieneAcceso.motivo);
    }

    return hallazgo as IHallazgoClinicoCompleto;
  }

  /**
   * Actualizar un hallazgo clínico existente
   * 
   * Permite modificar campos específicos de un hallazgo
   * verificando permisos de edición.
   * 
   * @param id - ID del hallazgo a actualizar
   * @param datos - Datos a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @returns Promise<IHallazgoClinico> - Hallazgo actualizado
   * @throws NotFoundException - Si el hallazgo no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   * @throws BadRequestException - Si los datos son inválidos
   */
  async actualizarHallazgo(
    id: number,
    datos: ActualizarHallazgoClinicoDto,
    usuarioId: number
  ): Promise<IHallazgoClinico> {
    this.logger.log(`Actualizando hallazgo clínico ${id} por usuario ${usuarioId}`);

    // Verificar que el hallazgo existe
    const hallazgoExistente = await this.prisma.hallazgoClinico.findUnique({
      where: { id },
      include: {
        casoClinico: true
      }
    });

    if (!hallazgoExistente) {
      throw new NotFoundException(`Hallazgo clínico con ID ${id} no encontrado`);
    }

    // Verificar permisos de edición
    const accesoInfo = await this.verificarAccesoHallazgo(id, usuarioId);
    if (!accesoInfo.permisos.editar) {
      throw new ForbiddenException('No tiene permisos para editar este hallazgo clínico');
    }

    // Validar archivo si se actualiza
    if (datos.archivoId) {
      const archivo = await this.prisma.archivo.findUnique({
        where: { id: datos.archivoId }
      });

      if (!archivo) {
        throw new BadRequestException(`Archivo con ID ${datos.archivoId} no encontrado`);
      }
    }

    // Validar duplicados si se cambia tipo o zona
    if (datos.tipo || datos.codigoZona) {
      const tipoFinal = datos.tipo || hallazgoExistente.tipo;
      const zonaFinal = datos.codigoZona || hallazgoExistente.codigoZona;

      const hallazgoDuplicado = await this.prisma.hallazgoClinico.findFirst({
        where: {
          id: { not: id },
          casoClinicoId: hallazgoExistente.casoClinicoId,
          tipo: tipoFinal,
          codigoZona: zonaFinal
        }
      });

      if (hallazgoDuplicado) {
        throw new BadRequestException(
          `Ya existe otro hallazgo de tipo "${tipoFinal}" en la zona "${zonaFinal}" para este caso clínico`
        );
      }
    }

    try {
      const hallazgoActualizado = await this.prisma.hallazgoClinico.update({
        where: { id },
        data: datos
      });

      this.logger.log(`Hallazgo clínico ${id} actualizado exitosamente`);
      return hallazgoActualizado;
    } catch (error) {
      this.logger.error(`Error al actualizar hallazgo clínico: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar el hallazgo clínico');
    }
  }

  /**
   * Eliminar un hallazgo clínico
   * 
   * Elimina permanentemente un hallazgo clínico
   * verificando permisos de eliminación.
   * 
   * @param id - ID del hallazgo a eliminar
   * @param usuarioId - ID del usuario que elimina
   * @returns Promise<void>
   * @throws NotFoundException - Si el hallazgo no existe
   * @throws ForbiddenException - Si el usuario no tiene permisos
   */
  async eliminarHallazgo(id: number, usuarioId: number): Promise<void> {
    this.logger.log(`Eliminando hallazgo clínico ${id} por usuario ${usuarioId}`);

    // Verificar que el hallazgo existe
    const hallazgo = await this.prisma.hallazgoClinico.findUnique({
      where: { id }
    });

    if (!hallazgo) {
      throw new NotFoundException(`Hallazgo clínico con ID ${id} no encontrado`);
    }

    // Verificar permisos de eliminación
    const accesoInfo = await this.verificarAccesoHallazgo(id, usuarioId);
    if (!accesoInfo.permisos.eliminar) {
      throw new ForbiddenException('No tiene permisos para eliminar este hallazgo clínico');
    }

    try {
      await this.prisma.hallazgoClinico.delete({
        where: { id }
      });

      this.logger.log(`Hallazgo clínico ${id} eliminado exitosamente`);
    } catch (error) {
      this.logger.error(`Error al eliminar hallazgo clínico: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar el hallazgo clínico');
    }
  }

  /**
   * Obtener estadísticas básicas de hallazgos clínicos
   * 
   * Calcula y devuelve estadísticas generales del sistema
   * de hallazgos clínicos.
   * 
   * @returns Promise<IEstadisticasHallazgos> - Estadísticas del sistema
   */
  async obtenerEstadisticasBasicas(): Promise<IEstadisticasHallazgos> {
    this.logger.log('Calculando estadísticas básicas de hallazgos clínicos');

    try {
      // Obtener totales básicos
      const [
        totalHallazgos,
        conArchivos,
        sinArchivos,
        totalCasos,
        distribuciones
      ] = await Promise.all([
        this.prisma.hallazgoClinico.count(),
        this.prisma.hallazgoClinico.count({ where: { archivoId: { not: null } } }),
        this.prisma.hallazgoClinico.count({ where: { archivoId: null } }),
        this.prisma.casoClinico.count(),
        this.prisma.hallazgoClinico.groupBy({
          by: ['tipo'],
          _count: { tipo: true },
          orderBy: { _count: { tipo: 'desc' } }
        })
      ]);

      // Procesar distribución por tipo
      const porTipo: Record<string, number> = {};
      distribuciones.forEach(item => {
        porTipo[item.tipo] = item._count.tipo;
      });

      // Calcular tipos más frecuentes
      const tiposMasFrecuentes = distribuciones.slice(0, 5).map(item => ({
        tipo: item.tipo,
        cantidad: item._count.tipo,
        porcentaje: totalHallazgos > 0 ? (item._count.tipo / totalHallazgos) * 100 : 0
      }));

      // Obtener zonas más afectadas
      const zonasDistribucion = await this.prisma.hallazgoClinico.groupBy({
        by: ['codigoZona'],
        _count: { codigoZona: true },
        orderBy: { _count: { codigoZona: 'desc' } },
        take: 10
      });

      const zonasMasAfectadas = zonasDistribucion.map(item => ({
        codigoZona: item.codigoZona,
        cantidad: item._count.codigoZona,
        porcentaje: totalHallazgos > 0 ? (item._count.codigoZona / totalHallazgos) * 100 : 0
      }));

      const promedioPorCaso = totalCasos > 0 ? totalHallazgos / totalCasos : 0;

      return {
        totalHallazgos,
        porTipo,
        conArchivos,
        sinArchivos,
        promedioPorCaso: Number(promedioPorCaso.toFixed(2)),
        tiposMasFrecuentes,
        zonasMasAfectadas
      };
    } catch (error) {
      this.logger.error(`Error al calcular estadísticas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las estadísticas');
    }
  }

  /**
   * Verificar acceso de usuario a un hallazgo clínico
   * 
   * Determina si un usuario tiene permisos para acceder
   * a un hallazgo específico y qué acciones puede realizar.
   * 
   * @param hallazgoId - ID del hallazgo a verificar
   * @param usuarioId - ID del usuario
   * @returns Promise<IAccesoHallazgoClinico> - Información de acceso
   */
  async verificarAccesoHallazgo(
    hallazgoId: number, 
    usuarioId: number
  ): Promise<IAccesoHallazgoClinico> {
    this.logger.log(`Verificando acceso al hallazgo ${hallazgoId} para usuario ${usuarioId}`);

    const hallazgo = await this.prisma.hallazgoClinico.findUnique({
      where: { id: hallazgoId },
      include: {
        casoClinico: {
          include: {
            estudiante: true,
            profesor: true
          }
        }
      }
    });

    if (!hallazgo) {
      return {
        tieneAcceso: false,
        motivo: 'Hallazgo clínico no encontrado',
        permisos: {
          leer: false,
          editar: false,
          eliminar: false,
          verArchivos: false
        }
      };
    }

    const esEstudiante = hallazgo.casoClinico.estudianteId === usuarioId;
    const esProfesor = hallazgo.casoClinico.profesorId === usuarioId;

    if (!esEstudiante && !esProfesor) {
      return {
        tieneAcceso: false,
        motivo: 'No tiene permisos para acceder a este hallazgo clínico',
        permisos: {
          leer: false,
          editar: false,
          eliminar: false,
          verArchivos: false
        }
      };
    }

    const rolEnCaso = esEstudiante ? 'estudiante' : 'docente';
    
    return {
      tieneAcceso: true,
      motivo: `Acceso autorizado como ${rolEnCaso}`,
      rolEnCaso: rolEnCaso as 'estudiante' | 'docente',
      permisos: {
        leer: true,
        editar: true, // Tanto estudiante como docente pueden editar
        eliminar: esProfesor, // Solo docente puede eliminar
        verArchivos: true
      }
    };
  }

  /**
   * Obtener hallazgos de un usuario específico
   * 
   * Devuelve todos los hallazgos clínicos relacionados
   * con los casos donde el usuario participa.
   * 
   * @param usuarioId - ID del usuario
   * @param filtros - Filtros adicionales opcionales
   * @returns Promise<IRespuestaPaginadaHallazgos> - Hallazgos del usuario
   */
  async obtenerHallazgosUsuario(
    usuarioId: number,
    filtros?: Partial<FiltrosHallazgosClinicosDto>
  ): Promise<IRespuestaPaginadaHallazgos> {
    this.logger.log(`Obteniendo hallazgos del usuario ${usuarioId}`);

    const página = filtros?.página || 1;
    const límite = Math.min(filtros?.límite || 10, 100);
    const saltar = (página - 1) * límite;

    const where: any = {
      casoClinico: {
        OR: [
          { estudianteId: usuarioId },
          { profesorId: usuarioId }
        ]
      }
    };

    // Aplicar filtros adicionales si se proporcionan
    if (filtros?.tipo) where.tipo = filtros.tipo;
    if (filtros?.codigoZona) where.codigoZona = filtros.codigoZona;
    if (filtros?.conArchivos !== undefined) {
      where.archivoId = filtros.conArchivos ? { not: null } : null;
    }

    try {
      const [hallazgos, total] = await Promise.all([
        this.prisma.hallazgoClinico.findMany({
          where,
          include: {
            casoClinico: {
              include: {
                paciente: {
                  select: { id: true, nombre: true, apellido: true }
                },
                especialidad: {
                  select: { id: true, nombre: true }
                }
              }
            },
            archivo: {
              select: { 
                id: true, 
                nombre: true, 
                tipo: true, 
                fechaSubida: true 
              }
            }
          },
          orderBy: { id: 'desc' },
          skip: saltar,
          take: límite
        }),
        this.prisma.hallazgoClinico.count({ where })
      ]);

      return {
        hallazgos,
        paginación: {
          total,
          página,
          límite,
          totalPáginas: Math.ceil(total / límite)
        }
      };
    } catch (error) {
      this.logger.error(`Error al obtener hallazgos del usuario: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener los hallazgos del usuario');
    }
  }
}
