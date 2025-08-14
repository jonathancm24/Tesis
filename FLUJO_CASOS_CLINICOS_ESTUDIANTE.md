# Flujo Completo de Casos Clínicos para Estudiantes

## Descripción General

El sistema de casos clínicos permite a los estudiantes crear, gestionar y completar casos clínicos de manera estructurada, cumpliendo con los requisitos académicos establecidos.

## Requisitos Previos

### 1. Elegibilidad del Paciente
- **Requisito obligatorio**: El paciente debe tener al menos una encuesta de tamizaje completada
- **Verificación automática**: El sistema valida automáticamente la elegibilidad antes de permitir crear un caso clínico
- **Mensaje de advertencia**: Si el paciente no cumple el requisito, se muestra una advertencia

### 2. Acceso del Estudiante
- Debe estar autenticado en el sistema
- Debe tener permisos de estudiante activos
- Debe estar matriculado en el período académico actual

## Flujo de Creación de Caso Clínico

### Paso 1: Información Básica
**Campos requeridos:**
- **Especialidad**: Selección obligatoria que determina las preguntas específicas
- **Profesor Supervisor**: Asignación del docente que supervisará el caso
- **Motivo de Consulta**: Descripción del motivo principal (mínimo 10 caracteres)
- **Enfermedad Actual**: Descripción detallada de la evolución (mínimo 20 caracteres)

**Validaciones:**
- Todos los campos son obligatorios
- Longitud mínima de texto respetada
- Profesor debe estar activo y disponible

### Paso 2: Examen Físico General
**Campos requeridos:**
- **Peso**: En kilogramos (rango: 1-300 kg)
- **Talla**: En metros (rango: 0.3-2.5 m)
- **Facies**: Descripción de la expresión facial (mínimo 10 caracteres)
- **Marcha**: Descripción de la forma de caminar (mínimo 10 caracteres)

**Cálculos automáticos:**
- IMC se calcula automáticamente (peso/talla²)
- Categorización del estado nutricional

### Paso 3: Examen Regional
**Campos requeridos:**
- **Cráneo**: Descripción de forma y simetría
- **Cara y Cuello**: Evaluación de características faciales y cervicales
- **ATM**: Evaluación de la articulación temporomandibular
- **Piel y Mucosa**: Estado de tejidos blandos visibles

**Consideraciones clínicas:**
- Cada descripción debe ser detallada y objetiva
- Mínimo 10 caracteres por campo
- Enfoque en hallazgos anormales

### Paso 4: Examen Bucal
**Componentes principales:**

#### A. Odontograma
- **Herramienta visual**: Interfaz interactiva para marcar hallazgos dentales
- **Estados disponibles**: Sano, Caries, Obturado, Ausente, Corona, Endodoncia
- **Superficies**: Mesial, Distal, Oclusal, Vestibular, Lingual/Palatino
- **Registro automático**: Los hallazgos se guardan automáticamente

#### B. Topografía de Mucosa Oral
- **Mapeo visual**: Interfaz para marcar hallazgos en mucosas
- **Áreas cubiertas**: Encías, lengua, paladar, carrillos, labios
- **Descripción de hallazgos**: Campo de texto para detalles específicos

**Opcionalidad**: Los hallazgos en esta sección son opcionales pero recomendados

### Paso 5: Preguntas de Especialidad
**Carga dinámica:**
- Las preguntas se cargan según la especialidad seleccionada
- **Tipos de preguntas soportados:**
  - Texto simple
  - Texto largo (textarea)
  - Número
  - Fecha
  - Verdadero/Falso
  - Opción múltiple

**Obligatoriedad:**
- Marcadas con asterisco (*)
- Validación automática antes de guardar
- Mensajes de error específicos por pregunta

## Validaciones del Sistema

### Validaciones por Sección
1. **Información Básica**: Campos completos y longitudes mínimas
2. **Examen General**: Datos físicos en rangos válidos
3. **Examen Regional**: Descripciones mínimas completas
4. **Examen Bucal**: Opcional, pero si hay datos deben ser válidos
5. **Preguntas**: Respuestas obligatorias completadas

### Validación Final
- Todas las secciones deben estar completas
- Paciente debe ser elegible
- Profesor asignado debe estar activo
- Sin errores de formato en ningún campo

## Proceso de Envío y Aprobación

### 1. Envío Automático
- **Destinatario**: Profesor supervisor seleccionado
- **Estado inicial**: "PENDIENTE_REVISION"
- **Notificación**: Email automático al profesor
- **Timestamp**: Fecha y hora de envío registradas

### 2. Tipos de Respuesta del Profesor
- **APROBADO**: Caso aceptado sin modificaciones
- **APROBADO_CON_OBSERVACIONES**: Aceptado con comentarios
- **REQUIERE_MODIFICACIONES**: Necesita cambios específicos
- **RECHAZADO**: No cumple estándares académicos

### 3. Ciclo de Revisión
- Estudiante recibe notificación del estado
- Si requiere modificaciones, puede editar y reenviar
- Historial completo de revisiones mantenido
- Comentarios del profesor visibles

## Estudios Complementarios

### Solicitud de Estudios Extra
- **Disponible después de aprobación**: Solo casos aprobados pueden solicitar estudios
- **Tipos de estudios**: Radiografías, análisis de laboratorio, interconsultas
- **Justificación requerida**: Descripción del motivo médico
- **Aprobación adicional**: Puede requerir autorización administrativa

### Subida de Archivos
- **Formatos soportados**: PDF, JPG, PNG, DICOM (para imágenes médicas)
- **Tamaño máximo**: 10MB por archivo
- **Múltiples archivos**: Hasta 5 archivos por caso
- **Metadatos**: Tipo de estudio, fecha, observaciones

## Estados del Caso Clínico

### Estados Principales
1. **BORRADOR**: En proceso de creación
2. **PENDIENTE_REVISION**: Enviado al profesor
3. **EN_REVISION**: Profesor revisando activamente
4. **APROBADO**: Caso completado exitosamente
5. **APROBADO_CON_OBSERVACIONES**: Aceptado con comentarios
6. **REQUIERE_MODIFICACIONES**: Necesita cambios
7. **RECHAZADO**: No aprobado
8. **CANCELADO**: Proceso cancelado

### Transiciones de Estado
```
BORRADOR → PENDIENTE_REVISION (envío del estudiante)
PENDIENTE_REVISION → EN_REVISION (profesor inicia revisión)
EN_REVISION → APROBADO (aprobación del profesor)
EN_REVISION → APROBADO_CON_OBSERVACIONES (aprobación con comentarios)
EN_REVISION → REQUIERE_MODIFICACIONES (solicitud de cambios)
EN_REVISION → RECHAZADO (rechazo definitivo)
REQUIERE_MODIFICACIONES → PENDIENTE_REVISION (reenvío tras modificaciones)
```

## Funcionalidades Adicionales

### 1. Guardado Automático
- Borrador guardado cada 30 segundos
- Recuperación automática en caso de cierre accidental
- Indicador visual de estado de guardado

### 2. Exportación de Reportes
- **PDF completo**: Caso clínico formateado para impresión
- **Resumen ejecutivo**: Versión condensada
- **Odontograma visual**: Diagrama dental exportable

### 3. Historial y Auditoría
- **Log completo**: Todas las acciones registradas
- **Fechas de modificación**: Timestamp de cada cambio
- **Usuario responsable**: Identificación de quien realizó cada acción

## Mejores Prácticas para Estudiantes

### Durante la Creación
1. **Preparación previa**: Revisar encuesta de tamizaje del paciente
2. **Examen físico completo**: No omitir ninguna sección
3. **Descripción objetiva**: Usar terminología médica apropiada
4. **Documentación fotográfica**: Incluir imágenes cuando sea apropiado

### Durante la Revisión
1. **Respuesta oportuna**: Atender comentarios del profesor rápidamente
2. **Modificaciones específicas**: Cambiar solo lo solicitado
3. **Comunicación**: Contactar al profesor si hay dudas
4. **Reenvío completo**: Verificar todas las secciones antes de reenviar

### Consideraciones Éticas
1. **Confidencialidad**: Proteger datos del paciente
2. **Consentimiento**: Verificar autorización para documentación
3. **Veracidad**: Reportar hallazgos de manera honesta
4. **Profesionalismo**: Mantener estándares académicos

## Soporte Técnico

### Problemas Comunes
1. **Error de elegibilidad**: Verificar encuestas de tamizaje completadas
2. **Fallos de guardado**: Revisar conexión a internet
3. **Preguntas no cargan**: Reseleccionar especialidad
4. **Archivos no suben**: Verificar formato y tamaño

### Contacto
- **Mesa de ayuda técnica**: soporte@sistema.edu
- **Coordinación académica**: coordinacion@odontologia.edu
- **Emergencias**: +593-XXX-XXXX

## Actualizaciones del Sistema

### Versión Actual: 2.1.0
- Mejoras en validación de datos
- Nuevos tipos de preguntas clínicas
- Optimización de rendimiento

### Próximas Funcionalidades
- Integración con historias clínicas hospitalarias
- Análisis estadístico de casos
- Gamificación del proceso de aprendizaje
