# Módulo de Citas Médicas 🗓️

## Descripción

El módulo de **Citas Médicas** es un sistema completo para gestión de citas odontológicas en el entorno académico. Permite a estudiantes crear citas para pacientes, a secretarios asignar pacientes a estudiantes según disponibilidad, y gestionar el ciclo completo de estados de las citas.

## Características Principales

### 🔧 Funcionalidades Core
- ✅ **CRUD Completo de Citas**: Crear, leer, actualizar y eliminar citas médicas
- ✅ **Verificación de Disponibilidad**: Consulta automática de horarios disponibles por estudiante
- ✅ **Detección de Conflictos**: Prevención de solapamiento de horarios y doble reserva
- ✅ **Gestión de Estados**: Control completo del ciclo de vida de las citas
- ✅ **Paginación Avanzada**: Lista paginada con filtros múltiples
- ✅ **Estadísticas**: Métricas y reportes básicos del sistema

### 🎯 Estados de Citas
```typescript
enum EstadoCita {
  DISPONIBLE = 'DISPONIBLE',    // Horario libre para agendar
  RESERVADA = 'RESERVADA',      // Cita agendada y confirmada
  CANCELADA = 'CANCELADA',      // Cita cancelada (libera el horario)
  FINALIZADA = 'FINALIZADA',    // Cita completada exitosamente
  NO_ASISTIO = 'NO_ASISTIO'     // Paciente no se presentó
}
```

### 📋 Roles y Permisos
- **Estudiantes**: Crear citas, consultar sus citas, modificar citas propias
- **Secretarios**: Asignar pacientes, gestionar disponibilidad, cambios masivos
- **Docentes**: Supervisar citas, cambiar estados, reportes académicos

## Estructura del Módulo

```
src/modules/Citas/
├── DTO/
│   └── index.ts           # DTOs con validación completa
├── Interface/
│   └── index.ts           # Interfaces TypeScript
├── cita.controller.ts     # Controlador REST con endpoints
├── cita.service.ts        # Lógica de negocio y operaciones
├── cita.module.ts         # Configuración del módulo
└── README.md             # Documentación (este archivo)
```

## API Endpoints

### 📝 Operaciones CRUD

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/citas` | Crear nueva cita médica |
| `GET` | `/citas` | Listar citas con filtros |
| `GET` | `/citas/:id` | Obtener cita específica |
| `PUT` | `/citas/:id` | Actualizar cita completa |
| `PATCH` | `/citas/:id/cancelar` | Cancelar cita específica |

### 🔍 Consultas Especializadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/citas/consultar-disponibilidad` | Verificar disponibilidad de estudiante |
| `GET` | `/citas/estadisticas/basicas` | Estadísticas generales del sistema |
| `GET` | `/citas/mis-citas/usuario` | Citas del usuario autenticado |
| `GET` | `/citas/:id/verificar-acceso` | Verificar permisos de acceso |

### 👥 Consultas por Entidad

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/citas/paciente/:pacienteId/citas` | Citas de un paciente |
| `GET` | `/citas/estudiante/:estudianteId/citas` | Citas de un estudiante |
| `PATCH` | `/citas/cambiar-estado-masivo` | Cambio masivo de estados |

## Ejemplos de Uso

### 1. Crear Nueva Cita

```typescript
POST /citas
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "fecha": "2025-01-15",
  "horaInicio": "09:00",
  "horaFin": "10:00",
  "pacienteId": 1,
  "estudianteId": 2,
  "especialidadId": 1,
  "observaciones": "Primera consulta de ortodoncia"
}
```

**Respuesta Exitosa:**
```json
{
  "id": 15,
  "fecha": "2025-01-15T00:00:00Z",
  "estado": "RESERVADA",
  "observaciones": "Primera consulta de ortodoncia",
  "pacienteId": 1,
  "especialidadId": 1,
  "estudianteId": 2,
  "docenteId": null,
  "horainicio": "2025-01-15T09:00:00Z",
  "horafin": "2025-01-15T10:00:00Z"
}
```

### 2. Consultar Disponibilidad

```typescript
POST /citas/consultar-disponibilidad
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "estudianteId": 2,
  "fecha": "2025-01-15"
}
```

**Respuesta:**
```json
{
  "fecha": "2025-01-15",
  "estudianteId": 2,
  "estudiante": {
    "nombre": "María",
    "apellido": "García"
  },
  "diaSemana": "LUNES",
  "tieneDisponibilidad": true,
  "horariosConfigurados": [
    {
      "horaInicio": "08:00",
      "horaFin": "12:00"
    }
  ],
  "citasExistentes": [
    {
      "horaInicio": "09:00",
      "horaFin": "10:00",
      "estado": "RESERVADA",
      "paciente": "Juan Pérez"
    }
  ],
  "horariosDisponibles": [
    {
      "horaInicio": "08:00",
      "horaFin": "09:00",
      "disponible": true
    },
    {
      "horaInicio": "10:00",
      "horaFin": "11:00",
      "disponible": true
    }
  ]
}
```

### 3. Listar Citas con Filtros

```typescript
GET /citas?pacienteId=1&estado=RESERVADA&fechaDesde=2025-01-01&límite=10&página=1
Authorization: Bearer <jwt-token>
```

### 4. Cancelar Cita

```typescript
PATCH /citas/15/cancelar
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "motivo": "Paciente solicitó reagendar por enfermedad"
}
```

## DTOs y Validación

### CrearCitaDto
```typescript
{
  fecha: string;           // Fecha en formato YYYY-MM-DD
  horaInicio: string;      // Hora en formato HH:MM
  horaFin: string;         // Hora en formato HH:MM  
  pacienteId: number;      // ID del paciente (obligatorio)
  estudianteId: number;    // ID del estudiante (obligatorio)
  especialidadId: number;  // ID de especialidad (obligatorio)
  docenteId?: number;      // ID del docente (opcional)
  observaciones?: string;  // Notas adicionales (opcional)
}
```

### FiltrosCitasDto
```typescript
{
  pacienteId?: number;
  estudianteId?: number;
  docenteId?: number;
  especialidadId?: number;
  estado?: EstadoCita;
  fechaDesde?: string;
  fechaHasta?: string;
  horaDesde?: string;
  horaHasta?: string;
  busqueda?: string;
  página?: number;         // Por defecto: 1
  límite?: number;         // Por defecto: 10, máximo: 100
  ordenarPor?: string;
  dirección?: 'asc' | 'desc';
}
```

## Lógica de Negocio

### 🔍 Verificación de Disponibilidad
1. **Validar Estudiante**: Verificar que el estudiante existe y está activo
2. **Consultar Horarios**: Obtener horarios configurados para el día de la semana
3. **Verificar Conflictos**: Comprobar citas existentes en el rango horario
4. **Calcular Disponibilidad**: Generar slots disponibles basados en horarios y citas

### ⚡ Detección de Conflictos
```typescript
// Verifica solapamiento de horarios
const tieneConflicto = (nuevaHoraInicio, nuevaHoraFin, citaExistente) => {
  return (nuevaHoraInicio < citaExistente.horaFin) && 
         (nuevaHoraFin > citaExistente.horaInicio) &&
         citaExistente.estado !== 'CANCELADA';
};
```

### 🔄 Gestión de Estados
- **DISPONIBLE → RESERVADA**: Al crear una nueva cita
- **RESERVADA → CANCELADA**: Libera el horario para nuevas citas
- **RESERVADA → FINALIZADA**: Marca la cita como completada
- **RESERVADA → NO_ASISTIO**: Paciente no se presentó, libera horario

## Dependencias

### Internas
- `PrismaService`: Operaciones de base de datos
- `JwtAuthGuard`: Autenticación de endpoints
- `class-validator`: Validación de DTOs
- `@nestjs/swagger`: Documentación automática

### Base de Datos
El módulo requiere las siguientes tablas:
- `Cita`: Tabla principal de citas
- `Usuario`: Estudiantes y docentes
- `Paciente`: Información de pacientes
- `Especialidad`: Especialidades odontológicas
- `Disponibilidad`: Horarios configurados por estudiante

## Configuración

### 1. Instalar Dependencias
```bash
npm install @nestjs/common @nestjs/swagger class-validator class-transformer
```

### 2. Importar en AppModule
```typescript
import { CitaModule } from './modules/Citas/cita.module';

@Module({
  imports: [
    // ... otros módulos
    CitaModule,
  ],
})
export class AppModule {}
```

### 3. Configurar Base de Datos
Asegurar que las tablas necesarias existan en Prisma schema:
```prisma
model Cita {
  id            Int       @id @default(autoincrement())
  fecha         DateTime
  estado        EstadoCita @default(DISPONIBLE)
  observaciones String?
  pacienteId    Int
  especialidadId Int
  estudianteId  Int
  docenteId     Int?
  horainicio    DateTime
  horafin       DateTime
  
  // Relaciones
  paciente      Paciente     @relation(fields: [pacienteId], references: [id])
  especialidad  Especialidad @relation(fields: [especialidadId], references: [id])
  estudiante    Usuario      @relation("CitasEstudiante", fields: [estudianteId], references: [id])
  docente       Usuario?     @relation("CitasDocente", fields: [docenteId], references: [id])
}
```

## Testing

### Tests Unitarios
```bash
npm run test -- --testPathPattern=cita.service.spec.ts
```

### Tests E2E
```bash
npm run test:e2e -- --testPathPattern=citas.e2e-spec.ts
```

## Monitoreo y Logs

El módulo incluye logging detallado:
- ✅ Creación de citas con validaciones
- ✅ Consultas de disponibilidad por estudiante
- ✅ Detección y prevención de conflictos
- ✅ Cambios de estado y cancelaciones
- ✅ Errores de autorización y validación

## Performance

### Optimizaciones Implementadas
- **Índices de Base de Datos**: En campos de consulta frecuente
- **Paginación Eficiente**: Límites configurables con máximos
- **Consultas Optimizadas**: JOINs eficientes con Prisma
- **Cache de Disponibilidad**: Para consultas repetitivas

### Límites Configurables
- Máximo 100 elementos por página
- Búsqueda limitada a 3 meses hacia adelante
- Timeout de 30 segundos para operaciones complejas

## Seguridad

### Autenticación y Autorización
- 🔐 **JWT Required**: Todos los endpoints requieren token válido
- 👤 **Control de Acceso**: Usuarios solo ven sus citas relacionadas
- 🛡️ **Validación de Entrada**: Sanitización completa de datos
- 🚫 **Rate Limiting**: Prevención de abuso en consultas masivas

### Validaciones de Negocio
- ✅ Horarios dentro de disponibilidad configurada
- ✅ Fechas no pueden ser en el pasado
- ✅ Duración mínima y máxima de citas
- ✅ Estudiantes solo en especialidades asignadas

## Changelog

### v1.0.0 (2025-01-15)
- ✅ Implementación inicial completa
- ✅ CRUD de citas con validaciones
- ✅ Sistema de disponibilidad y conflictos
- ✅ Documentación Swagger completa
- ✅ Tests unitarios básicos
- ✅ Integración con autenticación JWT

## Próximas Funcionalidades

### v1.1.0 (Planificado)
- 📧 Notificaciones automáticas por email/SMS
- 📅 Recordatorios de citas programados
- 📊 Dashboard de estadísticas avanzadas
- 🔄 Reagendamiento automático inteligente
- 📱 API para aplicación móvil

### v1.2.0 (Futuro)
- 🤖 IA para optimización de horarios
- 📈 Reportes de productividad estudiantil
- 🔗 Integración con sistemas de pago
- 📋 Historia clínica vinculada
- 🌐 Soporte multi-idioma

---

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar al equipo de desarrollo o crear un issue en el repositorio del proyecto.

**Autor**: Sistema de Gestión Académica Odontológica  
**Versión**: 1.0.0  
**Última Actualización**: Enero 2025
