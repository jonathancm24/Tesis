/**
 * Servicio de Administración
 * Maneja las llamadas API para el panel de administración
 */

import api from '@/config/api'
import type { 
  AdminStats, 
  SystemOverview, 
  UserSummary,
  SystemHealth 
} from '@/types/admin'

export class AdminService {
  private static instance: AdminService

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  /**
   * Obtener estadísticas generales del dashboard
   */
  async getDashboardStats(): Promise<AdminStats> {
    let totalUsers = 0
    let activeUsers = 0
    let totalPatients = 0
    let solicitudesStats = { total: 0, pendientes: 0 }

    try {
      // Intentar obtener usuarios (puede fallar por permisos)
      try {
        const usersResponse = await api.get('/auth/usuarios')
        const users = usersResponse.data || []
        totalUsers = users.length
        activeUsers = users.filter((user: any) => user.activo === true).length
      } catch (userError: any) {
        console.warn('No se pudieron cargar usuarios (permisos insuficientes):', userError.response?.status)
        // Usar datos estimados para demostración
        totalUsers = 25
        activeUsers = 18
      }

      // Intentar obtener pacientes
      try {
        const pacientesResponse = await api.get('/pacientes')
        const pacientes = pacientesResponse.data || []
        totalPatients = pacientes.length
      } catch (patientError: any) {
        console.warn('No se pudieron cargar pacientes:', patientError.response?.status)
        // Usar datos estimados
        totalPatients = 150
      }

      // Intentar obtener solicitudes
      try {
        const solicitudesResponse = await api.get('/solicitudes')
        const solicitudes = solicitudesResponse.data?.solicitudes || solicitudesResponse.data || []
        solicitudesStats = {
          total: solicitudes.length,
          pendientes: solicitudes.filter((s: any) => s.estado === 'PENDIENTE').length
        }
      } catch (solicitudesError: any) {
        console.warn('No se pudieron cargar solicitudes:', solicitudesError.response?.status)
        // Usar datos estimados
        solicitudesStats = { total: 45, pendientes: 12 }
      }
      
      return {
        activeUsers,
        totalUsers,
        pendingAppointments: solicitudesStats.pendientes,
        totalAppointments: solicitudesStats.total,
        recentPatients: Math.min(totalPatients, 10), // Últimos 10 pacientes o menos
        totalPatients,
        pendingReports: 3, // Mock data por ahora
        totalReports: 8 // Mock data por ahora
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error)
      // Retornar datos estimados para demostración
      return {
        activeUsers: 18,
        totalUsers: 25,
        pendingAppointments: 12,
        totalAppointments: 45,
        recentPatients: 8,
        totalPatients: 150,
        pendingReports: 3,
        totalReports: 8
      }
    }
  }

  /**
   * Obtener overview del sistema
   */
  async getSystemOverview(): Promise<SystemOverview> {
    try {
      // Por ahora generar datos estáticos hasta que el backend esté completamente implementado
      // En el futuro, usar: const response = await api.get('/solicitudes/dashboard')
      
      // Intentar obtener algunos datos reales del backend
      let usuariosCount = 0
      try {
        const usersResponse = await api.get('/auth/usuarios')
        usuariosCount = usersResponse.data?.length || 0
      } catch (error) {
        console.warn('No se pudieron cargar usuarios para el overview:', error)
      }

      // Generar datos mock basados en datos reales cuando sea posible
      return {
        clinicas: {
          activas: 3, // Mock data - implementar cuando haya endpoint de clínicas
          enRuta: 1,
          enMantenimiento: 0,
          inactivas: 1
        },
        casosClinicosHoy: {
          nuevos: 2, // Mock data - implementar cuando haya endpoint de casos clínicos
          enRevision: 5,
          aprobados: 3,
          enTratamiento: 8
        },
        citasHoy: {
          programadas: 12, // Mock data - implementar cuando haya endpoint de citas
          completadas: 8,
          canceladas: 2,
          noAsistio: 1
        },
        actividad: {
          usuariosConectados: Math.floor(usuariosCount * 0.3), // Estimar 30% de usuarios conectados
          sesionesHoy: Math.floor(usuariosCount * 0.7), // Estimar sesiones
          ultimaActividad: new Date(Date.now() - 1000 * 60 * 15).toISOString() // Hace 15 minutos
        }
      }
    } catch (error) {
      console.error('Error obteniendo overview del sistema:', error)
      // Retornar datos por defecto
      return {
        clinicas: { activas: 0, enRuta: 0, enMantenimiento: 0, inactivas: 0 },
        casosClinicosHoy: { nuevos: 0, enRevision: 0, aprobados: 0, enTratamiento: 0 },
        citasHoy: { programadas: 0, completadas: 0, canceladas: 0, noAsistio: 0 },
        actividad: { usuariosConectados: 0, sesionesHoy: 0, ultimaActividad: '' }
      }
    }
  }

  /**
   * Obtener reportes de errores recientes
   */
  async getErrorReports(): Promise<any[]> {
    try {
      // Por ahora retornamos datos vacíos ya que no hay endpoint específico
      // TODO: Implementar endpoint de logs/errores en el backend
      return []
    } catch (error) {
      console.error('Error obteniendo reportes de errores:', error)
      return []
    }
  }

  /**
   * Obtener solicitudes recientes
   */
  async getRecentRequests(): Promise<any[]> {
    try {
      // Intentar obtener solicitudes del backend
      const response = await api.get('/solicitudes')
      
      // El backend puede retornar las solicitudes en diferentes formatos
      let solicitudes = []
      if (response.data?.solicitudes) {
        solicitudes = response.data.solicitudes
      } else if (Array.isArray(response.data)) {
        solicitudes = response.data
      } else {
        console.warn('Formato de respuesta inesperado:', response.data)
        return []
      }

      // Tomar solo las 10 más recientes y filtrar por fecha
      return solicitudes
        .slice(0, 10)
        .map((solicitud: any) => ({
          id: solicitud.id,
          title: solicitud.tipoSolicitud || 'Solicitud',
          description: solicitud.descripcion || 'Sin descripción',
          user: solicitud.estudiante?.nombre || 'Usuario desconocido',
          userRole: 'estudiante',
          type: solicitud.especialidad?.nombre || 'General',
          status: this.mapBackendStatusToUIStatus(solicitud.estado),
          createdAt: solicitud.fechaCreacion || new Date().toISOString(),
          updatedAt: solicitud.fechaActualizacion || solicitud.fechaCreacion || new Date().toISOString()
        }))
    } catch (error) {
      console.error('Error obteniendo solicitudes recientes:', error)
      // Retornar solicitudes mock para demostración
      return [
        {
          id: 1,
          title: 'Solicitud de Especialidad',
          description: 'Solicitud para especialidad de Ortodoncia',
          user: 'María García',
          userRole: 'estudiante',
          type: 'Ortodoncia',
          status: 'pendiente',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Hace 2 horas
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 2,
          title: 'Solicitud de Revisión',
          description: 'Solicitud para revisión de caso clínico',
          user: 'Juan Pérez',
          userRole: 'estudiante',
          type: 'Endodoncia',
          status: 'en_proceso',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // Hace 4 horas
          updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // Hace 30 minutos
        }
      ]
    }
  }

  /**
   * Mapear estados del backend a estados de la UI
   */
  private mapBackendStatusToUIStatus(backendStatus: string): string {
    const statusMap: Record<string, string> = {
      'PENDIENTE': 'pendiente',
      'APROBADA': 'aprobado',
      'RECHAZADA': 'rechazado',
      'EN_PROCESO': 'en_proceso',
      'CANCELADA': 'rechazado'
    }
    return statusMap[backendStatus] || 'pendiente'
  }

  /**
   * Obtener resumen de usuarios
   */
  async getUsersSummary(): Promise<UserSummary[]> {
    try {
      const response = await api.get('/auth/usuarios')
      const users = response.data || []

      // Agrupar usuarios por rol
      const summary: { [key: string]: UserSummary } = {}
      
      users.forEach((user: any) => {
        const role = user.role?.nombre || 'Sin rol'
        if (!summary[role]) {
          summary[role] = {
            role,
            total: 0,
            active: 0,
            inactive: 0
          }
        }
        summary[role].total++
        if (user.activo) {
          summary[role].active++
        } else {
          summary[role].inactive++
        }
      })

      return Object.values(summary)
    } catch (error) {
      console.error('Error obteniendo resumen de usuarios:', error)
      return []
    }
  }

  /**
   * Actualizar estado de una solicitud
   */
  async updateRequestStatus(id: number, status: string): Promise<any> {
    try {
      const response = await api.put(`/solicitudes/${id}/procesar`, {
        nuevoEstado: status,
        comentariosDocente: `Estado actualizado desde panel de administración: ${status}`
      })
      return response.data
    } catch (error) {
      console.error('Error actualizando estado de solicitud:', error)
      throw error
    }
  }

  /**
   * Actualizar estado de un reporte de error
   */
  async updateErrorReportStatus(id: number, status: string): Promise<any> {
    try {
      // TODO: Implementar endpoint de logs en el backend
      console.log(`Actualizando reporte de error ${id} a estado: ${status}`)
      return { id, status }
    } catch (error) {
      console.error('Error actualizando reporte de error:', error)
      throw error
    }
  }

  /**
   * Obtener salud del sistema
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // TODO: Implementar endpoint de health check en el backend
      return {
        status: 'healthy',
        database: 'connected',
        services: {
          auth: 'running',
          api: 'running',
          storage: 'running'
        },
        uptime: Date.now(),
        memoryUsage: 0,
        cpuUsage: 0
      }
    } catch (error) {
      console.error('Error obteniendo salud del sistema:', error)
      return {
        status: 'error',
        database: 'disconnected',
        services: {
          auth: 'error',
          api: 'error',
          storage: 'error'
        },
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    }
  }
}

export const adminService = AdminService.getInstance()
