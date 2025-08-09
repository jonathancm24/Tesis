
## 3. Diagrama de Flujo de Aprobación por Profesor

```mermaid
graph TD
    A[Profesor inicia sesión] --> B[Dashboard Profesor]
    B --> C[Ver Solicitudes Pendientes]
    C --> D[Lista de Casos para Revisar]
    
    D --> E[Seleccionar Caso Clínico]
    E --> F[Ver Detalles del Caso]
    
    F --> G[Revisar Información del Paciente]
    G --> H[Revisar Motivo de Consulta]
    H --> I[Revisar Exámenes Realizados]
    I --> J[Revisar Odontograma]
    J --> K[Revisar Topografía]
    
    K --> L{¿Caso Completo y Correcto?}
    
    L -->|Sí| M[Aprobar Caso]
    L -->|No| N[Rechazar con Comentarios]
    
    M --> O[Cambiar Estado: aprobado]
    O --> P[Notificar al Estudiante]
    P --> Q[Habilitar Inicio de Tratamiento]
    
    N --> R[Cambiar Estado: rechazado]
    R --> S[Agregar Comentarios de Corrección]
    S --> T[Notificar al Estudiante]
    T --> U[Permitir Edición al Estudiante]
    
    Q --> V[Caso disponible para Tratamiento]
    U --> W[Estudiante puede corregir]
    W --> X[Reenvío a Revisión]
    X --> E
    
    B --> Y[Gestión de Estudiantes]
    Y --> Z[Ver Progreso por Estudiante]
    Z --> AA[Revisar Permisos Clínicos]
    AA --> BB{¿Estudiante Apto?}
    
    BB -->|Sí| CC[Mantener/Otorgar Permisos]
    BB -->|No| DD[Revocar Permisos]
    
    CC --> EE[Estudiante puede atender pacientes]
    DD --> FF[Estudiante restringido]
    
    style A fill:#e8eaf6
    style M fill:#c8e6c9
    style N fill:#ffcdd2
    style O fill:#4caf50,color:#fff
    style R fill:#f44336,color:#fff
    style DD fill:#ff9800,color:#fff