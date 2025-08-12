# Módulo de Odontogramas

## Descripción General

El módulo de Odontogramas es un componente central del sistema académico odontológico que permite gestionar cartas dentales (odontogramas) de manera integral. Este módulo proporciona funcionalidades completas para crear, leer, actualizar y eliminar odontogramas, así como filtrado avanzado y estadísticas.

## Arquitectura del Módulo

```
src/modules/Odontograma/
├── DTO/
│   └── index.ts                 # Data Transfer Objects para validación
├── Interface/
│   └── index.ts                 # Interfaces TypeScript para tipado
├── odontograma.controller.ts    # Controlador REST con endpoints
├── odontograma.service.ts       # Lógica de negocio y operaciones
├── odontograma.module.ts        # Configuración del módulo NestJS
└── README.md                    # Esta documentación
```

## Componentes Principales

### 1. DTOs (Data Transfer Objects)

- **CrearOdontogramaDto**: Validación para crear nuevos odontogramas
- **ActualizarOdontogramaBasicoDto**: Validación para actualizaciones
- **FiltrosOdontogramasDto**: Parámetros de filtrado y paginación
- **RespuestaPaginadaOdontogramasDto**: Estructura de respuestas paginadas

### 2. Interfaces

- **IOdontograma**: Estructura básica del odontograma
- **IOdontogramaCompleto**: Odontograma con relaciones completas
- **IEstadisticasOdontograma**: Métricas y estadísticas
- **IFiltrosOdontograma**: Parámetros de filtrado

### 3. Servicio (OdontogramaService)

Métodos principales:
- `crearOdontograma()`: Crear nuevo odontograma
- `obtenerOdontogramas()`: Listar con filtros y paginación
- `obtenerOdontogramaPorId()`: Obtener odontograma específico
- `actualizarOdontograma()`: Actualizar odontograma existente
- `eliminarOdontograma()`: Eliminación lógica
- `obtenerEstadisticasBasicas()`: Estadísticas del sistema
- `verificarAccesoOdontograma()`: Validación de permisos

### 4. Controlador (OdontogramaController)

Endpoints REST disponibles:

#### POST /odontogramas
Crear un nuevo odontograma
```json
{
  "paciente_id": 1,
  "caso_clinico_id": 2,
  "condiciones_dentales": {
    "diente_11": ["caries", "obturación"],
    "diente_21": ["sano"]
  },
  "observaciones": "Odontograma inicial del paciente"
}
```

#### GET /odontogramas
Listar odontogramas con filtros opcionales
- Query params: `paciente_id`, `caso_clinico_id`, `fecha_desde`, `fecha_hasta`, `página`, `límite`

#### GET /odontogramas/:id
Obtener un odontograma específico por ID

#### PUT /odontogramas/:id
Actualizar un odontograma existente

#### DELETE /odontogramas/:id
Eliminación lógica de un odontograma

#### GET /odontogramas/estadisticas/basicas
Obtener estadísticas básicas del sistema

#### GET /odontogramas/mis-odontogramas
Obtener odontogramas del usuario autenticado

#### GET /odontogramas/:id/verificar-acceso
Verificar si el usuario tiene acceso a un odontograma específico

## Características Técnicas

### Autenticación y Autorización
- Uso de JWT Guards para proteger endpoints
- Validación de permisos basada en roles
- Control de acceso a nivel de recurso

### Validación de Datos
- Validación exhaustiva usando class-validator
- DTOs tipados para entrada y salida
- Manejo de errores personalizado

### Base de Datos
- Integración con Prisma ORM
- Campos JSON para condiciones dentales flexibles
- Soft delete para preservar historial

### Documentación API
- Swagger/OpenAPI completamente integrado
- Ejemplos de uso para cada endpoint
- Documentación de esquemas de datos

## Uso del Módulo

### Importación en otros módulos

```typescript
import { OdontogramaModule } from './modules/Odontograma/odontograma.module';

@Module({
  imports: [OdontogramaModule],
  // ...
})
export class OtroModule {}
```

### Inyección del servicio

```typescript
import { OdontogramaService } from './modules/Odontograma/odontograma.service';

@Injectable()
export class MiServicio {
  constructor(
    private readonly odontogramaService: OdontogramaService
  ) {}
}
```

## Estructura de Datos

### Condiciones Dentales
Las condiciones dentales se almacenan como JSON con la siguiente estructura:

```json
{
  "diente_11": ["caries", "obturación", "corona"],
  "diente_12": ["sano"],
  "diente_13": ["extracción_indicada"],
  "diente_21": ["caries", "endodoncia"]
}
```

### Estados Posibles por Diente
- `sano`: Diente en perfecto estado
- `caries`: Presencia de caries
- `obturación`: Diente obturado/empastado
- `corona`: Corona dental
- `endodoncia`: Tratamiento de conducto
- `extracción_indicada`: Requiere extracción
- `ausente`: Diente faltante
- `implante`: Implante dental
- `puente`: Parte de un puente dental

## Testing

Para ejecutar tests del módulo:

```bash
# Tests unitarios
npm run test -- --testPathPattern=odontograma

# Tests e2e
npm run test:e2e -- --testPathPattern=odontograma
```

## Consideraciones de Desarrollo

### Extensibilidad
- El módulo está diseñado para ser fácilmente extensible
- Nuevos tipos de condiciones dentales se pueden agregar sin cambios estructurales
- Interfaces tipadas facilitan la adición de nuevas funcionalidades

### Performance
- Paginación implementada para grandes volúmenes de datos
- Índices de base de datos para consultas optimizadas
- Lazy loading de relaciones cuando sea necesario

### Mantenimiento
- Código bien documentado y comentado
- Separación clara de responsabilidades
- Principios SOLID aplicados

## Roadmap

### Próximas Características
- [ ] Exportación de odontogramas a PDF
- [ ] Plantillas predefinidas de odontogramas
- [ ] Comparación visual entre odontogramas
- [ ] Integración con sistema de imágenes dentales
- [ ] Historial de cambios detallado
- [ ] Alertas automáticas para seguimiento

### Mejoras Técnicas
- [ ] Cache de consultas frecuentes
- [ ] Optimización de consultas complejas
- [ ] Validación más granular de condiciones dentales
- [ ] Integración con sistema de notificaciones

## Soporte y Mantenimiento

Para reportar bugs o solicitar nuevas características, contactar al equipo de desarrollo o crear un issue en el repositorio del proyecto.

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Mantenedor**: Equipo de Desarrollo Sistema Académico Odontológico
