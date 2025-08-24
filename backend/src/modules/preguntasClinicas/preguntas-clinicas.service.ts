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
import { 
  parseQuestion, 
  validateQuestionFormat, 
  esFormatoNuevo,
  migrarFormatoAntiguo,
  getQuestionSummary,
  type ParsedQuestion 
} from '../../utils/questionParser';

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
      // Validar formato de la pregunta
      validateQuestionFormat(createDto.texto);
      
      // Parsear para obtener información adicional (opcional)
      let parsedType: any | undefined = undefined;
      try {
        const parsedQuestion = parseQuestion(createDto.texto);
        this.logger.log(`Pregunta parseada: ${getQuestionSummary(parsedQuestion)}`);
        parsedType = parsedQuestion.type;
      } catch (e) {
        // Si el parser falla, continuamos usando el tipo provisto en el DTO
        this.logger.warn(`Parser de pregunta no aplicado: ${e.message}`);
      }

      // Validar que la especialidad existe si se proporciona
      if (createDto.especialidadId) {
        await this.validarEspecialidad(createDto.especialidadId);
      }

      const pregunta = await this.prisma.preguntaClinica.create({
        data: {
          texto: createDto.texto,
          // Preferir el tipo provisto por el cliente; fallback al tipo inferido si no viene
          tipo: (createDto.tipo as any) ?? (parsedType as any),
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
      
      // Si es un error de validación del parser, pasarlo directamente
      if (error.message.includes('La pregunta') || error.message.includes('formato')) {
        throw new BadRequestException(error.message);
      }
      
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

  /**
   * Enriquece una pregunta con información parseada del formato optimizado
   * @param pregunta - Pregunta de la base de datos
   * @returns Pregunta enriquecida con información parseada
   */
  private enriquecerPregunta(pregunta: any): IPreguntaClinica & { parsedInfo?: ParsedQuestion } {
    try {
      // Si la pregunta usa el formato nuevo, parsearla
      if (esFormatoNuevo(pregunta.texto)) {
        const parsedInfo = parseQuestion(pregunta.texto);
        return {
          ...pregunta,
          parsedInfo
        };
      } else {
        // Formato antiguo: migrar automáticamente para la respuesta
        const textoMigrado = migrarFormatoAntiguo(pregunta.texto, pregunta.tipo, pregunta.obligatoria);
        const parsedInfo = parseQuestion(textoMigrado);
        
        return {
          ...pregunta,
          parsedInfo,
          // Agregar flag para indicar que necesita migración
          requiresMigration: true
        };
      }
    } catch (error) {
      this.logger.warn(`Error parseando pregunta ID ${pregunta.id}: ${error.message}`);
      
      // En caso de error, devolver la pregunta sin información parseada
      return pregunta;
    }
  }

  /**
   * Migra automáticamente preguntas del formato antiguo al nuevo
   * @param preguntaId - ID de la pregunta a migrar
   * @returns Promise<IPreguntaClinica> - Pregunta migrada
   */
  async migrarPreguntaAFormatoNuevo(preguntaId: number): Promise<IPreguntaClinica> {
    this.logger.log(`Migrando pregunta ID ${preguntaId} al formato nuevo`);

    const pregunta = await this.prisma.preguntaClinica.findUnique({
      where: { id: preguntaId },
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
      throw new NotFoundException(`Pregunta con ID ${preguntaId} no encontrada`);
    }

    // Si ya está en formato nuevo, no hacer nada
    if (esFormatoNuevo(pregunta.texto)) {
      this.logger.log(`Pregunta ID ${preguntaId} ya está en formato nuevo`);
      return pregunta;
    }

    try {
      // Migrar al formato nuevo
      const textoMigrado = migrarFormatoAntiguo(pregunta.texto, pregunta.tipo, pregunta.obligatoria);
      
      // Validar el formato migrado
      validateQuestionFormat(textoMigrado);
      
      // Parsear para obtener el tipo correcto
      const parsedQuestion = parseQuestion(textoMigrado);

      // Actualizar en la base de datos
      const preguntaActualizada = await this.prisma.preguntaClinica.update({
        where: { id: preguntaId },
        data: {
          texto: textoMigrado,
          tipo: parsedQuestion.type as any
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

      this.logger.log(`Pregunta ID ${preguntaId} migrada exitosamente al formato nuevo`);
      return preguntaActualizada;

    } catch (error) {
      this.logger.error(`Error migrando pregunta ID ${preguntaId}: ${error.message}`, error.stack);
      throw new BadRequestException(`Error al migrar la pregunta: ${error.message}`);
    }
  }

  /**
   * Migra todas las preguntas de una especialidad al formato nuevo
   * @param especialidadId - ID de la especialidad (opcional, si no se proporciona migra todas)
   * @returns Promise<{ migradas: number, errores: number }> - Resultado de la migración
   */
  async migrarPreguntasFormatoNuevo(especialidadId?: number): Promise<{ migradas: number, errores: number }> {
    this.logger.log(`Iniciando migración masiva de preguntas ${especialidadId ? `para especialidad ${especialidadId}` : 'de todas las especialidades'}`);

    const whereClause = especialidadId ? { especialidadId } : {};
    
    const preguntas = await this.prisma.preguntaClinica.findMany({
      where: whereClause,
      select: {
        id: true,
        texto: true,
        tipo: true,
        obligatoria: true
      }
    });

    let migradas = 0;
    let errores = 0;

    for (const pregunta of preguntas) {
      try {
        // Solo migrar si no está en formato nuevo
        if (!esFormatoNuevo(pregunta.texto)) {
          await this.migrarPreguntaAFormatoNuevo(pregunta.id);
          migradas++;
        }
      } catch (error) {
        this.logger.error(`Error migrando pregunta ID ${pregunta.id}: ${error.message}`);
        errores++;
      }
    }

    this.logger.log(`Migración completada: ${migradas} migradas, ${errores} errores`);
    
    return { migradas, errores };
  }

  /**
   * Obtiene estadísticas del formato de preguntas
   * @returns Promise<{ formatoNuevo: number, formatoAntiguo: number, total: number }>
   */
  async obtenerEstadisticasFormato(): Promise<{ formatoNuevo: number, formatoAntiguo: number, total: number }> {
    const todasLasPreguntas = await this.prisma.preguntaClinica.findMany({
      select: {
        texto: true
      }
    });

    const total = todasLasPreguntas.length;
    const formatoNuevo = todasLasPreguntas.filter(p => esFormatoNuevo(p.texto)).length;
    const formatoAntiguo = total - formatoNuevo;

    return { formatoNuevo, formatoAntiguo, total };
  }
}
