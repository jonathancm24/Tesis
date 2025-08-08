import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CrearEncuestaTamizajeDto } from './DTO/crear-encuesta.dto';
import { CrearPreguntaTamizajeDto } from './DTO/crear-pregunta.dto';
import { 
  IEncuestaTamizaje, 
  IFormularioTamizaje, 
  IAntecedentesMedicos,
  IPreguntasPorCategoria
} from './Interface/encuesta.interface';

/**
 * Servicio para manejar encuestas de tamizaje médico
 * 
 * Este servicio gestiona:
 * - Obtención de preguntas para el formulario de tamizaje
 * - Creación de encuestas con respuestas del paciente  
 * - Consulta de antecedentes médicos para casos clínicos
 * - Gestión de preguntas (solo para profesores/admin)
 * 
 * Las encuestas son fundamentales para recopilar antecedentes
 * médicos que ayuden a los estudiantes a armar casos clínicos.
 */
@Injectable()
export class EncuestaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el formulario de tamizaje para un paciente específico
   * 
   * @param pacienteId - ID del paciente
   * @param genero - Género del paciente para filtrar preguntas específicas
   * @returns Formulario organizado por categorías con preguntas filtradas
   * 
   * Esta es una de las rutas principales que usa el estudiante
   * para obtener las preguntas y poder llenar la encuesta
   */
  async obtenerFormularioTamizaje(pacienteId: number, genero?: string): Promise<IFormularioTamizaje> {
    // Verificar que el paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        genero: true,
        activo: true
      }
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${pacienteId} no encontrado`);
    }

    if (!paciente.activo) {
      throw new BadRequestException('El paciente está inactivo');
    }

    // Verificar si ya tiene encuesta previa
    const encuestaPrevia = await this.prisma.encuestaTamizaje.findFirst({
      where: { pacienteId },
      orderBy: { fecha: 'desc' }
    });

    // Obtener preguntas filtradas por género si aplica
    const whereCondition: any = {};
    const generoFinal = genero || paciente.genero;
    
    if (generoFinal && generoFinal.toLowerCase() !== 'masculino') {
      // Si no es masculino, incluir todas las preguntas
      // Si es masculino, excluir preguntas solo para mujeres
    } else {
      whereCondition.soloMujer = false;
    }

    const preguntas = await this.prisma.preguntaTamizaje.findMany({
      where: whereCondition,
      orderBy: [
        { categoria: 'asc' },
        { orden: 'asc' },
        { id: 'asc' }
      ]
    });

    // Agrupar preguntas por categoría
    const preguntasPorCategoria = this.agruparPreguntasPorCategoria(preguntas);

    return {
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        genero: paciente.genero
      },
      preguntasPorCategoria,
      tieneEncuestaPrevia: !!encuestaPrevia,
      fechaUltimaEncuesta: encuestaPrevia?.fecha
    };
  }

  /**
   * Crea una nueva encuesta de tamizaje con las respuestas del paciente
   * 
   * @param crearEncuestaDto - Datos de la encuesta y respuestas
   * @returns La encuesta creada con todas sus respuestas
   * 
   * Esta es la otra ruta principal que permite al estudiante
   * guardar las respuestas recopiladas del paciente
   */
  async crearEncuestaTamizaje(crearEncuestaDto: CrearEncuestaTamizajeDto): Promise<IEncuestaTamizaje> {
    const { pacienteId, respuestas } = crearEncuestaDto;

    // Verificar que el paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true,
        email: true,
        genero: true,
        activo: true
      }
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${pacienteId} no encontrado`);
    }

    if (!paciente.activo) {
      throw new BadRequestException('No se puede crear una encuesta para un paciente inactivo');
    }

    // Verificar que todas las preguntas existen
    const preguntaIds = respuestas.map(r => r.preguntaId);
    const preguntasExistentes = await this.prisma.preguntaTamizaje.findMany({
      where: { id: { in: preguntaIds } }
    });

    if (preguntasExistentes.length !== preguntaIds.length) {
      throw new BadRequestException('Una o más preguntas no existen');
    }

    // Crear la encuesta y sus respuestas en una transacción
    const encuestaCreada = await this.prisma.$transaction(async (prisma) => {
      // Crear la encuesta principal
      const encuesta = await prisma.encuestaTamizaje.create({
        data: {
          pacienteId,
          fecha: new Date()
        }
      });

      // Crear las respuestas individuales
      const respuestasCreadas = await Promise.all(
        respuestas.map(respuesta => 
          prisma.respuestaTamizaje.create({
            data: {
              pacienteId,
              preguntaId: respuesta.preguntaId,
              respuesta: respuesta.respuesta,
              detalle: respuesta.detalle,
              EncuestaTamizaje: {
                connect: { id: encuesta.id }
              }
            },
            include: {
              pregunta: true
            }
          })
        )
      );

      return {
        ...encuesta,
        respuestas: respuestasCreadas
      };
    });

    return {
      id: encuestaCreada.id,
      pacienteId: encuestaCreada.pacienteId,
      fecha: encuestaCreada.fecha,
      paciente,
      respuestas: encuestaCreada.respuestas.map(r => ({
        id: r.id,
        preguntaId: r.preguntaId,
        respuesta: r.respuesta,
        detalle: r.detalle,
        pregunta: {
          id: r.pregunta.id,
          texto: r.pregunta.texto,
          tipo: r.pregunta.tipo,
          categoria: r.pregunta.categoria,
          orden: r.pregunta.orden,
          soloMujer: r.pregunta.soloMujer,
          requiereDetalle: r.pregunta.requiereDetalle
        }
      }))
    };
  }

  /**
   * Obtiene los antecedentes médicos organizados de un paciente
   * 
   * @param pacienteId - ID del paciente
   * @returns Antecedentes médicos organizados por categoría
   * 
   * Esta ruta es fundamental para que el estudiante pueda
   * ver los antecedentes organizados al armar el caso clínico
   */
  async obtenerAntecedentesMedicos(pacienteId: number): Promise<IAntecedentesMedicos> {
    // Obtener la encuesta más reciente del paciente
    const encuesta = await this.prisma.encuestaTamizaje.findFirst({
      where: { pacienteId },
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cedula: true,
            genero: true
          }
        },
        RespuestaTamizaje: {
          include: {
            pregunta: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    if (!encuesta) {
      throw new NotFoundException(`No se encontró encuesta de tamizaje para el paciente con ID ${pacienteId}`);
    }

    // Agrupar respuestas por categoría
    const antecedentesPorCategoria = this.agruparRespuestasPorCategoria(encuesta.RespuestaTamizaje);

    return {
      paciente: encuesta.paciente,
      fechaEncuesta: encuesta.fecha,
      antecedentesPorCategoria
    };
  }

  /**
   * Crea una nueva pregunta de tamizaje (solo para profesores/admin)
   * 
   * @param crearPreguntaDto - Datos de la nueva pregunta
   * @returns La pregunta creada
   */
  async crearPregunta(crearPreguntaDto: CrearPreguntaTamizajeDto) {
    return await this.prisma.preguntaTamizaje.create({
      data: crearPreguntaDto
    });
  }

  /**
   * Obtiene todas las preguntas de tamizaje (para administración)
   * 
   * @returns Lista de todas las preguntas organizadas
   */
  async obtenerTodasLasPreguntas() {
    const preguntas = await this.prisma.preguntaTamizaje.findMany({
      orderBy: [
        { categoria: 'asc' },
        { orden: 'asc' },
        { id: 'asc' }
      ]
    });

    return this.agruparPreguntasPorCategoria(preguntas);
  }

  /**
   * Verifica si un paciente ya tiene encuesta de tamizaje
   * 
   * @param pacienteId - ID del paciente
   * @returns true si ya tiene encuesta, false si no
   */
  async pacienteTieneEncuesta(pacienteId: number): Promise<boolean> {
    const encuesta = await this.prisma.encuestaTamizaje.findFirst({
      where: { pacienteId }
    });

    return !!encuesta;
  }

  // MÉTODOS AUXILIARES PRIVADOS

  /**
   * Agrupa preguntas por categoría para organizar el formulario
   */
  private agruparPreguntasPorCategoria(preguntas: any[]): IPreguntasPorCategoria[] {
    const grupos = new Map<string, any[]>();
    
    preguntas.forEach(pregunta => {
      const categoria = pregunta.categoria || 'General';
      if (!grupos.has(categoria)) {
        grupos.set(categoria, []);
      }
      grupos.get(categoria)!.push(pregunta);
    });

    return Array.from(grupos.entries()).map(([categoria, preguntas]) => ({
      categoria,
      preguntas
    }));
  }

  /**
   * Agrupa respuestas por categoría para mostrar antecedentes organizados
   */
  private agruparRespuestasPorCategoria(respuestas: any[]) {
    const grupos = new Map<string, any[]>();
    
    respuestas.forEach(respuesta => {
      const categoria = respuesta.pregunta.categoria || 'General';
      if (!grupos.has(categoria)) {
        grupos.set(categoria, []);
      }
      grupos.get(categoria)!.push({
        pregunta: respuesta.pregunta.texto,
        respuesta: respuesta.respuesta || 'No respondida',
        detalle: respuesta.detalle
      });
    });

    return Array.from(grupos.entries()).map(([categoria, respuestas]) => ({
      categoria,
      respuestas
    }));
  }
}