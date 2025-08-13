# Gestión Masiva de Usuarios - Frontend

## Nuevas Funcionalidades

Se han agregado dos nuevas funcionalidades a la gestión de usuarios en el panel de administración:

### 1. Carga Masiva desde Excel

**Ubicación**: Botón "Carga masiva" en la vista AdminUsers  
**Función**: Permite crear múltiples usuarios desde un archivo Excel

#### Características:
- **Validación previa**: El sistema valida el archivo antes de procesarlo
- **Vista previa**: Muestra usuarios válidos, duplicados y con errores
- **Reactivación automática**: Los usuarios duplicados inactivos se reactivan
- **Contraseñas temporales**: Se generan automáticamente para nuevos usuarios
- **Descarga de plantilla**: Botón para descargar formato de Excel requerido

#### Proceso:
1. Click en "Carga masiva"
2. Descargar plantilla (opcional)
3. Subir archivo Excel
4. Revisar validación
5. Confirmar procesamiento
6. Ver resultados y contraseñas temporales

### 2. Desactivación Masiva

**Ubicación**: Botón "Desactivar masivo" en la vista AdminUsers  
**Función**: Permite desactivar múltiples usuarios de forma simultánea

#### Características:
- **Selección múltiple**: Checkboxes para seleccionar usuarios
- **Filtro de búsqueda**: Buscar usuarios específicos
- **Solo usuarios activos**: Solo muestra usuarios que se pueden desactivar
- **Paginación**: Manejo de listas grandes de usuarios
- **Confirmación**: Proceso seguro con confirmación

#### Proceso:
1. Click en "Desactivar masivo"
2. Buscar/filtrar usuarios (opcional)
3. Seleccionar usuarios a desactivar
4. Confirmar desactivación
5. Ver resultados

## Componentes Agregados

### BulkUploadModal.vue
- **Ubicación**: `src/components/admin/BulkUploadModal.vue`
- **Estilos**: `src/assets/css/components/BulkUploadModal.css`
- **Función**: Modal para carga masiva de usuarios desde Excel

### BulkDeactivateModal.vue
- **Ubicación**: `src/components/admin/BulkDeactivateModal.vue`
- **Estilos**: `src/assets/css/components/BulkDeactivateModal.css`
- **Función**: Modal para desactivación masiva de usuarios

### bulkUserService.ts
- **Ubicación**: `src/services/bulkUserService.ts`
- **Función**: Servicio para operaciones masivas (carga y desactivación)

## Integración Visual

Los nuevos botones se han integrado en el toolbar de la vista AdminUsers:

```
[Buscador] [Carga masiva] [Desactivar masivo] [Añadir usuario]
```

### Diseño Responsive
- **Desktop**: Botones en línea horizontal
- **Tablet**: Se reorganizan en columna
- **Mobile**: Stack vertical completo

### Iconografía
- **Carga masiva**: Icono de upload (fas fa-upload)
- **Desactivar masivo**: Icono de usuario tachado (fas fa-user-slash)
- **Añadir individual**: Icono de usuario plus (fas fa-user-plus)

## Estados de los Botones

### Botón "Carga masiva"
- **Siempre habilitado**: Permite subir archivos en cualquier momento
- **Estilo**: Outline success (verde)

### Botón "Desactivar masivo"
- **Habilitado**: Cuando hay usuarios activos disponibles
- **Deshabilitado**: Cuando no hay usuarios activos para desactivar
- **Estilo**: Outline warning (naranja)

## Mensajes y Feedback

### Carga Masiva
- **Validación**: Mensajes específicos para cada tipo de error
- **Progreso**: Indicadores visuales durante procesamiento
- **Resultados**: Resumen detallado con contraseñas temporales
- **Errores**: Lista específica de problemas encontrados

### Desactivación Masiva
- **Selección**: Contador de usuarios seleccionados
- **Progreso**: Spinner durante procesamiento
- **Resultados**: Resumen de éxitos y fallos
- **Confirmación**: Alertas de seguridad antes de procesar

## Consideraciones de UX

### Accesibilidad
- **ARIA labels**: Etiquetas descriptivas para lectores de pantalla
- **Navegación por teclado**: Soporte completo
- **Contraste**: Cumple estándares WCAG

### Responsive Design
- **Mobile first**: Diseño optimizado para dispositivos móviles
- **Touch friendly**: Botones y áreas táctiles apropiadas
- **Breakpoints**: Adaptación fluida en todos los tamaños

### Performance
- **Lazy loading**: Componentes modales se cargan bajo demanda
- **Chunking**: Archivos separados para optimizar carga
- **Debouncing**: Búsquedas con retardo para mejorar rendimiento

## Seguridad

### Validaciones Frontend
- **Tipos de archivo**: Solo Excel (.xlsx, .xls)
- **Tamaño**: Máximo 5MB
- **Formato**: Validación de estructura de datos

### Confirmaciones
- **Operaciones masivas**: Requieren confirmación explícita
- **Estados críticos**: Alertas antes de acciones irreversibles
- **Feedback visual**: Estados claros de éxito/error

## Mantenimiento

### Estilos CSS
- **Modulares**: CSS separado por componente
- **Variables**: Uso de custom properties para temas
- **BEM**: Nomenclatura consistente

### Servicios
- **Tipado**: TypeScript completo
- **Error handling**: Manejo robusto de errores
- **Testing**: Preparado para pruebas unitarias

## Extensibilidad

### Futuros Desarrollos
- **Más formatos**: Posibilidad de agregar CSV, JSON
- **Campos adicionales**: Fácil extensión de columnas
- **Plantillas múltiples**: Diferentes formatos según rol
- **Importación programada**: Tareas automáticas

### Configuración
- **Limits configurable**: Tamaños y límites ajustables
- **Roles dinámicos**: Carga automática desde backend
- **Validaciones**: Extensibles según necesidades
