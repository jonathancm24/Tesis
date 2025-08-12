# Módulo 3: Gestión de Pacientes

```mermaid
graph TB
    %% Nodo Principal del Módulo
    OBJETIVO_PAC[🎯 GESTIÓN EXITOSA DE PACIENTES<br/>🏥 Atención de calidad<br/>😊 Satisfacción del servicio]
    
    %% Categoría Principal
    PACIENTES[🏥 GESTIÓN DE PACIENTES]

    %% === GESTIÓN DE PACIENTES ===
    PACIENTES --> PAC_REGISTRO[📋 Registro y Admisión]
    PACIENTES --> PAC_HISTORIAS[📄 Historias Clínicas]
    PACIENTES --> PAC_TRATAMIENTOS[🦷 Tratamientos]
    PACIENTES --> PAC_SEGUIMIENTO[🔄 Seguimiento]
    PACIENTES --> PAC_SATISFACCION[😊 Satisfacción]
    
    PAC_REGISTRO --> PAC_REG_PROC[• Datos demográficos<br/>• Consentimientos informados<br/>• Encuestas de tamizaje<br/>• Asignación a estudiantes]
    PAC_HISTORIAS --> PAC_HIS_GEST[• Historia clínica completa<br/>• Odontogramas digitales<br/>• Hallazgos clínicos<br/>• Documentación fotográfica]
    PAC_TRATAMIENTOS --> PAC_TRA_PLAN[• Planes de tratamiento<br/>• Procedimientos realizados<br/>• Prescripciones médicas<br/>• Control de calidad]
    PAC_SEGUIMIENTO --> PAC_SEG_CONT[• Citas de control<br/>• Evolución del tratamiento<br/>• Observaciones clínicas<br/>• Comunicación con familia]
    PAC_SATISFACCION --> PAC_SAT_MED[• Encuestas de satisfacción<br/>• Retroalimentación de servicio<br/>• Quejas y sugerencias<br/>• Mejora continua]

    %% Conexión al objetivo
    PAC_SATISFACCION --> OBJETIVO_PAC
    PAC_TRATAMIENTOS --> OBJETIVO_PAC
    PAC_SEGUIMIENTO --> OBJETIVO_PAC

    %% Estilos
    classDef objetivoStyle fill:#e1f5fe,stroke:#01579b,stroke-width:4px,color:#000
    classDef categoriaStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef subcategoriaStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef detalleStyle fill:#fff8e1,stroke:#e65100,stroke-width:1px,color:#000

    class OBJETIVO_PAC objetivoStyle
    class PACIENTES categoriaStyle
    class PAC_REGISTRO,PAC_HISTORIAS,PAC_TRATAMIENTOS,PAC_SEGUIMIENTO,PAC_SATISFACCION subcategoriaStyle
    class PAC_REG_PROC,PAC_HIS_GEST,PAC_TRA_PLAN,PAC_SEG_CONT,PAC_SAT_MED detalleStyle
```

## 🏥 **Aspectos Clave del Módulo:**

### **Elementos Críticos:**
- **Registro completo** con consentimientos informados
- **Historias clínicas digitales** con documentación integral
- **Planes de tratamiento** con control de calidad
- **Seguimiento continuo** y comunicación efectiva
- **Medición de satisfacción** para mejora continua

### **Impacto en el Objetivo:**
La gestión efectiva de pacientes asegura la calidad en la atención clínica y proporciona casos reales valiosos para el aprendizaje estudiantil.
