
## 2. Diagrama de Flujo de Caso Clínico

```mermaid
# Flujo Detallado de Caso Clínico

```mermaid
graph TD
    A[Estudiante inicia sesión] --> B[Accede a Gestión de Pacientes]
    B --> C{¿Paciente existe?}
    
    C -->|No| D[Registrar Nuevo Paciente]
    C -->|Sí| E[Seleccionar Paciente]
    
    D --> F[Formulario de Registro]
    F --> G[Autocompletado Ubicación]
    G --> H[Guardar Paciente]
    H --> E
    
    E --> I[Verificar Encuesta de Tamizaje]
    I --> J{¿Encuesta Completa?}
    
    J -->|No| K[Abrir Modal Encuesta]
    J -->|Sí| L[Habilitar Crear Caso Clínico]
    
    K --> M[Formulario por Categorías]
    M --> N[Antecedentes Médicos]
    N --> O[Guardar Respuestas]
    O --> L
    
    L --> P[Abrir Formulario Caso Clínico]
    P --> Q[Paso 1: Motivo de Consulta]
    Q --> R[Paso 2: Enfermedad Actual]
    R --> S[Paso 3: Examen Físico General]
    S --> T[Paso 4: Examen Físico Regional]
    T --> U[Paso 5: Examen Físico Bucal]
    
    U --> V[Odontograma Interactivo]
    V --> W[Seleccionar Dientes y Superficies]
    W --> X[Marcar Condiciones]
    X --> Y[Tabla de Hallazgos]
    
    U --> Z[Topografía de Mucosa]
    Z --> AA[Seleccionar Áreas Afectadas]
    AA --> BB[Agregar Observaciones]
    
    Y --> CC[Paso 6: Estudios Complementarios]
    BB --> CC
    CC --> DD[Validar Formulario Completo]
    
    DD --> EE{¿Formulario Válido?}
    EE -->|No| FF[Mostrar Errores]
    EE -->|Sí| GG[Enviar a Revisión]
    
    FF --> P
    GG --> HH[Cambiar Estado: en_revision]
    HH --> II[Crear Solicitud Automática]
    II --> JJ[Redirigir a Casos Clínicos]
    
    style A fill:#e3f2fd
    style K fill:#fff3e0
    style P fill:#f3e5f5
    style V fill:#e8f5e8
    style Z fill:#e8f5e8
    style GG fill:#ff5722,color:#fff