# Pruebas y calidad

## Resultados observados

Ejecución local con Node 24.16.0 sobre la revisión `cd52119`. Se usaron herramientas instaladas y comprobaciones de tipos sin emisión de artefactos.

| Verificación | Resultado | Alcance |
| --- | --- | --- |
| TypeScript backend con `tsc -p tsconfig.build.json --noEmit --incremental false` | Código de salida 0 | Tipos del backend. |
| Vue TypeScript con `vue-tsc -p tsconfig.app.json --noEmit --incremental false` | Código de salida 0 | Tipos de la aplicación Vue. |
| Jest unitario con `--runInBand --no-cache` | 4 suites y 33 pruebas aprobadas | AppController aislado, RolesGuard, UsuariosService y CasosClinicosService. Prisma y dependencias se simulan donde corresponde. |
| Jest HTTP aislado con `--config test/jest-e2e.json --runInBand --no-cache` y selección de usuarios y casos | 2 suites y 13 pruebas aprobadas | Nest/Supertest con servicios simulados. Comprueba parte del contrato HTTP y guards. |
| `app.e2e-spec.ts` | Sin ejecución | Importa AppModule, que conecta Prisma e inicializa permisos. La expectativa de GET raíz no coincide con los módulos registrados en AppModule. |
| Cobertura, navegador, build empaquetado, migraciones y pruebas con PostgreSQL | Sin medición o ejecución | Los resultados anteriores solo respaldan tipado y pruebas aisladas. |

[Pruebas unitarias de usuarios](../../backendv2/src/modules/usuarios/usuarios.service.spec.ts), [pruebas unitarias de casos](../../backendv2/src/modules/CasosClinicos/casos-clinicos.service.spec.ts), [pruebas de guard](../../backendv2/src/guards/roles.guard.spec.ts), [unitaria de raíz](../../backendv2/src/app.controller.spec.ts), [HTTP usuarios](../../backendv2/test/usuarios-auth.e2e-spec.ts), [HTTP casos](../../backendv2/test/casos-clinicos-auth.e2e-spec.ts), [HTTP aplicación](../../backendv2/test/app.e2e-spec.ts), [AppModule](../../backendv2/src/app.module.ts).

## Validaciones y problemas identificados

- **Frontend.** Agenda y formularios revisan datos previos al envío. Axios usa timeout de 10 s, token Bearer y redirección ante 401. La visibilidad de una ruta depende de rol y sesión en el cliente. [Agenda](../../Frontendv2/src/views/Estudiantes/Agenda.vue), [cliente HTTP](../../Frontendv2/src/Config/api.ts), [guard de rutas](../../Frontendv2/src/router/guards.ts).
- **Backend.** ValidationPipe transforma y rechaza campos ajenos al DTO. Los servicios comprueban referencias y algunas precondiciones. Citas, odontograma y tamizaje requieren especial atención a la autorización por recurso. [Arranque](../../backendv2/src/main.ts), [citas](../../backendv2/src/modules/Citas/citas.service.ts), [odontograma](../../backendv2/src/modules/Odontograma/odontograma.service.ts), [tamizaje](../../backendv2/src/modules/EncuestaTamizaje/encuesta-tamizaje.controller.ts).
- **Configuración.** El arranque configura puerto y CORS de desarrollo, inicia Prisma y genera entradas del catálogo de permisos. El ensayo operativo exige un entorno de prueba apto para esas escrituras. El estado aplicado de las migraciones y el conjunto de datos de referencia permanecen sin verificar. [Arranque](../../backendv2/src/main.ts), [Prisma](../../backendv2/prisma/prisma.service.ts), [inicializador](../../backendv2/src/modules/permisos/permisos-inicializador.service.ts).
- **Riesgos.** Controles JWT sin rol para ciertas mutaciones, delimitación desigual de expedientes, desvíos de estado desde tratamiento o receta, archivos locales y falta de auditoría operativa. [Permisos](06_matriz_permisos.md), [pendientes](08_pendientes_y_mejoras.md).

## Escenarios de aceptación pendientes

Usar PostgreSQL desechable, datos sintéticos, cuatro cuentas con los roles del sistema y un directorio temporal para adjuntos. Incorporar un segundo docente y estudiante para verificar acceso cruzado. Ejecutar el arranque real, preparar los catálogos y comprobar respuestas HTTP, registros en PostgreSQL y archivos cuando corresponda.

| Flujo | Casos a probar con persistencia o navegador |
| --- | --- |
| Identidad, roles y catálogos | Inicio correcto, clave inválida, cuenta inactiva y token expirado. Gestión de usuarios, importación Excel con fila inválida y restricciones de profesor. Operaciones de cada rol, permisos vigentes y expirados y referencias geográficas. |
| Pacientes y tamizaje | Documento duplicado, parroquia inexistente, actualización y baja. Acceso al historial según vínculo, guardado y relectura de respuestas, nueva versión y dos guardados paralelos. |
| Casos y preguntas | Alta y rollback de respuestas inválidas, docente sin especialidad, consulta ajena, aprobación y rechazo, calificación y observaciones. Carrera entre revisión y registro de tratamiento. |
| Agenda | Alta, filtro, consulta de cita, cancelación, actualización parcial, cruces de medianoche, zona horaria, reservas simultáneas y rechazo de conflictos según política aprobada. |
| Odontograma y diagnóstico | Guardar y reabrir caras, repetir guardado, verificar nota general, denegar caso ajeno y comprobar códigos en uso, categoría y normalización. |
| Tratamientos y prescripciones | Persistencia de ambos en transacción, fallo en segunda escritura, conducta ante RECHAZADO y CANCELADO, finalización con y sin tratamiento. |
| Archivos | Visibilidad del área y vínculos por rol, tipo inválido, descarga sin binario, error de escritura y recuperación consistente. |
| Navegador y operación | Recorrido completo con cada rol, navegación directa, manejo de 401 y 403, uso por teclado. Arranque, reinicio, medición con volumen controlado y restauración de BD y adjuntos. |
