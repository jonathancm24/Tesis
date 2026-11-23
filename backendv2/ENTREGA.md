# Entrega backend - Seguridad y módulos clínicos

## Rama

- Rama de trabajo: `feat/backend-seguridad-validacion`
- Rama base: `main`
- Repositorio principal acordado: `melanieperez26/Practicas-Odontologia`

## Resultados verificados

- Backend: `npm run build` aprobado.
- Frontend: `npm run build` aprobado.
- Unitarias backend: 75 aprobadas.
- E2E backend: 54 aprobadas.
- Conexión PostgreSQL: comprobada durante las pruebas E2E.
- Dependencias: Multer actualizado a 2.5.0.
- Seguridad: Helmet, CORS por entorno y throttling habilitados.
- Auditoría: 6 vulnerabilidades de producción pendientes al último registro.

## Funcionalidad entregada

- Acceso por administrador, profesor y estudiante.
- Protección de casos, pacientes, odontograma, citas, tratamientos y prescripciones.
- Bloqueo de identificadores clínicos enviados por el cliente.
- Estados y observaciones de casos clínicos.
- Validación de citas solapadas.
- Usuarios y pacientes inactivos bloqueados.
- Archivos restringidos por contexto autorizado.

## Comandos de validación

```powershell
cd backendv2
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm audit --omit=dev

cd ../Frontendv2
npm install
npm run build
```

## Pendientes antes de integrar

- Resolver las vulnerabilidades restantes de producción.
- Cambiar la contraseña real de PostgreSQL.
- Ejecutar escenarios explícitos de concurrencia y rollback con PostgreSQL.
- Realizar revisión manual del Pull Request.
- Ejecutar una prueba end-to-end completa desde el frontend.
