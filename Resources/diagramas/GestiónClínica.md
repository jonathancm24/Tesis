# Flujo Principal del Sistema de Gestión Clínica

```mermaid
graph TD
    A[Login Usuario] --> B{¿Tipo de Usuario?}
    
    B -->|Estudiante| C[Dashboard Estudiante]
    B -->|Profesor| D[Dashboard Profesor]
    B -->|Secretario| E[Dashboard Secretario]
    B -->|Admin| F[Dashboard Admin]
    
    C --> G[Gestión de Pacientes]
    G --> H[Registrar Paciente]
    H --> I[Encuesta de Tamizaje]
    I --> J{¿Encuesta Completa?}
    J -->|No| I
    J -->|Sí| K[Crear Caso Clínico]
    
    K --> L[Llenar Formulario Clínico]
    L --> M[Odontograma]
    L --> N[Topografía Mucosa]
    L --> O[Exámenes Físicos]
    
    M --> P[Enviar a Revisión]
    N --> P
    O --> P
    
    P --> Q[Crear Solicitud Automática]
    Q --> R[Profesor Revisa]
    
    R --> S{¿Aprobado?}
    S -->|No| T[Rechazado - Permite Edición]
    S -->|Sí| U[Aprobado - Iniciar Tratamiento]
    
    T --> L
    U --> V[Gestión de Tratamientos]
    
    D --> W[Revisar Solicitudes]
    W --> X[Aprobar/Rechazar Casos]
    X --> Y[Gestionar Permisos Estudiantes]
    
    E --> Z[Asignar Pacientes]
    Z --> AA[Agendar Citas]
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style P fill:#fff3e0
    style S fill:#e8f5e8
    style U fill:#e8f5e8
    style T fill:#ffebee