# Módulo de Hallazgos Clínicos

## Descripción General

El módulo de Hallazgos Clínicos es un componente especializado del sistema académico odontológico que permite registrar, gestionar y analizar hallazgos clínicos encontrados durante los exámenes de pacientes. Este módulo facilita la documentación sistemática de condiciones patológicas, anomalías y otros hallazgos relevantes durante la práctica clínica académica.

## Arquitectura del Módulo

```
src/modules/HallazgosClinico/
├── DTO/
│   └── index.ts                      # Data Transfer Objects para validación
├── Interface/
│   └── index.ts                      # Interfaces TypeScript para tipado
├── hallazgo-clinico.controller.ts    # Controlador REST con endpoints
├── hallazgo-clinico.service.ts       # Lógica de negocio y operaciones
├── hallazgo-clinico.module.ts        # Configuración del módulo NestJS
└── README.md                         # Esta documentación
```

## Modelo de Datos

### Estructura del Hallazgo Clínico

```typescript
interface HallazgoClinico {
  id: number;                    // ID único del hallazgo
  casoClinicoId: number;         // Relación con caso clínico
  tipo: string;                  // Tipo de hallazgo (Caries, Gingivitis, etc.)
  codigoZona: string;            // Código anatómico (D-16, D-21, etc.)
  descripcion?: string;          // Descripción detallada opcional
  archivoId?: number;            // Archivo adjunto opcional (imagen, radiografía)
}
```

### Tipos de Hallazgos Soportados

- **Caries**: Lesiones cariosas en diferentes grados
- **Gingivitis**: Inflamación gingival
- **Periodontitis**: Enfermedad periodontal
- **Absceso**: Infecciones localizadas
- **Fractura**: Fracturas dentales o óseas
- **Desgaste**: Desgaste dental patológico
- **Maloclusión**: Problemas de oclusión
- **Lesión de tejidos blandos**: Patologías en mucosa oral
- **Anomalía dental**: Anomalías de desarrollo
- **Patología pulpar**: Problemas endodónticos
- **Otro**: Hallazgos no categorizados

### Nomenclatura de Zonas Anatómicas

El sistema utiliza la nomenclatura dental estándar:

#### Dientes Permanentes
- **Superiores**: D-18 a D-11 (derecha), D-21 a D-28 (izquierda)
- **Inferiores**: D-48 a D-41 (derecha), D-31 a D-38 (izquierda)

#### Tejidos Blandos
- **ENC-SUP**: Encía superior
- **ENC-INF**: Encía inferior
- **LENGUA**: Lengua
- **PALADAR**: Paladar
- **MEJILLAS**: Mejillas
- **LABIOS**: Labios
- **SUELO-BOCA**: Suelo de la boca

## Componentes Principales

### 1. DTOs (Data Transfer Objects)

#### CrearHallazgoClinicoDto
Validación para crear nuevos hallazgos:
```typescript
{
  casoClinicoId: number;     // Requerido
  tipo: string;              // Requerido, validado contra enum
  codigoZona: string;        // Requerido, formato validado
  descripcion?: string;      // Opcional, máximo 500 caracteres
  archivoId?: number;        // Opcional, debe existir en BD
}
```

#### ActualizarHallazgoClinicoDto
Para actualizaciones parciales (todos los campos opcionales).

#### FiltrosHallazgosClinicosDto
Parámetros de filtrado y paginación:
- Filtro por caso clínico, tipo, zona
- Búsqueda en descripción
- Filtro por presencia de archivos
- Paginación y ordenamiento

### 2. Interfaces TypeScript

- **IHallazgoClinico**: Estructura básica
- **IHallazgoClinicoCompleto**: Con relaciones completas
- **IRespuestaPaginadaHallazgos**: Para respuestas con paginación
- **IEstadisticasHallazgos**: Para métricas del sistema
- **IAccesoHallazgoClinico**: Para control de permisos

### 3. Servicio (HallazgoClinicoService)

#### Métodos Principales

```typescript
// Crear hallazgo
crearHallazgo(datos: CrearHallazgoClinicoDto, usuarioId: number): Promise<IHallazgoClinico>

// Listar con filtros
obtenerHallazgos(filtros: FiltrosHallazgosClinicosDto, usuarioId: number): Promise<IRespuestaPaginadaHallazgos>

// Obtener por ID
obtenerHallazgoPorId(id: number, usuarioId: number): Promise<IHallazgoClinicoCompleto>

// Actualizar
actualizarHallazgo(id: number, datos: ActualizarHallazgoClinicoDto, usuarioId: number): Promise<IHallazgoClinico>

// Eliminar
eliminarHallazgo(id: number, usuarioId: number): Promise<void>

// Estadísticas
obtenerEstadisticasBasicas(): Promise<IEstadisticasHallazgos>

// Verificar acceso
verificarAccesoHallazgo(hallazgoId: number, usuarioId: number): Promise<IAccesoHallazgoClinico>

// Hallazgos del usuario
obtenerHallazgosUsuario(usuarioId: number, filtros?: Partial<FiltrosHallazgosClinicosDto>): Promise<IRespuestaPaginadaHallazgos>
```

### 4. Controlador (HallazgoClinicoController)

#### Endpoints REST Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/hallazgos-clinicos` | Crear hallazgo clínico |
| GET | `/hallazgos-clinicos` | Listar con filtros |
| GET | `/hallazgos-clinicos/:id` | Obtener por ID |
| PUT | `/hallazgos-clinicos/:id` | Actualizar hallazgo |
| DELETE | `/hallazgos-clinicos/:id` | Eliminar hallazgo |
| GET | `/hallazgos-clinicos/estadisticas/basicas` | Estadísticas |
| GET | `/hallazgos-clinicos/mis-hallazgos/usuario` | Hallazgos del usuario |
| GET | `/hallazgos-clinicos/:id/verificar-acceso` | Verificar permisos |
| GET | `/hallazgos-clinicos/caso/:casoId/hallazgos` | Hallazgos por caso |

## Características Técnicas

### Seguridad y Permisos

- **Autenticación JWT**: Todos los endpoints requieren autenticación
- **Control de acceso**: Basado en participación en casos clínicos
- **Roles soportados**:
  - **Estudiante**: Puede crear, ver y editar hallazgos de sus casos
  - **Docente**: Puede crear, ver, editar y eliminar hallazgos de casos supervisados
  - **Administrador**: Acceso completo (implementación futura)

### Validaciones de Negocio

1. **Prevención de duplicados**: No permite hallazgos del mismo tipo en la misma zona del mismo caso
2. **Validación de relaciones**: Verifica existencia de caso clínico y archivos
3. **Permisos contextuales**: Solo usuarios relacionados al caso pueden acceder
4. **Integridad de datos**: Validación exhaustiva de tipos y formatos

### Base de Datos

- **Prisma ORM**: Para consultas tipo-seguras
- **Relaciones**: Con CasoClinico y Archivo
- **Índices**: Optimización para consultas frecuentes
- **Transacciones**: Para operaciones críticas

## Uso del Módulo

### Ejemplo de Creación

```typescript
// POST /hallazgos-clinicos
{
  "casoClinicoId": 1,
  "tipo": "Caries",
  "codigoZona": "D-16",
  "descripcion": "Caries profunda en cara oclusal del primer molar superior derecho",
  "archivoId": 15
}
```

### Ejemplo de Filtrado

```typescript
// GET /hallazgos-clinicos?tipo=Caries&codigoZona=D-16&página=1&límite=10
{
  "hallazgos": [...],
  "paginación": {
    "total": 25,
    "página": 1,
    "límite": 10,
    "totalPáginas": 3
  }
}
```

### Integración en Otros Módulos

```typescript
import { HallazgoClinicoModule } from './modules/HallazgosClinico/hallazgo-clinico.module';

@Module({
  imports: [HallazgoClinicoModule],
  // ...
})
export class MiModulo {}
```

## Estadísticas Disponibles

El módulo proporciona estadísticas completas:

```typescript
{
  "totalHallazgos": 150,
  "porTipo": {
    "Caries": 45,
    "Gingivitis": 30,
    "Periodontitis": 20
  },
  "conArchivos": 85,
  "sinArchivos": 65,
  "promedioPorCaso": 2.5,
  "tiposMasFrecuentes": [...],
  "zonasMasAfectadas": [...]
}
```

## Consideraciones Clínicas

### Documentación Clínica
- Facilita la documentación sistemática de hallazgos
- Permite adjuntar evidencia fotográfica o radiográfica
- Historial completo por paciente y caso

### Proceso Académico
- Supervisión docente de hallazgos registrados por estudiantes
- Validación de competencias clínicas
- Seguimiento de casos complejos

### Análisis Epidemiológico
- Estadísticas de prevalencia por tipo de hallazgo
- Análisis de zonas más afectadas
- Tendencias en la población atendida

## Flujo de Trabajo Típico

1. **Examen Clínico**: Estudiante examina paciente
2. **Registro de Hallazgos**: Documenta hallazgos encontrados
3. **Adjuntar Evidencia**: Sube imágenes o radiografías
4. **Revisión Docente**: Profesor valida hallazgos
5. **Actualización**: Modificaciones según supervisión
6. **Análisis**: Estadísticas para seguimiento académico

## Testing y Calidad

### Tests Recomendados

```bash
# Tests unitarios
npm run test -- --testPathPattern=hallazgo-clinico

# Tests de integración
npm run test:e2e -- --testPathPattern=hallazgo-clinico

# Coverage
npm run test:cov -- --testPathPattern=hallazgo-clinico
```

### Validaciones de Calidad
- Cobertura de tests > 90%
- Validación de todos los DTOs
- Tests de permisos y seguridad
- Tests de integridad de datos

## Roadmap y Mejoras Futuras

### Próximas Características
- [ ] Plantillas de hallazgos predefinidas
- [ ] Clasificación automática por IA
- [ ] Exportación de reportes clínicos
- [ ] Integración con sistemas de imágenes médicas
- [ ] Notificaciones automáticas para casos críticos
- [ ] Dashboard analítico avanzado

### Optimizaciones Técnicas
- [ ] Cache de consultas frecuentes
- [ ] Búsqueda full-text avanzada
- [ ] Archivos en CDN
- [ ] Compresión de imágenes automática
- [ ] API GraphQL alternativa

## Mantenimiento y Soporte

### Logs y Monitoreo
- Logs detallados de operaciones críticas
- Métricas de rendimiento
- Alertas para errores críticos

### Backup y Recuperación
- Respaldo automático de datos
- Versionado de archivos adjuntos
- Procedimientos de recuperación

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Mantenedor**: Equipo de Desarrollo Sistema Académico Odontológico  
**Documentación técnica**: Disponible en Swagger UI en `/api/docs`
