/**
 * Servicio para la gestión de Logs del sistema
 * 
 * Proporciona funcionalidades de solo lectura para consultar,
 * analizar y exportar logs de auditoría del sistema.
 * Este servicio está diseñado exclusivamente para administradores
 * y no permite modificación de logs existentes.
 * 
 * @fileoverview Servicio de logs de auditoría
 * @module LogService
 */

import { Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  FiltrosLogDto,
  PaginacionLogDto,
  LogRespuestaDto,
  LogsPaginadosDto,
  EstadisticasLogDto,
  MetricasActividadDto,
  UsuarioLogDto,
  DetallesLogDto,
  ExportacionLogDto
} from './log.dto';

/**
 * Servicio para gestionar logs de auditoría
 * 
 * Proporciona métodos para consultar y analizar logs del sistema
 * con capacidades avanzadas de filtrado, estadísticas y exportación.
 * Exclusivamente para operaciones de lectura y análisis.
 */
@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener logs paginados con filtros
   * 
   * Consulta logs del sistema aplicando filtros específicos
   * con paginación para manejar grandes volúmenes de datos.
   * 
   * @param filtros - Criterios de búsqueda y filtros
   * @param paginacion - Opciones de paginación y ordenamiento
   * @returns Logs paginados con información adicional
   */
  async obtenerLogsPaginados(
    filtros: FiltrosLogDto = {},
    paginacion: PaginacionLogDto
  ): Promise<LogsPaginadosDto> {
    this.logger.log('Obteniendo logs paginados con filtros:', JSON.stringify(filtros, null, 2));

    try {
      // Construir condiciones de búsqueda
      const condiciones = await this.construirCondicionesBusqueda(filtros);

      // Calcular offset para paginación
      const offset = (paginacion.pagina - 1) * paginacion.limite;

      // Configurar ordenamiento
      const ordenamiento = this.configurarOrdenamiento(paginacion);

      // Configurar inclusiones según filtros
      const include = this.configurarInclusiones(filtros);

      // Ejecutar consulta paginada
      const [logs, totalElementos] = await Promise.all([
        this.prisma.log.findMany({
          where: condiciones,
          include,
          orderBy: ordenamiento,
          skip: offset,
          take: paginacion.limite
        }),
        this.prisma.log.count({ where: condiciones })
      ]);

      // Transformar logs a DTOs
      const logsTransformados = logs.map(log => this.transformarLogADto(log, filtros));

      // Calcular información de paginación
      const totalPaginas = Math.ceil(totalElementos / paginacion.limite);
      const tieneSiguiente = paginacion.pagina < totalPaginas;
      const tieneAnterior = paginacion.pagina > 1;

      // Generar resumen de consulta
      const resumen = await this.generarResumenConsulta(logs);

      const resultado: LogsPaginadosDto = {
        logs: logsTransformados,
        paginacion: {
          paginaActual: paginacion.pagina,
          totalPaginas,
          totalElementos,
          elementosPorPagina: paginacion.limite,
          tieneSiguiente,
          tieneAnterior
        },
        filtrosAplicados: filtros,
        resumen
      };

      this.logger.log(`Consulta completada: ${logs.length} logs encontrados de ${totalElementos} total`);
      return resultado;

    } catch (error) {
      this.logger.error(`Error al obtener logs paginados: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener un log específico por ID
   * 
   * Consulta los detalles completos de un log específico
   * incluyendo toda la información del usuario y detalles.
   * 
   * @param id - ID del log a consultar
   * @returns Log con información completa
   */
  async obtenerLogPorId(id: number): Promise<LogRespuestaDto> {
    this.logger.log(`Obteniendo log con ID: ${id}`);

    try {
      const log = await this.prisma.log.findUnique({
        where: { id },
        include: {
          usuario: {
            include: {
              role: true,
              parroquia: {
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

      if (!log) {
        throw new BadRequestException(`No se encontró log con ID: ${id}`);
      }

      // Transformar con toda la información
      const filtrosCompletos: FiltrosLogDto = {
        incluirUsuario: true,
        incluirDetalles: true
      };

      return this.transformarLogADto(log, filtrosCompletos);

    } catch (error) {
      this.logger.error(`Error al obtener log por ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de logs
   * 
   * Calcula métricas y estadísticas del sistema de logs
   * para análisis de actividad y toma de decisiones.
   * 
   * @returns Estadísticas detalladas del sistema
   */
  async obtenerEstadisticas(): Promise<EstadisticasLogDto> {
    this.logger.log('Calculando estadísticas de logs del sistema');

    try {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

      // Obtener totales básicos
      const [totalLogs, logsHoy, logsSemana, logsMes] = await Promise.all([
        this.prisma.log.count(),
        this.prisma.log.count({ where: { fecha: { gte: hoy } } }),
        this.prisma.log.count({ where: { fecha: { gte: inicioSemana } } }),
        this.prisma.log.count({ where: { fecha: { gte: inicioMes } } })
      ]);

      // Obtener distribución por acciones
      const porAccion = await this.obtenerDistribucionPorAccion(totalLogs);

      // Obtener distribución por tablas
      const porTabla = await this.obtenerDistribucionPorTabla(totalLogs);

      // Obtener usuarios más activos
      const usuariosMasActivos = await this.obtenerUsuariosMasActivos();

      // Obtener actividad por hora
      const actividadPorHora = await this.obtenerActividadPorHora();

      // Obtener actividad por día de la semana
      const actividadPorDia = await this.obtenerActividadPorDia();

      // Obtener tipos de documento frecuentes
      const tiposDocumentoFrecuentes = await this.obtenerTiposDocumentoFrecuentes();

      // Obtener acciones por rol
      const accionesPorRol = await this.obtenerAccionesPorRol();

      const estadisticas: EstadisticasLogDto = {
        totalLogs,
        logsHoy,
        logsSemana,
        logsMes,
        porAccion,
        porTabla,
        usuariosMasActivos,
        actividadPorHora,
        actividadPorDia,
        tiposDocumentoFrecuentes,
        accionesPorRol
      };

      this.logger.log('Estadísticas calculadas exitosamente');
      return estadisticas;

    } catch (error) {
      this.logger.error(`Error al calcular estadísticas: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener métricas de actividad en tiempo real
   * 
   * Proporciona información actualizada para dashboard
   * de monitoreo del sistema en tiempo real.
   * 
   * @returns Métricas de actividad actual
   */
  async obtenerMetricasActividad(): Promise<MetricasActividadDto> {
    this.logger.log('Obteniendo métricas de actividad en tiempo real');

    try {
      const ahora = new Date();
      const unaHoraAtras = new Date(ahora.getTime() - 60 * 60 * 1000);
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      // Obtener métricas básicas
      const [accionesUltimaHora, erroresUltimaHora] = await Promise.all([
        this.prisma.log.count({
          where: { fecha: { gte: unaHoraAtras } }
        }),
        this.prisma.log.count({
          where: {
            fecha: { gte: unaHoraAtras },
            detalle: {
              path: ['resultado'],
              equals: 'error'
            }
          }
        })
      ]);

      // Calcular promedio de acciones por minuto
      const accionesPorMinuto = accionesUltimaHora / 60;

      // Obtener usuarios conectados (estimación basada en actividad reciente)
      const usuariosConectados = await this.estimarUsuariosConectados();

      // Obtener tablas más consultadas hoy
      const tablasMasConsultadas = await this.obtenerTablasMasConsultadasHoy();

      // Detectar alertas de seguridad
      const alertasSeguridad = await this.detectarAlertasSeguridad();

      const metricas: MetricasActividadDto = {
        timestamp: ahora,
        usuariosConectados,
        accionesUltimaHora,
        erroresUltimaHora,
        accionesPorMinuto: Math.round(accionesPorMinuto * 100) / 100,
        tablasMasConsultadas,
        alertasSeguridad
      };

      this.logger.log('Métricas de actividad obtenidas exitosamente');
      return metricas;

    } catch (error) {
      this.logger.error(`Error al obtener métricas de actividad: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Buscar logs por texto libre
   * 
   * Búsqueda textual en acciones, tablas y detalles JSON
   * de los logs para encontrar información específica.
   * 
   * @param textoBusqueda - Texto a buscar
   * @param paginacion - Opciones de paginación
   * @returns Logs que contienen el texto buscado
   */
  async buscarLogsPorTexto(
    textoBusqueda: string,
    paginacion: PaginacionLogDto
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Buscando logs con texto: "${textoBusqueda}"`);

    try {
      if (!textoBusqueda || textoBusqueda.trim().length < 2) {
        throw new BadRequestException('El texto de búsqueda debe tener al menos 2 caracteres');
      }

      const texto = textoBusqueda.trim().toLowerCase();

      // Construir condiciones de búsqueda textual
      const condiciones: Prisma.LogWhereInput = {
        OR: [
          { accion: { contains: texto, mode: 'insensitive' } },
          { tabla: { contains: texto, mode: 'insensitive' } },
          {
            usuario: {
              OR: [
                { nombre: { contains: texto, mode: 'insensitive' } },
                { apellido: { contains: texto, mode: 'insensitive' } },
                { email: { contains: texto, mode: 'insensitive' } }
              ]
            }
          }
        ]
      };

      const filtros: FiltrosLogDto = {
        incluirUsuario: true,
        buscarEnDetalles: texto
      };

      return await this.obtenerLogsPaginados(filtros, paginacion);

    } catch (error) {
      this.logger.error(`Error en búsqueda de logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener logs de un usuario específico
   * 
   * Consulta todas las actividades registradas
   * para un usuario en particular.
   * 
   * @param usuarioId - ID del usuario
   * @param paginacion - Opciones de paginación
   * @returns Logs del usuario especificado
   */
  async obtenerLogsPorUsuario(
    usuarioId: number,
    paginacion: PaginacionLogDto
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Obteniendo logs para usuario ID: ${usuarioId}`);

    try {
      // Verificar que el usuario existe
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId }
      });

      if (!usuario) {
        throw new BadRequestException(`No se encontró usuario con ID: ${usuarioId}`);
      }

      const filtros: FiltrosLogDto = {
        usuarioId,
        incluirUsuario: true,
        incluirDetalles: true
      };

      return await this.obtenerLogsPaginados(filtros, paginacion);

    } catch (error) {
      this.logger.error(`Error al obtener logs por usuario: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtener logs por rango de fechas
   * 
   * Consulta logs en un período específico
   * con análisis estadístico del período.
   * 
   * @param fechaInicio - Fecha de inicio del rango
   * @param fechaFin - Fecha final del rango
   * @param paginacion - Opciones de paginación
   * @returns Logs en el rango especificado
   */
  async obtenerLogsPorRangoFechas(
    fechaInicio: Date,
    fechaFin: Date,
    paginacion: PaginacionLogDto
  ): Promise<LogsPaginadosDto> {
    this.logger.log(`Obteniendo logs desde ${fechaInicio.toISOString()} hasta ${fechaFin.toISOString()}`);

    try {
      // Validar rango de fechas
      if (fechaInicio >= fechaFin) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha final');
      }

      const diferenciaDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      if (diferenciaDias > 365) {
        throw new BadRequestException('El rango de fechas no puede ser mayor a 365 días');
      }

      const filtros: FiltrosLogDto = {
        fechaInicio,
        fechaFin,
        incluirUsuario: true
      };

      return await this.obtenerLogsPaginados(filtros, paginacion);

    } catch (error) {
      this.logger.error(`Error al obtener logs por rango de fechas: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ===============================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ===============================

  /**
   * Construir condiciones de búsqueda para Prisma
   */
  private async construirCondicionesBusqueda(filtros: FiltrosLogDto): Promise<Prisma.LogWhereInput> {
    const condiciones: Prisma.LogWhereInput = {};

    if (filtros.usuarioId) {
      condiciones.usuarioId = filtros.usuarioId;
    }

    if (filtros.accion) {
      condiciones.accion = { contains: filtros.accion, mode: 'insensitive' };
    }

    if (filtros.tabla) {
      condiciones.tabla = { contains: filtros.tabla, mode: 'insensitive' };
    }

    if (filtros.fechaInicio || filtros.fechaFin) {
      condiciones.fecha = {};
      if (filtros.fechaInicio) {
        condiciones.fecha.gte = filtros.fechaInicio;
      }
      if (filtros.fechaFin) {
        condiciones.fecha.lte = filtros.fechaFin;
      }
    }

    if (filtros.nombreUsuario || filtros.emailUsuario || filtros.rolUsuario || filtros.usuarioActivo !== undefined) {
      condiciones.usuario = {};
      
      if (filtros.nombreUsuario) {
        condiciones.usuario.nombre = { contains: filtros.nombreUsuario, mode: 'insensitive' };
      }
      
      if (filtros.emailUsuario) {
        condiciones.usuario.email = { contains: filtros.emailUsuario, mode: 'insensitive' };
      }
      
      if (filtros.rolUsuario) {
        condiciones.usuario.role = {
          nombre: { contains: filtros.rolUsuario, mode: 'insensitive' }
        };
      }
      
      if (filtros.usuarioActivo !== undefined) {
        condiciones.usuario.activo = filtros.usuarioActivo;
      }
    }

    return condiciones;
  }

  /**
   * Configurar ordenamiento para la consulta
   */
  private configurarOrdenamiento(paginacion: PaginacionLogDto): Prisma.LogOrderByWithRelationInput {
    const campo = paginacion.ordenarPor || 'fecha';
    const direccion = paginacion.direccion || 'desc';

    switch (campo) {
      case 'usuarioId':
        return { usuarioId: direccion };
      case 'accion':
        return { accion: direccion };
      case 'tabla':
        return { tabla: direccion };
      default:
        return { fecha: direccion };
    }
  }

  /**
   * Configurar inclusiones de relaciones
   */
  private configurarInclusiones(filtros: FiltrosLogDto) {
    const include: any = {};

    if (filtros.incluirUsuario) {
      include.usuario = {
        include: {
          role: true,
          parroquia: {
            include: {
              canton: {
                include: {
                  provincia: true
                }
              }
            }
          }
        }
      };
    }

    return include;
  }

  /**
   * Transformar log de base de datos a DTO
   */
  private transformarLogADto(log: any, filtros: FiltrosLogDto): LogRespuestaDto {
    const tiempoTranscurrido = this.calcularTiempoTranscurrido(log.fecha);
    const tipoAccion = this.categorizarAccion(log.accion);
    const severidad = this.determinarSeveridad(log.accion, log.detalle);
    const exitosa = this.determinarExito(log.detalle);

    const logDto: LogRespuestaDto = {
      id: log.id,
      fecha: log.fecha,
      usuarioId: log.usuarioId,
      accion: log.accion,
      tabla: log.tabla,
      tiempoTranscurrido,
      tipoAccion,
      severidad,
      exitosa
    };

    // Incluir información de usuario si se solicita
    if (filtros.incluirUsuario && log.usuario) {
      logDto.usuario = {
        id: log.usuario.id,
        nombre: log.usuario.nombre,
        apellido: log.usuario.apellido,
        email: log.usuario.email,
        rol: log.usuario.role?.nombre || 'Sin rol',
        activo: log.usuario.activo,
        tipoDocumento: log.usuario.tipoDocumento,
        numeroDocumento: log.usuario.numeroDocumento
      };
    }

    // Incluir detalles si se solicita
    if (filtros.incluirDetalles && log.detalle) {
      logDto.detalle = this.parsearDetalles(log.detalle);
    }

    return logDto;
  }

  /**
   * Calcular tiempo transcurrido desde la acción
   */
  private calcularTiempoTranscurrido(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 60) {
      return `${minutos} minuto${minutos !== 1 ? 's' : ''} ago`;
    } else if (horas < 24) {
      return `${horas} hora${horas !== 1 ? 's' : ''} ago`;
    } else {
      return `${dias} día${dias !== 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Categorizar tipo de acción
   */
  private categorizarAccion(accion: string): string {
    const accionUpper = accion.toUpperCase();
    
    if (accionUpper.includes('CREAR') || accionUpper.includes('REGISTRAR')) {
      return 'Creación';
    } else if (accionUpper.includes('ACTUALIZAR') || accionUpper.includes('MODIFICAR')) {
      return 'Actualización';
    } else if (accionUpper.includes('ELIMINAR') || accionUpper.includes('BORRAR')) {
      return 'Eliminación';
    } else if (accionUpper.includes('LOGIN') || accionUpper.includes('LOGOUT')) {
      return 'Autenticación';
    } else if (accionUpper.includes('CONFIGURAR') || accionUpper.includes('PERMISO')) {
      return 'Configuración';
    } else {
      return 'Consulta';
    }
  }

  /**
   * Determinar severidad del evento
   */
  private determinarSeveridad(accion: string, detalle: any): string {
    const accionUpper = accion.toUpperCase();
    
    if (detalle?.resultado === 'error' || accionUpper.includes('ERROR')) {
      return 'ERROR';
    } else if (accionUpper.includes('ELIMINAR') || accionUpper.includes('PERMISO')) {
      return 'WARN';
    } else if (accionUpper.includes('LOGIN') || accionUpper.includes('CREAR')) {
      return 'INFO';
    } else {
      return 'DEBUG';
    }
  }

  /**
   * Determinar si la acción fue exitosa
   */
  private determinarExito(detalle: any): boolean {
    if (detalle?.resultado) {
      return detalle.resultado === 'exito';
    }
    return true; // Por defecto, asumimos éxito si no hay información
  }

  /**
   * Parsear detalles JSON a estructura tipada
   */
  private parsearDetalles(detalle: any): DetallesLogDto {
    if (!detalle || typeof detalle !== 'object') {
      return {};
    }

    return {
      datosAnteriores: detalle.datosAnteriores,
      datosNuevos: detalle.datosNuevos,
      registroId: detalle.registroId,
      camposModificados: detalle.camposModificados,
      contexto: detalle.contexto,
      ipUsuario: detalle.ipUsuario,
      userAgent: detalle.userAgent,
      duracionMs: detalle.duracionMs,
      resultado: detalle.resultado,
      mensaje: detalle.mensaje
    };
  }

  /**
   * Generar resumen de consulta
   */
  private async generarResumenConsulta(logs: any[]): Promise<any> {
    const accionesFrecuentes = this.contarAcciones(logs);
    const usuariosActivos = this.contarUsuarios(logs);

    return {
      totalLogsRango: logs.length,
      accionesFrecuentes: accionesFrecuentes.slice(0, 5),
      usuariosActivos: usuariosActivos.slice(0, 5)
    };
  }

  /**
   * Contar acciones más frecuentes
   */
  private contarAcciones(logs: any[]): Array<{ accion: string; cantidad: number }> {
    const conteo: Record<string, number> = {};
    
    logs.forEach(log => {
      conteo[log.accion] = (conteo[log.accion] || 0) + 1;
    });

    return Object.entries(conteo)
      .map(([accion, cantidad]) => ({ accion, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Contar usuarios más activos
   */
  private contarUsuarios(logs: any[]): Array<{ usuarioId: number; nombreUsuario: string; cantidad: number }> {
    const conteo: Record<number, { nombre: string; cantidad: number }> = {};
    
    logs.forEach(log => {
      if (!conteo[log.usuarioId]) {
        conteo[log.usuarioId] = {
          nombre: log.usuario ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Usuario desconocido',
          cantidad: 0
        };
      }
      conteo[log.usuarioId].cantidad++;
    });

    return Object.entries(conteo)
      .map(([usuarioId, data]) => ({
        usuarioId: Number(usuarioId),
        nombreUsuario: data.nombre,
        cantidad: data.cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  // Métodos para estadísticas (implementación simplificada)
  private async obtenerDistribucionPorAccion(totalLogs: number) {
    const distribucion = await this.prisma.log.groupBy({
      by: ['accion'],
      _count: { id: true }
    });

    return distribucion.map(item => ({
      accion: item.accion,
      cantidad: item._count.id,
      porcentaje: Math.round((item._count.id / totalLogs) * 100 * 100) / 100
    })).sort((a, b) => b.cantidad - a.cantidad);
  }

  private async obtenerDistribucionPorTabla(totalLogs: number) {
    const distribucion = await this.prisma.log.groupBy({
      by: ['tabla'],
      _count: { id: true }
    });

    return distribucion.map(item => ({
      tabla: item.tabla,
      cantidad: item._count.id,
      porcentaje: Math.round((item._count.id / totalLogs) * 100 * 100) / 100
    })).sort((a, b) => b.cantidad - a.cantidad);
  }

  private async obtenerUsuariosMasActivos() {
    // Implementación simplificada - en un caso real sería más compleja
    return [];
  }

  private async obtenerActividadPorHora() {
    // Implementación simplificada
    return Array.from({ length: 24 }, (_, hora) => ({ hora, cantidad: 0 }));
  }

  private async obtenerActividadPorDia() {
    // Implementación simplificada
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias.map(dia => ({ dia, cantidad: 0 }));
  }

  private async obtenerTiposDocumentoFrecuentes() {
    // Implementación simplificada
    return [];
  }

  private async obtenerAccionesPorRol() {
    // Implementación simplificada
    return [];
  }

  private async estimarUsuariosConectados(): Promise<number> {
    // Implementación simplificada - estimar basado en actividad reciente
    const quinceMinutosAtras = new Date(Date.now() - 15 * 60 * 1000);
    
    const usuariosActivos = await this.prisma.log.findMany({
      where: {
        fecha: { gte: quinceMinutosAtras }
      },
      distinct: ['usuarioId']
    });

    return usuariosActivos.length;
  }

  private async obtenerTablasMasConsultadasHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const consultas = await this.prisma.log.groupBy({
      by: ['tabla'],
      where: { fecha: { gte: hoy } },
      _count: { id: true }
    });

    return consultas.map(item => ({
      tabla: item.tabla,
      consultas: item._count.id
    })).sort((a, b) => b.consultas - a.consultas).slice(0, 10);
  }

  private async detectarAlertasSeguridad() {
    // Implementación simplificada - detectar patrones sospechosos
    return [];
  }
}
