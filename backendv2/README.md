## Sistema Odontológico - Backend

### Descripción

Este repositorio contiene el código fuente del backend para el **Sistema de Gestión Odontológica**. Está construido con **NestJS** y proporciona la API REST necesaria para que la aplicación frontend funcione correctamente.

#### Características Actuales

- **Framework**: Construido sobre el robusto framework de Node.js, [NestJS](https://nestjs.com/).
- **Base de Datos**: Utiliza [Prisma](https://www.prisma.io/) como ORM para una interacción segura y tipada con la base de datos.
- **Autenticación**: Provee los endpoints necesarios para la autenticación de usuarios (inicio de sesión).
- **Gestión Geográfica**: Incluye la lógica para consultar datos geográficos como países, provincias, cantones y parroquias, con capacidades de búsqueda de texto optimizadas.
- **Seed Geográfica**: Incluye una seed que se puede ejecutar para tener la mayoría de parroquias cantones y provincias del Ecuador en la base de datos. Es importante que previamente se aya subido el país Ecuador con Id 1.
- **Creacion de Usuarios**: Se pueden agregar usuarios mediante el uso de la API correspondiente.
- **Gestión de Especialidades**: CRUD completo para administrar especialidades odontológicas del sistema.

## Ejemplos de Json 
```json
// Usuarios
    {
    "nombre": "Jonathan Alexander",
    "apellido": "Cedeño Moran",
    "email": "Jonathancm56@gmail.com",
    "fechaNacimiento": "2002-01-24",
    "password": "admin123",
    "telefono": "0961035637",
    "direccion": "calle falsa av. 22",
    "NotasAdicionales": "Cuenta de administrador para pruebas",
    "parroquiaId": 729,
    "roleId": 1,
    "tipoDocumento": "CEDULA",
    "numeroDocumento": "1351880506"
    }

// Países   
    {
    "name": "Ecuador"
    }

// Provincias
    {
    "name": "Pichincha",
    "paisId": 1
    }

// Especialidades
    {
    "nombre": "Ortodoncia",
    "descripcion": "Especialidad dedicada al diagnóstico, prevención y corrección de malposiciones dentarias"
    }
```

## Installation

```bash
$ npm install
```

## Despliegue en Producción

Si vas a subir el backend a un servidor, sigue este orden:

1. Usa Node.js 20 LTS.
2. Configura el archivo `.env` con al menos `DATABASE_URL` y `JWT_SECRET`.
3. Instala dependencias con `npm install`.
4. Genera el cliente de Prisma con `npx prisma generate`.
5. Compila el proyecto con `npm run build`.
6. Ejecuta el backend con `npm run start:prod`.

Antes de publicar, valida que `npm audit --omit=dev` no reporte vulnerabilidades de producción.

Si vas a desplegar con CI/CD o con una imagen de contenedor, deja las dependencias de desarrollo solo para la etapa de compilación y no para el runtime final.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Runinng the Seeds
```bash
# seed1 para provincias, cantones y parroquias de Ecuador
$ npm run script:seed1

```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).


## Notas de Seguridad

Este proyecto evita el uso de `npm audit fix --force` salvo revisión técnica explícita.

Estado actual del backend:
- El árbol de producción se mantiene libre de vulnerabilidades conocidas con `npm audit --omit=dev`.
- `bcrypt` se usa para proteger contraseñas; no debe reemplazarse por texto plano.
- Las cargas de archivos usan `multer` con límites de tamaño y validación de tipo.
- La importación y exportación de Excel se hace con `exceljs`.

Qué sigue requiriendo atención:
- Las alertas que aparezcan solo en dependencias de desarrollo no bloquean el despliegue.
- Cualquier nueva dependencia debe revisarse antes de incorporarla al árbol de producción.
- Si cambias librerías de autenticación, Excel o subida de archivos, vuelve a ejecutar `npm audit --omit=dev` y las pruebas.

Este enfoque está alineado con prácticas reales de ingeniería de software y estándares académicos.

## Autor del Proyecto

- Author - [Jonathan Alexander Cedeño Moran](https://kamilmysliwiec.com)
- Twitter - [@Jonathancm56](https://x.com/jonathancm56)
- Correo - [Jonathancm56@gmail.com](mailto:Jonathancm56@gmail.com)
