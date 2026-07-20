# Política de Seguridad – backendv2

## Objetivo

Este documento explica el estado real de seguridad del backend y cómo desplegarlo sin depender de conocimientos profundos del ecosistema Node.js.

La regla principal es separar dos cosas:
- Lo que afecta al runtime de producción.
- Lo que solo afecta herramientas de desarrollo, pruebas o generación de código.

## Estado actual

En la versión actual del proyecto, `npm audit --omit=dev` no reporta vulnerabilidades de producción conocidas.

Eso significa que el backend puede desplegarse hoy con una base razonable de seguridad, siempre que se sigan los pasos de instalación y compilación definidos en el README.

## Superficies de riesgo reales

### Autenticación

- El proyecto usa `bcrypt` para hashear contraseñas.
- Esto es preferible a cualquier alternativa insegura como almacenar contraseñas en texto plano.
- Si se cambia esta librería, se debe volver a validar el flujo de login, cambio de contraseña y creación de usuarios.

### Subida de archivos

- Las cargas usan `multer` con límites de tamaño.
- Se restringen tipos MIME permitidos.
- Las rutas de subida deben seguir siendo consideradas una superficie de ataque y no exponerse sin autenticación.

### Archivos Excel

- La importación y exportación de Excel usa `exceljs`.
- Esta librería reemplazó a la anterior para evitar arrastrar vulnerabilidades conocidas de `xlsx`.
- Los archivos subidos siguen necesitando validación de tamaño, tipo y contenido.

### Base de datos

- Prisma usa `DATABASE_URL` y el despliegue debe apuntar solo a una base controlada.
- No se debe exponer la base de datos directamente a internet.

## Qué no bloquea la producción

- Vulnerabilidades presentes solo en `devDependencies`.
- Alertas de `eslint`, `jest`, `ts-jest`, `@nestjs/cli` y herramientas parecidas.
- Cambios de auditoría que no aparecen en `npm audit --omit=dev`.

## Cuándo sí actuar

Hay que intervenir si aparece alguno de estos casos:

- `npm audit --omit=dev` vuelve a mostrar vulnerabilidades.
- Se incorpora una nueva dependencia para runtime.
- Se cambia la lógica de autenticación, subida de archivos o importación de Excel.
- Se modifica la versión de Node.js o la cadena de despliegue.

## Criterio de mantenimiento

- Se priorizan vulnerabilidades explotables en runtime.
- No se usa `npm audit fix --force` sin revisar el impacto.
- Las dependencias se actualizan de forma controlada y con build exitoso después de cada cambio.
- Node.js 20 LTS es la línea recomendada para producción.

## Verificación mínima antes de publicar

1. Ejecutar `npm install`.
2. Ejecutar `npx prisma generate`.
3. Ejecutar `npm run build`.
4. Ejecutar `npm audit --omit=dev`.
5. Confirmar que la aplicación arranca con `npm run start:prod`.

## Última revisión

Junio 2026
