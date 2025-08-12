# Módulo de Disponibilidad Horaria 🕒

## Descripción

El módulo de **Disponibilidad Horaria** permite a los estudiantes definir sus horarios de atención a pacientes y a los secretarios consultar esta información para la asignación de citas. Es un componente fundamental que garantiza que solo se puedan crear citas cuando los estudiantes estén realmente disponibles.

## Características Principales

### 🔧 Funcionalidades Core
- ✅ **Gestión de Horarios**: Los estudiantes pueden definir su disponibilidad por día de la semana
- ✅ **Validación de Conflictos**: Prevención automática de solapamiento de horarios
- ✅ **Consulta de Disponibilidad**: Verificación rápida para asignación de citas
- ✅ **Creación Masiva**: Configuración semanal completa en una sola operación
- ✅ **Generación de Slots**: División automática de disponibilidad en slots de tiempo
- ✅ **Estadísticas**: Métricas del sistema de disponibilidad

### 🎯 Días de la Semana Soportados
```typescript
enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES', 
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}
```

### 👥 Roles y Permisos
- **Estudiantes**: Gestionar su propia disponibilidad, ver sus horarios configurados
- **Secretarios**: Consultar disponibilidad de estudiantes para asignar citas
- **Docentes**: Ver disponibilidad de estudiantes a su cargo, generar reportes

## Estructura del Módulo

```
src/modules/Disponibilidad/
├── DTO/
│   └── index.ts                    # DTOs con validación completa
├── Interface/
│   └── index.ts                    # Interfaces TypeScript
├── disponibilidad.controller.ts    # Controlador REST con endpoints
├── disponibilidad.service.ts       # Lógica de negocio y validaciones
├── disponibilidad.module.ts        # Configuración del módulo
└── README.md                       # Documentación (este archivo)
```

## API Endpoints

### 📝 Operaciones CRUD

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/disponibilidad` | Crear nueva disponibilidad horaria |
| `GET` | `/disponibilidad` | Listar disponibilidades con filtros |
| `GET` | `/disponibilidad/:id` | Obtener disponibilidad específica |
| `PUT` | `/disponibilidad/:id` | Actualizar disponibilidad |
| `DELETE` | `/disponibilidad/:id` | Eliminar disponibilidad |

### 🔍 Consultas Especializadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/disponibilidad/consultar` | Verificar disponibilidad específica |
| `POST` | `/disponibilidad/masivo` | Crear múltiples disponibilidades |
| `GET` | `/disponibilidad/slots/:usuarioId/:fecha` | Obtener slots disponibles |
| `GET` | `/disponibilidad/estadisticas/basicas` | Estadísticas del sistema |

### 👥 Consultas por Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/disponibilidad/mis-horarios/usuario` | Horarios del usuario autenticado |
| `GET` | `/disponibilidad/estudiante/:id/horarios` | Horarios de un estudiante |
| `GET` | `/disponibilidad/verificar/:estudiante/:fecha/:inicio/:fin` | Verificación rápida |

## Ejemplos de Uso

### 1. Crear Disponibilidad Individual

```typescript
POST /disponibilidad
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "dia": "LUNES",
  "horaInicio": "08:00",
  "horaFin": "12:00",
  "usuarioId": 2
}
```

**Respuesta Exitosa:**
```json
{
  "id": 1,
  "dia": "LUNES",
  "horaInicio": "08:00", 
  "horaFin": "12:00",
  "usuarioId": 2
}
```

### 2. Crear Disponibilidad Semanal (Masiva)

```typescript
POST /disponibilidad/masivo
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "usuarioId": 2,
  "disponibilidades": [
    { "dia": "LUNES", "horaInicio": "08:00", "horaFin": "12:00" },
    { "dia": "MARTES", "horaInicio": "08:00", "horaFin": "12:00" },
    { "dia": "MIERCOLES", "horaInicio": "14:00", "horaFin": "18:00" },
    { "dia": "JUEVES", "horaInicio": "08:00", "horaFin": "12:00" },
    { "dia": "VIERNES", "horaInicio": "08:00", "horaFin": "12:00" }
  ]
}
```

**Respuesta:**
```json
{
  "totalProcesadas": 5,
  "creadasExitosamente": 5,
  "fallos": 0,
  "disponibilidadesCreadas": [
    {
      "id": 1,
      "dia": "LUNES",
      "horaInicio": "08:00",
      "horaFin": "12:00",
      "usuarioId": 2
    }
    // ... resto de disponibilidades
  ],
  "errores": [],
  "advertencias": []
}
```

### 3. Consultar Disponibilidad Específica

```typescript
POST /disponibilidad/consultar
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "usuarioId": 2,
  "fecha": "2025-01-15",
  "horaInicio": "09:00",
  "horaFin": "10:00"
}
```

**Respuesta:**
```json
{
  "usuario": {
    "id": 2,
    "nombre": "María",
    "apellido": "García",
    "email": "maria@email.com"
  },
  "fecha": "2025-01-15",
  "diaSemana": "LUNES",
  "horarioSolicitado": {
    "horaInicio": "09:00",
    "horaFin": "10:00"
  },
  "estaDisponible": true,
  "disponibilidadesConfiguradas": [
    {
      "id": 1,
      "horaInicio": "08:00",
      "horaFin": "12:00"
    }
  ],
  "citasExistentes": [],
  "horariosAlternativos": []
}
```

### 4. Obtener Slots Disponibles

```typescript
GET /disponibilidad/slots/2/2025-01-15?duracion=60
Authorization: Bearer <jwt-token>
```

**Respuesta:**
```json
{
  "usuario": {
    "id": 2,
    "nombre": "María",
    "apellido": "García"
  },
  "fecha": "2025-01-15",
  "diaSemana": "LUNES",
  "slots": [
    {
      "horaInicio": "08:00",
      "horaFin": "09:00", 
      "duracion": 60,
      "disponible": true
    },
    {
      "horaInicio": "09:00",
      "horaFin": "10:00",
      "duracion": 60,
      "disponible": false,
      "motivo": "Ocupado por cita con Juan Pérez",
      "citaId": 5
    },
    {
      "horaInicio": "10:00",
      "horaFin": "11:00",
      "duracion": 60,
      "disponible": true
    }
  ],
  "resumen": {
    "totalSlots": 4,
    "slotsDisponibles": 3,
    "slotsOcupados": 1,
    "porcentajeDisponibilidad": 75.0
  }
}
```

### 5. Verificación Rápida para Citas

```typescript
GET /disponibilidad/verificar/2/2025-01-15/09:00/10:00
Authorization: Bearer <jwt-token>
```

**Respuesta:**
```json
{
  "disponible": true,
  "motivo": "Estudiante disponible en el horario solicitado",
  "estudiante": "María García", 
  "fecha": "2025-01-15",
  "horario": "09:00 - 10:00"
}
```

## DTOs y Validación

### CrearDisponibilidadDto
```typescript
{
  dia: DiaSemana;          // Día de la semana (obligatorio)
  horaInicio: string;      // Formato HH:MM (obligatorio)  
  horaFin: string;         // Formato HH:MM (obligatorio)
  usuarioId?: number;      // ID del usuario (opcional, usa autenticado)
}
```

### FiltrosDisponibilidadDto
```typescript
{
  usuarioId?: number;           // Filtrar por usuario específico
  dia?: DiaSemana;             // Filtrar por día específico
  dias?: DiaSemana[];          // Filtrar por múltiples días
  horaMinima?: string;         // Hora mínima de inicio
  horaMaxima?: string;         // Hora máxima de fin
  soloActivas?: boolean;       // Solo usuarios activos (default: true)
  incluirUsuario?: boolean;    // Incluir info del usuario (default: false)
  página?: number;             // Número de página (default: 1)
  límite?: number;             // Elementos por página (default: 10, max: 100)
  ordenarPor?: string;         // Campo de ordenamiento (default: 'dia')
  dirección?: 'asc' | 'desc';  // Dirección (default: 'asc')
}
```

## Validaciones de Negocio

### 🕐 Validaciones de Horario
```typescript
// Formato válido: HH:MM en 24 horas
const formatoValido = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Reglas de negocio:
- Hora inicio < Hora fin
- Duración mínima: 15 minutos
- Duración máxima: 12 horas  
- No solapamiento en mismo día/usuario
```

### 🔍 Detección de Conflictos
```typescript
// Algoritmo de solapamiento
const tieneConflicto = (inicio1, fin1, inicio2, fin2) => {
  const minutos1Inicio = convertirHoraAMinutos(inicio1);
  const minutos1Fin = convertirHoraAMinutos(fin1);
  const minutos2Inicio = convertirHoraAMinutos(inicio2);
  const minutos2Fin = convertirHoraAMinutos(fin2);
  
  return minutos1Inicio < minutos2Fin && minutos1Fin > minutos2Inicio;
};
```

### 👤 Control de Acceso
- **Autogestión**: Los usuarios pueden gestionar solo su propia disponibilidad
- **Consulta Cross-User**: Secretarios/docentes pueden ver disponibilidad de estudiantes
- **Validación de Existencia**: El usuario debe existir y estar activo
- **Prevención de Eliminación**: No se pueden eliminar disponibilidades con citas asociadas

## Integración con Módulo de Citas

### Uso en CitaService
```typescript
// Verificar disponibilidad antes de crear cita
const disponibilidadConsulta = {
  usuarioId: estudianteId,
  fecha: citaDto.fecha,
  horaInicio: citaDto.horaInicio, 
  horaFin: citaDto.horaFin
};

const resultado = await this.disponibilidadService
  .consultarDisponibilidadEspecifica(disponibilidadConsulta);

if (!resultado.estaDisponible) {
  throw new BadRequestException(
    `Estudiante no disponible: ${resultado.motivo}`
  );
}
```

### Slots para Selección de Horarios
```typescript
// Obtener horarios disponibles para mostrar en frontend
const slotsDisponibles = await this.disponibilidadService
  .obtenerSlotsDisponibles(estudianteId, fecha, 60);

const horariosLibres = slotsDisponibles.slots
  .filter(slot => slot.disponible)
  .map(slot => ({
    inicio: slot.horaInicio,
    fin: slot.horaFin
  }));
```

## Base de Datos

### Modelo Prisma
```prisma
model Disponibilidad {
  id         Int       @id @default(autoincrement())
  dia        DiaSemana
  horaInicio String    @map("hora_inicio")
  horaFin    String    @map("hora_fin") 
  usuarioId  Int       @map("usuario_id")
  usuario    Usuario   @relation("DisponibilidadPorUsuario", fields: [usuarioId], references: [id])

  @@map("Disponibilidad")
}

enum DiaSemana {
  LUNES
  MARTES
  MIERCOLES
  JUEVES
  VIERNES
  SABADO
  DOMINGO
}
```

### Índices Recomendados
```sql
-- Índice compuesto para consultas de disponibilidad por usuario y día
CREATE INDEX idx_disponibilidad_usuario_dia ON "Disponibilidad" (usuario_id, dia);

-- Índice para consultas por día específico
CREATE INDEX idx_disponibilidad_dia ON "Disponibilidad" (dia);

-- Índice para consultas por rango horario
CREATE INDEX idx_disponibilidad_horario ON "Disponibilidad" (hora_inicio, hora_fin);
```

## Configuración y Dependencias

### 1. Instalar Dependencias
```bash
npm install @nestjs/common @nestjs/swagger class-validator class-transformer @prisma/client
```

### 2. Importar en AppModule
```typescript
import { DisponibilidadModule } from './modules/Disponibilidad/disponibilidad.module';

@Module({
  imports: [
    // ... otros módulos
    DisponibilidadModule,
  ],
})
export class AppModule {}
```

### 3. Configurar Variables de Entorno
```env
# En .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/db_tesis"
JWT_SECRET="tu_jwt_secret_aqui"
```

## Testing

### Tests Unitarios
```bash
# Ejecutar tests del servicio
npm run test -- --testPathPattern=disponibilidad.service.spec.ts

# Ejecutar tests del controlador  
npm run test -- --testPathPattern=disponibilidad.controller.spec.ts
```

### Tests de Integración
```bash
# Tests E2E del módulo completo
npm run test:e2e -- --testPathPattern=disponibilidad.e2e-spec.ts
```

### Casos de Prueba Principales
- ✅ Creación de disponibilidad válida
- ✅ Validación de formato de horarios
- ✅ Detección de conflictos de solapamiento
- ✅ Consulta de disponibilidad específica
- ✅ Generación de slots de tiempo
- ✅ Control de acceso por usuario
- ✅ Creación masiva con manejo de errores

## Monitoreo y Logs

### Logging Implementado
```typescript
// Logs de creación
this.logger.log(`Creando disponibilidad para usuario ${usuarioId}`);

// Logs de consulta
this.logger.log(`Consultando disponibilidad específica para usuario ${usuarioId}`);

// Logs de errores
this.logger.error(`Error al crear disponibilidad: ${error.message}`);

// Logs de conflictos
this.logger.warn(`Conflicto de horario detectado para usuario ${usuarioId}`);
```

### Métricas Recomendadas
- Número de disponibilidades creadas por día
- Consultas de disponibilidad por minuto
- Conflictos de horario detectados
- Estudiantes con/sin disponibilidad configurada
- Distribución de horarios por día de la semana

## Performance y Optimización

### Consultas Optimizadas
```typescript
// Uso de índices compuestos
const disponibilidades = await this.prisma.disponibilidad.findMany({
  where: {
    usuarioId: usuarioId,    // Usa índice
    dia: diaSemana          // Usa índice compuesto
  },
  orderBy: { horaInicio: 'asc' }
});
```

### Paginación Eficiente
```typescript
// Paginación con offset y limit
const offset = (página - 1) * límite;
const [datos, total] = await Promise.all([
  this.prisma.disponibilidad.findMany({
    skip: offset,
    take: límite,
    where: filtros
  }),
  this.prisma.disponibilidad.count({ where: filtros })
]);
```

### Cache Recomendado
- Cache de disponibilidades por usuario (TTL: 5 minutos)
- Cache de slots calculados por fecha (TTL: 1 hora)
- Cache de estadísticas generales (TTL: 1 día)

## Seguridad

### Validaciones de Entrada
- ✅ Sanitización de parámetros de entrada
- ✅ Validación de formato de fechas y horas
- ✅ Límites en rangos de consulta
- ✅ Prevención de inyección SQL (usando Prisma)

### Control de Rate Limiting
```typescript
// Recomendado para endpoints de consulta intensiva
@Throttle(60, 60) // 60 requests por minuto
@Get('slots/:usuarioId/:fecha')
async obtenerSlotsDisponibles() { ... }
```

## Casos de Uso Comunes

### 1. Estudiante Configura Horario Semanal
```typescript
// Frontend envía horario completo de la semana
const horarioSemanal = {
  usuarioId: 2,
  disponibilidades: [
    { dia: "LUNES", horaInicio: "08:00", horaFin: "12:00" },
    { dia: "LUNES", horaInicio: "14:00", horaFin: "17:00" },
    { dia: "MARTES", horaInicio: "08:00", horaFin: "12:00" }
    // ... más días
  ]
};
```

### 2. Secretario Busca Horarios Libres
```typescript
// Consultar estudiantes disponibles para un día específico
GET /disponibilidad?dia=LUNES&incluirUsuario=true&soloActivas=true

// Verificar horario específico antes de crear cita
GET /disponibilidad/verificar/2/2025-01-15/09:00/10:00
```

### 3. Sistema Automatizado de Citas
```typescript
// Encontrar primer horario disponible para un estudiante
const slots = await disponibilidadService.obtenerSlotsDisponibles(
  estudianteId, 
  fechaDeseada, 
  duracionCita
);

const primerSlotLibre = slots.slots.find(slot => slot.disponible);
```

## Troubleshooting

### Problemas Comunes

**Error: Conflicto de horarios**
- Verificar que no haya solapamiento con horarios existentes
- Revisar formato de horas (debe ser HH:MM)
- Confirmar que hora inicio < hora fin

**Error: Usuario no encontrado**
- Verificar que el usuario existe en la base de datos
- Confirmar que el usuario está activo
- Revisar permisos de acceso

**Error: No se puede eliminar disponibilidad**
- Verificar que no hay citas futuras asociadas
- Confirmar permisos de eliminación
- Revisar estado de las citas relacionadas

### Logs de Debug
```bash
# Habilitar logs detallados
DEBUG=disponibilidad:* npm run start:dev

# Ver queries de Prisma
DATABASE_URL_WITH_LOGGING=true npm run start:dev
```

## Roadmap y Mejoras Futuras

### v1.1.0 (Próximo)
- 🔄 Disponibilidad recurrente (cada N semanas)
- 📅 Excepciones por fechas específicas (feriados, vacaciones)
- 🔔 Notificaciones de cambios de disponibilidad
- 📊 Dashboard de disponibilidad por especialidad

### v1.2.0 (Futuro)
- 🤖 Sugerencias inteligentes de horarios
- 📈 Análisis de patrones de disponibilidad
- 🔗 Integración con calendario externo (Google Calendar)
- 📱 Sincronización con app móvil

### v1.3.0 (Largo Plazo)
- 🌐 Disponibilidad multi-ubicación (clínicas)
- ⚡ Cache distribuido para alta concurrencia
- 🔄 Disponibilidad compartida entre estudiantes
- 📋 Templates de horarios por especialidad

---

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades del módulo de Disponibilidad, contactar al equipo de desarrollo.

**Autor**: Sistema de Gestión Académica Odontológica  
**Versión**: 1.0.0  
**Última Actualización**: Enero 2025  
**Dependencias**: NestJS 10+, Prisma 5+, PostgreSQL 14+
