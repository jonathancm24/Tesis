# Módulo de Usuarios

Este módulo maneja toda la funcionalidad relacionada con la gestión de usuarios en el sistema odontológico de ULEAM.

## Características Principales

### 🔧 CRUD Completo
- ✅ Crear usuarios con validaciones exhaustivas
- ✅ Listar usuarios con filtros avanzados y paginación
- ✅ Obtener detalles de un usuario específico
- ✅ Actualizar información de usuarios
- ✅ Cambio de contraseñas con validación
- ✅ Activar/Desactivar usuarios
- ✅ Eliminación soft (desactivación)

### 🛡️ Seguridad
- 🔐 Contraseñas encriptadas con bcrypt (salt rounds: 12)
- 🔒 Guards comentados para facilitar pruebas (descomentar en producción)
- ✋ Validaciones de permisos por endpoint
- 🚫 Exclusión de contraseñas en respuestas API

### 📊 Validaciones de Negocio
- 📧 Email único en el sistema
- 🆔 Documento de identidad único
- 🏢 Validación de existencia de roles
- 🌍 Validación de existencia de parroquias
- 🎓 Validación de existencia de especialidades

## Estructura del Módulo

```
src/modules/usuarios/
├── dto/
│   ├── create-usuario.dto.ts      # DTO para crear usuarios
│   ├── update-usuario.dto.ts      # DTO para actualizar usuarios
│   ├── usuario-response.dto.ts    # DTOs de respuesta y filtros
│   └── index.ts                   # Barrel exports
├── usuarios.controller.ts         # Controlador REST
├── usuarios.service.ts           # Lógica de negocio
├── usuarios.module.ts            # Configuración del módulo
├── index.ts                      # Barrel exports
└── README.md                     # Esta documentación
```

## Endpoints Disponibles

### POST /usuarios
Crear un nuevo usuario en el sistema.

**Payload de ejemplo:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@uleam.edu.ec",
  "fechaNacimiento": "1995-08-15",
  "password": "MiContraseñaSegura123!",
  "telefono": "+593987654321",
  "direccion": "Av. Principal 123, Manta",
  "roleId": 2,
  "tipoDocumento": "CEDULA",
  "numeroDocumento": "1234567890",
  "especialidadIds": [1, 3]
}
```

### GET /usuarios
Obtener lista paginada de usuarios con filtros.

**Query parameters disponibles:**
- `nombre`: Filtrar por nombre (búsqueda insensible a mayúsculas)
- `apellido`: Filtrar por apellido
- `email`: Filtrar por email
- `activo`: Filtrar por estado (true/false)
- `roleId`: Filtrar por rol
- `parroquiaId`: Filtrar por parroquia
- `tipoDocumento`: Filtrar por tipo de documento
- `fechaNacimientoDesde/Hasta`: Rango de fechas de nacimiento
- `fechaCreacionDesde/Hasta`: Rango de fechas de creación
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `orderBy`: Campo de ordenamiento (default: 'fechaRegistro')
- `orderDirection`: Dirección del ordenamiento ('asc'|'desc', default: 'desc')

**Ejemplo:**
```
GET /usuarios?nombre=juan&activo=true&page=1&limit=5&orderBy=nombre&orderDirection=asc
```

### GET /usuarios/:id
Obtener detalles de un usuario específico con sus relaciones.

### PATCH /usuarios/:id
Actualizar información de un usuario existente.

### PATCH /usuarios/:id/change-password
Cambiar la contraseña de un usuario.

**Payload:**
```json
{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123!",
  "confirmPassword": "nuevaContraseña123!"
}
```

### PATCH /usuarios/:id/activate
Activar un usuario.

### PATCH /usuarios/:id/deactivate
Desactivar un usuario.

### DELETE /usuarios/:id
Eliminar (desactivar) un usuario.

### GET /usuarios/search/:searchTerm
Buscar usuarios por término libre en nombre, apellido y email.

### GET /usuarios/stats/overview
Obtener estadísticas básicas de usuarios (pendiente de implementación).

## Modelos de Datos

### CreateUsuarioDto
- `nombre`: string (requerido, 2-50 caracteres)
- `apellido`: string (requerido, 2-50 caracteres)
- `email`: string (requerido, único, formato email)
- `fechaNacimiento`: string (requerido, formato YYYY-MM-DD)
- `password`: string (requerido, mínimo 8 caracteres)
- `telefono`: string (opcional)
- `direccion`: string (opcional, máximo 200 caracteres)
- `NotasAdicionales`: string (opcional, máximo 500 caracteres)
- `parroquiaId`: number (opcional)
- `roleId`: number (requerido)
- `activo`: boolean (opcional, default: true)
- `tipoDocumento`: enum TipoDocumento (requerido)
- `numeroDocumento`: string (requerido, único, 8-20 caracteres)
- `especialidadIds`: number[] (opcional)

### UsuarioResponseDto
Respuesta de la API que excluye información sensible como contraseñas e incluye relaciones populadas.

## Dependencias

### Instaladas
- `@nestjs/common`
- `@nestjs/core`
- `class-validator`
- `class-transformer`
- `bcrypt`
- `@prisma/client`

### Por instalar (si no están presentes)
```bash
npm install bcrypt
npm install @types/bcrypt --save-dev
```

## Configuración de Seguridad

### Para Desarrollo/Pruebas
Los guards están comentados para facilitar las pruebas. Todas las rutas son accesibles sin autenticación.

### Para Producción
Descomenta las siguientes líneas en el controlador:

```typescript
// En la clase UsuariosController
@UseGuards(JwtAuthGuard) // Descomenta para proteger todas las rutas

// En cada endpoint
@UseGuards(PermissionsGuard) // Descomenta para verificar permisos
@RequirePermissions(Permisos.CREAR_USUARIOS) // Descomenta para requerir permiso específico
```

### Permisos Requeridos
- `VER_USUARIOS`: Para listar y ver detalles de usuarios
- `CREAR_USUARIOS`: Para crear nuevos usuarios
- `EDITAR_USUARIOS`: Para actualizar usuarios y cambiar contraseñas
- `ELIMINAR_USUARIOS`: Para eliminar usuarios

## Ejemplos de Uso

### Crear un usuario básico
```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellido": "García",
    "email": "maria.garcia@uleam.edu.ec",
    "fechaNacimiento": "1992-03-20",
    "password": "contraseñaSegura123!",
    "roleId": 2,
    "tipoDocumento": "CEDULA",
    "numeroDocumento": "0987654321"
  }'
```

### Listar usuarios con filtros
```bash
curl "http://localhost:3000/usuarios?activo=true&limit=5&page=1"
```

### Buscar usuarios
```bash
curl "http://localhost:3000/usuarios/search/maria"
```

## Consideraciones de Rendimiento

- **Paginación**: Implementada por defecto (10 elementos por página)
- **Índices de BD**: Email y numeroDocumento tienen índices únicos
- **Consultas optimizadas**: Se usan `select` específicos para evitar sobre-fetching
- **Transacciones**: Operaciones complejas usan transacciones Prisma

## Próximas Mejoras

- [ ] Implementar estadísticas de usuarios
- [ ] Agregar búsqueda full-text
- [ ] Implementar upload de avatares
- [ ] Agregar logs de auditoría
- [ ] Implementar exportación de datos
- [ ] Cacheo con Redis
- [ ] Notificaciones por email

## Testing

Para probar el módulo:

```bash
# Asegúrate de que el servidor esté corriendo
npm run start:dev

# Crear un usuario de prueba
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "User",
    "email": "test@uleam.edu.ec",
    "fechaNacimiento": "1990-01-01",
    "password": "testpassword123!",
    "roleId": 1,
    "tipoDocumento": "CEDULA",
    "numeroDocumento": "1111111111"
  }'

# Listar usuarios
curl http://localhost:3000/usuarios

# Obtener usuario por ID
curl http://localhost:3000/usuarios/1
```

---

**Nota**: Este módulo está diseñado para ser seguro y eficiente. En producción, asegúrate de descomentar los guards de seguridad y configurar correctamente los permisos de usuarios.