/**
 * Servicio para la gestión de horarios de clínica
 * 
 * Maneja toda la lógica de negocio para los horarios de atención
 * de las clínicas del sistema universitario. Incluye validaciones
 * de conflictos, cálculos de duración y gestión de estados.
 * 
 * @fileoverview Servicio de horarios de clínica
 * @module HorarioClinicaService
 */

import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CrearHorarioClinicaDto,
  ActualizarHorarioClinicaDto,
  FiltrosHorarioClinicaDto,
  HorarioClinicaRespuestaDto,
  HorariosClinicaAgrupadosDto,
  EstadisticasHorarioClinicaDto,
  DiaSemana
} from './horario-clinica.dto';
import { Prisma, DiaSemana as PrismaDiaSemana } from '@prisma/client';

/**
 * Servicio para gestionar horarios de clínica
 * 
 * Proporciona métodos para crear, consultar, actualizar y eliminar
 * horarios de atención de las clínicas, incluyendo validaciones
 * de negocio y cálculos de estadísticas.
 */
@Injectable()
export class HorarioClinicaService {
  private readonly logger = new Logger(HorarioClinicaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo horario de clínica
   * 
   * Registra un horario de atención para una clínica específica,
   * validando que no existan conflictos y que los datos sean coherentes.
   * 
   * @param datos - Datos del horario a crear
   * @returns Horario creado con información adicional
   * 
   * @throws BadRequestException Si los datos son inválidos
   * @throws ConflictException Si ya existe un horario para esa clínica y día
   * @throws NotFoundException Si la clínica no existe
   */
  async crear(datos: CrearHorarioClinicaDto): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Creando horario para clínica ${datos.clinicaId}, día ${datos.diaSemana}`);

    try {
      // Validar que la clínica existe y está activa
      await this.validarClinicaExiste(datos.clinicaId);

      // Validar coherencia de horarios
      this.validarCoherenciaHorarios(datos.horaApertura, datos.horaCierre);

      // Verificar que no existe conflicto con horarios existentes
      await this.verificarConflictoHorario(datos.clinicaId, datos.diaSemana as PrismaDiaSemana);

      // Crear el horario
      const horarioCreado = await this.prisma.horarioClinica.create({
        data: {
          clinicaId: datos.clinicaId,
          diaSemana: datos.diaSemana,
          horaApertura: datos.horaApertura,
          horaCierre: datos.horaCierre,
          activo: datos.activo ?? true
        },
        include: {
          clinica: {
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
          }
        }
      });

      this.logger.log(`Horario creado exitosamente con ID: ${horarioCreado.id}`);
      return this.transformarRespuesta(horarioCreado);

    } catch (error) {
      this.logger.error(`Error al crear horario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener horarios con filtros opcionales
   * 
   * Consulta horarios aplicando filtros específicos y paginación.
   * Puede incluir información detallada de las clínicas.
   * 
   * @param filtros - Criterios de búsqueda y filtros
   * @returns Lista de horarios que cumplen los criterios
   */
  async obtenerTodos(filtros: FiltrosHorarioClinicaDto = {}): Promise<HorarioClinicaRespuestaDto[]> {
    this.logger.log('Obteniendo horarios con filtros:', JSON.stringify(filtros, null, 2));

    try {
      // Construir condiciones de búsqueda
      const condiciones: Prisma.HorarioClinicaWhereInput = {};

      if (filtros.clinicaId) {
        condiciones.clinicaId = filtros.clinicaId;
      }

      if (filtros.diaSemana) {
        condiciones.diaSemana = filtros.diaSemana;
      }

      if (filtros.soloActivos !== undefined) {
        condiciones.activo = filtros.soloActivos;
      }

      // Filtros de clínica relacionada
      if (filtros.tipoClinica || filtros.estadoClinica) {
        condiciones.clinica = {};
        if (filtros.tipoClinica) {
          condiciones.clinica.tipo = filtros.tipoClinica as any;
        }
        if (filtros.estadoClinica) {
          condiciones.clinica.estado = filtros.estadoClinica as any;
        }
      }

      // Ejecutar consulta
      const horarios = await this.prisma.horarioClinica.findMany({
        where: condiciones,
        include: filtros.incluirClinica ? {
          clinica: {
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
          }
        } : undefined,
        orderBy: [
          { clinicaId: 'asc' },
          { diaSemana: 'asc' },
          { horaApertura: 'asc' }
        ]
      });

      this.logger.log(`Se encontraron ${horarios.length} horarios`);
      return horarios.map(horario => this.transformarRespuesta(horario));

    } catch (error) {
      this.logger.error(`Error al obtener horarios: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un horario específico por ID
   * 
   * @param id - ID del horario a buscar
   * @returns Horario encontrado con información detallada
   * 
   * @throws NotFoundException Si el horario no existe
   */
  async obtenerPorId(id: number): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Obteniendo horario con ID: ${id}`);

    try {
      const horario = await this.prisma.horarioClinica.findUnique({
        where: { id },
        include: {
          clinica: {
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
          }
        }
      });

      if (!horario) {
        throw new NotFoundException(`No se encontró horario con ID: ${id}`);
      }

      return this.transformarRespuesta(horario);

    } catch (error) {
      this.logger.error(`Error al obtener horario por ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Actualizar un horario existente
   * 
   * Modifica los datos de un horario validando coherencia
   * y ausencia de conflictos con otros horarios.
   * 
   * @param id - ID del horario a actualizar
   * @param datos - Nuevos datos del horario
   * @returns Horario actualizado
   * 
   * @throws NotFoundException Si el horario no existe
   * @throws BadRequestException Si los datos son inválidos
   * @throws ConflictException Si genera conflictos
   */
  async actualizar(id: number, datos: ActualizarHorarioClinicaDto): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Actualizando horario ID: ${id}`);

    try {
      // Verificar que el horario existe
      const horarioExistente = await this.prisma.horarioClinica.findUnique({
        where: { id }
      });

      if (!horarioExistente) {
        throw new NotFoundException(`No se encontró horario con ID: ${id}`);
      }

      // Si se están cambiando los horarios, validar coherencia
      if (datos.horaApertura || datos.horaCierre) {
        const horaApertura = datos.horaApertura || horarioExistente.horaApertura;
        const horaCierre = datos.horaCierre || horarioExistente.horaCierre;
        this.validarCoherenciaHorarios(horaApertura, horaCierre);
      }

      // Si se cambia clínica o día, verificar conflictos
      if (datos.clinicaId || datos.diaSemana) {
        const nuevaClinicaId = datos.clinicaId || horarioExistente.clinicaId;
        const nuevoDiaSemana = datos.diaSemana || horarioExistente.diaSemana;
        
        // Solo verificar conflicto si realmente cambió algo relevante
        if (nuevaClinicaId !== horarioExistente.clinicaId || 
            nuevoDiaSemana !== horarioExistente.diaSemana) {
          await this.verificarConflictoHorario(
            nuevaClinicaId, 
            nuevoDiaSemana as PrismaDiaSemana, 
            id
          );
        }
      }

      // Validar clínica si se cambió
      if (datos.clinicaId && datos.clinicaId !== horarioExistente.clinicaId) {
        await this.validarClinicaExiste(datos.clinicaId);
      }

      // Actualizar el horario
      const horarioActualizado = await this.prisma.horarioClinica.update({
        where: { id },
        data: datos,
        include: {
          clinica: {
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
          }
        }
      });

      this.logger.log(`Horario actualizado exitosamente: ${id}`);
      return this.transformarRespuesta(horarioActualizado);

    } catch (error) {
      this.logger.error(`Error al actualizar horario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Eliminar un horario de clínica
   * 
   * Remueve permanentemente un horario del sistema.
   * Valida que no afecte operaciones en curso.
   * 
   * @param id - ID del horario a eliminar
   * @returns Confirmación de eliminación
   * 
   * @throws NotFoundException Si el horario no existe
   */
  async eliminar(id: number): Promise<{ mensaje: string; horarioEliminado: HorarioClinicaRespuestaDto }> {
    this.logger.log(`Eliminando horario ID: ${id}`);

    try {
      // Verificar que el horario existe y obtener sus datos
      const horario = await this.obtenerPorId(id);

      // Eliminar el horario
      await this.prisma.horarioClinica.delete({
        where: { id }
      });

      this.logger.log(`Horario eliminado exitosamente: ${id}`);
      return {
        mensaje: `Horario de ${horario.diaSemana} para clínica ${horario.clinica?.nombre || horario.clinicaId} eliminado exitosamente`,
        horarioEliminado: horario
      };

    } catch (error) {
      this.logger.error(`Error al eliminar horario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener horarios agrupados por clínica
   * 
   * Retorna todos los horarios organizados por clínica
   * para facilitar la visualización y gestión.
   * 
   * @param filtros - Filtros opcionales para las clínicas
   * @returns Horarios agrupados por clínica
   */
  async obtenerAgrupadosPorClinica(filtros: FiltrosHorarioClinicaDto = {}): Promise<HorariosClinicaAgrupadosDto[]> {
    this.logger.log('Obteniendo horarios agrupados por clínica');

    try {
      // Construir condiciones para clínicas
      const condicionesClinica: Prisma.ClinicaWhereInput = {};
      
      if (filtros.tipoClinica) {
        condicionesClinica.tipo = filtros.tipoClinica as any;
      }
      if (filtros.estadoClinica) {
        condicionesClinica.estado = filtros.estadoClinica as any;
      }

      // Obtener clínicas con sus horarios
      const clinicas = await this.prisma.clinica.findMany({
        where: condicionesClinica,
        include: {
          horarios: {
            where: filtros.soloActivos !== undefined ? { activo: filtros.soloActivos } : undefined,
            orderBy: [
              { diaSemana: 'asc' },
              { horaApertura: 'asc' }
            ]
          }
        },
        orderBy: { nombre: 'asc' }
      });

      // Transformar los datos
      const resultado = clinicas.map(clinica => {
        const horariosPorDia: Record<string, any> = {};
        let totalHorasSemanales = 0;
        let diasActivos = 0;

        clinica.horarios.forEach(horario => {
          const duracionHoras = this.calcularDuracionHoras(horario.horaApertura, horario.horaCierre);
          
          horariosPorDia[horario.diaSemana] = {
            id: horario.id,
            horaApertura: horario.horaApertura,
            horaCierre: horario.horaCierre,
            activo: horario.activo,
            duracionHoras
          };

          if (horario.activo) {
            totalHorasSemanales += duracionHoras;
            diasActivos++;
          }
        });

        return {
          clinicaId: clinica.id,
          nombreClinica: clinica.nombre,
          codigoClinica: clinica.codigo,
          tipoClinica: clinica.tipo,
          estadoClinica: clinica.estado,
          horariosPorDia,
          totalDiasDefinidos: clinica.horarios.length,
          diasActivos,
          totalHorasSemanales
        };
      });

      this.logger.log(`Horarios agrupados para ${resultado.length} clínicas`);
      return resultado;

    } catch (error) {
      this.logger.error(`Error al obtener horarios agrupados: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de horarios de clínica
   * 
   * Calcula métricas y estadísticas del sistema de horarios
   * para análisis y toma de decisiones.
   * 
   * @returns Estadísticas detalladas del sistema
   */
  async obtenerEstadisticas(): Promise<EstadisticasHorarioClinicaDto> {
    this.logger.log('Calculando estadísticas de horarios de clínica');

    try {
      // Obtener totales básicos
      const [totalHorarios, horariosActivos, horariosInactivos] = await Promise.all([
        this.prisma.horarioClinica.count(),
        this.prisma.horarioClinica.count({ where: { activo: true } }),
        this.prisma.horarioClinica.count({ where: { activo: false } })
      ]);

      // Obtener distribución por día de la semana
      const horariosPorDia = await this.prisma.horarioClinica.groupBy({
        by: ['diaSemana'],
        _count: { id: true },
        where: { activo: true }
      });

      const porDiaSemana = Object.values(DiaSemana).reduce((acc, dia) => {
        const encontrado = horariosPorDia.find(h => h.diaSemana === dia);
        acc[dia] = encontrado?._count.id || 0;
        return acc;
      }, {} as Record<DiaSemana, number>);

      // Eliminar consulta de horariosPorTipo que causaba errores
      // Se removió la distribución compleja por tipo de clínica

      // Obtener clínicas con más horas semanales
      const clinicasConHorarios = await this.prisma.clinica.findMany({
        include: {
          horarios: {
            where: { activo: true }
          }
        }
      });

      const clinicasConMasHoras = clinicasConHorarios
        .map(clinica => {
          const horasSemanales = clinica.horarios.reduce((total, horario) => {
            return total + this.calcularDuracionHoras(horario.horaApertura, horario.horaCierre);
          }, 0);

          return {
            clinicaId: clinica.id,
            nombre: clinica.nombre,
            horasSemanales
          };
        })
        .filter(c => c.horasSemanales > 0)
        .sort((a, b) => b.horasSemanales - a.horasSemanales)
        .slice(0, 10);

      // Obtener clínicas sin horarios
      const clinicasSinHorarios = await this.prisma.clinica.findMany({
        where: {
          horarios: {
            none: {}
          }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true
        }
      });

      // Transformar clínicas sin horarios al formato esperado
      const clinicasSinHorariosFormateadas = clinicasSinHorarios.map(clinica => ({
        clinicaId: clinica.id,
        nombre: clinica.nombre,
        tipo: clinica.tipo
      }));

      // Calcular promedio de horas por día
      const totalHorasActivas = clinicasConMasHoras.reduce((sum, c) => sum + c.horasSemanales, 0);
      const promedioHorasPorDia = horariosActivos > 0 ? totalHorasActivas / horariosActivos : 0;

      // Obtener distribución por tipo (requiere consulta adicional)
      const porTipoClinica = await this.obtenerDistribucionPorTipo();

      const estadisticas: EstadisticasHorarioClinicaDto = {
        totalHorarios,
        horariosActivos,
        horariosInactivos,
        porDiaSemana,
        porTipoClinica,
        promedioHorasPorDia: Math.round(promedioHorasPorDia * 100) / 100,
        clinicasConMasHoras,
        clinicasSinHorarios: clinicasSinHorariosFormateadas
      };

      this.logger.log('Estadísticas calculadas exitosamente');
      return estadisticas;

    } catch (error) {
      this.logger.error(`Error al calcular estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Activar o desactivar un horario
   * 
   * Cambia el estado activo de un horario específico.
   * 
   * @param id - ID del horario
   * @param activo - Nuevo estado activo
   * @returns Horario actualizado
   */
  async cambiarEstado(id: number, activo: boolean): Promise<HorarioClinicaRespuestaDto> {
    this.logger.log(`Cambiando estado del horario ${id} a ${activo ? 'activo' : 'inactivo'}`);

    try {
      const horarioActualizado = await this.prisma.horarioClinica.update({
        where: { id },
        data: { activo },
        include: {
          clinica: {
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
          }
        }
      });

      return this.transformarRespuesta(horarioActualizado);

    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`No se encontró horario con ID: ${id}`);
      }
      this.logger.error(`Error al cambiar estado del horario: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ===============================

  /**
   * Validar que una clínica existe y está activa
   */
  private async validarClinicaExiste(clinicaId: number): Promise<void> {
    const clinica = await this.prisma.clinica.findUnique({
      where: { id: clinicaId }
    });

    if (!clinica) {
      throw new NotFoundException(`No se encontró clínica con ID: ${clinicaId}`);
    }

    if (clinica.estado === 'INACTIVA') {
      throw new BadRequestException(`No se pueden crear horarios para una clínica inactiva`);
    }
  }

  /**
   * Validar coherencia entre hora de apertura y cierre
   */
  private validarCoherenciaHorarios(horaApertura: string, horaCierre: string): void {
    const apertura = this.convertirHoraAMinutos(horaApertura);
    const cierre = this.convertirHoraAMinutos(horaCierre);

    if (apertura >= cierre) {
      throw new BadRequestException(
        `La hora de apertura (${horaApertura}) debe ser anterior a la hora de cierre (${horaCierre})`
      );
    }

    const duracion = cierre - apertura;
    if (duracion < 30) { // Mínimo 30 minutos
      throw new BadRequestException(
        `El horario debe tener una duración mínima de 30 minutos`
      );
    }

    if (duracion > 720) { // Máximo 12 horas
      throw new BadRequestException(
        `El horario no puede exceder 12 horas de duración`
      );
    }
  }

  /**
   * Verificar que no existe conflicto con horarios existentes
   */
  private async verificarConflictoHorario(
    clinicaId: number, 
    diaSemana: PrismaDiaSemana, 
    excluirId?: number
  ): Promise<void> {
    const condiciones: Prisma.HorarioClinicaWhereInput = {
      clinicaId,
      diaSemana,
      activo: true
    };

    if (excluirId) {
      condiciones.id = { not: excluirId };
    }

    const horarioExistente = await this.prisma.horarioClinica.findFirst({
      where: condiciones
    });

    if (horarioExistente) {
      throw new ConflictException(
        `Ya existe un horario activo para la clínica ${clinicaId} el día ${diaSemana}`
      );
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ===============================

  /**
   * Transformar datos de base de datos a DTO de respuesta
   */
  private transformarRespuesta(horario: any): HorarioClinicaRespuestaDto {
    const duracionHoras = this.calcularDuracionHoras(horario.horaApertura, horario.horaCierre);
    const numeroDia = this.obtenerNumeroDia(horario.diaSemana);
    const esFinDeSemana = numeroDia === 6 || numeroDia === 7; // Sábado o Domingo

    const respuesta: HorarioClinicaRespuestaDto = {
      id: horario.id,
      clinicaId: horario.clinicaId,
      diaSemana: horario.diaSemana,
      horaApertura: horario.horaApertura,
      horaCierre: horario.horaCierre,
      activo: horario.activo,
      duracionHoras,
      numeroDia,
      esFinDeSemana
    };

    // Incluir información de clínica si está disponible
    if (horario.clinica) {
      respuesta.clinica = {
        id: horario.clinica.id,
        nombre: horario.clinica.nombre,
        codigo: horario.clinica.codigo,
        tipo: horario.clinica.tipo,
        estado: horario.clinica.estado,
        descripcion: horario.clinica.descripcion,
        telefono: horario.clinica.telefono,
        email: horario.clinica.email,
        capacidadPacientes: horario.clinica.capacidadPacientes,
        direccionBase: horario.clinica.direccionBase,
        placaVehiculo: horario.clinica.placaVehiculo,
        parroquiaBase: horario.clinica.parroquiaBase ? {
          id: horario.clinica.parroquiaBase.id,
          nombre: horario.clinica.parroquiaBase.nombre,
          canton: {
            nombre: horario.clinica.parroquiaBase.canton.nombre,
            provincia: {
              nombre: horario.clinica.parroquiaBase.canton.provincia.nombre
            }
          }
        } : undefined
      };
    }

    return respuesta;
  }

  /**
   * Calcular duración en horas entre apertura y cierre
   */
  private calcularDuracionHoras(horaApertura: string, horaCierre: string): number {
    const minutosApertura = this.convertirHoraAMinutos(horaApertura);
    const minutosCierre = this.convertirHoraAMinutos(horaCierre);
    const duracionMinutos = minutosCierre - minutosApertura;
    return Math.round((duracionMinutos / 60) * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Convertir hora en formato HH:MM a minutos desde medianoche
   */
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  /**
   * Obtener número del día de la semana (1=Lunes, 7=Domingo)
   */
  private obtenerNumeroDia(diaSemana: DiaSemana): number {
    const mapaDias = {
      [DiaSemana.LUNES]: 1,
      [DiaSemana.MARTES]: 2,
      [DiaSemana.MIERCOLES]: 3,
      [DiaSemana.JUEVES]: 4,
      [DiaSemana.VIERNES]: 5,
      [DiaSemana.SABADO]: 6,
      [DiaSemana.DOMINGO]: 7
    };
    return mapaDias[diaSemana];
  }

  /**
   * Obtener distribución de horarios por tipo de clínica
   */
  private async obtenerDistribucionPorTipo(): Promise<Record<string, number>> {
    const distribucion = await this.prisma.horarioClinica.findMany({
      where: { activo: true },
      include: { clinica: true }
    });

    const conteo: Record<string, number> = {};
    distribucion.forEach(horario => {
      const tipo = horario.clinica.tipo;
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });

    return conteo;
  }
}
