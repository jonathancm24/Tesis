<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Sistema de Gestión - Facultad de Odontología

API backend desarrollada con NestJS para la gestión de estudiantes, profesores, tratamientos y citas de la Facultad de Odontología.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Framework**: NestJS (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)
- **Autorización**: Sistema de roles y permisos granular

### Estructura del Proyecto
```
src/
├── common/              # Decoradores, enums y utilidades compartidas
├── guards/              # Guards de autenticación y autorización
├── modules/             # Módulos funcionales de la aplicación
│   ├── auth/           # Autenticación y manejo de JWT
│   ├── usuarios/       # Gestión de usuarios y permisos individuales
│   ├── roles/          # Gestión de roles y permisos
│   └── ...             # Otros módulos (citas, tratamientos, etc.)
└── prisma/             # Configuración y servicio de Prisma
```

## 🔐 Sistema de Autenticación y Autorización

### Flujo de Autenticación
```
Usuario → Credenciales → JWT Token → Guards → Permisos → Endpoint
```

### Arquitectura de Permisos
```
Usuario
├── Role (ADMIN, PROFESOR, ESTUDIANTE, SECRETARIO)
│   └── Permisos del Rol (VER_USUARIOS, CREAR_CITAS, etc.)
└── Permisos Individuales (temporales o permanentes)
```

### Roles Base del Sistema
- **ADMIN**: Acceso completo al sistema
- **PROFESOR**: Supervisa estudiantes y aprueba tratamientos
- **ESTUDIANTE**: Realiza tratamientos bajo supervisión
- **SECRETARIO**: Gestión administrativa y citas

### Permisos Disponibles
```typescript
// Gestión de Usuarios
VER_USUARIOS, CREAR_USUARIOS, EDITAR_USUARIOS, ELIMINAR_USUARIOS

// Gestión de Citas
VER_CITAS, CREAR_CITAS, EDITAR_CITAS, VER_TODAS_LAS_CITAS

// Gestión de Tratamientos
VER_TRATAMIENTOS, CREAR_TRATAMIENTOS, APROBAR_TRATAMIENTOS

// Gestión de Roles y Permisos
GESTIONAR_ROLES, ASIGNAR_PERMISOS_INDIVIDUALES
```

## 🛠️ Implementación en Controladores

### Protección Básica por Permisos
```typescript
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  
  // Solo usuarios con permiso VER_USUARIOS pueden acceder
  @RequirePermissions(PermisoEnum.VER_USUARIOS)
  @Get()
  obtenerTodos() {
    return this.usuariosService.findAll();
  }
  
  // Solo usuarios con permiso CREAR_USUARIOS pueden acceder
  @RequirePermissions(PermisoEnum.CREAR_USUARIOS)
  @Post()
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }
}
```

### Múltiples Permisos (OR - Al menos uno)
```typescript
// El usuario necesita tener AL MENOS UNO de estos permisos
@RequirePermissions(PermisoEnum.VER_USUARIOS, PermisoEnum.GESTIONAR_ROLES)
@Get('admin-panel')
panelAdmin() {
  return this.adminService.getDashboard();
}
```

### Endpoints de Administración
```typescript
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  
  // Crear nuevo rol dinámicamente
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  @Post()
  crearRol(@Body() dto: CreateRolDto) {
    return this.rolesService.crearRol(dto);
  }
  
  // Asignar permisos a un rol
  @RequirePermissions(PermisoEnum.GESTIONAR_ROLES)
  @Put(':id/permisos')
  asignarPermisos(@Param('id') id: string, @Body() dto: AsignarPermisosDto) {
    return this.rolesService.asignarPermisos(+id, dto);
  }
}
```

### Permisos Individuales Temporales
```typescript
@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsuariosController {
  
  // Asignar permiso especial a un usuario específico
  @RequirePermissions(PermisoEnum.ASIGNAR_PERMISOS_INDIVIDUALES)
  @Put(':id/permisos')
  asignarPermisoIndividual(
    @Param('id') usuarioId: string,
    @Body() dto: AsignarPermisoIndividualDto,
    @Request() req
  ) {
    return this.permisosService.asignarPermisoIndividual(
      +usuarioId, 
      dto, 
      req.user.id
    );
  }
}
```

## 📋 Casos de Uso Comunes

### 1. Crear Nuevo Rol Dinámicamente
```bash
POST /roles
{
  "nombre": "PACIENTE",
  "descripcion": "Paciente externo con acceso limitado",
  "permisos": [1, 2, 5]  // IDs de permisos específicos
}
```

### 2. Otorgar Permiso Temporal
```bash
PUT /usuarios/123/permisos
{
  "permisoId": 10,
  "fechaExpiracion": "2024-12-31T23:59:59.000Z",
  "justificacion": "Proyecto especial de tesis"
}
```

### 3. Verificación Automática
```typescript
// Cuando un estudiante accede a GET /tratamientos
// El sistema verifica automáticamente:
// 1. ¿JWT válido? ✅
// 2. ¿Tiene VER_TRATAMIENTOS?
    - Por rol ESTUDIANTE: ✅
    - Permisos individuales: No necesarios
// 3. Acceso concedido ✅
```

## 🚀 Instalación y Configuración

```bash
# Instalar dependencias
$ npm install

# Configurar base de datos
$ npx prisma migrate dev
$ npx prisma generate

# Ejecutar en desarrollo
$ npm run start:dev
```

## 📝 Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/facultad_odontologia"
JWT_SECRET="clave-secreta-muy-fuerte-y-aleatoria"
```

## 🧪 Testing

```bash
# Tests unitarios
$ npm run test

# Tests e2e
$ npm run test:e2e

# Cobertura de tests
$ npm run test:cov
```

## 🔧 Funcionalidades Clave

### Seguridad
- ✅ Autenticación JWT obligatoria
- ✅ Sistema de permisos granular
- ✅ Permisos individuales temporales
- ✅ Auditoría completa de acciones
- ✅ No hay rutas públicas (todo protegido)

### Gestión de Roles
- ✅ Roles base predefinidos
- ✅ Creación dinámica de nuevos roles
- ✅ Asignación flexible de permisos
- ✅ Permisos por módulos organizados

### Escalabilidad
- ✅ Fácil agregar nuevos permisos
- ✅ Roles dinámicos sin cambios de código
- ✅ Sistema de permisos individuales
- ✅ Limpieza automática de permisos expirados

## 👨‍💻 Autor

**Jonathan Alexander Cedeño Morán**  
Tesis de Grado - Facultad de Ciencias de la vida y tecnología  
Universidad Laica Eloy Alfaro de Manabí

---

*Sistema desarrollado con NestJS para la gestión integral de las practicas de los estudiantes de una facultad de odontología, implementando un robusto sistema de autenticación y autorización basado en roles y permisos granulares.*
