# Plan de trabajo

El plan parte de los [pendientes con criterios de cierre](08_pendientes_y_mejoras.md). Se puede preparar el entorno de verificación desde la primera fase y ejecutar pruebas de cada cambio a medida que se incorpore.

| Fase | Actividades y prioridad | Dependencias y trabajo paralelo | Salida verificable |
| --- | --- | --- | --- |
| 1. Correcciones críticas y seguridad | P-017 para decisiones de acceso y estados. P-001, P-002, P-003, P-004, P-009 y P-018 para corregir límites de exposición y estados. | Revisar permisos y adjuntos en paralelo con fechas. Las restricciones clínicas dependen de acuerdos aprobados. Preparar P-015 y P-016 en paralelo. | Matriz aprobada, estados definidos, pruebas de denegación y de reprogramación. |
| 2. Finalización de módulos existentes | P-005 y P-006 de prioridad alta. P-007 y P-008 de prioridad media. | Receta depende de P-003. Tamizaje depende de P-001 y P-002. Normalización de códigos puede avanzar en paralelo con versionado. | Cambios atómicos, códigos válidos y tamizaje con historial. |
| 3. Implementación de funcionalidades faltantes | P-010 y P-013 con prioridad alta. P-011 y P-012 según alcance aprobado. | Auditoría puede diseñarse en paralelo con disponibilidad. Hallazgos, trámites y sedes necesitan aprobación de responsables. | Los flujos aprobados persisten y aplican permisos. |
| 4. Integración de procesos | Integrar P-003, P-005, P-010, P-011, P-014 y P-019. | Transiciones de casos primero. Agenda requiere reglas de disponibilidad y recursos aprobados. La recuperación de altas incompletas depende de los controles de archivos y odontograma. | Recorrido paciente → caso → revisión → atención → cierre, recuperación de altas parciales y agenda consistente. |
| 5. Pruebas funcionales | Completar P-015 con PostgreSQL, archivos y navegador. | Las pruebas de cada módulo pueden avanzarse desde sus fases. El recorrido completo usa contratos estabilizados. | Resultados por rol, persistencia, errores, concurrencia e historial. |
| 6. Mejoras de calidad y usabilidad | P-014 y verificación de RNF de rendimiento y accesibilidad. | Se puede medir antes. Validar visibilidad y mensajes cuando permisos y contratos estén definidos. | Recorridos principales utilizables y controles comprobados en el cliente y API. |
| 7. Preparación para entrega y documentación | Cerrar P-016 y P-017. | Ensayar restauración y arranque antes de entrega. La guía definitiva refleja decisiones validadas. | Arranque reproducible, recuperación comprobada y documentos vigentes. |
