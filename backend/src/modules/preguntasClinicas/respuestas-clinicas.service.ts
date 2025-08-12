import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearRespuestaClinicaDto,
  ActualizarRespuestaClinicaDto,
  CrearRespuestasLoteDto 
} from './DTO/respuesta-clinica.dto';
import { TipoPregunta } from '@prisma/client';

/**
 * Servicio para gestión de respuestas clínicas
 * Maneja la creación, consulta, actualización y validación de respuestas
 * Incluye funcionalidades de análisis y estadísticas
 */
@Injectable()
export class RespuestasClinicasService {
  private readonly logger = new Logger(RespuestasClinicasService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva respuesta clínica
   * @param createDto - Datos para crear la respuesta
   * @returns Promise<any> - Respuesta creada
   */
  async crearRespuesta(createDto: CrearRespuestaClinicaDto): Promise<any> {
    this.logger.log(`Creando nueva respuesta clínica para pregunta ${createDto.preguntaId}`);

    try {
      // Validar que la pregunta existe
      await this.validarPregunta(createDto.preguntaId);

      // Validar que el caso clínico existe
      await this.validarCasoClinico(createDto.casoClinicoId);

      // Validar formato de respuesta según tipo de pregunta
      await this.validarFormatoRespuesta(createDto.preguntaId, createDto.respuesta);

      const respuesta = await this.prisma.respuestaClinica.create({
        data: {
          preguntaId: createDto.preguntaId,
          casoClinicoId: createDto.casoClinicoId,
          respuesta: createDto.respuesta
        },
        include: {
          pregunta: {
            select: {
              id: true,
              texto: true,
              tipo: true,
              obligatoria: true,
              especialidad: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          casoClinico: {
            select: {
              id: true,
              estado: true,
              paciente: {
                select: {
                  nombre: true,
                  apellido: true
                }
              },
              estudiante: {
                select: {
                  nombre: true,
                  apellido: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`Respuesta clínica creada exitosamente con ID: ${respuesta.id}`);
      return respuesta;

    } catch (error) {
      this.logger.error(`Error al crear respuesta clínica: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Error al crear la respuesta clínica');
    }
  }

  /**
   * Obtiene todas las respuestas de un caso clínico
   * @param casoClinicoId - ID del caso clínico
   * @returns Promise<any[]> - Lista de respuestas
   */
  async obtenerRespuestasPorCaso(casoClinicoId: number): Promise<any[]> {
    this.logger.log(`Obteniendo respuestas para caso clínico ${casoClinicoId}`);

    await this.validarCasoClinico(casoClinicoId);

    const respuestas = await this.prisma.respuestaClinica.findMany({
      where: {
        casoClinicoId: casoClinicoId
      },
      include: {
        pregunta: {
          select: {
            id: true,
            texto: true,
            tipo: true,
            obligatoria: true,
            especialidad: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        casoClinico: {
          select: {
            id: true,
            estado: true
          }
        }
      },
      orderBy: [
        { pregunta: { obligatoria: 'desc' } },
        { id: 'asc' }
      ]
    });

    this.logger.log(`Encontradas ${respuestas.length} respuestas para caso clínico ${casoClinicoId}`);
    return respuestas;
  }

  /**
   * Obtiene una respuesta específica por ID
   * @param id - ID de la respuesta
   * @returns Promise<any> - Respuesta encontrada
   */
  async obtenerRespuestaPorId(id: number): Promise<any> {
    this.logger.log(`Obteniendo respuesta con ID: ${id}`);

    const respuesta = await this.prisma.respuestaClinica.findUnique({
      where: { id },
      include: {
        pregunta: {
          select: {
            id: true,
            texto: true,
            tipo: true,
            obligatoria: true,
            especialidad: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        casoClinico: {
          select: {
            id: true,
            estado: true
          }
        }
      }
    });

    if (!respuesta) {
      throw new NotFoundException(`Respuesta clínica con ID ${id} no encontrada`);
    }

    return respuesta;
  }

  /**
   * Actualiza una respuesta clínica existente
   * @param id - ID de la respuesta
   * @param updateDto - Datos para actualizar
   * @returns Promise<any> - Respuesta actualizada
   */
  async actualizarRespuesta(id: number, updateDto: ActualizarRespuestaClinicaDto): Promise<any> {
    this.logger.log(`Actualizando respuesta con ID: ${id}`);

    // Verificar que la respuesta existe
    const respuestaExistente = await this.obtenerRespuestaPorId(id);

    // Validar formato si se está actualizando la respuesta
    if (updateDto.respuesta) {
      await this.validarFormatoRespuesta(respuestaExistente.preguntaId, updateDto.respuesta);
    }

    try {
      const respuestaActualizada = await this.prisma.respuestaClinica.update({
        where: { id },
        data: updateDto,
        include: {
          pregunta: {
            select: {
              id: true,
              texto: true,
              tipo: true,
              obligatoria: true,
              especialidad: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          casoClinico: {
            select: {
              id: true,
              estado: true
            }
          }
        }
      });

      this.logger.log(`Respuesta ${id} actualizada exitosamente`);
      return respuestaActualizada;

    } catch (error) {
      this.logger.error(`Error al actualizar respuesta ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al actualizar la respuesta clínica');
    }
  }

  /**
   * Elimina una respuesta clínica
   * @param id - ID de la respuesta
   * @returns Promise<void>
   */
  async eliminarRespuesta(id: number): Promise<void> {
    this.logger.log(`Eliminando respuesta con ID: ${id}`);

    // Verificar que la respuesta existe
    await this.obtenerRespuestaPorId(id);

    try {
      await this.prisma.respuestaClinica.delete({
        where: { id }
      });

      this.logger.log(`Respuesta ${id} eliminada exitosamente`);

    } catch (error) {
      this.logger.error(`Error al eliminar respuesta ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al eliminar la respuesta clínica');
    }
  }

  /**
   * Crea múltiples respuestas en lote para un caso clínico
   * @param createLoteDto - Datos para crear respuestas en lote
   * @returns Promise<any[]> - Respuestas creadas
   */
  async crearRespuestasLote(createLoteDto: CrearRespuestasLoteDto): Promise<any[]> {
    this.logger.log(`Creando ${createLoteDto.respuestas.length} respuestas en lote para caso ${createLoteDto.casoClinicoId}`);

    await this.validarCasoClinico(createLoteDto.casoClinicoId);

    // Validar todas las preguntas y formatos
    for (const respuesta of createLoteDto.respuestas) {
      await this.validarPregunta(respuesta.preguntaId);
      await this.validarFormatoRespuesta(respuesta.preguntaId, respuesta.respuesta);
    }

    try {
      const respuestasCreadas = await this.prisma.$transaction(
        createLoteDto.respuestas.map(respuesta => 
          this.prisma.respuestaClinica.create({
            data: {
              ...respuesta,
              casoClinicoId: createLoteDto.casoClinicoId
            },
            include: {
              pregunta: {
                select: {
                  id: true,
                  texto: true,
                  tipo: true,
                  obligatoria: true,
                  especialidad: {
                    select: {
                      id: true,
                      nombre: true
                    }
                  }
                }
              },
              casoClinico: {
                select: {
                  id: true,
                  estado: true
                }
              }
            }
          })
        )
      );

      this.logger.log(`${respuestasCreadas.length} respuestas creadas exitosamente en lote`);
      return respuestasCreadas;

    } catch (error) {
      this.logger.error(`Error al crear respuestas en lote: ${error.message}`, error.stack);
      throw new BadRequestException('Error al crear las respuestas en lote');
    }
  }

  /**
   * Obtiene estadísticas básicas de respuestas
   * @param especialidadId - ID de especialidad (opcional)
   * @returns Promise<any> - Estadísticas
   */
  async obtenerEstadisticasRespuestas(especialidadId?: number): Promise<any> {
    this.logger.log(`Obteniendo estadísticas de respuestas`);

    const whereConditions: any = {};

    if (especialidadId) {
      whereConditions.pregunta = {
        especialidadId: especialidadId
      };
    }

    const [
      totalRespuestas,
      casosUnicos
    ] = await Promise.all([
      // Total de respuestas
      this.prisma.respuestaClinica.count({ where: whereConditions }),
      
      // Casos únicos con respuestas
      this.prisma.respuestaClinica.findMany({
        where: whereConditions,
        select: { casoClinicoId: true },
        distinct: ['casoClinicoId']
      })
    ]);

    return {
      totalRespuestas,
      casosConRespuestas: casosUnicos.length,
      respuestasPorEspecialidad: []
    };
  }

  /**
   * Valida que una pregunta existe
   * @param preguntaId - ID de la pregunta
   * @throws NotFoundException si la pregunta no existe
   */
  private async validarPregunta(preguntaId: number): Promise<void> {
    const pregunta = await this.prisma.preguntaClinica.findUnique({
      where: { id: preguntaId }
    });

    if (!pregunta) {
      throw new NotFoundException(`Pregunta clínica con ID ${preguntaId} no encontrada`);
    }
  }

  /**
   * Valida que un caso clínico existe
   * @param casoClinicoId - ID del caso clínico
   * @throws NotFoundException si el caso clínico no existe
   */
  private async validarCasoClinico(casoClinicoId: number): Promise<void> {
    const casoClinico = await this.prisma.casoClinico.findUnique({
      where: { id: casoClinicoId }
    });

    if (!casoClinico) {
      throw new NotFoundException(`Caso clínico con ID ${casoClinicoId} no encontrado`);
    }
  }

  /**
   * Valida el formato de una respuesta según el tipo de pregunta
   * @param preguntaId - ID de la pregunta
   * @param respuesta - Respuesta a validar
   * @throws BadRequestException si el formato es inválido
   */
  private async validarFormatoRespuesta(preguntaId: number, respuesta: string): Promise<void> {
    const pregunta = await this.prisma.preguntaClinica.findUnique({
      where: { id: preguntaId }
    });

    if (!pregunta) {
      throw new NotFoundException(`Pregunta ${preguntaId} no encontrada`);
    }

    // Validaciones básicas según tipo de pregunta
    switch (pregunta.tipo) {
      case TipoPregunta.TEXTO:
        if (!respuesta || respuesta.trim().length === 0) {
          throw new BadRequestException('La respuesta de texto no puede estar vacía');
        }
        if (respuesta.length > 2000) {
          throw new BadRequestException('La respuesta de texto no puede exceder 2000 caracteres');
        }
        break;

      case TipoPregunta.NUMERICO:
        const numero = parseFloat(respuesta);
        if (isNaN(numero)) {
          throw new BadRequestException('La respuesta debe ser un número válido');
        }
        break;

      case TipoPregunta.SI_NO:
        const respuestas_validas = ['SI', 'NO', 'Sí', 'No', 'si', 'no', 'true', 'false'];
        if (!respuestas_validas.includes(respuesta)) {
          throw new BadRequestException('La respuesta debe ser SI o NO');
        }
        break;

      case TipoPregunta.FECHA:
        const fecha = new Date(respuesta);
        if (isNaN(fecha.getTime())) {
          throw new BadRequestException('La respuesta debe ser una fecha válida');
        }
        break;

      case TipoPregunta.OPCION_MULTIPLE:
        if (!respuesta || respuesta.trim().length === 0) {
          throw new BadRequestException('Debe seleccionar al menos una opción');
        }
        break;

      default:
        // Para tipos no reconocidos, validación básica
        if (!respuesta || respuesta.trim().length === 0) {
          throw new BadRequestException('La respuesta no puede estar vacía');
        }
    }
  }
}
