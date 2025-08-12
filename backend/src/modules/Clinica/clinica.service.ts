/**
 * Servicio de Clínicas
 * 
 * Maneja toda la lógica de negocio para la gestión de clínicas
 * móviles y consultorios de la universidad. Proporciona operaciones
 * CRUD básicas con validaciones de negocio apropiadas.
 * 
 * Funcionalidades:
 * - Crear nuevas clínicas (fijas, móviles, temporales)
 * - Consultar clínicas con filtros avanzados
 * - Actualizar información de clínicas existentes
 * - Eliminar clínicas (soft delete)
 * - Validar códigos únicos y nombres
 * - Gestión de estados operativos
 * 
 * @fileoverview Servicio de lógica de negocio para clínicas
 * @module ClinicaService
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CrearClinicaDto,
  ActualizarClinicaDto,
  FiltrosClinicaDto,
  ClinicaRespuestaDto,
  TipoClinica,
  EstadoClinica
} from './clinica.dto';

/**
 * Servicio de Clínicas
 * 
 * Proporciona métodos para gestionar las clínicas del sistema
 * universitario, incluyendo validaciones de negocio y operaciones
 * optimizadas para consultas con relaciones.
 */
@Injectable()
export class ClinicaService {
  private readonly logger = new Logger(ClinicaService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva clínica
   * 
   * Registra una nueva clínica en el sistema validando
   * la unicidad del código y nombre, así como los datos
   * específicos según el tipo de clínica.
   * 
   * @param crearClinicaDto - Datos de la clínica a crear
   * @returns Promise<ClinicaRespuestaDto> - Clínica creada
   * 
   * @throws {ConflictException} - Código o nombre duplicado
   * @throws {NotFoundException} - Parroquia base no encontrada
   * @throws {BadRequestException} - Datos inválidos para el tipo de clínica
   */
  async crear(crearClinicaDto: CrearClinicaDto): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Creando nueva clínica: ${crearClinicaDto.nombre}`);

    // Validar unicidad del código
    const clinicaExistenteCodigo = await this.prisma.clinica.findUnique({
      where: { codigo: crearClinicaDto.codigo }
    });

    if (clinicaExistenteCodigo) {
      throw new ConflictException(`Ya existe una clínica con el código: ${crearClinicaDto.codigo}`);
    }

    // Validar unicidad del nombre
    const clinicaExistenteNombre = await this.prisma.clinica.findUnique({
      where: { nombre: crearClinicaDto.nombre }
    });

    if (clinicaExistenteNombre) {
      throw new ConflictException(`Ya existe una clínica con el nombre: ${crearClinicaDto.nombre}`);
    }

    // Validar parroquia base si se proporciona
    if (crearClinicaDto.parroquiaBaseId) {
      const parroquia = await this.prisma.parroquia.findUnique({
        where: { id: crearClinicaDto.parroquiaBaseId }
      });

      if (!parroquia) {
        throw new NotFoundException(`Parroquia con ID ${crearClinicaDto.parroquiaBaseId} no encontrada`);
      }
    }

    // Validaciones específicas por tipo de clínica
    this.validarDatosPorTipo(crearClinicaDto);

    try {
      // Crear la clínica
      const clinica = await this.prisma.clinica.create({
        data: {
          nombre: crearClinicaDto.nombre,
          codigo: crearClinicaDto.codigo,
          tipo: crearClinicaDto.tipo,
          descripcion: crearClinicaDto.descripcion,
          telefono: crearClinicaDto.telefono,
          email: crearClinicaDto.email,
          capacidadPacientes: crearClinicaDto.capacidadPacientes,
          direccionBase: crearClinicaDto.direccionBase,
          parroquiaBaseId: crearClinicaDto.parroquiaBaseId,
          placaVehiculo: crearClinicaDto.placaVehiculo,
          modeloVehiculo: crearClinicaDto.modeloVehiculo,
          anoVehiculo: crearClinicaDto.anoVehiculo,
          estado: EstadoClinica.ACTIVA // Estado por defecto
        },
        include: {
          parroquiaBase: {
            include: {
              canton: {
                include: {
                  provincia: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`Clínica creada exitosamente con ID: ${clinica.id}`);
      return this.mapearClinicaRespuesta(clinica);
    } catch (error) {
      this.logger.error(`Error al crear clínica: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la clínica');
    }
  }

  /**
   * Obtener todas las clínicas con filtros opcionales
   * 
   * Consulta clínicas aplicando filtros de búsqueda y
   * opcionalmente incluyendo relaciones como horarios y personal.
   * 
   * @param filtros - Criterios de filtrado
   * @returns Promise<ClinicaRespuestaDto[]> - Lista de clínicas
   */
  async obtenerTodas(filtros: FiltrosClinicaDto = {}): Promise<ClinicaRespuestaDto[]> {
    this.logger.log('Consultando clínicas con filtros');

    // Construir condiciones de filtrado
    const where: any = {};

    if (filtros.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    if (filtros.parroquiaBaseId) {
      where.parroquiaBaseId = filtros.parroquiaBaseId;
    }

    if (filtros.busqueda) {
      where.OR = [
        { nombre: { contains: filtros.busqueda, mode: 'insensitive' } },
        { codigo: { contains: filtros.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } }
      ];
    }

    // Configurar inclusión de relaciones
    const include: any = {
      parroquiaBase: {
        include: {
          canton: {
            include: {
              provincia: true
            }
          }
        }
      }
    };

    if (filtros.incluirHorarios) {
      include.horarios = true;
    }

    if (filtros.incluirPersonal) {
      include.personalAsignado = {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      };
    }

    try {
      const clinicas = await this.prisma.clinica.findMany({
        where,
        include,
        orderBy: [
          { estado: 'asc' }, // Activas primero
          { nombre: 'asc' }
        ]
      });

      this.logger.log(`Encontradas ${clinicas.length} clínicas`);
      return clinicas.map(clinica => this.mapearClinicaRespuesta(clinica));
    } catch (error) {
      this.logger.error(`Error al obtener clínicas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener las clínicas');
    }
  }

  /**
   * Obtener una clínica por ID
   * 
   * Busca una clínica específica por su identificador,
   * incluyendo toda la información relacionada.
   * 
   * @param id - ID de la clínica
   * @returns Promise<ClinicaRespuestaDto> - Clínica encontrada
   * 
   * @throws {NotFoundException} - Clínica no encontrada
   */
  async obtenerPorId(id: number): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Obteniendo clínica con ID: ${id}`);

    const clinica = await this.prisma.clinica.findUnique({
      where: { id },
      include: {
        parroquiaBase: {
          include: {
            canton: {
              include: {
                provincia: true
              }
            }
          }
        },
        horarios: {
          orderBy: { diaSemana: 'asc' }
        },
        personalAsignado: {
          where: { fechaFin: null }, // Solo personal activo
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!clinica) {
      throw new NotFoundException(`Clínica con ID ${id} no encontrada`);
    }

    return this.mapearClinicaRespuesta(clinica);
  }

  /**
   * Actualizar una clínica existente
   * 
   * Modifica los datos de una clínica validando la unicidad
   * de códigos y nombres, y aplicando validaciones específicas
   * según el tipo de clínica.
   * 
   * @param id - ID de la clínica a actualizar
   * @param actualizarClinicaDto - Datos a actualizar
   * @returns Promise<ClinicaRespuestaDto> - Clínica actualizada
   * 
   * @throws {NotFoundException} - Clínica no encontrada
   * @throws {ConflictException} - Código o nombre duplicado
   */
  async actualizar(id: number, actualizarClinicaDto: ActualizarClinicaDto): Promise<ClinicaRespuestaDto> {
    this.logger.log(`Actualizando clínica con ID: ${id}`);

    // Verificar que la clínica existe
    const clinicaExistente = await this.prisma.clinica.findUnique({
      where: { id }
    });

    if (!clinicaExistente) {
      throw new NotFoundException(`Clínica con ID ${id} no encontrada`);
    }

    // Validar unicidad del código si se está actualizando
    if (actualizarClinicaDto.codigo && actualizarClinicaDto.codigo !== clinicaExistente.codigo) {
      const clinicaConCodigo = await this.prisma.clinica.findUnique({
        where: { codigo: actualizarClinicaDto.codigo }
      });

      if (clinicaConCodigo) {
        throw new ConflictException(`Ya existe una clínica con el código: ${actualizarClinicaDto.codigo}`);
      }
    }

    // Validar unicidad del nombre si se está actualizando
    if (actualizarClinicaDto.nombre && actualizarClinicaDto.nombre !== clinicaExistente.nombre) {
      const clinicaConNombre = await this.prisma.clinica.findUnique({
        where: { nombre: actualizarClinicaDto.nombre }
      });

      if (clinicaConNombre) {
        throw new ConflictException(`Ya existe una clínica con el nombre: ${actualizarClinicaDto.nombre}`);
      }
    }

    // Validar parroquia base si se está actualizando
    if (actualizarClinicaDto.parroquiaBaseId) {
      const parroquia = await this.prisma.parroquia.findUnique({
        where: { id: actualizarClinicaDto.parroquiaBaseId }
      });

      if (!parroquia) {
        throw new NotFoundException(`Parroquia con ID ${actualizarClinicaDto.parroquiaBaseId} no encontrada`);
      }
    }

    // Validaciones específicas por tipo si se está cambiando el tipo
    if (actualizarClinicaDto.tipo) {
      this.validarDatosPorTipo(actualizarClinicaDto);
    }

    try {
      const clinicaActualizada = await this.prisma.clinica.update({
        where: { id },
        data: actualizarClinicaDto,
        include: {
          parroquiaBase: {
            include: {
              canton: {
                include: {
                  provincia: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`Clínica ${id} actualizada exitosamente`);
      return this.mapearClinicaRespuesta(clinicaActualizada);
    } catch (error) {
      this.logger.error(`Error al actualizar clínica: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la clínica');
    }
  }

  /**
   * Eliminar una clínica
   * 
   * Realiza un soft delete cambiando el estado a INACTIVA.
   * No elimina físicamente para mantener integridad referencial.
   * 
   * @param id - ID de la clínica a eliminar
   * @returns Promise<{ mensaje: string }> - Confirmación de eliminación
   * 
   * @throws {NotFoundException} - Clínica no encontrada
   * @throws {BadRequestException} - Clínica tiene dependencias activas
   */
  async eliminar(id: number): Promise<{ mensaje: string }> {
    this.logger.log(`Eliminando clínica con ID: ${id}`);

    const clinica = await this.prisma.clinica.findUnique({
      where: { id },
      include: {
        personalAsignado: {
          where: { fechaFin: null }
        },
        horarios: {
          where: { activo: true }
        }
      }
    });

    if (!clinica) {
      throw new NotFoundException(`Clínica con ID ${id} no encontrada`);
    }

    // Verificar si tiene personal o horarios activos
    if (clinica.personalAsignado.length > 0 || clinica.horarios.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la clínica porque tiene personal asignado o horarios activos. ' +
        'Primero desactive el personal y horarios asociados.'
      );
    }

    try {
      // Soft delete cambiando el estado
      await this.prisma.clinica.update({
        where: { id },
        data: { estado: EstadoClinica.INACTIVA }
      });

      this.logger.log(`Clínica ${id} marcada como inactiva exitosamente`);
      return { mensaje: 'Clínica eliminada exitosamente' };
    } catch (error) {
      this.logger.error(`Error al eliminar clínica: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar la clínica');
    }
  }

  /**
   * Obtener clínicas por tipo
   * 
   * Consulta clínicas filtradas por su tipo operativo.
   * Útil para obtener solo clínicas móviles, fijas o temporales.
   * 
   * @param tipo - Tipo de clínica a consultar
   * @returns Promise<ClinicaRespuestaDto[]> - Lista de clínicas del tipo especificado
   */
  async obtenerPorTipo(tipo: TipoClinica): Promise<ClinicaRespuestaDto[]> {
    this.logger.log(`Obteniendo clínicas de tipo: ${tipo}`);

    return this.obtenerTodas({ tipo });
  }

  /**
   * Obtener estadísticas básicas de clínicas
   * 
   * Proporciona un resumen estadístico del estado actual
   * de las clínicas en el sistema.
   * 
   * @returns Promise<object> - Estadísticas de clínicas
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    porTipo: Record<TipoClinica, number>;
    porEstado: Record<EstadoClinica, number>;
    conPersonalActivo: number;
    conHorariosActivos: number;
  }> {
    this.logger.log('Generando estadísticas de clínicas');

    try {
      const [
        total,
        porTipo,
        porEstado,
        conPersonalActivo,
        conHorariosActivos
      ] = await Promise.all([
        // Total de clínicas
        this.prisma.clinica.count(),

        // Clínicas por tipo
        this.prisma.clinica.groupBy({
          by: ['tipo'],
          _count: true
        }),

        // Clínicas por estado
        this.prisma.clinica.groupBy({
          by: ['estado'],
          _count: true
        }),

        // Clínicas con personal activo
        this.prisma.clinica.count({
          where: {
            personalAsignado: {
              some: { fechaFin: null }
            }
          }
        }),

        // Clínicas con horarios activos
        this.prisma.clinica.count({
          where: {
            horarios: {
              some: { activo: true }
            }
          }
        })
      ]);

      // Procesar resultados
      const estadisticasPorTipo = porTipo.reduce((acc, item) => {
        acc[item.tipo as TipoClinica] = item._count;
        return acc;
      }, {} as Record<TipoClinica, number>);

      const estadisticasPorEstado = porEstado.reduce((acc, item) => {
        acc[item.estado as EstadoClinica] = item._count;
        return acc;
      }, {} as Record<EstadoClinica, number>);

      return {
        total,
        porTipo: estadisticasPorTipo,
        porEstado: estadisticasPorEstado,
        conPersonalActivo,
        conHorariosActivos
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`, error.stack);
      throw new BadRequestException('Error al obtener estadísticas de clínicas');
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Validar datos específicos según el tipo de clínica
   * 
   * @private
   * @param datos - Datos de la clínica a validar
   * @throws {BadRequestException} - Datos inválidos para el tipo
   */
  private validarDatosPorTipo(datos: CrearClinicaDto | ActualizarClinicaDto): void {
    if (datos.tipo === TipoClinica.MOVIL) {
      // Las clínicas móviles deberían tener información del vehículo
      if (!datos.placaVehiculo) {
        this.logger.warn('Clínica móvil creada sin placa de vehículo');
      }
    } else if (datos.tipo === TipoClinica.FIJA) {
      // Las clínicas fijas deberían tener dirección base
      if (!datos.direccionBase && !datos.parroquiaBaseId) {
        this.logger.warn('Clínica fija creada sin dirección base o parroquia');
      }
    }
  }

  /**
   * Mapear entidad Prisma a DTO de respuesta
   * 
   * @private
   * @param clinica - Entidad de clínica de Prisma
   * @returns ClinicaRespuestaDto - Objeto de respuesta formateado
   */
  private mapearClinicaRespuesta(clinica: any): ClinicaRespuestaDto {
    const respuesta: ClinicaRespuestaDto = {
      id: clinica.id,
      nombre: clinica.nombre,
      codigo: clinica.codigo,
      tipo: clinica.tipo,
      estado: clinica.estado,
      descripcion: clinica.descripcion,
      telefono: clinica.telefono,
      email: clinica.email,
      capacidadPacientes: clinica.capacidadPacientes,
      fechaCreacion: clinica.fechaCreacion,
      fechaActualizacion: clinica.fechaActualizacion,
      direccionBase: clinica.direccionBase,
      placaVehiculo: clinica.placaVehiculo,
      modeloVehiculo: clinica.modeloVehiculo,
      anoVehiculo: clinica.anoVehiculo
    };

    // Agregar información de parroquia si existe
    if (clinica.parroquiaBase) {
      respuesta.parroquiaBase = {
        id: clinica.parroquiaBase.id,
        nombre: clinica.parroquiaBase.nombre,
        canton: {
          id: clinica.parroquiaBase.canton.id,
          nombre: clinica.parroquiaBase.canton.nombre,
          provincia: {
            id: clinica.parroquiaBase.canton.provincia.id,
            nombre: clinica.parroquiaBase.canton.provincia.nombre
          }
        }
      };
    }

    // Agregar horarios si existen
    if (clinica.horarios) {
      respuesta.horarios = clinica.horarios;
    }

    // Agregar personal si existe
    if (clinica.personalAsignado) {
      respuesta.personalAsignado = clinica.personalAsignado;
    }

    // Agregar estadísticas básicas si hay relaciones cargadas
    if (clinica.personalAsignado || clinica.horarios) {
      respuesta.estadisticas = {
        totalPersonal: clinica.personalAsignado?.length || 0,
        personalActivo: clinica.personalAsignado?.filter((p: any) => !p.fechaFin).length || 0,
        totalHorarios: clinica.horarios?.length || 0,
        horariosActivos: clinica.horarios?.filter((h: any) => h.activo).length || 0
      };
    }

    return respuesta;
  }
}
