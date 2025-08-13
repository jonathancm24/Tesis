/**
 * Tipos para el módulo de administración
 */

export interface AdminStats {
  activeUsers: number
  totalUsers: number
  pendingAppointments: number
  totalAppointments: number
  recentPatients: number
  totalPatients: number
  pendingReports: number
  totalReports: number
}

export interface SystemOverview {
  clinicas: {
    activas: number
    enRuta: number
    enMantenimiento: number
    inactivas: number
  }
  casosClinicosHoy: {
    nuevos: number
    enRevision: number
    aprobados: number
    enTratamiento: number
  }
  citasHoy: {
    programadas: number
    completadas: number
    canceladas: number
    noAsistio: number
  }
  actividad: {
    usuariosConectados: number
    sesionesHoy: number
    ultimaActividad: string
  }
}

export interface DashboardData {
  stats: AdminStats
  overview: SystemOverview
  recentRequests: Request[]
  errorReports: ErrorReport[]
}

export interface UserSummary {
  role: string
  total: number
  active: number
  inactive: number
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  database: 'connected' | 'disconnected' | 'error'
  services: {
    auth: 'running' | 'stopped' | 'error'
    api: 'running' | 'stopped' | 'error'
    storage: 'running' | 'stopped' | 'error'
  }
  uptime: number
  memoryUsage: number
  cpuUsage: number
}

export interface Request {
  id: number
  type: string
  description: string
  status: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso'
  priority: 'baja' | 'media' | 'alta'
  submittedBy: string
  submittedAt: string
  assignedTo?: string
  dueDate?: string
  comments?: string
}

export interface ErrorReport {
  id: number
  title: string
  description: string
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado'
  priority: 'baja' | 'media' | 'alta' | 'critica'
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  errorType: 'ui' | 'api' | 'database' | 'system' | 'integration'
  affectedModules: string[]
  stackTrace?: string
  userAgent?: string
  reproduction?: string
  resolution?: string
}

export interface AdminNotification {
  id: number
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionText?: string
}

export interface SystemMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  activeConnections: number
  databaseConnections: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage: {
    current: number
    average: number
  }
  diskUsage: {
    used: number
    total: number
    percentage: number
  }
}

export interface AuditLog {
  id: number
  userId: number
  userName: string
  userRole: string
  action: string
  resource: string
  resourceId?: number
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  success: boolean
  errorMessage?: string
}
