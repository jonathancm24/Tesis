import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearPreguntaClinicaDto, 
  ActualizarPreguntaClinicaDto,
  CrearPreguntasLoteDto 
} from './DTO/crear-pregunta-clinica.dto';
import { 
  IPreguntaClinica,
  IFiltrosPreguntasClinicas,
  IPreguntasClinicasPaginadas,
  IEstadisticasPreguntasEspecialidad
} from './interfaces/pregunta-clinica.interface';

/**
 * Servicio para gestión de preguntas clínicas por especialidad
 * Maneja la creación, consulta, actualización y eliminación de preguntas
 * Incluye funcionalidades de filtrado y estadísticas
 */
@Injectable()
export class PreguntasClinicasService {
  private readonly logger = new Logger(PreguntasClinicasService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva pregunta clínica
   * @param createDto - Datos para crear la pregunta
   * @returns Promise<IPreguntaClinica> - Pregunta creada con datos completos
   */
  async crearPregunta(createDto: CrearPreguntaClinicaDto): Promise<IPreguntaClinica> {
    this.logger.log(`Creando nueva pregunta clínica para especialidad ${createDto.especialidadId}`);

    try {
      // Validar que la especialidad existe si se proporciona
      if (createDto.especialidadId) {
        await this.validarEspecialidad(createDto.especialidadId);
      }

      const pregunta = await this.prisma.preguntaClinica.create({
        data: {
          texto: createDto.texto,
          tipo: createDto.tipo,
          obligatoria: createDto.obligatoria ?? false,
          especialidadId: createDto.especialidadId
        },
        include: {
          especialidad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      this.logger.log(`Pregunta clínica creada exitosamente con ID: ${pregunta.id}`);
      return pregunta;

    } catch (error) {
      this.logger.error(`Error al crear pregunta clínica: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear la pregunta clínica');
    }
  }

  /**
   * Obtiene todas las preguntas de una especialidad específica
   * @param especialidadId - ID de la especialidad
   * @returns Promise<IPreguntaClinica[]> - Lista de preguntas
   */
  async obtenerPreguntasPorEspecialidad(especialidadId: number): Promise<IPreguntaClinica[]> {
    this.logger.log(`Obteniendo preguntas para especialidad ${especialidadId}`);

    await this.validarEspecialidad(especialidadId);

    const preguntas = await this.prisma.preguntaClinica.findMany({
      where: {
        especialidadId: especialidadId
      },
      include: {
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        }
      },
      orderBy: [
        { obligatoria: 'desc' }, // Preguntas obligatorias primero
        { id: 'asc' }
      ]
    });

    this.logger.log(`Encontradas ${preguntas.length} preguntas para especialidad ${especialidadId}`);
    return preguntas;
  }

  /**
   * Obtiene preguntas con filtros avanzados y paginación
   * @param filtros - Criterios de filtrado
   * @param pagina - Número de página (default: 1)
   * @param limite - Elementos por página (default: 10)
   * @returns Promise<IPreguntasClinicasPaginadas> - Resultado paginado
   */
  async obtenerPreguntasConFiltros(
    filtros: IFiltrosPreguntasClinicas,
    pagina: number = 1,
    limite: number = 10
  ): Promise<IPreguntasClinicasPaginadas> {
    this.logger.log(`Obteniendo preguntas con filtros: ${JSON.stringify(filtros)}`);

    const skip = (pagina - 1) * limite;
    
    // Construir condiciones WHERE dinámicamente
    const whereConditions: any = {};

    if (filtros.especialidadId) {
      whereConditions.especialidadId = filtros.especialidadId;
    }

    if (filtros.tipo) {
      whereConditions.tipo = filtros.tipo;
    }

    if (filtros.obligatoria !== undefined) {
      whereConditions.obligatoria = filtros.obligatoria;
    }

    if (filtros.busqueda) {
      whereConditions.texto = {
        contains: filtros.busqueda,
        mode: 'insensitive'
      };
    }

    // Obtener total y preguntas en paralelo
    const [total, preguntas] = await Promise.all([
      this.prisma.preguntaClinica.count({ where: whereConditions }),
      this.prisma.preguntaClinica.findMany({
        where: whereConditions,
        include: {
          especialidad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        },
        orderBy: [
          { obligatoria: 'desc' },
          { id: 'asc' }
        ],
        skip,
        take: limite
      })
    ]);

    const totalPaginas = Math.ceil(total / limite);

    this.logger.log(`Encontradas ${preguntas.length} preguntas de ${total} total`);

    return {
      preguntas,
      total,
      pagina,
      totalPaginas,
      limite
    };
  }

  /**
   * Obtiene una pregunta específica por ID
   * @param id - ID de la pregunta
   * @returns Promise<IPreguntaClinica> - Pregunta encontrada
   */
  async obtenerPreguntaPorId(id: number): Promise<IPreguntaClinica> {
    this.logger.log(`Obteniendo pregunta con ID: ${id}`);

    const pregunta = await this.prisma.preguntaClinica.findUnique({
      where: { id },
      include: {
        especialidad: {
          select: {
            id: true,
            nombre: true,
            descripcion: true
          }
        }
      }
    });

    if (!pregunta) {
      throw new NotFoundException(`Pregunta clínica con ID ${id} no encontrada`);
    }

    return pregunta;
  }

  /**
   * Actualiza una pregunta clínica existente
   * @param id - ID de la pregunta
   * @param updateDto - Datos para actualizar
   * @returns Promise<IPreguntaClinica> - Pregunta actualizada
   */
  async actualizarPregunta(id: number, updateDto: ActualizarPreguntaClinicaDto): Promise<IPreguntaClinica> {
    this.logger.log(`Actualizando pregunta con ID: ${id}`);

    // Verificar que la pregunta existe
    await this.obtenerPreguntaPorId(id);

    // Validar especialidad si se está actualizando
    if (updateDto.especialidadId) {
      await this.validarEspecialidad(updateDto.especialidadId);
    }

    try {
      const preguntaActualizada = await this.prisma.preguntaClinica.update({
        where: { id },
        data: updateDto,
        include: {
          especialidad: {
            select: {
              id: true,
              nombre: true,
              descripcion: true
            }
          }
        }
      });

      this.logger.log(`Pregunta ${id} actualizada exitosamente`);
      return preguntaActualizada;

    } catch (error) {
      this.logger.error(`Error al actualizar pregunta ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la pregunta clínica');
    }
  }

  /**
   * Elimina una pregunta clínica
   * @param id - ID de la pregunta
   * @returns Promise<void>
   */
  async eliminarPregunta(id: number): Promise<void> {
    this.logger.log(`Eliminando pregunta con ID: ${id}`);

    // Verificar que la pregunta existe
    await this.obtenerPreguntaPorId(id);

    // Verificar si tiene respuestas asociadas
    const respuestasCount = await this.prisma.respuestaClinica.count({
      where: { preguntaId: id }
    });

    if (respuestasCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la pregunta porque tiene ${respuestasCount} respuestas asociadas`
      );
    }

    try {
      await this.prisma.preguntaClinica.delete({
        where: { id }
      });

      this.logger.log(`Pregunta ${id} eliminada exitosamente`);

    } catch (error) {
      this.logger.error(`Error al eliminar pregunta ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar la pregunta clínica');
    }
  }

  /**
   * Crea múltiples preguntas en lote para una especialidad
   * @param createLoteDto - Datos para crear preguntas en lote
   * @returns Promise<IPreguntaClinica[]> - Preguntas creadas
   */
  async crearPreguntasLote(createLoteDto: CrearPreguntasLoteDto): Promise<IPreguntaClinica[]> {
    this.logger.log(`Creando ${createLoteDto.preguntas.length} preguntas en lote para especialidad ${createLoteDto.especialidadId}`);

    await this.validarEspecialidad(createLoteDto.especialidadId);

    try {
      const preguntasCreadas = await this.prisma.$transaction(
        createLoteDto.preguntas.map(pregunta => 
          this.prisma.preguntaClinica.create({
            data: {
              ...pregunta,
              especialidadId: createLoteDto.especialidadId
            },
            include: {
              especialidad: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          })
        )
      );

      this.logger.log(`${preguntasCreadas.length} preguntas creadas exitosamente en lote`);
      return preguntasCreadas;

    } catch (error) {
      this.logger.error(`Error al crear preguntas en lote: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear las preguntas en lote');
    }
  }

  /**
   * Obtiene estadísticas de preguntas por especialidad
   * @param especialidadId - ID de la especialidad (opcional, si no se proporciona devuelve todas)
   * @returns Promise<IEstadisticasPreguntasEspecialidad[]> - Estadísticas
   */
  async obtenerEstadisticasPorEspecialidad(especialidadId?: number): Promise<IEstadisticasPreguntasEspecialidad[]> {
    this.logger.log(`Obteniendo estadísticas de preguntas ${especialidadId ? `para especialidad ${especialidadId}` : 'para todas las especialidades'}`);

    const whereCondition = especialidadId ? { especialidadId } : {};

    const estadisticas = await this.prisma.especialidad.findMany({
      where: especialidadId ? { id: especialidadId } : {},
      include: {
        PreguntaClinica: {
          select: {
            tipo: true,
            obligatoria: true
          }
        }
      }
    });

    const resultado = estadisticas.map(especialidad => {
      const preguntas = especialidad.PreguntaClinica;
      const tiposPreguntas = preguntas.reduce((acc, pregunta) => {
        acc[pregunta.tipo] = (acc[pregunta.tipo] || 0) + 1;
        return acc;
      }, {} as any);

      return {
        especialidadId: especialidad.id,
        especialidadNombre: especialidad.nombre,
        totalPreguntas: preguntas.length,
        preguntasObligatorias: preguntas.filter(p => p.obligatoria).length,
        preguntasOpcionales: preguntas.filter(p => !p.obligatoria).length,
        tiposPreguntas
      };
    });

    return resultado;
  }

  /**
   * Valida que una especialidad existe
   * @param especialidadId - ID de la especialidad
   * @throws NotFoundException si la especialidad no existe
   */
  private async validarEspecialidad(especialidadId: number): Promise<void> {
    const especialidad = await this.prisma.especialidad.findUnique({
      where: { id: especialidadId }
    });

    if (!especialidad) {
      throw new NotFoundException(`Especialidad con ID ${especialidadId} no encontrada`);
    }
  }
}
