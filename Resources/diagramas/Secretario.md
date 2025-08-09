
## 4. Diagrama de Flujo del Secretario

```mermaid
graph TD
    A[Secretario inicia sesión] --> B[Dashboard Secretario]
    B --> C[Gestión de Pacientes]
    
    C --> D[Registrar Nuevo Paciente]
    D --> E[Formulario de Registro Completo]
    E --> F[Información Personal]
    F --> G[Información de Contacto]
    G --> H[Información Adicional]
    H --> I[Representante Legal si es menor]
    I --> J[Guardar Paciente]
    
    C --> K[Asignar Pacientes a Estudiantes]
    K --> L[Seleccionar Paciente]
    L --> M[Seleccionar Estudiante]
    M --> N[Seleccionar Especialidad]
    N --> O[Crear Asignación]
    
    B --> P[Agendar Citas]
    P --> Q[Seleccionar Paciente]
    Q --> R[Seleccionar Estudiante Asignado]
    R --> S[Seleccionar Profesor Supervisor]
    S --> T[Elegir Fecha y Hora]
    T --> U[Confirmar Disponibilidad]
    U --> V{¿Disponible?}
    
    V -->|No| W[Mostrar Horarios Alternativos]
    V -->|Sí| X[Crear Cita]
    
    W --> T
    X --> Y[Notificar a Involucrados]
    
    B --> Z[Manejo de Citas]
    Z --> AA[Ver Agenda del Día]
    AA --> BB[Confirmar Asistencia]
    BB --> CC[Reprogramar si es necesario]
    
    J --> DD[Paciente disponible para asignación]
    O --> EE[Paciente asignado a estudiante]
    Y --> FF[Cita agendada exitosamente]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style P fill:#fff3e0
    style X fill:#e8f5e8
    style CC fill:#ffecb3