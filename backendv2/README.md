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

Este proyecto evita intencionalmente el uso de `npm audit fix --force`.

Algunas vulnerabilidades reportadas corresponden a herramientas de desarrollo o dependencias transitivas que no se ejecutan en producción. Forzar correcciones automáticas introduciría cambios incompatibles en librerías críticas (como NestJS, ESLint o bcrypt) sin aportar beneficios reales de seguridad.

En su lugar, el proyecto adopta un enfoque de seguridad controlado:
- Se prioriza la seguridad en tiempo de ejecución.
- Las vulnerabilidades conocidas se documentan y monitorean.
- Se utilizan versiones LTS estables de Node.js y dependencias principales.

Este enfoque está alineado con prácticas reales de ingeniería de software y estándares académicos.

## Autor del Proyecto

- Author - [Jonathan Alexander Cedeño Moran](https://kamilmysliwiec.com)
- Twitter - [@Jonathancm56](https://x.com/jonathancm56)
- Correo - [Jonathancm56@gmail.com](mailto:Jonathancm56@gmail.com)
