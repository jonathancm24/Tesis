# Gestión de Preguntas Clínicas por Especialidad

## 📋 Descripción

Esta funcionalidad permite a los profesores gestionar preguntas específicas para los casos clínicos de su especialidad. Los profesores pueden crear, editar, visualizar y eliminar preguntas personalizadas que se agregan a las preguntas básicas predeterminadas del sistema.

## 🎯 Características Principales

### ✅ Para Profesores
- **Gestión Completa**: Crear, editar, visualizar y eliminar preguntas clínicas
- **Filtros Avanzados**: Buscar por especialidad, tipo de pregunta, obligatoriedad y texto
- **Vista Previa**: Visualización de cómo se verá la pregunta para los estudiantes
- **Tipos de Pregunta**: Soporte para múltiples tipos (texto, opción múltiple, fecha, etc.)
- **Estadísticas**: Panel con métricas de preguntas por especialidad
- **Exportación**: Posibilidad de exportar preguntas a CSV
- **Operaciones en Lote**: Crear múltiples preguntas simultáneamente

### 🎨 Diseño y UX
- **Responsive**: Adaptable a dispositivos móviles, tablets y desktop
- **Accesible**: Cumple con estándares de accesibilidad web
- **Consistente**: Sigue el sistema de diseño institucional
- **Intuitivo**: Interfaz clara y fácil de usar

## 📁 Estructura de Archivos

```
frontend/src/
├── views/professor/
│   └── QuestionsManagementView.vue          # Vista principal
├── components/professor/
│   └── QuestionFormModal.vue                # Modal para crear/editar
├── components/common/
│   └── ConfirmationModal.vue                # Modal de confirmación
├── services/
│   └── questionsService.ts                  # Servicio API
├── utils/
│   └── debounce.ts                          # Utilidad debounce
├── composables/
│   └── useToast.ts                          # Composable para notificaciones
└── assets/css/
    ├── pages/professor/
    │   └── QuestionsManagement.css          # Estilos de la vista
    └── components/professor/
        └── QuestionFormModal.css             # Estilos del modal
```

## 🔌 APIs Utilizadas

### Endpoints Backend
- `GET /preguntas-clinicas` - Obtener preguntas con filtros
- `GET /preguntas-clinicas/especialidad/:id` - Preguntas por especialidad
- `POST /preguntas-clinicas` - Crear nueva pregunta
- `PUT /preguntas-clinicas/:id` - Actualizar pregunta
- `DELETE /preguntas-clinicas/:id` - Eliminar pregunta
- `GET /preguntas-clinicas/estadisticas/especialidad` - Estadísticas
- `POST /preguntas-clinicas/lote` - Crear preguntas en lote
- `GET /especialidades` - Obtener especialidades

### Tipos de Pregunta Soportados
- **TEXTO**: Respuesta de texto corto
- **TEXTO_LARGO**: Respuesta de texto largo (múltiples líneas)
- **OPCION_MULTIPLE**: Selección múltiple con opciones
- **VERDADERO_FALSO**: Respuesta booleana
- **NUMERO**: Respuesta numérica
- **FECHA**: Respuesta de fecha específica

## 🚀 Funcionalidades Implementadas

### 1. Gestión de Preguntas
- ✅ **Crear**: Formulario completo con validación
- ✅ **Editar**: Modificar preguntas existentes
- ✅ **Eliminar**: Con confirmación de seguridad
- ✅ **Visualizar**: Lista paginada con metadatos

### 2. Filtros y Búsqueda
- ✅ **Por Especialidad**: Filtrar preguntas específicas
- ✅ **Por Tipo**: Filtrar por tipo de pregunta
- ✅ **Por Obligatoriedad**: Mostrar solo obligatorias/opcionales
- ✅ **Búsqueda de Texto**: Con debounce para optimización
- ✅ **Limpiar Filtros**: Resetear todos los filtros

### 3. Estadísticas
- ✅ **Total de Preguntas**: Contador general
- ✅ **Preguntas Obligatorias**: Contador específico
- ✅ **Preguntas Opcionales**: Contador específico
- ✅ **Distribución por Tipo**: Gráfico de tipos (futuro)

### 4. Experiencia de Usuario
- ✅ **Paginación**: Navegación eficiente entre páginas
- ✅ **Loading States**: Indicadores de carga
- ✅ **Estado Vacío**: Mensaje cuando no hay datos
- ✅ **Notificaciones**: Toast para feedback
- ✅ **Vista Previa**: Simulación de respuesta

### 5. Accesibilidad
- ✅ **Navegación por Teclado**: Totalmente navegable
- ✅ **Screen Readers**: Etiquetas ARIA apropiadas
- ✅ **Alto Contraste**: Soporte para preferencias
- ✅ **Reducción de Movimiento**: Respeta preferencias del usuario

## 🎨 Sistema de Colores

### Colores Institucionales para Profesores
- **Púrpura Principal**: `#ab47bc` - Color principal de profesor
- **Verde Complementario**: `#81c784` - Color secundario
- **Púrpura Suave**: `#f3e5f5` - Fondos y elementos suaves
- **Verde Suave**: `#c8e6c9` - Elementos de especialidad

### Colores de Estado
- **Éxito**: `#4caf50` - Operaciones exitosas
- **Advertencia**: `#ff9800` - Alertas y warnings
- **Error**: `#f44336` - Errores y eliminaciones
- **Información**: `#2196f3` - Información general

## 📱 Responsive Design

### Breakpoints
- **Desktop**: `≥992px` - Diseño completo con sidebar
- **Tablet**: `768px - 991px` - Adaptación de columnas
- **Móvil**: `≤767px` - Diseño apilado vertical
- **Móvil Pequeño**: `≤480px` - Optimización táctil

### Adaptaciones Móviles
- **Header**: Stack vertical de elementos
- **Filtros**: Campos en columna única
- **Tarjetas**: Diseño vertical completo
- **Acciones**: Botones centrados y táctiles
- **Modal**: Pantalla completa en móviles

## 🔧 Configuración y Uso

### 1. Navegación
- Acceder desde el menú lateral: **"Preguntas Clínicas"**
- Ruta: `/professor/questions`
- Rol requerido: `profesor`

### 2. Crear Pregunta
1. Hacer clic en **"Nueva Pregunta"**
2. Completar el formulario:
   - Texto de la pregunta (10-500 caracteres)
   - Seleccionar tipo de pregunta
   - Elegir especialidad (opcional)
   - Marcar como obligatoria (opcional)
3. Revisar la vista previa
4. Guardar cambios

### 3. Filtrar Preguntas
- **Especialidad**: Selector dropdown
- **Tipo**: Selector de tipo de pregunta
- **Obligatoria**: Filtro Sí/No/Todas
- **Búsqueda**: Campo de texto con debounce

### 4. Editar/Eliminar
- **Editar**: Botón de lápiz en cada pregunta
- **Eliminar**: Botón de papelera con confirmación

## 🛡️ Validaciones y Seguridad

### Validaciones Frontend
- **Texto**: Mínimo 10, máximo 500 caracteres
- **Tipo**: Selección obligatoria
- **Especialidad**: Validación de existencia
- **Formulario**: Validación en tiempo real

### Validaciones Backend
- **Autenticación**: Token JWT requerido
- **Autorización**: Solo profesores
- **Sanitización**: Limpieza de datos de entrada
- **Relaciones**: Validación de especialidad existente

## 🚨 Manejo de Errores

### Casos Contemplados
- **Error de Red**: Mensaje de conexión
- **Error 403**: Falta de permisos
- **Error 404**: Recurso no encontrado
- **Error 500**: Error interno del servidor
- **Validación**: Errores de formulario
- **Eliminación**: Restricciones de integridad

### Fallbacks
- **Datos Mock**: En caso de error 403
- **Estado Vacío**: Cuando no hay datos
- **Retry**: Botones de reintento
- **Navegación**: Rutas alternativas

## 🔄 Flujo de Trabajo

### Para el Profesor
1. **Acceso**: Login y navegación a preguntas
2. **Visualización**: Lista filtrable de preguntas
3. **Gestión**: CRUD completo de preguntas
4. **Configuración**: Asociación con especialidades
5. **Verificación**: Vista previa de preguntas

### Para el Sistema
1. **Integración**: Preguntas se muestran en casos clínicos
2. **Herencia**: Preguntas básicas + específicas
3. **Validación**: Obligatorias vs opcionales
4. **Almacenamiento**: Respuestas vinculadas a casos

## 📊 Métricas y Monitoreo

### Estadísticas Disponibles
- **Total de preguntas** por especialidad
- **Distribución** entre obligatorias/opcionales
- **Tipos más utilizados** de preguntas
- **Actividad** de creación/edición

### Funcionalidades Futuras
- 📈 **Dashboard de Analíticas**: Gráficos detallados
- 📤 **Importación Masiva**: Carga desde Excel/CSV
- 🔄 **Versionado**: Historial de cambios
- 👥 **Colaboración**: Compartir entre profesores

## 🎯 Próximos Pasos

### Mejoras Técnicas
- [ ] Implementar caché para especialidades
- [ ] Optimizar consultas con índices
- [ ] Agregar tests unitarios
- [ ] Implementar lazy loading

### Mejoras UX
- [ ] Drag & drop para reordenar
- [ ] Preview de formulario completo
- [ ] Plantillas predefinidas
- [ ] Duplicar preguntas existentes

### Integraciones
- [ ] Notificaciones push
- [ ] Historial de cambios
- [ ] Backup automático
- [ ] API para aplicaciones móviles

---

**Desarrollado por**: Sistema de Gestión Clínica  
**Versión**: 1.0  
**Fecha**: Agosto 2025
